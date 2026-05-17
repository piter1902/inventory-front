import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BoxesService } from '../../services/boxes.service';
import { ZonesService } from '../../services/zones.service';
import { BoxDto } from '../../models/box.models';
import { PageHeaderService } from '../../layout/page-header/page-header.service';

@Component({
  selector: 'app-boxes-dashboard',
  imports: [RouterLink],
  templateUrl: './boxes-dashboard.html',
  styleUrl: './boxes-dashboard.scss',
})
export class BoxesDashboard implements OnInit {
  private boxesService = inject(BoxesService);
  private zonesService = inject(ZonesService);
  private router = inject(Router);

  constructor() {
    inject(PageHeaderService).setTitle('Home Inventory');
  }

  boxes = signal<BoxDto[]>([]);
  zoneMap = signal<Map<string, string>>(new Map());
  searchQuery = signal('');

  get totalBoxes(): number {
    return this.boxes().length;
  }

  get totalItems(): number {
    return this.boxes().reduce((sum, b) => sum + (b.items?.length ?? 0), 0);
  }

  get filteredBoxes(): BoxDto[] {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.boxes();
    return this.boxes().filter(b =>
      b.name?.toLowerCase().includes(q) ||
      b.identifier?.toLowerCase().includes(q) ||
      this.zoneName(b.zoneId)?.toLowerCase().includes(q)
    );
  }

  ngOnInit(): void {
    this.zonesService.getAll().subscribe(zones => {
      this.zoneMap.set(new Map(zones.map(z => [z.id, z.name])));
    });
    this.boxesService.getAll().subscribe(data => this.boxes.set(data));
  }

  zoneName(zoneId: string | undefined): string | undefined {
    if (!zoneId) return undefined;
    return this.zoneMap().get(zoneId);
  }

  openBox(id: string): void {
    this.router.navigate(['/boxes', id]);
  }

  onCreateBox(): void {
    this.router.navigate(['/boxes/new']);
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }
}
