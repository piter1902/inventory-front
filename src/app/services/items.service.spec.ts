import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ItemsService } from './items.service';
import { environment } from '../../environments/environment';
import { AddItemRequest, BoxDto, UpdateItemRequest } from '../models/box.models';

describe('ItemsService', () => {
  let service: ItemsService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiBaseUrl}/api/Boxes`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ItemsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should make POST request for add()', () => {
    const request: AddItemRequest = { name: 'Item 1', description: 'Description' };
    const mockBox: BoxDto = { id: '1', identifier: 'B1', name: 'Box 1', qrUrl: '', items: [{ id: 'i1', name: 'Item 1', description: 'Description' }] };

    service.add('1', request).subscribe(box => {
      expect(box).toEqual(mockBox);
    });

    const req = httpMock.expectOne(`${baseUrl}/1/items`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockBox);
  });

  it('should make PUT request for update()', () => {
    const request: UpdateItemRequest = { name: 'Updated Item', description: 'Updated' };
    const mockBox: BoxDto = { id: '1', identifier: 'B1', name: 'Box 1', qrUrl: '', items: [{ id: 'i1', name: 'Updated Item', description: 'Updated' }] };

    service.update('1', 'i1', request).subscribe(box => {
      expect(box).toEqual(mockBox);
    });

    const req = httpMock.expectOne(`${baseUrl}/1/items/i1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(mockBox);
  });

  it('should make DELETE request for delete()', () => {
    const mockBox: BoxDto = { id: '1', identifier: 'B1', name: 'Box 1', qrUrl: '', items: [] };

    service.delete('1', 'i1').subscribe(box => {
      expect(box).toEqual(mockBox);
    });

    const req = httpMock.expectOne(`${baseUrl}/1/items/i1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockBox);
  });
});
