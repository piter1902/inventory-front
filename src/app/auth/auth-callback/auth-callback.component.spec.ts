import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { of } from 'rxjs';
import { AuthCallbackComponent } from './auth-callback.component';

describe('AuthCallbackComponent', () => {
  let routerMock: { navigateByUrl: ReturnType<typeof vi.fn> };
  let oidcSecurityServiceMock: { checkAuth: ReturnType<typeof vi.fn> };

  async function createComponent(): Promise<ComponentFixture<AuthCallbackComponent>> {
    await TestBed.configureTestingModule({
      imports: [AuthCallbackComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: OidcSecurityService, useValue: oidcSecurityServiceMock },
      ],
    }).compileComponents();

    return TestBed.createComponent(AuthCallbackComponent);
  }

  beforeEach(() => {
    routerMock = { navigateByUrl: vi.fn().mockResolvedValue(true) };
    oidcSecurityServiceMock = { checkAuth: vi.fn() };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call checkAuth on init', async () => {
    oidcSecurityServiceMock.checkAuth.mockReturnValue(of({ isAuthenticated: true, errorMessage: null }));
    const fixture = await createComponent();
    fixture.componentInstance.ngOnInit();
    expect(oidcSecurityServiceMock.checkAuth).toHaveBeenCalled();
  });

  it('should navigate to /boxes on successful auth', async () => {
    oidcSecurityServiceMock.checkAuth.mockReturnValue(of({ isAuthenticated: true, errorMessage: null }));
    const fixture = await createComponent();
    fixture.componentInstance.ngOnInit();
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/boxes');
  });

  it('should navigate to /unauthorized on error', async () => {
    oidcSecurityServiceMock.checkAuth.mockReturnValue(of({ isAuthenticated: false, errorMessage: 'error' }));
    const fixture = await createComponent();
    fixture.componentInstance.ngOnInit();
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/unauthorized');
  });
});
