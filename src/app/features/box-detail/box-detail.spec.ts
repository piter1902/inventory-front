vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn(() => Promise.resolve('data:image/png;base64,abc123')),
  },
}));

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { BoxDetail } from './box-detail';
import { BoxesService } from '../../services/boxes.service';
import { PageHeaderService } from '../../layout/page-header/page-header.service';
import { of } from 'rxjs';
import { BoxDto } from '../../models/box.models';

describe('BoxDetail', () => {
  const mockBox: BoxDto = {
    id: 'box-1',
    identifier: 'IDENT-001',
    name: 'Test Box',
    qrUrl: '',
    description: 'A test box',
    items: [
      { id: 'item-1', name: 'Item 1', description: 'Desc 1' },
      { id: 'item-2', name: 'Item 2', description: 'Desc 2' },
    ],
  };

  let fixture: any;
  let component: BoxDetail;
  let mockBoxesService: { getById: ReturnType<typeof vi.fn>; getLogs: ReturnType<typeof vi.fn> };
  let mockPageHeaderService: { setTitle: ReturnType<typeof vi.fn> };
  let navigateSpy: ReturnType<typeof vi.spyOn>;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(async () => {
    mockBoxesService = { getById: vi.fn(() => of(mockBox)), getLogs: vi.fn(() => of([])) };
    mockPageHeaderService = { setTitle: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [BoxDetail],
      providers: [
        provideRouter([]),
        { provide: BoxesService, useValue: mockBoxesService },
        { provide: PageHeaderService, useValue: mockPageHeaderService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BoxDetail);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('boxId', 'box-1');
    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call boxesService.getById on init', () => {
    fixture.detectChanges();
    expect(mockBoxesService.getById).toHaveBeenCalledWith('box-1');
  });

  it('should set page header title from box name', () => {
    fixture.detectChanges();
    expect(mockPageHeaderService.setTitle).toHaveBeenCalledWith('Test Box');
  });

  it('should return items from box', () => {
    fixture.detectChanges();
    expect(component.items.length).toBe(2);
    expect(component.items[0].name).toBe('Item 1');
    expect(component.items[1].name).toBe('Item 2');
  });

  it('should return empty items when box is null', () => {
    expect(component.items).toEqual([]);
  });

  it('should editItem navigate to edit page', () => {
    component.editItem('item-1');
    expect(navigateSpy).toHaveBeenCalledWith(
      ['/boxes', 'box-1', 'edit'],
      { queryParams: { itemId: 'item-1' } },
    );
  });

  describe('QR code generation', () => {
    it('should generate QR code on init', async () => {
      fixture.detectChanges();
      await new Promise(resolve => setTimeout(resolve));
      expect(component.qrDataUrl()).toBe('data:image/png;base64,abc123');
    });
  });

  describe('share', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'share', {
        value: vi.fn().mockResolvedValue(undefined),
        writable: true,
        configurable: true,
      });
      Object.defineProperty(navigator, 'canShare', {
        value: vi.fn().mockReturnValue(true),
        writable: true,
        configurable: true,
      });
      fixture.detectChanges();
    });

    afterEach(() => {
      delete (navigator as any).share;
      delete (navigator as any).canShare;
    });

    it('should call navigator.share with files when available', async () => {
      await new Promise(resolve => setTimeout(resolve));
      component.share();
      const shareSpy = (navigator as any).share;
      expect(shareSpy).toHaveBeenCalled();
      const args = shareSpy.mock.calls[0][0];
      expect(args.files).toBeDefined();
      expect(args.files[0]).toBeInstanceOf(File);
      expect(args.url).toContain('/boxes/box-1');
    });

    it('should include box name and identifier in share data', async () => {
      await new Promise(resolve => setTimeout(resolve));
      component.share();
      const args = (navigator as any).share.mock.calls[0][0];
      expect(args.title).toBe('Test Box');
      expect(args.text).toContain('IDENT-001');
    });
  });

  describe('share fallback', () => {
    it('should use clipboard when navigator.share is not available', async () => {
      fixture.detectChanges();
      await new Promise(resolve => setTimeout(resolve));

      const clipboardSpy = vi.fn();
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: clipboardSpy },
        writable: true,
        configurable: true,
      });

      component.share();
      expect(clipboardSpy).toHaveBeenCalledWith(expect.stringContaining('/boxes/box-1'));

      delete (navigator as any).clipboard;
    });
  });

  describe('exportBox', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should create anchor element and trigger download', async () => {
      await new Promise(resolve => setTimeout(resolve));

      const anchor = { href: '', download: '', click: vi.fn() };
      vi.spyOn(document, 'createElement').mockReturnValue(anchor as any);

      component.exportBox();

      expect(anchor.href).toBe('data:image/png;base64,abc123');
      expect(anchor.download).toBe('qr-IDENT-001.png');
      expect(anchor.click).toHaveBeenCalled();
    });

    it('should not export when qrDataUrl is empty', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');
      component.qrDataUrl.set('');
      component.exportBox();
      expect(createElementSpy).not.toHaveBeenCalled();
    });
  });

  describe('logs', () => {
  it('should not load logs on init', () => {
    fixture.detectChanges();
    expect(mockBoxesService.getLogs).not.toHaveBeenCalled();
    expect(component.showLogs()).toBe(false);
  });

  it('should load logs on first toggle', () => {
    fixture.detectChanges();
    component.toggleLogs();
    expect(component.showLogs()).toBe(true);
    expect(mockBoxesService.getLogs).toHaveBeenCalledWith('box-1');
  });

  it('should hide logs on second toggle without refetch', () => {
    fixture.detectChanges();
    component.toggleLogs();
    expect(mockBoxesService.getLogs).toHaveBeenCalledTimes(1);
    component.toggleLogs();
    expect(component.showLogs()).toBe(false);
  });
});

describe('dataUriToBlob', () => {
    it('should convert data URI to Blob with correct MIME type', () => {
      const dataUri = 'data:image/png;base64,QUJDRA==';
      const blob = (component as any).dataUriToBlob(dataUri);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
    });

    it('should handle different MIME types', () => {
      const dataUri = 'data:image/jpeg;base64,aGVsbG8=';
      const blob = (component as any).dataUriToBlob(dataUri);
      expect(blob.type).toBe('image/jpeg');
    });

    it('should produce a blob with the correct content', async () => {
      const binary = 'ABCD';
      const base64 = btoa(binary);
      const dataUri = `data:text/plain;base64,${base64}`;

      const blob = (component as any).dataUriToBlob(dataUri);
      const text = await blob.text();
      expect(text).toBe(binary);
    });
  });
});
