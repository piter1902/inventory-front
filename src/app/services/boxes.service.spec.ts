import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { BoxesService } from './boxes.service';
import { environment } from '../../environments/environment';
import { BoxDto, CreateBoxCommand, SearchResultDto, UpdateBoxRequest } from '../models/box.models';

describe('BoxesService', () => {
  let service: BoxesService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiBaseUrl}/api/Boxes`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(BoxesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should make GET request for getAll()', () => {
    const mockBoxes: BoxDto[] = [
      { id: '1', identifier: 'B1', name: 'Box 1', qrUrl: '', items: [] },
    ];

    service.getAll().subscribe(boxes => {
      expect(boxes).toEqual(mockBoxes);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockBoxes);
  });

  it('should make GET request with ID for getById()', () => {
    const mockBox: BoxDto = { id: '1', identifier: 'B1', name: 'Box 1', qrUrl: '', items: [] };

    service.getById('1').subscribe(box => {
      expect(box).toEqual(mockBox);
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockBox);
  });

  it('should make POST request for create()', () => {
    const command: CreateBoxCommand = { name: 'New Box' };
    const mockBox: BoxDto = { id: '2', identifier: 'B2', name: 'New Box', qrUrl: '', items: [] };

    service.create(command).subscribe(box => {
      expect(box).toEqual(mockBox);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(command);
    req.flush(mockBox);
  });

  it('should make PUT request for update()', () => {
    const request: UpdateBoxRequest = { name: 'Updated Box' };
    const mockBox: BoxDto = { id: '1', identifier: 'B1', name: 'Updated Box', qrUrl: '', items: [] };

    service.update('1', request).subscribe(box => {
      expect(box).toEqual(mockBox);
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(mockBox);
  });

  it('should make DELETE request for delete()', () => {
    service.delete('1').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should make GET request with query param for search()', () => {
    const mockResult: SearchResultDto = { boxes: [], items: [] };

    service.search('test').subscribe(result => {
      expect(result).toEqual(mockResult);
    });

    const req = httpMock.expectOne(r => r.url === `${baseUrl}/search` && r.params.get('query') === 'test');
    expect(req.request.method).toBe('GET');
    req.flush(mockResult);
  });
});
