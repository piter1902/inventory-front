import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { BottomNav } from '../bottom-nav/bottom-nav';
import { PageHeader } from '../page-header/page-header';
import { PageHeaderService } from '../page-header/page-header.service';
import { Notifications } from '../../shared/notifications/notifications';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, BottomNav, PageHeader, Notifications],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
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
    ).subscribe(data => {
      headerService.setShowBack(data['showBack'] !== false);
    });
  }
}
