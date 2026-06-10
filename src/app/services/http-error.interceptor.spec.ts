import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, HTTP_INTERCEPTORS, HttpInterceptorFn, withInterceptors } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { httpErrorInterceptor } from './http-error.interceptor';
import { NotificationService } from './notification.service';

describe('httpErrorInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let notificationService: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    notificationService = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    httpMock.verify();
  });

  it('should not show notification on successful request', () => {
    const showSpy = vi.spyOn(notificationService, 'show');

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    req.flush({ data: 'ok' });

    expect(showSpy).not.toHaveBeenCalled();
  });

  it.each([
    [400, 'Solicitud inválida. Revisa los datos e inténtalo de nuevo.'],
    [401, 'No autorizado. Inicia sesión para continuar.'],
    [403, 'Acceso denegado. No tienes permisos para realizar esta acción.'],
    [404, 'Recurso no encontrado.'],
    [409, 'Conflicto. El recurso ya existe o los datos son inconsistentes.'],
    [500, 'Error interno del servidor. Inténtalo de nuevo más tarde.'],
    [502, 'Servicio temporalmente no disponible. Inténtalo de nuevo más tarde.'],
    [503, 'Servicio no disponible. Inténtalo de nuevo más tarde.'],
  ])('should show notification with status %i', (status, expectedMessage) => {
    const showSpy = vi.spyOn(notificationService, 'show');

    httpClient.get('/api/test').subscribe({
      error: () => {},
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({ message: 'error' }, { status, statusText: 'Error' });

    expect(showSpy).toHaveBeenCalledWith(expectedMessage, 'error');
  });

  it('should use a generic message for unknown status codes, ignoring the error body', () => {
    const showSpy = vi.spyOn(notificationService, 'show');

    httpClient.get('/api/test').subscribe({
      error: () => {},
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({ message: 'Custom error body' }, { status: 418, statusText: "I'm a teapot" });

    expect(showSpy).toHaveBeenCalledWith(
      'Ha ocurrido un error inesperado.',
      'error',
    );
  });

  it('should use a generic message for unknown status codes, ignoring statusText', () => {
    const showSpy = vi.spyOn(notificationService, 'show');

    httpClient.get('/api/test').subscribe({
      error: () => {},
    });

    const req = httpMock.expectOne('/api/test');
    req.flush(null, { status: 418, statusText: "I'm a teapot" });

    expect(showSpy).toHaveBeenCalledWith(
      'Ha ocurrido un error inesperado.',
      'error',
    );
  });

  it('should re-throw the error after notification', () => {
    vi.spyOn(notificationService, 'show');
    const errorCallback = vi.fn();

    httpClient.get('/api/test').subscribe({
      error: errorCallback,
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });

    expect(errorCallback).toHaveBeenCalled();
  });
});
