import { Component, input, output, viewChild } from '@angular/core';
import { ModalDialog } from '../dialog/modal-dialog';

let nextId = 0;

/**
 * Modal confirmation built on the native <dialog> (alertdialog). It opens as soon as it is rendered.
 * `confirmed` / `cancelled` fire as soon as the user decides, so the parent can react while this
 * dialog animates out; `closed` fires once the exit animation ends, when the parent removes it.
 */
@Component({
  selector: 'app-confirm-dialog',
  imports: [ModalDialog],
  template: `
    <dialog
      appModalDialog
      class="dialog-pop m-auto w-[calc(100%-3rem)] max-w-[400px] max-h-[calc(100dvh-3rem)] overflow-y-auto p-0 border-0 rounded-[28px] bg-surface-container-lowest text-on-surface shadow-xl backdrop:bg-primary/32"
      role="alertdialog"
      aria-modal="true"
      [attr.aria-labelledby]="titleId"
      [attr.aria-describedby]="messageId"
      (dismissed)="cancel()"
    >
      <div class="flex flex-col gap-4 p-6 pb-5">
        <h2 [id]="titleId" class="text-headline-md text-primary">{{ title() }}</h2>
        <p [id]="messageId" class="text-body-md text-on-surface-variant break-words">
          {{ message() }}
        </p>
        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            autofocus
            class="h-11 px-5 rounded-full text-label-md text-primary hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            (click)="cancel()"
          >
            {{ cancelLabel() }}
          </button>
          <button
            type="button"
            class="h-11 px-5 rounded-full text-label-md hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest"
            [class.bg-error]="destructive()"
            [class.text-on-error]="destructive()"
            [class.bg-primary]="!destructive()"
            [class.text-on-primary]="!destructive()"
            (click)="confirm()"
          >
            {{ confirmLabel() }}
          </button>
        </div>
      </div>
    </dialog>
  `,
  host: { class: 'contents' },
})
export class ConfirmDialog {
  private readonly modal = viewChild.required(ModalDialog);

  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmLabel = input('Confirmar');
  readonly cancelLabel = input('Cancelar');
  readonly destructive = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
  readonly closed = output<void>();

  protected readonly titleId = `confirm-dialog-title-${nextId}`;
  protected readonly messageId = `confirm-dialog-message-${nextId++}`;

  protected confirm(): void {
    if (this.modal().close(() => this.closed.emit())) this.confirmed.emit();
  }

  protected cancel(): void {
    if (this.modal().close(() => this.closed.emit())) this.cancelled.emit();
  }
}
