import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  PendingTasks,
  viewChild,
} from '@angular/core';
import { closeDialog } from '../dialog/close-dialog';

let nextId = 0;

/**
 * Modal confirmation built on the native <dialog> (alertdialog). It opens as soon as it is rendered;
 * the parent removes it after `confirmed` or `cancelled`, which fire once the exit animation ends.
 */
@Component({
  selector: 'app-confirm-dialog',
  template: `
    <dialog
      #dialog
      class="dialog-pop m-auto w-[calc(100%-3rem)] max-w-[400px] max-h-none p-0 border-0 rounded-[28px] bg-surface-container-lowest text-on-surface shadow-xl backdrop:bg-primary/32"
      role="alertdialog"
      aria-modal="true"
      [attr.aria-labelledby]="titleId"
      [attr.aria-describedby]="messageId"
      (cancel)="onCancelEvent($event)"
      (click)="onDialogClick($event)"
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
  private readonly pendingTasks = inject(PendingTasks);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private closing = false;
  private destroyed = false;

  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmLabel = input('Confirmar');
  readonly cancelLabel = input('Cancelar');
  readonly destructive = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected readonly titleId = `confirm-dialog-title-${nextId}`;
  protected readonly messageId = `confirm-dialog-message-${nextId++}`;

  constructor() {
    inject(DestroyRef).onDestroy(() => (this.destroyed = true));
    afterNextRender(() => this.dialog().nativeElement.showModal());
  }

  protected confirm(): void {
    this.closeThen(() => this.confirmed.emit());
  }

  protected cancel(): void {
    this.closeThen(() => this.cancelled.emit());
  }

  protected onCancelEvent(event: Event): void {
    event.preventDefault();
    this.cancel();
  }

  /** Clicks on the ::backdrop are dispatched to the <dialog> itself. */
  protected onDialogClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.cancel();
  }

  private async closeThen(emit: () => void): Promise<void> {
    if (this.closing) return;
    this.closing = true;
    const taskDone = this.pendingTasks.add();
    try {
      await closeDialog(this.dialog().nativeElement);
      if (!this.destroyed) emit();
    } finally {
      taskDone();
    }
  }
}
