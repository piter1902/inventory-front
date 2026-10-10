import { Component, inject } from '@angular/core';
import { PageHeaderService } from '../page-header/page-header.service';

/** Desktop-only page title; on mobile the title lives in the header. */
@Component({
  selector: 'app-page-title',
  template: `<h1 class="text-[28px] leading-9 font-bold text-primary">{{ title() }}</h1>`,
  host: { class: 'hidden md:block max-w-[1280px] mx-auto pt-6 px-8' },
})
export class PageTitle {
  protected readonly title = inject(PageHeaderService).title;
}
