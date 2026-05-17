import { Injectable } from '@angular/core';
import { OidcSecurityService, LoginResponse } from 'angular-auth-oidc-client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private readonly oidcSecurityService: OidcSecurityService) {}

  get isAuthenticated$(): Observable<boolean> {
    return this.oidcSecurityService.isAuthenticated$.pipe(map(r => r.isAuthenticated));
  }

  get userData$(): Observable<any> {
    return this.oidcSecurityService.userData$;
  }

  login(): void {
    sessionStorage.setItem('auth_redirect', window.location.pathname);
    this.oidcSecurityService.authorize();
  }

  getRedirectUrl(): string {
    return sessionStorage.getItem('auth_redirect') || '/boxes';
  }

  clearRedirectUrl(): void {
    sessionStorage.removeItem('auth_redirect');
  }

  logout(): void {
    this.oidcSecurityService.logoff();
  }

  checkAuth(): Observable<LoginResponse> {
    return this.oidcSecurityService.checkAuth();
  }
}
