import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BoxesService } from '../../services/boxes.service';
import { ZonesService } from '../../services/zones.service';
import { BoxSummary } from '../../models/box.models';
import { PageHeaderService } from '../../layout/page-header/page-header.service';
import { BoxImage } from '../../shared/box-image/box-image';
import { CreateButton } from '../../shared/create-button/create-button';
import { NotificationService } from '../../services/notification.service';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { BoxActionsSheet } from './box-actions-sheet';

@Component({
  selector: 'app-boxes-dashboard',
  imports: [RouterLink, CreateButton, BoxImage, BoxActionsSheet, ConfirmDialog],
  templateUrl: './boxes-dashboard.html',
  host: { class: 'block min-h-dvh' },
})
export class BoxesDashboard implements OnInit {
  private boxesService = inject(BoxesService);
  private zonesService = inject(ZonesService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  constructor() {
    inject(PageHeaderService).setTitle('Home Inventory');
  }

  boxes = signal<BoxSummary[]>([]);
  zoneMap = signal<Map<string, string>>(new Map());
  searchQuery = signal('');
  actionsBox = signal<BoxSummary | null>(null);
  confirmBox = signal<BoxSummary | null>(null);
  deletingId = signal<string | null>(null);

  private readonly actionsSheet = viewChild(BoxActionsSheet);
  private actionsTrigger: HTMLElement | null = null;

  get totalBoxes(): number {
    return this.boxes().length;
  }

  get totalItems(): number {
    return this.boxes().reduce((sum, b) => sum + (b.items?.length ?? 0), 0);
  }

  get filteredBoxes(): BoxSummary[] {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.boxes();
    return this.boxes().filter(
      (b) =>
        b.name?.toLowerCase().includes(q) ||
        b.identifier?.toLowerCase().includes(q) ||
        this.zoneName(b.zoneId)?.toLowerCase().includes(q),
    );
  }

  ngOnInit(): void {
    this.zonesService.getAll().subscribe((zones) => {
      this.zoneMap.set(new Map(zones.map((z) => [z.id, z.name])));
    });
    this.boxesService.getAll().subscribe((data) => this.boxes.set(data));
  }

  zoneName(zoneId: string | undefined): string | undefined {
    if (!zoneId) return undefined;
    return this.zoneMap().get(zoneId);
  }

  openBox(id: string): void {
    this.dismissActions();
    this.router.navigate(['/boxes', id]);
  }

  onCreateBox(): void {
    this.router.navigate(['/boxes/new']);
  }

  openActions(event: MouseEvent, box: BoxSummary): void {
    event.stopPropagation();
    if (this.deletingId() === box.id) return;
    this.actionsTrigger = event.currentTarget as HTMLElement;
    this.actionsBox.set(box);
  }

  /** The sheet was dismissed without choosing an action: give focus back to its three-dots button. */
  closeActions(): void {
    const trigger = this.actionsTrigger;
    this.dismissActions();
    trigger?.focus();
  }

  editBox(id: string): void {
    this.dismissActions();
    this.router.navigate(['/boxes', id, 'edit']);
  }

  moveItemsFromBox(id: string): void {
    this.dismissActions();
    this.router.navigate(['/boxes', id, 'move-items']);
  }

  deleteMessage(name: string): string {
    return `Se eliminará "${name}" y todo su contenido. Esta acción no se puede deshacer.`;
  }

  confirmDelete(box: BoxSummary): void {
    this.confirmBox.set(null);
    this.deletingId.set(box.id);
    this.actionsSheet()?.close();

    this.boxesService.delete(box.id).subscribe({
      next: () => {
        this.boxes.update((list) => list.filter((b) => b.id !== box.id));
        this.notificationService.show(`Caja "${box.name}" eliminada`, 'success');
        this.deletingId.set(null);
      },
      error: () => {
        this.deletingId.set(null);
      },
    });
  }

  private dismissActions(): void {
    this.actionsBox.set(null);
    this.actionsTrigger = null;
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }
}
