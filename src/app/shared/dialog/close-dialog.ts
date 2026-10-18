/**
 * Closes a modal <dialog> and resolves once its exit transition has finished, so the caller
 * can remove it from the DOM without cutting the animation.
 */
export async function closeDialog(dialog: HTMLDialogElement): Promise<void> {
  dialog.close();
  // getAnimations() is missing in jsdom: there is nothing to wait for there.
  const animations = dialog.getAnimations?.({ subtree: true }) ?? [];
  await Promise.allSettled(animations.map((animation) => animation.finished));
}
