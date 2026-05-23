import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BoxesService } from '../../services/boxes.service';
import { PageHeaderService } from '../../layout/page-header/page-header.service';
import { BoxDto, BoxLogEntry } from '../../models/box.models';

@Component({
  selector: 'app-logs',
  imports: [DatePipe],
  templateUrl: './logs.html',
  styleUrl: './logs.scss',
})
export class Logs implements OnInit {
  private boxesService = inject(BoxesService);

  constructor() {
    inject(PageHeaderService).setTitle('Historial de movimientos');
  }

  logs = signal<BoxLogEntry[]>([]);
  allBoxes = signal<BoxDto[]>([]);
  filterBoxId = signal<string | null>(null);
  loading = signal(true);

  get filteredLogs(): BoxLogEntry[] {
    const boxId = this.filterBoxId();
    if (!boxId) return this.logs();
    return this.logs().filter(
      l => l.sourceBoxId === boxId || l.destinationBoxId === boxId,
    );
  }

  ngOnInit(): void {
    this.boxesService.getAll().subscribe(boxes => {
      this.allBoxes.set(boxes);
    });
    this.loadLogs();
  }

  private loadLogs(): void {
    this.loading.set(true);
    this.boxesService.getAllLogs().subscribe({
      next: data => {
        this.logs.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  applyFilter(boxId: string | null): void {
    this.filterBoxId.set(boxId);
  }
}
