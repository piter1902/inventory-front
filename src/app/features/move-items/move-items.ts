import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BoxesService } from '../../services/boxes.service';
import { ItemsService } from '../../services/items.service';
import { PageHeaderService } from '../../layout/page-header/page-header.service';
import { NotificationService } from '../../services/notification.service';
import { BoxDto, MoveItemsResult } from '../../models/box.models';

@Component({
  selector: 'app-move-items',
  imports: [],
  templateUrl: './move-items.html',
  styleUrl: './move-items.scss',
})
export class MoveItems implements OnInit {
  private boxesService = inject(BoxesService);
  private itemsService = inject(ItemsService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  boxId = input.required<string>();

  constructor() {
    inject(PageHeaderService).setTitle('Mover items');
  }

  sourceBox = signal<BoxDto | null>(null);
  allBoxes = signal<BoxDto[]>([]);
  selectedItemIds = signal<Set<string>>(new Set());
  destinationBoxId = signal<string | null>(null);
  destinationSearch = signal('');
  showDestinationPicker = signal(false);
  moving = signal(false);
  result = signal<MoveItemsResult | null>(null);

  get destinationBox(): BoxDto | null {
    const id = this.destinationBoxId();
    if (!id) return null;
    return this.allBoxes().find(b => b.id === id) ?? null;
  }

  get filteredDestinationBoxes(): BoxDto[] {
    const q = this.destinationSearch().toLowerCase().trim();
    const boxes = this.allBoxes().filter(b => b.id !== this.boxId());
    if (!q) return boxes;
    return boxes.filter(b => b.name?.toLowerCase().includes(q) || b.identifier?.toLowerCase().includes(q));
  }

  ngOnInit(): void {
    this.boxesService.getById(this.boxId()).subscribe(data => {
      this.sourceBox.set(data);
    });
    this.boxesService.getAll().subscribe(data => {
      this.allBoxes.set(data);
    });
  }

  toggleItem(itemId: string): void {
    this.selectedItemIds.update(set => {
      const next = new Set(set);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }

  selectAll(): void {
    const items = this.sourceBox()?.items ?? [];
    this.selectedItemIds.set(new Set(items.map(i => i.id)));
  }

  deselectAll(): void {
    this.selectedItemIds.set(new Set());
  }

  openDestinationPicker(): void {
    this.destinationSearch.set('');
    this.showDestinationPicker.set(true);
  }

  selectDestination(boxId: string): void {
    this.destinationBoxId.set(boxId);
    this.showDestinationPicker.set(false);
  }

  clearDestination(): void {
    this.destinationBoxId.set(null);
  }

  move(): void {
    const sourceId = this.boxId();
    const destId = this.destinationBoxId();
    const itemIds = Array.from(this.selectedItemIds());

    if (!sourceId || !destId || itemIds.length === 0) return;

    this.moving.set(true);
    this.itemsService.move(sourceId, { itemIds, destinationBoxId: destId }).subscribe({
      next: res => {
        this.moving.set(false);
        this.result.set(res);
        if (res.failureCount === 0) {
          this.notificationService.show(`${res.successCount} items movidos correctamente`, 'success');
        } else {
          this.notificationService.show(`${res.successCount} movidos, ${res.failureCount} fallos`, 'error');
        }
      },
      error: () => {
        this.moving.set(false);
      },
    });
  }

  goToBox(boxId: string): void {
    this.router.navigate(['/boxes', boxId]);
  }

  reset(): void {
    this.selectedItemIds.set(new Set());
    this.destinationBoxId.set(null);
    this.result.set(null);
    this.ngOnInit();
  }
}
