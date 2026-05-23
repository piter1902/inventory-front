import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { BoxDto, AddItemRequest, UpdateItemRequest, MoveItemsRequest, MoveItemsResult } from '../models/box.models';

@Injectable({ providedIn: 'root' })
export class ItemsService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/Boxes`;

  constructor(private http: HttpClient) {}

  add(boxId: string, request: AddItemRequest): Observable<BoxDto> {
    return this.http.post<BoxDto>(`${this.baseUrl}/${boxId}/items`, request);
  }

  update(boxId: string, itemId: string, request: UpdateItemRequest): Observable<BoxDto> {
    return this.http.put<BoxDto>(`${this.baseUrl}/${boxId}/items/${itemId}`, request);
  }

  delete(boxId: string, itemId: string): Observable<BoxDto> {
    return this.http.delete<BoxDto>(`${this.baseUrl}/${boxId}/items/${itemId}`);
  }

  move(sourceBoxId: string, request: MoveItemsRequest): Observable<MoveItemsResult> {
    return this.http.post<MoveItemsResult>(`${this.baseUrl}/${sourceBoxId}/items/move`, request);
  }
}
