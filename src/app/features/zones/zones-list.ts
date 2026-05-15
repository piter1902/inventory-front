import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ZonesService } from '../../services/zones.service';
import { ZoneDto } from '../../models/zone.models';
import { PageHeaderService } from '../../layout/page-header/page-header.service';

@Component({
  selector: 'app-zones-list',
  imports: [],
  templateUrl: './zones-list.html',
})
export class ZonesList implements OnInit {
  private zonesService = inject(ZonesService);
  private router = inject(Router);

  constructor() {
    inject(PageHeaderService).setTitle('Gestionar Zonas');
  }

  zones = signal<ZoneDto[]>([]);
  searchQuery = signal('');

  get totalZones(): number {
    return this.zones().length;
  }

  get filteredZones(): ZoneDto[] {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.zones();
    return this.zones().filter(z => z.name?.toLowerCase().includes(q));
  }

  ngOnInit(): void {
    this.zonesService.getAll().subscribe(data => this.zones.set(data));
  }

  openZone(id: string): void {
    this.router.navigate(['/zones', id]);
  }

  onCreateZone(): void {
    this.router.navigate(['/zones/new']);
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }
}
