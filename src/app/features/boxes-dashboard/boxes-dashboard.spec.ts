import { TestBed } from '@angular/core/testing';
import { BoxesDashboard } from './boxes-dashboard';
import { BoxesService } from '../../services/boxes.service';
import { PageHeaderService } from '../../layout/page-header/page-header.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { BoxDto } from '../../models/box.models';

describe('BoxesDashboard', () => {
  const mockBoxes: BoxDto[] = [
    { id: '1', identifier: 'BOX-001', name: 'Tools', qrUrl: '', imageBase64: '', items: [{ id: 'i1', name: 'Hammer', description: 'A hammer' }] },
    { id: '2', identifier: 'BOX-002', name: 'Books', qrUrl: '', items: [] },
    { id: '3', identifier: 'BOX-003', name: 'Toolshed', qrUrl: '', items: [{ id: 'i2', name: 'Shovel', description: '' }, { id: 'i3', name: 'Rake', description: '' }] },
  ];

  let fixture: any;
  let component: BoxesDashboard;
  let mockBoxesService: { getAll: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let mockPageHeaderService: { setTitle: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockBoxesService = { getAll: vi.fn(() => of(mockBoxes)) };
    mockRouter = { navigate: vi.fn() };
    mockPageHeaderService = { setTitle: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [BoxesDashboard],
      providers: [
        { provide: BoxesService, useValue: mockBoxesService },
        { provide: Router, useValue: mockRouter },
        { provide: PageHeaderService, useValue: mockPageHeaderService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BoxesDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call boxesService.getAll on init', () => {
    expect(mockBoxesService.getAll).toHaveBeenCalledTimes(1);
  });

  it('should set page header title in constructor', () => {
    expect(mockPageHeaderService.setTitle).toHaveBeenCalledWith('Home Inventory');
  });

  it('should display boxes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Tools');
    expect(compiled.textContent).toContain('Books');
    expect(compiled.textContent).toContain('Toolshed');
  });

  it('should display box item counts', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('1 items');
    expect(compiled.textContent).toContain('0 items');
    expect(compiled.textContent).toContain('2 items');
  });

  it('should compute totalBoxes correctly', () => {
    expect(component.totalBoxes).toBe(3);
  });

  it('should compute totalItems correctly', () => {
    expect(component.totalItems).toBe(3);
  });

  it('should return all boxes when search is empty', () => {
    expect(component.filteredBoxes.length).toBe(3);
  });

  it('should filter boxes by name', () => {
    component.searchQuery.set('tools');
    const filtered = component.filteredBoxes;
    expect(filtered.length).toBe(2);
    expect(filtered.every(b => b.name.toLowerCase().includes('tools'))).toBe(true);
  });

  it('should filter boxes by identifier', () => {
    component.searchQuery.set('BOX-002');
    const filtered = component.filteredBoxes;
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Books');
  });

  it('should be case insensitive when filtering', () => {
    component.searchQuery.set('box-001');
    const filtered = component.filteredBoxes;
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Tools');
  });

  it('should return empty array when no match', () => {
    component.searchQuery.set('nonexistent');
    expect(component.filteredBoxes.length).toBe(0);
  });

  it('should update searchQuery on onSearch', () => {
    const input = fixture.nativeElement.querySelector('input');
    input.value = 'test query';
    input.dispatchEvent(new Event('input'));
    expect(component.searchQuery()).toBe('test query');
  });

  it('should navigate on openBox', () => {
    component.openBox('123');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/boxes', '123']);
  });

  it('should navigate on onCreateBox', () => {
    component.onCreateBox();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/boxes/new']);
  });
});
