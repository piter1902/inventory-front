import { closeDialog } from './close-dialog';

describe('closeDialog', () => {
  const animation = (iterations: number, finished: Promise<unknown>) =>
    ({ finished, effect: { getComputedTiming: () => ({ iterations }) } }) as unknown as Animation;

  const dialogWith = (animations: Animation[]) =>
    ({ close: vi.fn(), getAnimations: () => animations }) as unknown as HTMLDialogElement;

  it('should close the dialog and wait for its finite exit animations', async () => {
    let finishExit!: () => void;
    const exit = new Promise<void>((resolve) => (finishExit = resolve));
    const dialog = dialogWith([animation(1, exit)]);
    const done = vi.fn();

    const closing = closeDialog(dialog).then(done);
    await Promise.resolve();
    expect(dialog.close).toHaveBeenCalled();
    expect(done).not.toHaveBeenCalled();

    finishExit();
    await closing;
    expect(done).toHaveBeenCalled();
  });

  it('should not wait for infinite animations such as a spinner', async () => {
    const never = new Promise<void>(() => {});
    const dialog = dialogWith([animation(Infinity, never), animation(1, Promise.resolve())]);

    await expect(closeDialog(dialog)).resolves.toBeUndefined();
  });

  it('should resolve when an exit animation is cancelled', async () => {
    const dialog = dialogWith([animation(1, Promise.reject(new DOMException('', 'AbortError')))]);

    await expect(closeDialog(dialog)).resolves.toBeUndefined();
  });
});
