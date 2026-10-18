import {
  afterNextRender,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  output,
  PendingTasks,
  signal,
} from '@angular/core';
import { closeDialog } from './close-dialog';

/**
 * Modal lifecycle for a native <dialog>: opens it with showModal() once rendered, reports Escape
 * and backdrop clicks as `dismissed`, and closes it with its exit animation.
 */
@Directive({
  selector: 'dialog[appModalDialog]',
  exportAs: 'modalDialog',
  host: {
    '(cancel)': 'onCancel($event)',
    '(close)': 'onNativeClose()',
    '(pointerdown)': 'onPointerDown($event)',
    '(click)': 'onClick($event)',
  },
})
export class ModalDialog {
  private readonly dialog = inject<ElementRef<HTMLDialogElement>>(ElementRef).nativeElement;
  private readonly pendingTasks = inject(PendingTasks);
  private destroyed = false;
  private pressStartedOnBackdrop = false;

  /** True from the moment close() starts until the dialog is removed. */
  readonly closing = signal(false);
  /** Escape or a click on the backdrop; the host decides what dismissing means. */
  readonly dismissed = output<void>();

  constructor() {
    inject(DestroyRef).onDestroy(() => (this.destroyed = true));
    afterNextRender(() => this.dialog.showModal());
  }

  /**
   * Closes the dialog and runs `then` once its exit animation has ended. Returns false (and does
   * nothing) if it is already closing; hosts route every action through close() or check
   * `closing()`.
   */
  close(then?: () => void): boolean {
    if (this.closing()) return false;
    this.closing.set(true);
    const taskDone = this.pendingTasks.add();
    const shield = this.shieldPageWhileClosing();
    closeDialog(this.dialog)
      .then(() => {
        if (!this.destroyed) then?.();
      })
      .finally(() => {
        shield.remove();
        taskDone();
      });
    return true;
  }

  /**
   * Browsers stop hit-testing a dialog once close() is called, even while it is still visible
   * animating out, so taps on it would reach the page underneath (e.g. a card that navigates).
   * A transparent layer over the page swallows them; dialogs that stay open live in the top
   * layer, above it, and keep working.
   */
  private shieldPageWhileClosing(): HTMLElement {
    const shield = this.dialog.ownerDocument.createElement('div');
    shield.className = 'fixed inset-0 z-[1000]';
    shield.setAttribute('aria-hidden', 'true');
    shield.dataset['dialogClosingShield'] = '';
    this.dialog.ownerDocument.body.appendChild(shield);
    return shield;
  }

  protected onCancel(event: Event): void {
    event.preventDefault();
    this.dismissed.emit();
  }

  /**
   * The browser can close the dialog without a `cancel` event (e.g. a close request without user
   * activation, or a form with method="dialog"); report it so the host can clean up.
   */
  protected onNativeClose(): void {
    if (!this.closing()) this.dismissed.emit();
  }

  /** Clicks on the ::backdrop target the <dialog> itself; a drag that only ends there is not one. */
  protected onPointerDown(event: Event): void {
    this.pressStartedOnBackdrop = event.target === this.dialog;
  }

  protected onClick(event: Event): void {
    const onBackdrop = event.target === this.dialog && this.pressStartedOnBackdrop;
    this.pressStartedOnBackdrop = false;
    if (onBackdrop) this.dismissed.emit();
  }
}
