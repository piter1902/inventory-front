/**
 * jsdom implements HTMLDialogElement but not showModal()/close(). These stand-ins toggle the
 * `open` attribute and fire `close` like a browser does. Returns a function that restores the originals.
 */
export function installDialogStub(): () => void {
  const proto = HTMLDialogElement.prototype;
  const { showModal, close } = proto;

  proto.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  proto.close = function (this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };

  return () => {
    proto.showModal = showModal;
    proto.close = close;
  };
}

/** A press and click on the ::backdrop, which browsers dispatch to the <dialog> itself. */
export function clickBackdrop(dialog: HTMLDialogElement): void {
  dialog.dispatchEvent(new Event('pointerdown', { bubbles: true }));
  dialog.click();
}
