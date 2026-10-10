import { Component, inject } from '@angular/core';
import { PageHeaderService } from '../page-header/page-header.service';

/** Desktop-only page title; on mobile the title lives in the header. */
@Component({
  selector: 'app-page-title',
  template: `<h1 class="page-title">{{ title() }}</h1>`,
  styleUrl: './page-title.scss',
})
export class PageTitle {
  protected readonly title = inject(PageHeaderService).title;
}
