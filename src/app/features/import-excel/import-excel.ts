import { Component, inject, signal } from '@angular/core';
import { PageHeaderService } from '../../layout/page-header/page-header.service';
import { ImportService } from '../../services/import.service';
import { NotificationService } from '../../services/notification.service';
import { ImportBoxesResult } from '../../models/import.models';

@Component({
  selector: 'app-import-excel',
  imports: [],
  templateUrl: './import-excel.html',
  host: { class: 'block min-h-dvh' },
})
export class ImportExcel {
  private importService = inject(ImportService);
  private notificationService = inject(NotificationService);

  constructor() {
    inject(PageHeaderService).setTitle('Importar Excel');
  }

  selectedFile = signal<File | null>(null);
  uploading = signal(false);
  result = signal<ImportBoxesResult | null>(null);
  dragging = signal(false);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.setFile(file);
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    const zone = event.currentTarget as HTMLElement;
    if (event.relatedTarget && zone.contains(event.relatedTarget as Node)) return;
    this.dragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    if (!/\.xlsx?$/i.test(file.name)) {
      this.notificationService.show('Formato no válido. Usa un archivo .xlsx o .xls', 'error');
      return;
    }
    this.setFile(file);
  }

  formatSize(bytes: number): string {
    return bytes < 1024 * 1024
      ? `${Math.max(1, Math.round(bytes / 1024))} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private setFile(file: File): void {
    this.selectedFile.set(file);
    this.result.set(null);
  }

  removeFile(): void {
    this.selectedFile.set(null);
    this.result.set(null);
  }

  reset(): void {
    this.selectedFile.set(null);
    this.result.set(null);
  }

  async upload(): Promise<void> {
    const file = this.selectedFile();
    if (!file) return;

    this.uploading.set(true);
    this.result.set(null);

    try {
      const base64 = await this.importService.readExcelAsBase64(file);
      this.importService.importExcel(base64).subscribe({
        next: res => {
          this.uploading.set(false);
          this.result.set(res);
          if (res.failureCount === 0) {
            this.notificationService.show('Importación completada con éxito', 'success');
          } else {
            this.notificationService.show(
              `Importación finalizada con ${res.failureCount} errores`,
              'error',
            );
          }
        },
        error: () => {
          this.uploading.set(false);
        },
      });
    } catch {
      this.uploading.set(false);
      this.notificationService.show('Error al leer el archivo', 'error');
    }
  }
}
