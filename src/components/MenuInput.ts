import Phaser from 'phaser';

// Shared input scaffolding for menu/overlay components. Every menu screen
// binds the same keys (UP/DOWN/Z/ENTER/X, plus LEFT/RIGHT for grid menus),
// guards each handler behind an "is this menu active" check, and clamps its
// cursor to [0, length-1]. Components keep their own mode dispatch,
// rendering, and inputBound lifecycle guard.

export interface MenuKeyHandlers {
  /** Guard evaluated on every keypress; handlers only fire when true. */
  isActive: () => boolean;
  onUp: () => void;
  onDown: () => void;
  /** Bound only when provided (e.g. BattleMenu's 2x2 grid). */
  onLeft?: () => void;
  onRight?: () => void;
  /** Fired for both Z and ENTER. */
  onConfirm: () => void;
  /** Fired for X. */
  onCancel: () => void;
}

/**
 * Binds the standard menu keys. Call at most once per component instance —
 * callers keep their existing `inputBound` guard so listeners never stack
 * across reopens.
 */
export function bindMenuKeys(scene: Phaser.Scene, handlers: MenuKeyHandlers): void {
  const kb = scene.input.keyboard!;
  const K = Phaser.Input.Keyboard.KeyCodes;
  const guard = (fn: () => void) => () => { if (handlers.isActive()) fn(); };

  kb.addKey(K.UP).on('down', guard(handlers.onUp));
  kb.addKey(K.DOWN).on('down', guard(handlers.onDown));
  if (handlers.onLeft) kb.addKey(K.LEFT).on('down', guard(handlers.onLeft));
  if (handlers.onRight) kb.addKey(K.RIGHT).on('down', guard(handlers.onRight));
  kb.addKey(K.Z).on('down', guard(handlers.onConfirm));
  kb.addKey(K.ENTER).on('down', guard(handlers.onConfirm));
  kb.addKey(K.X).on('down', guard(handlers.onCancel));
}

/** Cursor move clamped to [0, length-1] — menus don't wrap around. */
export function clampIndex(index: number, delta: number, length: number): number {
  const next = index + delta;
  if (next < 0) return 0;
  if (next >= length) return length - 1;
  return next;
}
