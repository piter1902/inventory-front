import { Component, input, output } from '@angular/core';

/** Floating action button on mobile, inline labelled button on desktop. */
@Component({
  selector: 'app-create-button',
  template: `
    <button type="button" class="create-button" [attr.aria-label]="label()" (click)="pressed.emit()">
      <span class="material-symbols-outlined create-button-icon">add</span>
      <span class="create-button-label">{{ label() }}</span>
    </button>
  `,
  styleUrl: './create-button.scss',
})
export class CreateButton {
  readonly label = input.required<string>();
  readonly pressed = output<void>();
}
