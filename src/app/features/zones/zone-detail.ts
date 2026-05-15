import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ZonesService } from '../../services/zones.service';
import { ZoneDto } from '../../models/zone.models';
import { PageHeaderService } from '../../layout/page-header/page-header.service';

@Component({
  selector: 'app-zone-detail',
  imports: [],
  templateUrl: './zone-detail.html',
})
export class ZoneDetail implements OnInit {
  private zonesService = inject(ZonesService);
  private router = inject(Router);
  private readonly headerService = inject(PageHeaderService);

  zoneId = input.required<string>();
  zone = signal<ZoneDto | null>(null);

  ngOnInit(): void {
    this.zonesService.getById(this.zoneId()).subscribe(data => {
      if (data) {
        this.zone.set(data);
        this.headerService.setTitle(data.name);
      }
    });
  }

  edit(): void {
    this.router.navigate(['/zones', this.zoneId(), 'edit']);
  }
}
