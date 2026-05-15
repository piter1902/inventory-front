import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <div
      class="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed-dim active:scale-95 transition-transform cursor-pointer flex items-center justify-center bg-primary-container text-on-primary-container font-bold text-sm"
    >
      {{ initials$ | async }}
    </div>
  `,
})
export class UserAvatar {
  private authService = inject(AuthService);

  protected initials$ = this.authService.userData$.pipe(
    map(data => getInitials(data?.userData)),
  );
}

export function getInitials(userData: Record<string, any> | undefined): string {
  if (!userData) return '?';

  const name = userData['name'];
  if (name) {
    const parts = String(name).split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  const givenName = userData['given_name'];
  const familyName = userData['family_name'];
  if (givenName || familyName) {
    return ((givenName?.[0] ?? '') + (familyName?.[0] ?? '')).toUpperCase();
  }

  const email = userData['email'];
  if (email) {
    return email[0].toUpperCase();
  }

  return '?';
}
