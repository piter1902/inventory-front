import { TestBed } from '@angular/core/testing';
import { CreateBox } from './create-box';
import { BoxesService } from '../../services/boxes.service';
import { PageHeaderService } from '../../layout/page-header/page-header.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BoxDto } from '../../models/box.models';
import { ImageService } from '../../services/image.service';

describe('CreateBox', () => {
  const createdBox: BoxDto = { id: 'new-1', identifier: 'BOX-NEW', name: 'Test', qrUrl: '', items: [] };

  let fixture: any;
  let component: CreateBox;
  let mockBoxesService: { create: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let mockPageHeaderService: { setTitle: ReturnType<typeof vi.fn> };
  let mockImageService: { compressImage: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockBoxesService = { create: vi.fn(() => of(createdBox)) };
    mockRouter = { navigate: vi.fn() };
    mockPageHeaderService = { setTitle: vi.fn() };
    mockImageService = { compressImage: vi.fn() };
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('mock-uuid' as any);

    await TestBed.configureTestingModule({
      imports: [CreateBox],
      providers: [
        { provide: BoxesService, useValue: mockBoxesService },
        { provide: Router, useValue: mockRouter },
        { provide: PageHeaderService, useValue: mockPageHeaderService },
        { provide: ImageService, useValue: mockImageService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateBox);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set page header title in constructor', () => {
    expect(mockPageHeaderService.setTitle).toHaveBeenCalledWith('Nueva Caja');
  });

  describe('form validation', () => {
    it('should set nameError when name is empty on create', () => {
      component.create();
      expect(component.nameError()).toBe(true);
    });

    it('should not set nameError when name is provided on create', () => {
      component.name.set('Test Box');
      component.create();
      expect(component.nameError()).toBe(false);
    });

    it('should clear nameError when valid name is entered', () => {
      component.nameError.set(true);
      component.updateName('Valid Name');
      expect(component.nameError()).toBe(false);
    });

    it('should not clear nameError for whitespace-only input', () => {
      component.nameError.set(true);
      component.updateName('   ');
      expect(component.nameError()).toBe(true);
    });
  });

  describe('updateName and updateDescription', () => {
    it('should update name signal', () => {
      component.updateName('New Name');
      expect(component.name()).toBe('New Name');
    });

    it('should update description signal', () => {
      component.updateDescription('New Desc');
      expect(component.description()).toBe('New Desc');
    });
  });

  describe('item management', () => {
    it('should add a new item with generated UUID', () => {
      component.addItem();
      const items = component.items();
      expect(items.length).toBe(1);
      expect(items[0].id).toBe('mock-uuid');
      expect(items[0].name).toBe('');
      expect(items[0].description).toBe('');
    });

    it('should add multiple items with unique IDs', () => {
      component.addItem();
      vi.spyOn(crypto, 'randomUUID').mockReturnValue('second-uuid' as any);
      component.addItem();
      expect(component.items().length).toBe(2);
    });

    it('should remove an item by id', () => {
      component.addItem();
      vi.spyOn(crypto, 'randomUUID').mockReturnValue('second-uuid' as any);
      component.addItem();
      expect(component.items().length).toBe(2);
      component.removeItem('mock-uuid');
      expect(component.items().length).toBe(1);
      expect(component.items()[0].id).toBe('second-uuid');
    });

    it('should remove the correct item when multiple exist', () => {
      component.addItem();
      vi.spyOn(crypto, 'randomUUID').mockReturnValue('second-uuid' as any);
      component.addItem();
      component.removeItem('second-uuid');
      expect(component.items().length).toBe(1);
      expect(component.items()[0].id).toBe('mock-uuid');
    });

    it('should update item name', () => {
      component.addItem();
      component.updateItemName('mock-uuid', 'Updated Name');
      expect(component.items()[0].name).toBe('Updated Name');
    });

    it('should update item description', () => {
      component.addItem();
      component.updateItemDescription('mock-uuid', 'Updated Desc');
      expect(component.items()[0].description).toBe('Updated Desc');
    });

    it('should update the correct item when multiple exist', () => {
      component.addItem();
      vi.spyOn(crypto, 'randomUUID').mockReturnValue('second-uuid' as any);
      component.addItem();
      component.updateItemName('mock-uuid', 'First');
      component.updateItemName('second-uuid', 'Second');
      expect(component.items()[0].name).toBe('First');
      expect(component.items()[1].name).toBe('Second');
    });

    it('should compute itemCount correctly', () => {
      expect(component.itemCount).toBe(0);
      component.addItem();
      expect(component.itemCount).toBe(1);
      vi.spyOn(crypto, 'randomUUID').mockReturnValue('second-uuid' as any);
      component.addItem();
      expect(component.itemCount).toBe(2);
      component.removeItem('mock-uuid');
      expect(component.itemCount).toBe(1);
    });
  });

  describe('create', () => {
    it('should call boxesService.create with correct data', () => {
      mockBoxesService.create.mockReturnValue(of(createdBox));

      component.name.set('Test Box');
      component.description.set('A description');
      component.addItem();
      component.updateItemName('mock-uuid', 'Item 1');
      component.updateItemDescription('mock-uuid', 'Item desc');

      component.create();

      expect(mockBoxesService.create).toHaveBeenCalledWith({
        name: 'Test Box',
        description: 'A description',
        imageBase64: undefined,
        items: [{ name: 'Item 1', description: 'Item desc' }],
      });
    });

    it('should send items as undefined when all are empty', () => {
      mockBoxesService.create.mockReturnValue(of(createdBox));

      component.name.set('Test Box');
      component.addItem();
      component.addItem();

      component.create();

      expect(mockBoxesService.create).toHaveBeenCalledWith({
        name: 'Test Box',
        description: undefined,
        imageBase64: undefined,
        items: undefined,
      });
    });

    it('should navigate on successful creation', () => {
      mockBoxesService.create.mockReturnValue(of(createdBox));

      component.name.set('Test Box');
      component.create();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/boxes', 'new-1']);
    });

    it('should set saving to false on successful creation', () => {
      mockBoxesService.create.mockReturnValue(of(createdBox));

      component.name.set('Test Box');
      component.create();

      expect(component.saving()).toBe(false);
    });

    it('should set saving to false on creation error', () => {
      mockBoxesService.create.mockReturnValue(throwError(() => new Error('error')));

      component.name.set('Test Box');
      component.create();

      expect(component.saving()).toBe(false);
    });

    it('should not navigate on creation error', () => {
      mockBoxesService.create.mockReturnValue(throwError(() => new Error('error')));

      component.name.set('Test Box');
      component.create();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('onPhotoSelected', () => {
    it('should compress and set imageBase64', async () => {
      mockImageService.compressImage.mockResolvedValue('data:image/jpeg;base64,compressed');
      const file = new File(['test'], 'photo.png', { type: 'image/png' });
      const event = { target: { files: [file] } } as unknown as Event;

      await component.onPhotoSelected(event);

      expect(mockImageService.compressImage).toHaveBeenCalledWith(file);
      expect(component.imageBase64()).toBe('data:image/jpeg;base64,compressed');
    });

    it('should do nothing when no file is selected', async () => {
      const event = { target: { files: [] } } as unknown as Event;

      await component.onPhotoSelected(event);

      expect(component.imageBase64()).toBeNull();
    });

    it('should do nothing when files is null', async () => {
      const event = { target: { files: null } } as unknown as Event;

      await component.onPhotoSelected(event);

      expect(component.imageBase64()).toBeNull();
    });
  });
});
