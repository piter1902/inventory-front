import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { BoxesService } from '../../services/boxes.service';
import { SearchResultDto, SearchBoxResultDto, SearchItemResultDto } from '../../models/box.models';
import { PageHeaderService } from '../../layout/page-header/page-header.service';

@Component({
  selector: 'app-inventory-search',
  imports: [],
  templateUrl: './inventory-search.html',
  styleUrl: './inventory-search.scss',
})
export class InventorySearch implements OnInit {
  private boxesService = inject(BoxesService);
  private router = inject(Router);

  searchQuery = signal('');
  activeFilter = signal('Todo');
  searchResult = signal<SearchResultDto | null>(null);
  hasSearched = signal(false);

  private searchSubject = new Subject<string>();

  filters = ['Todo', 'Cajas', 'Items'];

  constructor() {
    inject(PageHeaderService).setTitle('Home Inventory');

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => this.boxesService.search(q))
    ).subscribe(result => {
      this.searchResult.set(result);
      this.hasSearched.set(true);
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
