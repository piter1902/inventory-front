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
    this.oidcSecurityService.authorize();
  }

  logout(): void {
    this.oidcSecurityService.logoff();
  }

  checkAuth(): Observable<LoginResponse> {
    return this.oidcSecurityService.checkAuth();
  }
}
