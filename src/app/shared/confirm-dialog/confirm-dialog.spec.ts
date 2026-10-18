import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialog } from './confirm-dialog';
import { installDialogStub } from '../../../testing/dialog-stub';

describe('ConfirmDialog', () => {
  const message = 'Se eliminará "Tools" y todo su contenido. Esta acción no se puede deshacer.';
  let restoreDialog: () => void;
  let fixture: ComponentFixture<ConfirmDialog>;
  let dialog: HTMLDialogElement;
  let confirmed: ReturnType<typeof vi.fn<() => void>>;
  let cancelled: ReturnType<typeof vi.fn<() => void>>;

  const buttons = () => Array.from(dialog.querySelectorAll('button')) as HTMLButtonElement[];

  beforeEach(async () => {
    restoreDialog = installDialogStub();
    await TestBed.configureTestingModule({ imports: [ConfirmDialog] }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialog);
    fixture.componentRef.setInput('title', '¿Eliminar la caja?');
    fixture.componentRef.setInput('message', message);
    fixture.componentRef.setInput('confirmLabel', 'Eliminar');
    fixture.componentRef.setInput('destructive', true);
    confirmed = vi.fn<() => void>();
    cancelled = vi.fn<() => void>();
    fixture.componentInstance.confirmed.subscribe(confirmed);
    fixture.componentInstance.cancelled.subscribe(cancelled);
    await fixture.whenStable();
    dialog = fixture.nativeElement.querySelector('dialog');
  });

  afterEach(() => restoreDialog());

  it('should open as a modal when created', () => {
    expect(dialog.open).toBe(true);
  });

  it('AC-6 renders title, message and labels as an alertdialog', () => {
    expect(dialog.getAttribute('role')).toBe('alertdialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(
      document.getElementById(dialog.getAttribute('aria-labelledby')!)?.textContent?.trim(),
    ).toBe('¿Eliminar la caja?');
    expect(
      document.getElementById(dialog.getAttribute('aria-describedby')!)?.textContent?.trim(),
    ).toBe(message);
    expect(buttons().map((b) => b.textContent?.trim())).toEqual(['Cancelar', 'Eliminar']);
  });

  it('AC-10 puts the initial focus on the cancel button', () => {
    const [cancel, confirm] = buttons();
    expect(cancel.hasAttribute('autofocus')).toBe(true);
    expect(confirm.hasAttribute('autofocus')).toBe(false);
  });

  it('should style the confirm button as destructive', () => {
    const confirm = buttons()[1];
    expect(confirm.classList).toContain('bg-error');
    expect(confirm.classList).toContain('text-on-error');
  });

  it('should close and emit confirmed when confirming', async () => {
    buttons()[1].click();
    await fixture.whenStable();

    expect(dialog.open).toBe(false);
    expect(confirmed).toHaveBeenCalledTimes(1);
    expect(cancelled).not.toHaveBeenCalled();
  });

  it('AC-7 emits cancelled when Cancelar is pressed', async () => {
    buttons()[0].click();
    await fixture.whenStable();

    expect(dialog.open).toBe(false);
    expect(cancelled).toHaveBeenCalledTimes(1);
    expect(confirmed).not.toHaveBeenCalled();
  });

  it('AC-7 emits cancelled on a backdrop click but not on a click inside the content', async () => {
    dialog.querySelector('p')!.click();
    await fixture.whenStable();
    expect(cancelled).not.toHaveBeenCalled();

    dialog.click();
    await fixture.whenStable();
    expect(cancelled).toHaveBeenCalledTimes(1);
  });

  it('AC-7 emits cancelled on Escape (cancel event)', async () => {
    const event = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(event);
    await fixture.whenStable();

    expect(event.defaultPrevented).toBe(true);
    expect(cancelled).toHaveBeenCalledTimes(1);
  });

  it('should emit only once when activated twice while closing', async () => {
    buttons()[1].click();
    buttons()[1].click();
    await fixture.whenStable();

    expect(confirmed).toHaveBeenCalledTimes(1);
  });
});
