import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MoveItems } from './move-items';
import { BoxesService } from '../../services/boxes.service';
import { ItemsService } from '../../services/items.service';
import { PageHeaderService } from '../../layout/page-header/page-header.service';
import { NotificationService } from '../../services/notification.service';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BoxDto, MoveItemsResult } from '../../models/box.models';

describe('MoveItems', () => {
  const mockBoxes: BoxDto[] = [
    { id: '1', identifier: 'BOX-001', name: 'Source Box', qrUrl: '', items: [{ id: 'i1', name: 'Item A', description: '' }, { id: 'i2', name: 'Item B', description: '' }] },
    { id: '2', identifier: 'BOX-002', name: 'Target Box', qrUrl: '', items: [] },
    { id: '3', identifier: 'BOX-003', name: 'Another Box', qrUrl: '', items: [] },
  ];

  let fixture: ComponentFixture<MoveItems>;
  let component: MoveItems;
  let mockBoxesService: { getById: ReturnType<typeof vi.fn>; getAll: ReturnType<typeof vi.fn> };
  let mockItemsService: { move: ReturnType<typeof vi.fn> };
  let mockNotificationService: { show: ReturnType<typeof vi.fn> };
  let mockPageHeaderService: { setTitle: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockBoxesService = {
      getById: vi.fn(() => of(mockBoxes[0])),
      getAll: vi.fn(() => of(mockBoxes)),
    };
    mockItemsService = { move: vi.fn() };
    mockNotificationService = { show: vi.fn() };
    mockPageHeaderService = { setTitle: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [MoveItems],
      providers: [
        provideRouter([]),
        { provide: BoxesService, useValue: mockBoxesService },
        { provide: ItemsService, useValue: mockItemsService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: PageHeaderService, useValue: mockPageHeaderService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MoveItems);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('boxId', '1');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set title on construction', () => {
    expect(mockPageHeaderService.setTitle).toHaveBeenCalledWith('Mover items');
  });

  it('should load source box and all boxes on init', () => {
    expect(mockBoxesService.getById).toHaveBeenCalled();
    expect(mockBoxesService.getAll).toHaveBeenCalled();
    expect(component.sourceBox()?.id).toBe('1');
    expect(component.allBoxes().length).toBe(3);
  });

  it('should toggle item selection', () => {
    component.toggleItem('i1');
    expect(component.selectedItemIds().has('i1')).toBe(true);
    component.toggleItem('i1');
    expect(component.selectedItemIds().has('i1')).toBe(false);
  });

  it('should select all items', () => {
    component.selectAll();
    expect(component.selectedItemIds().size).toBe(2);
    expect(component.selectedItemIds().has('i1')).toBe(true);
    expect(component.selectedItemIds().has('i2')).toBe(true);
  });

  it('should deselect all items', () => {
    component.selectAll();
    component.deselectAll();
    expect(component.selectedItemIds().size).toBe(0);
  });

  it('should filter out source box from destination list', () => {
    expect(component.filteredDestinationBoxes.length).toBe(2);
    expect(component.filteredDestinationBoxes.find(b => b.id === '1')).toBeUndefined();
  });

  it('should filter destination boxes by name', () => {
    component.destinationSearch.set('target');
    expect(component.filteredDestinationBoxes.length).toBe(1);
    expect(component.filteredDestinationBoxes[0].id).toBe('2');
  });

  it('should select destination box', () => {
    component.selectDestination('2');
    expect(component.destinationBoxId()).toBe('2');
    expect(component.showDestinationPicker()).toBe(false);
  });

  it('should return destination box from signal', () => {
    component.destinationBoxId.set('2');
    expect(component.destinationBox?.id).toBe('2');
    expect(component.destinationBox?.name).toBe('Target Box');
  });

  it('should clear destination', () => {
    component.destinationBoxId.set('2');
    component.clearDestination();
    expect(component.destinationBoxId()).toBeNull();
  });

  it('should move items successfully', () => {
    component.selectedItemIds.set(new Set(['i1']));
    component.destinationBoxId.set('2');

    const mockResult: MoveItemsResult = {
      totalItems: 1,
      successCount: 1,
      failureCount: 0,
      results: [{ itemId: 'i1', itemName: 'Item A', success: true, error: null }],
    };
    mockItemsService.move.mockReturnValue(of(mockResult));

    component.move();

    expect(mockItemsService.move).toHaveBeenCalledWith('1', { itemIds: ['i1'], destinationBoxId: '2' });
    expect(component.result()).toEqual(mockResult);
    expect(mockNotificationService.show).toHaveBeenCalledWith('1 items movidos correctamente', 'success');
  });

  it('should show error notification when some moves fail', () => {
    component.selectedItemIds.set(new Set(['i1', 'i2']));
    component.destinationBoxId.set('2');

    const mockResult: MoveItemsResult = {
      totalItems: 2,
      successCount: 1,
      failureCount: 1,
      results: [
        { itemId: 'i1', itemName: 'Item A', success: true, error: null },
        { itemId: 'i2', itemName: 'Item B', success: false, error: 'Error' },
      ],
    };
    mockItemsService.move.mockReturnValue(of(mockResult));

    component.move();

    expect(mockNotificationService.show).toHaveBeenCalledWith('1 movidos, 1 fallos', 'error');
  });

  it('should handle move error', () => {
    component.selectedItemIds.set(new Set(['i1']));
    component.destinationBoxId.set('2');
    mockItemsService.move.mockReturnValue(throwError(() => new Error('API error')));

    component.move();

    expect(component.moving()).toBe(false);
  });

  it('should go to box', () => {
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    component.goToBox('2');
    expect(router.navigate).toHaveBeenCalledWith(['/boxes', '2']);
  });

  it('should reset state', () => {
    component.result.set({
      totalItems: 1, successCount: 1, failureCount: 0,
      results: [{ itemId: 'i1', itemName: 'Item A', success: true, error: null }],
    });
    component.destinationBoxId.set('2');

    component.reset();

    expect(component.result()).toBeNull();
    expect(component.destinationBoxId()).toBeNull();
    expect(component.selectedItemIds().size).toBe(0);
  });
});
