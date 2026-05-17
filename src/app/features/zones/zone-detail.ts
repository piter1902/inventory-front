import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ZonesService } from '../../services/zones.service';
import { ZoneDetailDto } from '../../models/zone.models';
import { PageHeaderService } from '../../layout/page-header/page-header.service';

@Component({
  selector: 'app-zone-detail',
  imports: [RouterLink],
  templateUrl: './zone-detail.html',
})
export class ZoneDetail implements OnInit {
  private zonesService = inject(ZonesService);
  private router = inject(Router);
  private readonly headerService = inject(PageHeaderService);

  zoneId = input.required<string>();
  zone = signal<ZoneDetailDto | null>(null);

  ngOnInit(): void {
    this.zonesService.getById(this.zoneId()).subscribe(data => {
      this.zone.set(data);
      this.headerService.setTitle(data.name);
    });
  }

  get boxes() {
    return this.zone()?.boxes ?? [];
  }

  edit(): void {
    this.router.navigate(['/zones', this.zoneId(), 'edit']);
  }
}
