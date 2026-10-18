import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalDialog } from './modal-dialog';
import { clickBackdrop, installDialogStub } from '../../../testing/dialog-stub';

@Component({
  imports: [ModalDialog],
  template: `<dialog appModalDialog (dismissed)="dismissed = dismissed + 1">
    <p>Content</p>
  </dialog>`,
})
class Host {
  readonly modal = viewChild.required(ModalDialog);
  dismissed = 0;
}

describe('ModalDialog', () => {
  let restoreDialog: () => void;
  let fixture: ComponentFixture<Host>;
  let dialog: HTMLDialogElement;

  beforeEach(async () => {
    restoreDialog = installDialogStub();
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    dialog = fixture.nativeElement.querySelector('dialog');
  });

  afterEach(() => restoreDialog());

  it('should open the dialog as a modal once rendered', () => {
    expect(dialog.open).toBe(true);
  });

  it('should close and run the callback once the exit ends, staying hit-testable', async () => {
    const then = vi.fn<() => void>();

    expect(fixture.componentInstance.modal().close(then)).toBe(true);
    expect(fixture.componentInstance.modal().closing()).toBe(true);
    expect(dialog.inert).not.toBe(true);
    expect(dialog.open).toBe(false);

    await fixture.whenStable();
    expect(then).toHaveBeenCalledTimes(1);
  });

  it('should cover the page while the dialog animates out, so taps do not reach it', async () => {
    const shield = () => document.body.querySelector('[data-dialog-closing-shield]');
    fixture.componentInstance.modal().close();
    expect(shield()).not.toBeNull();

    await fixture.whenStable();
    expect(shield()).toBeNull();
  });

  it('should ignore close() while already closing', async () => {
    const first = vi.fn<() => void>();
    const second = vi.fn<() => void>();

    fixture.componentInstance.modal().close(first);
    expect(fixture.componentInstance.modal().close(second)).toBe(false);
    await fixture.whenStable();

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
  });

  it('should not run the callback when destroyed before the exit ends', async () => {
    const then = vi.fn<() => void>();
    fixture.componentInstance.modal().close(then);
    fixture.destroy();
    await Promise.resolve();
    await Promise.resolve();

    expect(then).not.toHaveBeenCalled();
  });

  it('should report Escape (cancel event) as dismissed and prevent the native close', () => {
    const event = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(fixture.componentInstance.dismissed).toBe(1);
  });

  it('should report a native close that bypassed cancel as dismissed', () => {
    dialog.close();
    expect(fixture.componentInstance.dismissed).toBe(1);
  });

  it('should not report its own close() as dismissed', async () => {
    fixture.componentInstance.modal().close();
    await fixture.whenStable();
    expect(fixture.componentInstance.dismissed).toBe(0);
  });

  it('should report a click on the backdrop as dismissed', () => {
    clickBackdrop(dialog);
    expect(fixture.componentInstance.dismissed).toBe(1);
  });

  it('should not report a click inside the content', () => {
    dialog.querySelector('p')!.click();
    expect(fixture.componentInstance.dismissed).toBe(0);
  });

  it('should not report a drag that starts inside the content and ends on the backdrop', () => {
    dialog.querySelector('p')!.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    dialog.click();
    expect(fixture.componentInstance.dismissed).toBe(0);
  });
});
