import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.scss',
})
export class BottomNav {
  protected drawerOpen = signal(false);

  protected toggleDrawer(): void {
    this.drawerOpen.update(v => !v);
  }

  protected closeDrawer(): void {
    this.drawerOpen.set(false);
  }
}
