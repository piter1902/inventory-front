import { Component, inject } from '@angular/core';
import { UserAvatar } from '../../shared/user-avatar/user-avatar';
import { PageHeaderService } from './page-header.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-page-header',
  imports: [UserAvatar],
  template: `
    <header
      class="w-full top-0 z-40 bg-surface shadow-sm flex items-center gap-3 px-container-padding-mobile md:px-container-padding-desktop h-16"
    >
      @if (showBack()) {
        <button
          class="active:scale-95 transition-transform hover:bg-surface-container-high p-2 rounded-full"
          style="margin-left: -8px"
          (click)="onBack()"
        >
          <span class="material-symbols-outlined text-primary">arrow_back</span>
        </button>
      }
      <app-user-avatar />
      <h1 class="text-headline-lg-mobile md:text-headline-md text-primary font-headline-md flex-1">
        {{ title() }}
      </h1>
      <button
        class="active:scale-95 transition-transform hover:bg-surface-container-high p-2 rounded-full"
        (click)="themeService.toggle()"
      >
        <span class="material-symbols-outlined text-primary">{{
          themeService.isDark() ? 'light_mode' : 'dark_mode'
        }}</span>
      </button>
    </header>
  `,
  styles: '',
})
export class PageHeader {
  private readonly headerService = inject(PageHeaderService);
  protected readonly themeService = inject(ThemeService);

  protected readonly title = this.headerService.title;
  protected readonly showBack = this.headerService.showBack;

  protected onBack(): void {
    this.headerService.back();
  }
}
