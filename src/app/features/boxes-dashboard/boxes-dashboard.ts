import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BoxesService } from '../../services/boxes.service';
import { BoxDto } from '../../models/box.models';

@Component({
  selector: 'app-boxes-dashboard',
  imports: [],
  templateUrl: './boxes-dashboard.html',
  styleUrl: './boxes-dashboard.scss',
})
export class BoxesDashboard implements OnInit {
  private boxesService = inject(BoxesService);
  private router = inject(Router);

  boxes = signal<BoxDto[]>([]);
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
    return this.boxes().filter(
      b =>
        b.name?.toLowerCase().includes(q) ||
        b.identifier?.toLowerCase().includes(q)
    );
  }

  ngOnInit(): void {
    this.boxesService.getAll().subscribe(data => this.boxes.set(data));
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
