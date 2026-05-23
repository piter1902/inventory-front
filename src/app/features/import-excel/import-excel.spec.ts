import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportExcel } from './import-excel';
import { PageHeaderService } from '../../layout/page-header/page-header.service';
import { ImportService } from '../../services/import.service';
import { NotificationService } from '../../services/notification.service';
import { of, throwError } from 'rxjs';
import { ImportBoxesResult } from '../../models/import.models';

describe('ImportExcel', () => {
  let fixture: ComponentFixture<ImportExcel>;
  let component: ImportExcel;
  let mockImportService: { readExcelAsBase64: ReturnType<typeof vi.fn>; importExcel: ReturnType<typeof vi.fn> };
  let mockNotificationService: { show: ReturnType<typeof vi.fn> };
  let mockPageHeaderService: { setTitle: ReturnType<typeof vi.fn> };

  const mockResult: ImportBoxesResult = {
    totalSheets: 2,
    successCount: 2,
    failureCount: 0,
    results: [
      { sheetName: 'Hoja1', boxName: 'Caja 1', success: true, error: null },
      { sheetName: 'Hoja2', boxName: 'Caja 2', success: true, error: null },
    ],
  };

  const mockResultWithErrors: ImportBoxesResult = {
    totalSheets: 2,
    successCount: 1,
    failureCount: 1,
    results: [
      { sheetName: 'Hoja1', boxName: 'Caja 1', success: true, error: null },
      { sheetName: 'Hoja2', boxName: null, success: false, error: 'Formato inválido' },
    ],
  };

  beforeEach(async () => {
    mockImportService = {
      readExcelAsBase64: vi.fn(),
      importExcel: vi.fn(),
    };
    mockNotificationService = { show: vi.fn() };
    mockPageHeaderService = { setTitle: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ImportExcel],
      providers: [
        { provide: ImportService, useValue: mockImportService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: PageHeaderService, useValue: mockPageHeaderService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportExcel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set title on construction', () => {
    expect(mockPageHeaderService.setTitle).toHaveBeenCalledWith('Importar Excel');
  });

  it('should set selected file on selection', () => {
    const file = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const event = { target: { files: [file] } } as unknown as Event;
    component.onFileSelected(event);
    expect(component.selectedFile()).toBe(file);
    expect(component.result()).toBeNull();
  });

  it('should not set file if no files selected', () => {
    const event = { target: { files: [] } } as unknown as Event;
    component.onFileSelected(event);
    expect(component.selectedFile()).toBeNull();
  });

  it('should remove selected file and clear result', () => {
    const file = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    component.selectedFile.set(file);
    component.result.set(mockResult);
    component.removeFile();
    expect(component.selectedFile()).toBeNull();
    expect(component.result()).toBeNull();
  });

  it('should reset file and result', () => {
    const file = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    component.selectedFile.set(file);
    component.result.set(mockResult);
    component.reset();
    expect(component.selectedFile()).toBeNull();
    expect(component.result()).toBeNull();
  });

  it('should upload file and show success result', async () => {
    const file = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    component.selectedFile.set(file);

    mockImportService.readExcelAsBase64.mockResolvedValue('dGVzdA==');
    mockImportService.importExcel.mockReturnValue(of(mockResult));

    await component.upload();

    expect(mockImportService.readExcelAsBase64).toHaveBeenCalledWith(file);
    expect(mockImportService.importExcel).toHaveBeenCalledWith('dGVzdA==');
    expect(component.result()).toEqual(mockResult);
    expect(mockNotificationService.show).toHaveBeenCalledWith('Importación completada con éxito', 'success');
  });

  it('should show error notification when some imports fail', async () => {
    const file = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    component.selectedFile.set(file);

    mockImportService.readExcelAsBase64.mockResolvedValue('dGVzdA==');
    mockImportService.importExcel.mockReturnValue(of(mockResultWithErrors));

    await component.upload();

    expect(component.result()).toEqual(mockResultWithErrors);
    expect(mockNotificationService.show).toHaveBeenCalledWith('Importación finalizada con 1 errores', 'error');
  });

  it('should handle upload error', async () => {
    const file = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    component.selectedFile.set(file);

    mockImportService.readExcelAsBase64.mockResolvedValue('dGVzdA==');
    mockImportService.importExcel.mockReturnValue(throwError(() => new Error('API error')));

    await component.upload();

    expect(component.result()).toBeNull();
    expect(component.selectedFile()).toBe(file);
  });

  it('should handle file read error', async () => {
    const file = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    component.selectedFile.set(file);

    mockImportService.readExcelAsBase64.mockRejectedValue(new Error('Read error'));

    await component.upload();

    expect(mockNotificationService.show).toHaveBeenCalledWith('Error al leer el archivo', 'error');
    expect(component.uploading()).toBe(false);
  });
});
