import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  OutputEmitterRef,
  PendingTasks,
  viewChild,
} from '@angular/core';
import { BoxSummary } from '../../models/box.models';
import { closeDialog } from '../../shared/dialog/close-dialog';

let nextId = 0;

/**
 * Actions for one box: bottom sheet on mobile, centred dialog from md. Opens as soon as it is
 * rendered; outputs fire once the exit animation ends so the parent can remove it.
 */
@Component({
  selector: 'app-box-actions-sheet',
  templateUrl: './box-actions-sheet.html',
  host: { class: 'contents' },
})
export class BoxActionsSheet {
  private readonly pendingTasks = inject(PendingTasks);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private closing = false;
  private destroyed = false;

  readonly box = input.required<BoxSummary>();

  readonly view = output<void>();
  readonly edit = output<void>();
  readonly moveItems = output<void>();
  readonly deleteRequested = output<void>();
  readonly closed = output<void>();

  protected readonly titleId = `box-actions-title-${nextId++}`;
  protected readonly actions: { label: string; icon: string; emitter: OutputEmitterRef<void> }[] = [
    { label: 'Ver', icon: 'visibility', emitter: this.view },
    { label: 'Modificar', icon: 'edit', emitter: this.edit },
    { label: 'Mover items', icon: 'drive_file_move', emitter: this.moveItems },
  ];

  constructor() {
    inject(DestroyRef).onDestroy(() => (this.destroyed = true));
    afterNextRender(() => this.dialog().nativeElement.showModal());
  }

  /** Closes the sheet with its animation, then emits `closed`. */
  close(): Promise<void> {
    return this.closeThen(() => this.closed.emit());
  }

  protected choose(emitter: OutputEmitterRef<void>): void {
    this.closeThen(() => emitter.emit());
  }

  protected onCancelEvent(event: Event): void {
    event.preventDefault();
    this.close();
  }

  /** Clicks on the ::backdrop are dispatched to the <dialog> itself. */
  protected onDialogClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.close();
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
