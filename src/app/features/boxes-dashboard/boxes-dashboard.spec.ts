import { TestBed } from '@angular/core/testing';
import { BoxesDashboard } from './boxes-dashboard';
import { BoxesService } from '../../services/boxes.service';
import { ZonesService } from '../../services/zones.service';
import { PageHeaderService } from '../../layout/page-header/page-header.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BoxDto } from '../../models/box.models';
import { NotificationService } from '../../services/notification.service';

describe('BoxesDashboard', () => {
  const mockBoxes: BoxDto[] = [
    { id: '1', identifier: 'BOX-001', name: 'Tools', qrUrl: '', imageBase64: '', items: [{ id: 'i1', name: 'Hammer', description: 'A hammer' }] },
    { id: '2', identifier: 'BOX-002', name: 'Books', qrUrl: '', items: [] },
    { id: '3', identifier: 'BOX-003', name: 'Toolshed', qrUrl: '', items: [{ id: 'i2', name: 'Shovel', description: '' }, { id: 'i3', name: 'Rake', description: '' }] },
  ];

  let fixture: any;
  let component: BoxesDashboard;
  let mockBoxesService: { getAll: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  let mockZonesService: { getAll: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let mockPageHeaderService: { setTitle: ReturnType<typeof vi.fn> };
  let mockNotificationService: { show: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockBoxesService = { getAll: vi.fn(() => of(mockBoxes)), delete: vi.fn() };
    mockZonesService = { getAll: vi.fn(() => of([])) };
    mockRouter = { navigate: vi.fn() };
    mockPageHeaderService = { setTitle: vi.fn() };
    mockNotificationService = { show: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [BoxesDashboard],
      providers: [
        { provide: BoxesService, useValue: mockBoxesService },
        { provide: ZonesService, useValue: mockZonesService },
        { provide: Router, useValue: mockRouter },
        { provide: PageHeaderService, useValue: mockPageHeaderService },
        { provide: NotificationService, useValue: mockNotificationService },
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

  it('should toggle menu and stop propagation', () => {
    const event = new MouseEvent('click');
    vi.spyOn(event, 'stopPropagation');

    component.toggleMenu(event, '1');
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.openMenuId()).toBe('1');

    component.toggleMenu(event, '1');
    expect(component.openMenuId()).toBeNull();
  });

  it('should toggle to a different box', () => {
    component.toggleMenu(new MouseEvent('click'), '1');
    expect(component.openMenuId()).toBe('1');

    component.toggleMenu(new MouseEvent('click'), '2');
    expect(component.openMenuId()).toBe('2');
  });

  it('should close menu', () => {
    component.openMenuId.set('1');
    component.closeMenu();
    expect(component.openMenuId()).toBeNull();
  });

  it('should navigate to edit and close menu', () => {
    component.openMenuId.set('1');
    component.editBox('123');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/boxes', '123', 'edit']);
    expect(component.openMenuId()).toBeNull();
  });

  it('should delete a box when confirmed', () => {
    const event = new MouseEvent('click');
    vi.spyOn(event, 'stopPropagation');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockBoxesService.delete.mockReturnValue(of(undefined));

    component.deleteBox(event, '1', 'Tools');

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(window.confirm).toHaveBeenCalledWith('¿Eliminar la caja "Tools"? Esta acción no se puede deshacer.');
    expect(mockBoxesService.delete).toHaveBeenCalledWith('1');
    expect(component.boxes().length).toBe(2);
    expect(component.boxes().find(b => b.id === '1')).toBeUndefined();
    expect(mockNotificationService.show).toHaveBeenCalledWith('Caja "Tools" eliminada', 'success');
    expect(component.deletingId()).toBeNull();
    expect(component.openMenuId()).toBeNull();
  });

  it('should not delete a box when not confirmed', () => {
    const event = new MouseEvent('click');
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.deleteBox(event, '1', 'Tools');

    expect(mockBoxesService.delete).not.toHaveBeenCalled();
    expect(component.boxes().length).toBe(3);
  });

  it('should handle delete error', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockBoxesService.delete.mockReturnValue(throwError(() => new Error('API error')));

    component.deleteBox(new MouseEvent('click'), '1', 'Tools');

    expect(mockBoxesService.delete).toHaveBeenCalledWith('1');
    expect(component.deletingId()).toBeNull();
  });
});
