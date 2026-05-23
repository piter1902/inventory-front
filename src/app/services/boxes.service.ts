import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { BoxDto, CreateBoxCommand, UpdateBoxRequest, SearchResultDto, BoxLogEntry } from '../models/box.models';

@Injectable({ providedIn: 'root' })
export class BoxesService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/Boxes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<BoxDto[]> {
    return this.http.get<BoxDto[]>(this.baseUrl);
  }

  getById(id: string): Observable<BoxDto> {
    return this.http.get<BoxDto>(`${this.baseUrl}/${id}`);
  }

  create(command: CreateBoxCommand): Observable<BoxDto> {
    return this.http.post<BoxDto>(this.baseUrl, command);
  }

  update(id: string, request: UpdateBoxRequest): Observable<BoxDto> {
    return this.http.put<BoxDto>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  search(query: string): Observable<SearchResultDto> {
    return this.http.get<SearchResultDto>(`${this.baseUrl}/search`, { params: { query } });
  }

  getLogs(boxId: string): Observable<BoxLogEntry[]> {
    return this.http.get<BoxLogEntry[]>(`${this.baseUrl}/${boxId}/logs`);
  }

  getAllLogs(boxId?: string): Observable<BoxLogEntry[]> {
    const params = boxId ? new HttpParams().set('boxId', boxId) : undefined;
    return this.http.get<BoxLogEntry[]>(`${environment.apiBaseUrl}/api/logs`, { params });
  }
}
