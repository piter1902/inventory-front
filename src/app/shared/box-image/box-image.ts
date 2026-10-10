import { Component, ElementRef, OnDestroy, OnInit, inject, input, signal } from '@angular/core';
import { BoxImageService } from '../../services/box-image.service';

/**
 * Box picture loaded lazily: the request is only made once the element scrolls
 * into view, and never when the box has no image.
 */
@Component({
  selector: 'app-box-image',
  template: `
    @if (src(); as url) {
      <img class="size-full object-cover" [src]="url" [alt]="alt()" />
    } @else {
      <div class="flex items-center justify-center size-full text-on-surface-variant" [class.animate-pulse]="loading()">
        <span class="material-symbols-outlined" [style.font-size.px]="iconSize()">inventory_2</span>
      </div>
    }
  `,
  host: { class: 'block size-full' },
})
export class BoxImage implements OnInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly images = inject(BoxImageService);

  readonly boxId = input.required<string>();
  readonly hasImage = input.required<boolean>();
  readonly alt = input('');
  readonly iconSize = input(48);

  protected readonly src = signal<string | null>(null);
  protected readonly loading = signal(false);

  private observer?: IntersectionObserver;
  private destroyed = false;

  ngOnInit(): void {
    if (!this.hasImage()) return;

    if (typeof IntersectionObserver === 'undefined') {
      void this.load();
      return;
    }
    this.observer = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          this.stopObserving();
          void this.load();
        }
      },
      { rootMargin: '200px' },
    );
    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.stopObserving();
    const url = this.src();
    if (url) URL.revokeObjectURL(url);
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    const url = await this.images.load(this.boxId());
    if (this.destroyed) {
      if (url) URL.revokeObjectURL(url);
      return;
    }
    this.src.set(url);
    this.loading.set(false);
  }

  private stopObserving(): void {
    this.observer?.disconnect();
    this.observer = undefined;
  }
}
