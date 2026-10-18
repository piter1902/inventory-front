import { Component, input, output, OutputEmitterRef, viewChild } from '@angular/core';
import { BoxSummary } from '../../models/box.models';
import { ModalDialog } from '../../shared/dialog/modal-dialog';

let nextId = 0;

/**
 * Actions for one box: bottom sheet on mobile, centred dialog from md. Opens as soon as it is
 * rendered; outputs fire once the exit animation ends so the parent can remove it.
 */
@Component({
  selector: 'app-box-actions-sheet',
  imports: [ModalDialog],
  templateUrl: './box-actions-sheet.html',
  host: { class: 'contents' },
})
export class BoxActionsSheet {
  private readonly modal = viewChild.required(ModalDialog);

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

  /** Closes the sheet with its animation, then emits `closed`. */
  close(): void {
    this.modal().close(() => this.closed.emit());
  }

  protected choose(emitter: OutputEmitterRef<void>): void {
    this.modal().close(() => emitter.emit());
  }

  /** Deletion stacks a confirmation on top, so the sheet stays open, unless it is already closing. */
  protected requestDelete(): void {
    if (!this.modal().closing()) this.deleteRequested.emit();
  }
}
