import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { BoxesService } from '../../services/boxes.service';
import { BoxImage } from '../../shared/box-image/box-image';
import { BoxSummary } from '../../models/box.models';

type BoxFilter = 'all' | 'free' | 'other';

@Component({
  selector: 'app-add-boxes-sheet',
  imports: [BoxImage],
  templateUrl: './add-boxes-sheet.html',
  styleUrl: './add-boxes-sheet.scss',
})
export class AddBoxesSheet implements OnInit {
  private readonly boxesService = inject(BoxesService);

  zoneId = input.required<string>();
  zoneName = input.required<string>();
  assignedIds = input.required<string[]>();

  closed = output<void>();
  confirmed = output<string[]>();

  allBoxes = signal<BoxSummary[]>([]);
  loading = signal(true);
  query = signal('');
  filter = signal<BoxFilter>('all');
  selected = signal<Set<string>>(new Set());

  readonly filters: { id: BoxFilter; label: string }[] = [
    { id: 'all', label: 'Todas' },
    { id: 'free', label: 'Sin zona' },
    { id: 'other', label: 'En otra zona' },
  ];

  candidates = computed(() => {
    const assigned = new Set(this.assignedIds());
    const q = this.query().toLowerCase().trim();
    const f = this.filter();
    return this.allBoxes().filter(b => {
      if (assigned.has(b.id)) return false;
      if (f === 'free' && b.zoneId) return false;
      if (f === 'other' && !b.zoneId) return false;
      if (!q) return true;
      return b.name?.toLowerCase().includes(q) || b.identifier?.toLowerCase().includes(q);
    });
  });

  movingCount = computed(() => {
    const sel = this.selected();
    return this.allBoxes().filter(b => sel.has(b.id) && b.zoneId).length;
  });

  ngOnInit(): void {
    this.boxesService.getAll().subscribe({
      next: data => {
        this.allBoxes.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggle(id: string): void {
    this.selected.update(ids => {
      const next = new Set(ids);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  confirm(): void {
    if (this.selected().size === 0) return;
    this.confirmed.emit(Array.from(this.selected()));
  }
}
