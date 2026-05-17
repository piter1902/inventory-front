import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ZoneDto, ZoneDetailDto, CreateZoneCommand, UpdateZoneCommand } from '../models/zone.models';

@Injectable({ providedIn: 'root' })
export class ZonesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/Zones`;

  getAll(): Observable<ZoneDto[]> {
    return this.http.get<ZoneDto[]>(this.baseUrl);
  }

  getById(id: string): Observable<ZoneDetailDto> {
    return this.http.get<ZoneDetailDto>(`${this.baseUrl}/${id}`);
  }

  create(command: CreateZoneCommand): Observable<ZoneDto> {
    return this.http.post<ZoneDto>(this.baseUrl, command);
  }

  update(id: string, command: UpdateZoneCommand): Observable<ZoneDetailDto> {
    return this.http.put<ZoneDetailDto>(`${this.baseUrl}/${id}`, command);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
