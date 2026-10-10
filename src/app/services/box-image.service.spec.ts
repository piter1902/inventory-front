import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { BoxImageService } from './box-image.service';
import { environment } from '../../environments/environment';

describe('BoxImageService', () => {
  let service: BoxImageService;
  let httpMock: HttpTestingController;
  const url = `${environment.apiBaseUrl}/api/Boxes/1/image`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BoxImageService);
    httpMock = TestBed.inject(HttpTestingController);
    URL.createObjectURL = vi.fn(() => 'blob:image');
  });

  afterEach(() => httpMock.verify());

  it('should request the image as blob and return a blob URL', async () => {
    const result = service.load('1');
    const req = httpMock.expectOne(url);
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['x'], { type: 'image/jpeg' }));
    expect(await result).toBe('blob:image');
  });

  it('should return null when the request fails', async () => {
    const result = service.load('1');
    httpMock.expectOne(url).flush(new Blob([]), { status: 404, statusText: 'Not Found' });
    expect(await result).toBeNull();
  });

  it('should add a version param after invalidate()', async () => {
    service.invalidate('1');
    const result = service.load('1');
    const req = httpMock.expectOne(r => r.url === url);
    expect(req.request.params.has('v')).toBe(true);
    req.flush(new Blob(['x']));
    await result;
  });
});
