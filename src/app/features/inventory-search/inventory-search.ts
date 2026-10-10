import { Component, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { BoxesService } from '../../services/boxes.service';
import { SearchResultDto, SearchBoxResultDto, SearchItemResultDto } from '../../models/box.models';
import { BoxImage } from '../../shared/box-image/box-image';
import { PageHeaderService } from '../../layout/page-header/page-header.service';

@Component({
  selector: 'app-inventory-search',
  imports: [BoxImage],
  templateUrl: './inventory-search.html',
  host: { class: 'block min-h-dvh' },
})
export class InventorySearch implements OnInit {
  private static readonly RECENTS_KEY = 'inventory.recentSearches';

  private boxesService = inject(BoxesService);
  private router = inject(Router);

  searchQuery = signal('');
  activeFilter = signal('Todo');
  searchResult = signal<SearchResultDto | null>(null);
  hasSearched = signal(false);

  private searchSubject = new Subject<string>();

  filters = ['Todo', 'Items', 'Cajas'];
  recentSearches = signal<string[]>(this.loadRecents());

  constructor() {
    inject(PageHeaderService).setTitle('');

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => this.boxesService.search(q)),
      takeUntilDestroyed(),
    ).subscribe(result => {
      this.searchResult.set(result);
      this.hasSearched.set(true);
      this.saveRecent(this.searchQuery().trim());
    });
  }

  get filteredBoxes(): SearchBoxResultDto[] {
    const filter = this.activeFilter();
    if (filter === 'Items') return [];
    return this.searchResult()?.boxes ?? [];
  }

  get allItems(): SearchItemResultDto[] {
    const filter = this.activeFilter();
    if (filter === 'Cajas') return [];
    return this.searchResult()?.items ?? [];
  }

  ngOnInit(): void {
  }

  get boxCount(): number {
    return this.searchResult()?.boxes?.length ?? 0;
  }

  get itemCount(): number {
    return this.searchResult()?.items?.length ?? 0;
  }

  countFor(filter: string): number {
    if (filter === 'Cajas') return this.boxCount;
    if (filter === 'Items') return this.itemCount;
    return this.boxCount + this.itemCount;
  }

  /** Divide el texto en trozos para resaltar la búsqueda sin usar innerHTML. */
  highlight(text: string | undefined): { text: string; match: boolean }[] {
    const value = text ?? '';
    const q = this.searchQuery().trim();
    if (!q) return [{ text: value, match: false }];
    const index = value.toLowerCase().indexOf(q.toLowerCase());
    if (index < 0) return [{ text: value, match: false }];
    return [
      { text: value.slice(0, index), match: false },
      { text: value.slice(index, index + q.length), match: true },
      { text: value.slice(index + q.length), match: false },
    ].filter(part => part.text);
  }

  searchRecent(query: string): void {
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  removeRecent(query: string): void {
    this.updateRecents(this.recentSearches().filter(r => r !== query));
  }

  clearRecents(): void {
    this.updateRecents([]);
  }

  private saveRecent(query: string): void {
    if (!query) return;
    const next = [query, ...this.recentSearches().filter(r => r !== query)].slice(0, 5);
    this.updateRecents(next);
  }

  private updateRecents(recents: string[]): void {
    this.recentSearches.set(recents);
    try {
      localStorage.setItem(InventorySearch.RECENTS_KEY, JSON.stringify(recents));
    } catch {
      // almacenamiento no disponible: el historial solo vive en memoria
    }
  }

  private loadRecents(): string[] {
    try {
      const raw = JSON.parse(localStorage.getItem(InventorySearch.RECENTS_KEY) ?? '[]');
      return Array.isArray(raw) ? raw.filter(r => typeof r === 'string').slice(0, 5) : [];
    } catch {
      return [];
    }
  }

  setFilter(filter: string): void {
    this.activeFilter.set(filter);
  }

  onSearch(event: Event): void {
    const q = (event.target as HTMLInputElement).value;
    this.searchQuery.set(q);
    if (q.trim()) {
      this.searchSubject.next(q.trim());
    } else {
      this.searchResult.set(null);
      this.hasSearched.set(false);
    }
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchResult.set(null);
    this.hasSearched.set(false);
  }

  openBox(id: string): void {
    this.router.navigate(['/boxes', id]);
  }
}
