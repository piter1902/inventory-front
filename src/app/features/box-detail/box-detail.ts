import { Component, inject, input, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import QRCode from 'qrcode';
import { BoxesService } from '../../services/boxes.service';
import { ZonesService } from '../../services/zones.service';
import { BoxDto, BoxLogEntry } from '../../models/box.models';
import { PageHeaderService } from '../../layout/page-header/page-header.service';

@Component({
  selector: 'app-box-detail',
  imports: [RouterLink, DatePipe],
  templateUrl: './box-detail.html',
  styleUrl: './box-detail.scss',
})
export class BoxDetail implements OnInit {
  private boxesService = inject(BoxesService);
  private zonesService = inject(ZonesService);
  private router = inject(Router);
  private readonly headerService = inject(PageHeaderService);
  boxId = input.required<string>();
  box = signal<BoxDto | null>(null);
  qrDataUrl = signal('');
  zoneName = signal<string | undefined>(undefined);
  logs = signal<BoxLogEntry[]>([]);
  showLogs = signal(false);
  logsLoading = signal(false);

  get items() {
    return this.box()?.items ?? [];
  }

  ngOnInit(): void {
    this.boxesService.getById(this.boxId()).subscribe(data => {
      this.box.set(data);
      this.headerService.setTitle(data.name || 'Home Inventory');
      this.generateQr();
      if (data.zoneId) {
        this.zonesService.getById(data.zoneId).subscribe({
          next: zone => this.zoneName.set(zone.name),
          error: () => this.zoneName.set(data.zoneId),
        });
      }
    });
  }

  toggleLogs(): void {
    if (this.showLogs()) {
      this.showLogs.set(false);
      return;
    }
    this.showLogs.set(true);
    if (this.logs().length === 0) {
      this.logsLoading.set(true);
      this.boxesService.getLogs(this.boxId()).subscribe({
        next: data => {
          this.logs.set(data);
          this.logsLoading.set(false);
        },
        error: () => this.logsLoading.set(false),
      });
    }
  }

  private generateQr(): void {
    const url = `${window.location.origin}/boxes/${this.boxId()}`;
    QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
      .then((dataUrl: string) => this.qrDataUrl.set(dataUrl))
      .catch((err: unknown) => console.error('Failed to generate QR code', err));
  }

  editItem(itemId: string): void {
    this.router.navigate(['/boxes', this.boxId(), 'edit'], { queryParams: { itemId } });
  }

  share(): void {
    const b = this.box();
    if (!b) return;
    const url = `${window.location.origin}/boxes/${this.boxId()}`;

    if (navigator.share && this.qrDataUrl()) {
      const blob = this.dataUriToBlob(this.qrDataUrl());
      const file = new File([blob], `qr-${b.identifier || b.id}.png`, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        navigator.share({ title: b.name ?? '', text: `Caja: ${b.name} (${b.identifier})`, files: [file], url });
        return;
      }
    }

    if (navigator.share) {
      navigator.share({ title: b.name ?? '', text: `Caja: ${b.name} (${b.identifier})`, url });
    } else {
      navigator.clipboard?.writeText(url);
    }
  }

  private dataUriToBlob(dataUri: string): Blob {
    const parts = dataUri.split(',');
    const mime = parts[0].match(/:(.*?);/)?.[1] ?? 'application/octet-stream';
    const bytes = atob(parts[1]);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  exportBox(): void {
    const b = this.box();
    if (!b || !this.qrDataUrl()) return;
    const a = document.createElement('a');
    a.href = this.qrDataUrl();
    a.download = `qr-${b.identifier || b.id}.png`;
    a.click();
  }
}
