import { Component, inject } from '@angular/core';
import { PageHeaderService } from '../page-header/page-header.service';

/** Desktop-only page title; on mobile the title lives in the header. */
@Component({
  selector: 'app-page-title',
  template: `
    @if (title()) {
      <h1 class="max-w-[1280px] mx-auto pt-6 px-8 text-[28px] leading-9 font-bold text-primary">{{ title() }}</h1>
    }
  `,
  host: { class: 'hidden md:block' },
})
export class PageTitle {
  protected readonly title = inject(PageHeaderService).title;
}
