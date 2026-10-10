import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_ITEMS } from '../nav-items';

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.html',
  host: { class: 'block md:hidden' },
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
