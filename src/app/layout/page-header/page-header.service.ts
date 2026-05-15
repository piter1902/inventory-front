import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class PageHeaderService {
  private readonly router = inject(Router);

  readonly title = signal('');
  readonly showBack = signal(false);

  setTitle(title: string): void {
    this.title.set(title);
  }

  setShowBack(show: boolean): void {
    this.showBack.set(show);
  }

  back(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigateByUrl('/boxes');
    }
  }
}
