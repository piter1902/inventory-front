import { Component, inject, signal } from '@angular/core';
import { PageHeaderService } from '../../layout/page-header/page-header.service';
import { ImportService } from '../../services/import.service';
import { NotificationService } from '../../services/notification.service';
import { ImportBoxesResult } from '../../models/import.models';

@Component({
  selector: 'app-import-excel',
  imports: [],
  templateUrl: './import-excel.html',
  styleUrl: './import-excel.scss',
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
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
