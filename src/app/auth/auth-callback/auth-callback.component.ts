import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AuthService } from '../auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: '',
})
export class AuthCallbackComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.oidcSecurityService
      .checkAuth()
      .pipe(take(1))
      .subscribe(({ isAuthenticated, errorMessage }) => {
        if (isAuthenticated) {
          const redirect = this.authService.getRedirectUrl();
          this.authService.clearRedirectUrl();
          this.router.navigateByUrl(redirect);
        } else if (errorMessage) {
          this.router.navigateByUrl('/unauthorized');
        }
      });
  }
}
