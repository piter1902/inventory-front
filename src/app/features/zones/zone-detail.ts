import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ZonesService } from '../../services/zones.service';
import { ZoneDetailDto } from '../../models/zone.models';
import { PageHeaderService } from '../../layout/page-header/page-header.service';
import { NotificationService } from '../../services/notification.service';
import { AddBoxesSheet } from './add-boxes-sheet';

@Component({
  selector: 'app-zone-detail',
  imports: [RouterLink, AddBoxesSheet],
  templateUrl: './zone-detail.html',
  styles: `
    .zone-actions { display: flex; gap: 10px; width: 100%; margin-top: 8px; }
    .zone-add { flex: 1; height: 52px; border-radius: 26px; display: flex; align-items: center; justify-content: center; gap: 8px;
      background: var(--color-secondary); color: var(--color-on-secondary); box-shadow: 0 1px 2px rgba(0,0,0,.1); }
    .zone-edit { width: 52px; height: 52px; border-radius: 26px; display: flex; align-items: center; justify-content: center;
      border: 1.5px solid var(--color-outline-variant); background: var(--color-surface-container-lowest); color: var(--color-primary); }
    .box-fresh { border-color: color-mix(in srgb, var(--color-secondary) 50%, transparent) !important; }
    .badge-new { font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 8px;
      color: var(--color-secondary); background: color-mix(in srgb, var(--color-secondary-container) 40%, transparent); }
    .undo-toast { position: fixed; left: 16px; right: 16px; bottom: 96px; z-index: 40; max-width: 28rem; margin: 0 auto;
      display: flex; align-items: center; gap: 12px; padding: 4px 6px 4px 16px; min-height: 52px; border-radius: 16px;
      background: var(--color-on-surface); color: var(--color-surface); box-shadow: 0 8px 24px rgba(4,22,50,.28);
      .material-symbols-outlined { font-size: 20px; color: var(--color-secondary-fixed-dim); } }
    .undo-text { flex: 1; }
    .undo-btn { height: 44px; padding: 0 14px; color: var(--color-secondary-fixed); }
  `,
})
export class ZoneDetail implements OnInit {
  private zonesService = inject(ZonesService);
  private router = inject(Router);
  private readonly headerService = inject(PageHeaderService);
  private readonly notifications = inject(NotificationService);

  zoneId = input.required<string>();
  zone = signal<ZoneDetailDto | null>(null);
  sheetOpen = signal(false);
  saving = signal(false);
  freshIds = signal<Set<string>>(new Set());
  undoState = signal<{ count: number; previousIds: string[] } | null>(null);
  private undoTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.zonesService.getById(this.zoneId()).subscribe(data => {
      this.zone.set(data);
      this.headerService.setTitle(data.name);
    });
  }

  get boxes() {
    return this.zone()?.boxes ?? [];
  }

  edit(): void {
    this.router.navigate(['/zones', this.zoneId(), 'edit']);
  }

  get boxIds(): string[] {
    return this.boxes.map(b => b.id);
  }

  addBoxes(newIds: string[]): void {
    const z = this.zone();
    if (!z || this.saving()) return;
    const previousIds = this.boxIds;
    this.saving.set(true);
    this.zonesService.update(z.id, { id: z.id, name: z.name, boxIds: [...previousIds, ...newIds] }).subscribe({
      next: data => {
        this.saving.set(false);
        this.sheetOpen.set(false);
        this.zone.set(data);
        this.freshIds.set(new Set(newIds));
        this.showUndo(newIds.length, previousIds);
      },
      error: () => this.saving.set(false),
    });
  }

  undo(): void {
    const z = this.zone();
    const state = this.undoState();
    if (!z || !state) return;
    this.clearUndo();
    this.zonesService.update(z.id, { id: z.id, name: z.name, boxIds: state.previousIds }).subscribe(data => {
      this.zone.set(data);
      this.freshIds.set(new Set());
      this.notifications.show('Cambio deshecho', 'info');
    });
  }

  private showUndo(count: number, previousIds: string[]): void {
    clearTimeout(this.undoTimeout);
    this.undoState.set({ count, previousIds });
    this.undoTimeout = setTimeout(() => this.clearUndo(), 6000);
  }

  private clearUndo(): void {
    clearTimeout(this.undoTimeout);
    this.undoState.set(null);
  }
}
