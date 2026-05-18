import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from './notification.service';

const errorMessages: Record<number, string> = {
  400: 'Solicitud inválida. Revisa los datos e inténtalo de nuevo.',
  401: 'No autorizado. Inicia sesión para continuar.',
  403: 'Acceso denegado. No tienes permisos para realizar esta acción.',
  404: 'Recurso no encontrado.',
  409: 'Conflicto. El recurso ya existe o los datos son inconsistentes.',
  500: 'Error interno del servidor. Inténtalo de nuevo más tarde.',
  502: 'Servicio temporalmente no disponible. Inténtalo de nuevo más tarde.',
  503: 'Servicio no disponible. Inténtalo de nuevo más tarde.',
};

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = errorMessages[error.status]
        ?? (error.error?.message || error.statusText)
        ?? 'Ha ocurrido un error inesperado.';

      notificationService.show(message, 'error');

      return throwError(() => error);
    }),
  );
};
