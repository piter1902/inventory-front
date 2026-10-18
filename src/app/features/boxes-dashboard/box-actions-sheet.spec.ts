import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BoxActionsSheet } from './box-actions-sheet';
import { BoxSummary } from '../../models/box.models';
import { installDialogStub } from '../../../testing/dialog-stub';

describe('BoxActionsSheet', () => {
  const box: BoxSummary = {
    id: '1',
    identifier: 'BOX-001',
    name: 'Tools',
    qrUrl: '',
    hasImage: false,
    items: [],
  };
  let restoreDialog: () => void;
  let fixture: ComponentFixture<BoxActionsSheet>;
  let dialog: HTMLDialogElement;

  const render = async (value: BoxSummary) => {
    fixture = TestBed.createComponent(BoxActionsSheet);
    fixture.componentRef.setInput('box', value);
    await fixture.whenStable();
    dialog = fixture.nativeElement.querySelector('dialog');
  };
  const actionButtons = () =>
    Array.from(dialog.querySelectorAll<HTMLButtonElement>('button[data-action]'));
  const closeButton = () => dialog.querySelector<HTMLButtonElement>('button[aria-label="Cerrar"]')!;
  const spyOn = (name: 'view' | 'edit' | 'moveItems' | 'deleteRequested' | 'closed') => {
    const spy = vi.fn<() => void>();
    fixture.componentInstance[name].subscribe(spy);
    return spy;
  };

  beforeEach(async () => {
    restoreDialog = installDialogStub();
    await TestBed.configureTestingModule({ imports: [BoxActionsSheet] }).compileComponents();
    await render(box);
  });

  afterEach(() => restoreDialog());

  it('should open as a modal when created', () => {
    expect(dialog.open).toBe(true);
  });

  it('AC-2 uses bottom-sheet classes below md and centred classes from md', () => {
    expect(dialog.classList).toContain('dialog-sheet');
    expect(dialog.classList).toContain('mt-auto');
    expect(dialog.classList).toContain('rounded-t-[28px]');
    expect(dialog.classList).toContain('md:m-auto');
    expect(dialog.classList).toContain('md:rounded-[28px]');
  });

  it('AC-3 shows the box name and identifier in the header', () => {
    expect(dialog.querySelector('h2')?.textContent?.trim()).toBe('Tools');
    expect(dialog.textContent).toContain('BOX-001');
  });

  it('AC-3 omits the identifier when the box has none', async () => {
    fixture.destroy();
    await render({ ...box, identifier: '' });

    expect(dialog.querySelector('[data-testid="box-identifier"]')).toBeNull();
  });

  it('AC-3 lists Ver, Modificar, Mover items and Eliminar in order with Eliminar as destructive', () => {
    const buttons = actionButtons();
    expect(buttons.map((b) => b.textContent?.trim().replace(/^\S+\s+/, ''))).toEqual([
      'Ver',
      'Modificar',
      'Mover items',
      'Eliminar',
    ]);
    expect(buttons[3].classList).toContain('text-error');
  });

  it('AC-4 closes on the close button', async () => {
    const closed = spyOn('closed');
    closeButton().click();
    await fixture.whenStable();

    expect(dialog.open).toBe(false);
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it('AC-4 closes on backdrop click but not on a click inside the content', async () => {
    const closed = spyOn('closed');
    dialog.querySelector('h2')!.click();
    await fixture.whenStable();
    expect(closed).not.toHaveBeenCalled();

    dialog.click();
    await fixture.whenStable();
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it('AC-4 closes on Escape (cancel event)', async () => {
    const closed = spyOn('closed');
    const event = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(event);
    await fixture.whenStable();

    expect(event.defaultPrevented).toBe(true);
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['view', 0],
    ['edit', 1],
    ['moveItems', 2],
  ] as const)('AC-5 emits %s and closes the dialog', async (name, index) => {
    const emitted = spyOn(name);
    const closed = spyOn('closed');
    actionButtons()[index].click();
    await fixture.whenStable();

    expect(dialog.open).toBe(false);
    expect(emitted).toHaveBeenCalledTimes(1);
    expect(closed).not.toHaveBeenCalled();
  });

  it('should request deletion without closing the sheet', async () => {
    const deleteRequested = spyOn('deleteRequested');
    actionButtons()[3].click();
    await fixture.whenStable();

    expect(deleteRequested).toHaveBeenCalledTimes(1);
    expect(dialog.open).toBe(true);
  });

  it('should close and emit closed when closed by its parent', async () => {
    const closed = spyOn('closed');
    await fixture.componentInstance.close();

    expect(dialog.open).toBe(false);
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it('AC-10 exposes role, aria-modal and the box name as accessible name', () => {
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(
      document.getElementById(dialog.getAttribute('aria-labelledby')!)?.textContent?.trim(),
    ).toBe('Tools');
  });

  it('AC-10 puts the initial focus on the first action', () => {
    expect(actionButtons().map((b) => b.hasAttribute('autofocus'))).toEqual([
      true,
      false,
      false,
      false,
    ]);
  });
});
