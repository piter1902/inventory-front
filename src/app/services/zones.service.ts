import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { ZoneDto, CreateZoneCommand, UpdateZoneRequest } from '../models/zone.models';

@Injectable({ providedIn: 'root' })
export class ZonesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/Zones`;

  getAll(): Observable<ZoneDto[]> {
    return this.http.get<ZoneDto[]>(this.baseUrl);
  }

  getById(id: string): Observable<ZoneDto | null> {
    return this.http.get<ZoneDto>(`${this.baseUrl}/${id}`);
  }

  create(command: CreateZoneCommand): Observable<ZoneDto> {
    return this.http.post<ZoneDto>(this.baseUrl, command);
  }

  update(id: string, request: UpdateZoneRequest): Observable<ZoneDto> {
    return this.http.put<ZoneDto>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
