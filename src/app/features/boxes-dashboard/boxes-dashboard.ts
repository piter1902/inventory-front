import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
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

interface DialogOpening {
  box: BoxSummary;
  key: number;
}

const asList = <T>(value: T | null): T[] => (value ? [value] : []);

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
  private host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private injector = inject(Injector);
  private destroyRef = inject(DestroyRef);

  constructor() {
    inject(PageHeaderService).setTitle('Home Inventory');
  }

  boxes = signal<BoxSummary[]>([]);
  zoneMap = signal<Map<string, string>>(new Map());
  searchQuery = signal('');
  /** The open actions sheet and delete confirmation. Every opening gets a new key, so the
   *  template creates a fresh dialog even while the previous one is still animating out. */
  actionsOpening = signal<DialogOpening | null>(null);
  confirmOpening = signal<DialogOpening | null>(null);
  actionsSheetOpenings = computed(() => asList(this.actionsOpening()));
  confirmOpenings = computed(() => asList(this.confirmOpening()));
  /** Ids of the boxes whose DELETE is in flight; several can run at once. */
  deletingIds = signal<ReadonlySet<string>>(new Set());

  private readonly actionsSheet = viewChild(BoxActionsSheet);
  private actionsTrigger: HTMLElement | null = null;
  private removedBoxIndex = 0;
  private nextOpeningKey = 0;

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
    if (this.isDeleting(box.id)) return;
    this.actionsTrigger = event.currentTarget as HTMLElement;
    this.actionsOpening.set(this.openingFor(box));
  }

  /** The sheet was dismissed without choosing an action: give focus back to its three-dots button. */
  closeActions(key: number): void {
    // Without exit animations a sheet can report `closed` after a newer one was opened.
    if (this.actionsOpening()?.key !== key) return;
    const trigger = this.actionsTrigger;
    this.dismissActions();
    // The browser usually returns focus itself (Safari does not focus buttons on click, though);
    // only step in when focus is lost, so a user who already moved on is not pulled back.
    if (!trigger || !this.focusIsLost()) return;
    if (trigger.isConnected) trigger.focus();
    else this.focusNearestBox(this.removedBoxIndex);
  }

  editBox(id: string): void {
    this.dismissActions();
    this.router.navigate(['/boxes', id, 'edit']);
  }

  moveItemsFromBox(id: string): void {
    this.dismissActions();
    this.router.navigate(['/boxes', id, 'move-items']);
  }

  requestDelete(box: BoxSummary): void {
    this.confirmOpening.set(this.openingFor(box));
  }

  closeConfirmation(key: number): void {
    if (this.confirmOpening()?.key === key) this.confirmOpening.set(null);
  }

  deleteMessage(name: string): string {
    return `Se eliminará "${name}" y todo su contenido. Esta acción no se puede deshacer.`;
  }

  /** Runs as soon as the user confirms: the sheet starts closing together with the confirmation. */
  confirmDelete(box: BoxSummary): void {
    this.setDeleting(box.id, true);
    this.actionsSheet()?.close();

    this.boxesService.delete(box.id).subscribe({
      next: () => {
        const index = this.filteredBoxes.findIndex((b) => b.id === box.id);
        this.boxes.update((list) => list.filter((b) => b.id !== box.id));
        this.notificationService.show(`Caja "${box.name}" eliminada`, 'success');
        this.setDeleting(box.id, false);
        this.keepFocusAfterRemoval(index);
      },
      error: () => {
        this.setDeleting(box.id, false);
      },
    });
  }

  isDeleting(id: string): boolean {
    return this.deletingIds().has(id);
  }

  private setDeleting(id: string, deleting: boolean): void {
    this.deletingIds.update((ids) => {
      const next = new Set(ids);
      if (deleting) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  /** The removed card took its three-dots button with it; move focus once the list re-renders. */
  private keepFocusAfterRemoval(index: number): void {
    this.removedBoxIndex = index;
    // The user may have left the dashboard while the DELETE was in flight.
    if (this.destroyRef.destroyed) return;
    afterNextRender(() => this.focusIsLost() && this.focusNearestBox(index), {
      injector: this.injector,
    });
  }

  /** Focus the three-dots button now at `index`, or the search field when no box is left. */
  private focusNearestBox(index: number): void {
    const buttons = this.host.querySelectorAll<HTMLElement>('button[aria-haspopup="dialog"]');
    const nearest = Math.max(0, Math.min(index, buttons.length - 1));
    (buttons[nearest] ?? this.host.querySelector('input'))?.focus();
  }

  /** Focus is on nothing, on a removed element, or inside a dialog that has been closed. */
  private focusIsLost(): boolean {
    const doc = this.host.ownerDocument;
    const active = doc.activeElement;
    return (
      !active ||
      active === doc.body ||
      !active.isConnected ||
      !!active.closest('dialog:not([open])')
    );
  }

  private openingFor(box: BoxSummary): DialogOpening {
    return { box, key: this.nextOpeningKey++ };
  }

  private dismissActions(): void {
    this.actionsOpening.set(null);
    this.actionsTrigger = null;
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }
}
