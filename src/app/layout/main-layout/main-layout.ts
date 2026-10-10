import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { BottomNav } from '../bottom-nav/bottom-nav';
import { PageTitle } from '../page-title/page-title';
import { PageHeader } from '../page-header/page-header';
import { PageHeaderService } from '../page-header/page-header.service';
import { Notifications } from '../../shared/notifications/notifications';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, BottomNav, PageHeader, PageTitle, Notifications],
  templateUrl: './main-layout.html',
  host: { class: 'block min-h-dvh pb-20 md:pb-0' },
})
export class MainLayout {
  constructor() {
    const router = inject(Router);
    const headerService = inject(PageHeaderService);

    router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => {
        let route = router.routerState.root;
        while (route.firstChild) route = route.firstChild;
        return route.snapshot.data;
      }),
      takeUntilDestroyed(),
    ).subscribe(data => {
      headerService.setShowBack(data['showBack'] !== false);
    });
  }
}
