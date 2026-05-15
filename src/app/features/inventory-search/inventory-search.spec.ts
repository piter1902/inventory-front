import { TestBed } from '@angular/core/testing';
import { InventorySearch } from './inventory-search';
import { BoxesService } from '../../services/boxes.service';
import { PageHeaderService } from '../../layout/page-header/page-header.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { SearchResultDto } from '../../models/box.models';

describe('InventorySearch', () => {
  const mockSearchResult: SearchResultDto = {
    boxes: [
      { id: 'box-1', name: 'Tools', description: 'Tool box' },
      { id: 'box-2', name: 'Books', description: 'Book shelf' },
    ],
    items: [
      { id: 'item-1', name: 'Hammer', description: 'A hammer', boxId: 'box-1', boxName: 'Tools' },
    ],
  };

  let fixture: any;
  let component: InventorySearch;
  let mockBoxesService: { search: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let mockPageHeaderService: { setTitle: ReturnType<typeof vi.fn> };

  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(async () => {
    mockBoxesService = { search: vi.fn(() => of(mockSearchResult)) };
    mockRouter = { navigate: vi.fn() };
    mockPageHeaderService = { setTitle: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [InventorySearch],
      providers: [
        { provide: BoxesService, useValue: mockBoxesService },
        { provide: Router, useValue: mockRouter },
        { provide: PageHeaderService, useValue: mockPageHeaderService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InventorySearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set page header title in constructor', () => {
    expect(mockPageHeaderService.setTitle).toHaveBeenCalledWith('Home Inventory');
  });

  it('should initialize with default filter set to Todo', () => {
    expect(component.activeFilter()).toBe('Todo');
  });

  it('should initialize with hasSearched as false', () => {
    expect(component.hasSearched()).toBe(false);
  });

  describe('setFilter', () => {
    it('should set activeFilter to the given value', () => {
      component.setFilter('Cajas');
      expect(component.activeFilter()).toBe('Cajas');
    });

    it('should set activeFilter to Items', () => {
      component.setFilter('Items');
      expect(component.activeFilter()).toBe('Items');
    });

    it('should set activeFilter back to Todo', () => {
      component.setFilter('Cajas');
      component.setFilter('Todo');
      expect(component.activeFilter()).toBe('Todo');
    });
  });

  describe('clearSearch', () => {
    it('should reset searchQuery to empty string', () => {
      component.searchQuery.set('some query');
      component.clearSearch();
      expect(component.searchQuery()).toBe('');
    });

    it('should reset searchResult to null', () => {
      component.searchResult.set(mockSearchResult);
      component.clearSearch();
      expect(component.searchResult()).toBeNull();
    });

    it('should reset hasSearched to false', () => {
      component.hasSearched.set(true);
      component.clearSearch();
      expect(component.hasSearched()).toBe(false);
    });
  });

  describe('openBox', () => {
    it('should navigate to box detail', () => {
      component.openBox('box-1');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/boxes', 'box-1']);
    });

    it('should navigate with different box id', () => {
      component.openBox('box-42');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/boxes', 'box-42']);
    });
  });

  describe('search with debounce', () => {
    it('should debounce search calls and call service after debounce time', () => {
      vi.useFakeTimers();
      const f = TestBed.createComponent(InventorySearch);
      const c = f.componentInstance;
      f.detectChanges();

      const input = f.nativeElement.querySelector('input') as HTMLInputElement;
      input.value = 'test';
      input.dispatchEvent(new Event('input'));

      expect(mockBoxesService.search).not.toHaveBeenCalled();

      vi.advanceTimersByTime(400);

      expect(mockBoxesService.search).toHaveBeenCalledWith('test');
      expect(c.hasSearched()).toBe(true);

      vi.useRealTimers();
    });

    it('should not call search service for empty query', () => {
      vi.useFakeTimers();
      const f = TestBed.createComponent(InventorySearch);
      const c = f.componentInstance;
      f.detectChanges();

      const input = f.nativeElement.querySelector('input') as HTMLInputElement;
      input.value = '';
      input.dispatchEvent(new Event('input'));

      vi.advanceTimersByTime(400);

      expect(mockBoxesService.search).not.toHaveBeenCalled();
      expect(c.hasSearched()).toBe(false);

      vi.useRealTimers();
    });

    it('should trim whitespace from query before sending to API', () => {
      vi.useFakeTimers();
      const f = TestBed.createComponent(InventorySearch);
      const c = f.componentInstance;
      f.detectChanges();

      c.onSearch({ target: { value: '  test  ' } } as any);

      vi.advanceTimersByTime(400);

      expect(mockBoxesService.search).toHaveBeenCalledWith('test');

      vi.useRealTimers();
    });
  });

  describe('filteredBoxes', () => {
    it('should return boxes when filter is Todo and searchResult exists', () => {
      component.searchResult.set(mockSearchResult);
      expect(component.filteredBoxes.length).toBe(2);
    });

    it('should return boxes when filter is Cajas', () => {
      component.setFilter('Cajas');
      component.searchResult.set(mockSearchResult);
      expect(component.filteredBoxes.length).toBe(2);
    });

    it('should return empty when filter is Items regardless of searchResult', () => {
      component.setFilter('Items');
      component.searchResult.set(mockSearchResult);
      expect(component.filteredBoxes.length).toBe(0);
    });

    it('should return empty array when searchResult is null', () => {
      expect(component.filteredBoxes).toEqual([]);
    });

    it('should return empty when searchResult has no boxes', () => {
      component.searchResult.set({ boxes: [], items: [] });
      expect(component.filteredBoxes.length).toBe(0);
    });
  });

  describe('allItems', () => {
    it('should return items when filter is Todo and searchResult exists', () => {
      component.searchResult.set(mockSearchResult);
      expect(component.allItems.length).toBe(1);
    });

    it('should return items when filter is Items', () => {
      component.setFilter('Items');
      component.searchResult.set(mockSearchResult);
      expect(component.allItems.length).toBe(1);
    });

    it('should return empty when filter is Cajas regardless of searchResult', () => {
      component.setFilter('Cajas');
      component.searchResult.set(mockSearchResult);
      expect(component.allItems.length).toBe(0);
    });

    it('should return empty array when searchResult is null', () => {
      expect(component.allItems).toEqual([]);
    });

    it('should return empty when searchResult has no items', () => {
      component.searchResult.set({ boxes: [], items: [] });
      expect(component.allItems.length).toBe(0);
    });
  });
});
