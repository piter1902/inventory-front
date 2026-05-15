import { TestBed } from '@angular/core/testing';
import { ContentManagement } from './content-management';
import { BoxesService } from '../../services/boxes.service';
import { PageHeaderService } from '../../layout/page-header/page-header.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BoxDto } from '../../models/box.models';

describe('ContentManagement', () => {
  const mockBox: BoxDto = {
    id: 'box-1',
    identifier: 'IDENT-001',
    name: 'Test Box',
    qrUrl: '',
    description: 'A test box',
    imageBase64: 'data:image/png;base64,existing',
    items: [
      { id: 'item-1', name: 'Item 1', description: 'Desc 1' },
      { id: 'item-2', name: 'Item 2', description: 'Desc 2' },
    ],
  };

  let fixture: any;
  let component: ContentManagement;
  let mockBoxesService: {
    getById: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let mockPageHeaderService: { setTitle: ReturnType<typeof vi.fn> };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(async () => {
    mockBoxesService = {
      getById: vi.fn(() => of(mockBox)),
      update: vi.fn(() => of(mockBox)),
      delete: vi.fn(() => of(undefined)),
    };
    mockRouter = { navigate: vi.fn() };
    mockPageHeaderService = { setTitle: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ContentManagement],
      providers: [
        { provide: BoxesService, useValue: mockBoxesService },
        { provide: Router, useValue: mockRouter },
        { provide: PageHeaderService, useValue: mockPageHeaderService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentManagement);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('boxId', 'box-1');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('on init', () => {
    it('should load box on init', () => {
      expect(mockBoxesService.getById).toHaveBeenCalledWith('box-1');
    });

    it('should set box properties from response', () => {
      expect(component.boxName()).toBe('Test Box');
      expect(component.description()).toBe('A test box');
      expect(component.identifier()).toBe('IDENT-001');
    });

    it('should set imagePreview and imageBase64 from response', () => {
      expect(component.imagePreview()).toBe('data:image/png;base64,existing');
      expect(component.imageBase64()).toBe('data:image/png;base64,existing');
    });

    it('should populate editItems from box items', () => {
      const items = component.editItems();
      expect(items.length).toBe(2);
      expect(items[0].id).toBe('item-1');
      expect(items[0].name).toBe('Item 1');
      expect(items[0]._isNew).toBe(false);
      expect(items[0]._isDeleted).toBe(false);
    });

    it('should set page header title', () => {
      expect(mockPageHeaderService.setTitle).toHaveBeenCalledWith('Editar Caja');
    });

    it('should set loading to false after init', () => {
      expect(component.loading()).toBe(false);
    });

    it('should compute itemsCount excluding deleted items', () => {
      expect(component.itemsCount).toBe(2);
      component.removeItem('item-1');
      expect(component.itemsCount).toBe(1);
    });
  });

  describe('field updates', () => {
    it('should update boxName', () => {
      component.updateBoxName('Updated Box');
      expect(component.boxName()).toBe('Updated Box');
    });

    it('should update description', () => {
      component.updateDescription('Updated Desc');
      expect(component.description()).toBe('Updated Desc');
    });

    it('should update identifier', () => {
      component.updateIdentifier('NEW-ID');
      expect(component.identifier()).toBe('NEW-ID');
    });
  });

  describe('item management', () => {
    it('should add a new editable item', () => {
      component.addItem();
      const items = component.editItems();
      expect(items.length).toBe(3);
      const newItem = items[2];
      expect(newItem._isNew).toBe(true);
      expect(newItem.name).toBe('');
      expect(newItem.id).toContain('new_');
    });

    it('should set editingItemId to the new item on add', () => {
      component.addItem();
      expect(component.editingItemId()).toContain('new_');
    });

    it('should mark item as deleted on remove', () => {
      component.removeItem('item-1');
      const deleted = component.editItems().find(i => i.id === 'item-1');
      expect(deleted?._isDeleted).toBe(true);
    });

    it('should clear editingItemId when removing the editing item', () => {
      component.toggleEditItem('item-1');
      expect(component.editingItemId()).toBe('item-1');
      component.removeItem('item-1');
      expect(component.editingItemId()).toBeNull();
    });

    it('should toggle editingItemId', () => {
      component.toggleEditItem('item-1');
      expect(component.editingItemId()).toBe('item-1');
      component.toggleEditItem('item-1');
      expect(component.editingItemId()).toBeNull();
    });

    it('should switch editingItemId to a different item', () => {
      component.toggleEditItem('item-1');
      component.toggleEditItem('item-2');
      expect(component.editingItemId()).toBe('item-2');
    });

    it('should update item name', () => {
      component.updateItemName('item-1', 'Updated Name');
      const item = component.editItems().find(i => i.id === 'item-1');
      expect(item?.name).toBe('Updated Name');
    });

    it('should update item description', () => {
      component.updateItemDescription('item-1', 'Updated Desc');
      const item = component.editItems().find(i => i.id === 'item-1');
      expect(item?.description).toBe('Updated Desc');
    });
  });

  describe('save', () => {
    it('should call boxesService.update with correct data', () => {
      component.save();

      expect(mockBoxesService.update).toHaveBeenCalledWith('box-1', {
        name: 'Test Box',
        description: 'A test box',
        identifier: 'IDENT-001',
        imageBase64: 'data:image/png;base64,existing',
        items: [
          { name: 'Item 1', description: 'Desc 1' },
          { name: 'Item 2', description: 'Desc 2' },
        ],
      });
    });

    it('should exclude deleted items from update payload', () => {
      component.removeItem('item-1');
      component.save();

      const updatePayload = mockBoxesService.update.mock.calls[0][1];
      expect(updatePayload.items.length).toBe(1);
      expect(updatePayload.items[0].name).toBe('Item 2');
    });

    it('should include newly added items in update payload', () => {
      component.addItem();
      component.updateItemName(component.editItems()[2].id, 'New Item');
      component.updateItemDescription(component.editItems()[2].id, 'New Desc');
      component.save();

      const payload = mockBoxesService.update.mock.calls[0][1];
      expect(payload.items.length).toBe(3);
      expect(payload.items[2].name).toBe('New Item');
    });

    it('should navigate after successful save', () => {
      component.save();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/boxes', 'box-1']);
    });

    it('should set saving to false on success', () => {
      component.save();
      expect(component.saving()).toBe(false);
    });

    it('should set saving to false on error', () => {
      mockBoxesService.update.mockReturnValue(throwError(() => new Error('error')));
      component.save();
      expect(component.saving()).toBe(false);
    });

    it('should not navigate on error', () => {
      mockBoxesService.update.mockReturnValue(throwError(() => new Error('error')));
      component.save();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('deleteBox', () => {
    it('should call boxesService.delete after confirmation', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      component.deleteBox();
      expect(mockBoxesService.delete).toHaveBeenCalledWith('box-1');
    });

    it('should not call boxesService.delete without confirmation', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      component.deleteBox();
      expect(mockBoxesService.delete).not.toHaveBeenCalled();
    });

    it('should navigate to /boxes after successful delete', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      component.deleteBox();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/boxes']);
    });

    it('should set saving to false after successful delete', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      component.deleteBox();
      expect(component.saving()).toBe(false);
    });

    it('should set saving to false on delete error', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      mockBoxesService.delete.mockReturnValue(throwError(() => new Error('error')));
      component.deleteBox();
      expect(component.saving()).toBe(false);
    });

    it('should not navigate on delete error', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      mockBoxesService.delete.mockReturnValue(throwError(() => new Error('error')));
      component.deleteBox();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('onPhotoSelected', () => {
    it('should update imagePreview and imageBase64', () => {
      const mockReader = {
        result: 'data:image/png;base64,newphoto',
        onload: null as any,
        readAsDataURL: vi.fn(function (this: any) {
          if (this.onload) {
            this.onload({ target: this } as any);
          }
        }),
      };
      vi.spyOn(window, 'FileReader').mockImplementation(function () {
        return mockReader;
      } as any);

      const file = new File(['test'], 'photo.png', { type: 'image/png' });
      const event = { target: { files: [file] } } as unknown as Event;

      component.onPhotoSelected(event);

      expect(component.imagePreview()).toBe('data:image/png;base64,newphoto');
      expect(component.imageBase64()).toBe('data:image/png;base64,newphoto');
    });
  });
});
