import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_ITEMS } from '../nav-items';

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.scss',
})
export class BottomNav {
  protected readonly barItems = NAV_ITEMS.filter(i => i.mobile === 'bar');
  protected readonly drawerItems = NAV_ITEMS.filter(i => i.mobile === 'drawer');

  protected drawerOpen = signal(false);

  protected toggleDrawer(): void {
    this.drawerOpen.update(v => !v);
  }

  protected closeDrawer(): void {
    this.drawerOpen.set(false);
  }
}
