import { TestBed } from '@angular/core/testing';
import { BoxesDashboard } from './boxes-dashboard';
import { BoxesService } from '../../services/boxes.service';
import { ZonesService } from '../../services/zones.service';
import { PageHeaderService } from '../../layout/page-header/page-header.service';
import { Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { BoxSummary } from '../../models/box.models';
import { NotificationService } from '../../services/notification.service';
import { installDialogStub } from '../../../testing/dialog-stub';

describe('BoxesDashboard', () => {
  const mockBoxes: BoxSummary[] = [
    {
      id: '1',
      identifier: 'BOX-001',
      name: 'Tools',
      qrUrl: '',
      hasImage: false,
      items: [{ id: 'i1', name: 'Hammer', description: 'A hammer' }],
    },
    { id: '2', identifier: 'BOX-002', name: 'Books', qrUrl: '', hasImage: false, items: [] },
    {
      id: '3',
      identifier: 'BOX-003',
      name: 'Toolshed',
      qrUrl: '',
      hasImage: false,
      items: [
        { id: 'i2', name: 'Shovel', description: '' },
        { id: 'i3', name: 'Rake', description: '' },
      ],
    },
  ];

  let fixture: any;
  let component: BoxesDashboard;
  let mockBoxesService: { getAll: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  let mockZonesService: { getAll: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let mockPageHeaderService: { setTitle: ReturnType<typeof vi.fn> };
  let mockNotificationService: { show: ReturnType<typeof vi.fn> };
  let restoreDialog: () => void;

  afterEach(() => restoreDialog());

  beforeEach(async () => {
    restoreDialog = installDialogStub();
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
    expect(filtered.every((b) => b.name.toLowerCase().includes('tools'))).toBe(true);
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

  describe('box actions', () => {
    const host = () => fixture.nativeElement as HTMLElement;
    const actionsButton = (name: string) =>
      host().querySelector<HTMLButtonElement>(
        `button[aria-haspopup="dialog"][aria-label$="${name}"]`,
      )!;
    const sheet = () => host().querySelector<HTMLDialogElement>('app-box-actions-sheet dialog');
    const confirmDialog = () =>
      host().querySelector<HTMLDialogElement>('app-confirm-dialog dialog');
    const sheetButton = (label: string) =>
      Array.from(sheet()!.querySelectorAll<HTMLButtonElement>('button')).find((b) =>
        b.textContent?.trim().endsWith(label),
      )!;
    const confirmButton = (label: string) =>
      Array.from(confirmDialog()!.querySelectorAll<HTMLButtonElement>('button')).find(
        (b) => b.textContent?.trim() === label,
      )!;

    const openActionsFor = async (name: string) => {
      actionsButton(name).click();
      await fixture.whenStable();
    };
    const requestDelete = async (name: string) => {
      await openActionsFor(name);
      sheetButton('Eliminar').click();
      await fixture.whenStable();
    };

    it('AC-1 opens the actions sheet from the three-dots button without navigating', async () => {
      await openActionsFor('Tools');

      expect(component.actionsBox()?.id).toBe('1');
      expect(sheet()?.open).toBe(true);
      expect(sheet()?.querySelector('h2')?.textContent?.trim()).toBe('Tools');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('AC-4 clears the open box and does not navigate when the sheet is closed', async () => {
      await openActionsFor('Tools');
      sheet()!.querySelector<HTMLButtonElement>('button[aria-label="Cerrar"]')!.click();
      await fixture.whenStable();

      expect(component.actionsBox()).toBeNull();
      expect(sheet()).toBeNull();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it.each([
      ['Ver', ['/boxes', '1']],
      ['Modificar', ['/boxes', '1', 'edit']],
      ['Mover items', ['/boxes', '1', 'move-items']],
    ])('AC-5 navigates when choosing %s', async (label, route) => {
      await openActionsFor('Tools');
      sheetButton(label).click();
      await fixture.whenStable();

      expect(mockRouter.navigate).toHaveBeenCalledWith(route);
      expect(component.actionsBox()).toBeNull();
      expect(sheet()).toBeNull();
    });

    it('AC-6 opens the delete confirmation over the sheet with the box name and never calls window.confirm', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm');
      await requestDelete('Tools');

      expect(sheet()?.open).toBe(true);
      expect(confirmDialog()?.open).toBe(true);
      expect(confirmDialog()?.querySelector('h2')?.textContent?.trim()).toBe('¿Eliminar la caja?');
      expect(confirmDialog()?.querySelector('p')?.textContent?.trim()).toBe(
        'Se eliminará "Tools" y todo su contenido. Esta acción no se puede deshacer.',
      );
      expect(confirmSpy).not.toHaveBeenCalled();
    });

    it('AC-7 cancelling the confirmation keeps the actions sheet open', async () => {
      await requestDelete('Tools');
      confirmButton('Cancelar').click();
      await fixture.whenStable();

      expect(component.confirmBox()).toBeNull();
      expect(confirmDialog()).toBeNull();
      expect(component.actionsBox()?.id).toBe('1');
      expect(sheet()?.open).toBe(true);
      expect(mockBoxesService.delete).not.toHaveBeenCalled();
    });

    it('AC-8 confirming closes both dialogs, deletes the box and shows the notification', async () => {
      mockBoxesService.delete.mockReturnValue(of(undefined));
      await requestDelete('Tools');
      confirmButton('Eliminar').click();
      await fixture.whenStable();

      expect(mockBoxesService.delete).toHaveBeenCalledWith('1');
      expect(confirmDialog()).toBeNull();
      expect(sheet()).toBeNull();
      expect(component.boxes().find((b) => b.id === '1')).toBeUndefined();
      expect(component.boxes().length).toBe(2);
      expect(mockNotificationService.show).toHaveBeenCalledWith(
        'Caja "Tools" eliminada',
        'success',
      );
      expect(component.deletingId()).toBeNull();
    });

    it('AC-8 disables the three-dots button and labels it as deleting while the request is pending', async () => {
      const pending = new Subject<void>();
      mockBoxesService.delete.mockReturnValue(pending);
      await requestDelete('Tools');
      confirmButton('Eliminar').click();
      await fixture.whenStable();

      const button = actionsButton('Tools…');
      expect(component.deletingId()).toBe('1');
      expect(button.getAttribute('aria-label')).toBe('Eliminando Tools…');
      expect(button.getAttribute('aria-disabled')).toBe('true');

      button.click();
      await fixture.whenStable();
      expect(sheet()).toBeNull();
      expect(mockRouter.navigate).not.toHaveBeenCalled();

      pending.next();
      pending.complete();
      await fixture.whenStable();
      expect(actionsButton('Books').getAttribute('aria-disabled')).toBeNull();
    });

    it('AC-9 keeps the box and clears the deleting state when delete fails', async () => {
      mockBoxesService.delete.mockReturnValue(throwError(() => new Error('API error')));
      await requestDelete('Tools');
      confirmButton('Eliminar').click();
      await fixture.whenStable();

      expect(mockBoxesService.delete).toHaveBeenCalledWith('1');
      expect(component.deletingId()).toBeNull();
      expect(component.boxes().length).toBe(3);
      expect(mockNotificationService.show).not.toHaveBeenCalled();
    });

    it('AC-10 returns focus to the three-dots button when the sheet closes', async () => {
      const trigger = actionsButton('Tools');
      trigger.focus();
      await openActionsFor('Tools');
      sheet()!.querySelector<HTMLButtonElement>('button[aria-label="Cerrar"]')!.click();
      await fixture.whenStable();

      expect(document.activeElement).toBe(trigger);
    });
  });
});
