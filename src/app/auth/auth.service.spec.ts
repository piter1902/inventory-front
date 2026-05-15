import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { AuthService } from './auth.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';

describe('AuthService', () => {
  let service: AuthService;
  let authorize: ReturnType<typeof vi.fn>;
  let logoff: ReturnType<typeof vi.fn>;
  let checkAuth: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    authorize = vi.fn();
    logoff = vi.fn();
    checkAuth = vi.fn().mockReturnValue(
      of({ isAuthenticated: true, errorMessage: null, userData: null, accessToken: null, idToken: null }),
    );

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {
          provide: OidcSecurityService,
          useValue: {
            isAuthenticated$: of({ isAuthenticated: true }),
            userData$: of({ userData: { name: 'John Doe', email: 'john@example.com' } }),
            authorize,
            logoff,
            checkAuth,
          } as unknown as OidcSecurityService,
        },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('should return isAuthenticated flag from isAuthenticated$', async () => {
    const result = await firstValueFrom(service.isAuthenticated$);
    expect(result).toBe(true);
  });

  it('should return userData from userData$', async () => {
    const result = await firstValueFrom(service.userData$);
    expect(result).toEqual({ userData: { name: 'John Doe', email: 'john@example.com' } });
  });

  it('should call authorize() on login()', () => {
    service.login();
    expect(authorize).toHaveBeenCalled();
  });

  it('should call logoff() on logout()', () => {
    service.logout();
    expect(logoff).toHaveBeenCalled();
  });

  it('should return checkAuth result', async () => {
    const result = await firstValueFrom(service.checkAuth());
    expect(result.isAuthenticated).toBe(true);
  });
});
