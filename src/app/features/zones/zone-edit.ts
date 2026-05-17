import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ZonesService } from '../../services/zones.service';
import { BoxesService } from '../../services/boxes.service';
import { BoxDto } from '../../models/box.models';
import { CreateZoneCommand, UpdateZoneCommand } from '../../models/zone.models';
import { PageHeaderService } from '../../layout/page-header/page-header.service';

@Component({
  selector: 'app-zone-edit',
  imports: [],
  templateUrl: './zone-edit.html',
})
export class ZoneEdit implements OnInit {
  private zonesService = inject(ZonesService);
  private boxesService = inject(BoxesService);
  private router = inject(Router);
  private readonly headerService = inject(PageHeaderService);

  zoneId = input<string>();
  isEditing = signal(false);

  name = signal('');
  saving = signal(false);
  nameError = signal(false);

  allBoxes = signal<BoxDto[]>([]);
  selectedBoxIds = signal<Set<string>>(new Set());
  searchQuery = signal('');

  constructor() {
    this.headerService.setTitle('Nueva Zona');
  }

  ngOnInit(): void {
    this.boxesService.getAll().subscribe(data => this.allBoxes.set(data));

    const id = this.zoneId();
    if (id) {
      this.isEditing.set(true);
      this.headerService.setTitle('Editar Zona');
      this.zonesService.getById(id).subscribe(data => {
        this.name.set(data.name);
        this.selectedBoxIds.set(new Set(data.boxes.map(b => b.id)));
      });
    }
  }

  get selectedBoxes(): BoxDto[] {
    const ids = this.selectedBoxIds();
    return this.allBoxes().filter(b => ids.has(b.id));
  }

  get availableBoxes(): BoxDto[] {
    const ids = this.selectedBoxIds();
    const q = this.searchQuery().toLowerCase().trim();
    return this.allBoxes().filter(b => {
      if (ids.has(b.id)) return false;
      if (!q) return true;
      return b.name?.toLowerCase().includes(q) || b.identifier?.toLowerCase().includes(q);
    });
  }

  updateName(value: string): void {
    this.name.set(value);
    if (value.trim()) this.nameError.set(false);
  }

  toggleBox(boxId: string): void {
    this.selectedBoxIds.update(ids => {
      const next = new Set(ids);
      if (next.has(boxId)) next.delete(boxId); else next.add(boxId);
      return next;
    });
  }

  removeBox(boxId: string): void {
    this.selectedBoxIds.update(ids => {
      const next = new Set(ids);
      next.delete(boxId);
      return next;
    });
  }

  save(): void {
    const trimmedName = this.name().trim();
    if (!trimmedName) {
      this.nameError.set(true);
      return;
    }

    this.saving.set(true);
    const id = this.zoneId();

    if (id) {
      const command: UpdateZoneCommand = {
        id,
        name: trimmedName,
        boxIds: Array.from(this.selectedBoxIds()),
      };
      this.zonesService.update(id, command).subscribe({
        next: () => {
          this.saving.set(false);
          this.router.navigate(['/zones', id]);
        },
        error: () => {
          this.saving.set(false);
        },
      });
    } else {
      const command: CreateZoneCommand = { name: trimmedName };
      this.zonesService.create(command).subscribe({
        next: zone => {
          this.saving.set(false);
          this.router.navigate(['/zones', zone.id]);
        },
        error: () => {
          this.saving.set(false);
        },
      });
    }
  }

  delete(): void {
    const id = this.zoneId();
    if (!id) return;
    if (!confirm('¿Estás seguro de que quieres eliminar esta zona?')) return;

    this.saving.set(true);
    this.zonesService.delete(id).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/zones']);
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }
}
