import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { take } from 'rxjs';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: '',
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private readonly router: Router,
    private readonly oidcSecurityService: OidcSecurityService,
  ) {}

  ngOnInit(): void {
    this.oidcSecurityService
      .checkAuth()
      .pipe(take(1))
      .subscribe(({ isAuthenticated, errorMessage }) => {
        if (isAuthenticated) {
          this.router.navigateByUrl('/boxes');
        } else if (errorMessage) {
          this.router.navigateByUrl('/unauthorized');
        }
      });
  }
}
