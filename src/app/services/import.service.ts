import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ImportBoxesResult } from '../models/import.models';

@Injectable({ providedIn: 'root' })
export class ImportService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/Boxes/import`;

  readExcelAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const bytes = new Uint8Array(reader.result as ArrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        resolve(btoa(binary));
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  importExcel(base64: string): Observable<ImportBoxesResult> {
    return this.http.post<ImportBoxesResult>(this.baseUrl, { fileBase64: base64 });
  }
}
