import { Component, input, output } from '@angular/core';

/** Floating action button on mobile, inline labelled button on desktop. */
@Component({
  selector: 'app-create-button',
  template: `
    <button type="button" class="fixed right-6 bottom-24 z-50 flex items-center justify-center size-16 rounded-2xl bg-secondary text-on-secondary shadow-lg transition-transform active:scale-90 md:static md:size-auto md:h-12 md:gap-2 md:px-5 md:rounded-xl md:shadow-none md:whitespace-nowrap md:hover:brightness-110" [attr.aria-label]="label()" (click)="pressed.emit()">
      <span class="material-symbols-outlined text-[32px] md:text-[20px]">add</span>
      <span class="hidden md:inline text-[14px] font-semibold">{{ label() }}</span>
    </button>
  `,
})
export class CreateButton {
  readonly label = input.required<string>();
  readonly pressed = output<void>();
}
