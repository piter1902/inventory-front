import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';
import { SKIP_ERROR_NOTIFICATION } from './http-error.interceptor';

/**
 * Loads box images on demand. `<img src>` cannot send the Bearer token, so the
 * image is requested through HttpClient (auth interceptor) and exposed as a blob URL.
 * The caller owns the returned URL and must `URL.revokeObjectURL` it.
 */
@Injectable({ providedIn: 'root' })
export class BoxImageService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/Boxes`;
  private readonly versions = new Map<string, number>();

  /** Returns a blob URL, or null when the box has no image or the request fails. */
  async load(boxId: string): Promise<string | null> {
    const version = this.versions.get(boxId);
    const params = version ? new HttpParams().set('v', version) : undefined;
    try {
      const blob = await firstValueFrom(
        this.http.get(`${this.baseUrl}/${boxId}/image`, {
          params,
          responseType: 'blob',
          context: new HttpContext().set(SKIP_ERROR_NOTIFICATION, true),
        }),
      );
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  }

  /** Call after the image of a box changes so the next load skips the HTTP cache (max-age=3600). */
  invalidate(boxId: string): void {
    this.versions.set(boxId, Date.now());
  }
}
