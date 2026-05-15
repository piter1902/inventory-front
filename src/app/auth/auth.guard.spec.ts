import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { firstValueFrom, Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authServiceMock: { isAuthenticated$: Observable<boolean>; login: ReturnType<typeof vi.fn> };

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;

  beforeEach(() => {
    authServiceMock = {
      isAuthenticated$: of(true),
      login: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
      ],
    });
  });

  it('should return true when authenticated', async () => {
    const result = await firstValueFrom(
      TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState)) as Observable<boolean>,
    );
    expect(result).toBe(true);
  });

  it('should call login() and return false when not authenticated', async () => {
    authServiceMock.isAuthenticated$ = of(false);

    const result = await firstValueFrom(
      TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState)) as Observable<boolean>,
    );
    expect(result).toBe(false);
    expect(authServiceMock.login).toHaveBeenCalled();
  });
});
