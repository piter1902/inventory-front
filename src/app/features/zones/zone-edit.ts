import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ZonesService } from '../../services/zones.service';
import { CreateZoneCommand, UpdateZoneRequest } from '../../models/zone.models';
import { PageHeaderService } from '../../layout/page-header/page-header.service';

@Component({
  selector: 'app-zone-edit',
  imports: [],
  templateUrl: './zone-edit.html',
})
export class ZoneEdit implements OnInit {
  private zonesService = inject(ZonesService);
  private router = inject(Router);
  private readonly headerService = inject(PageHeaderService);

  zoneId = input<string>();
  isEditing = signal(false);

  name = signal('');
  saving = signal(false);
  nameError = signal(false);

  constructor() {
    this.headerService.setTitle('Nueva Zona');
  }

  ngOnInit(): void {
    const id = this.zoneId();
    if (id) {
      this.isEditing.set(true);
      this.headerService.setTitle('Editar Zona');
      this.zonesService.getById(id).subscribe(data => {
        if (data) {
          this.name.set(data.name ?? '');
        }
      });
    }
  }

  updateName(value: string): void {
    this.name.set(value);
    if (value.trim()) this.nameError.set(false);
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
      const request: UpdateZoneRequest = { name: trimmedName };
      this.zonesService.update(id, request).subscribe({
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
