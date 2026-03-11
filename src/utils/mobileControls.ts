// Mobile touch controls - Game Boy inspired layout
// Dispatches synthetic KeyboardEvents so all existing input handling works unchanged

import { soundSystem } from '../systems/SoundSystem';

// Track all currently-pressed mobile buttons so we can re-sync after scene transitions
const activeKeys = new Map<string, { key: string; code: string; keyCode: number }>();

/** Re-dispatch keydown events for any mobile buttons currently held.
 *  Call this after Phaser recreates keyboard input (scene restart/transition)
 *  so the new Key objects pick up the held state. */
export function resyncMobileInput(): void {
  for (const [, def] of activeKeys) {
    const event = new KeyboardEvent('keydown', {
      key: def.key,
      code: def.code,
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, 'keyCode', { value: def.keyCode });
    Object.defineProperty(event, 'which', { value: def.keyCode });
    window.dispatchEvent(event);
  }
}

function isMobile(): boolean {
  return window.matchMedia('(pointer: coarse)').matches;
}

function dispatchKey(type: 'keydown' | 'keyup', key: string, code: string, keyCode: number): void {
  const event = new KeyboardEvent(type, {
    key,
    code,
    bubbles: true,
    cancelable: true,
  });
  // Phaser checks keyCode/which for key mapping
  Object.defineProperty(event, 'keyCode', { value: keyCode });
  Object.defineProperty(event, 'which', { value: keyCode });
  window.dispatchEvent(event);
}

interface ButtonDef {
  label: string;
  key: string;
  code: string;
  keyCode: number;
  className: string;
}

function createButton(parent: HTMLElement, def: ButtonDef): HTMLElement {
  const btn = document.createElement('button');
  btn.className = `mobile-btn ${def.className}`;
  btn.textContent = def.label;
  btn.setAttribute('aria-label', def.label);

  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    soundSystem.resumeOnInteraction();
    btn.classList.add('pressed');
    activeKeys.set(def.className, { key: def.key, code: def.code, keyCode: def.keyCode });
    dispatchKey('keydown', def.key, def.code, def.keyCode);
  }, { passive: false });

  btn.addEventListener('touchend', (e) => {
    e.preventDefault();
    btn.classList.remove('pressed');
    activeKeys.delete(def.className);
    dispatchKey('keyup', def.key, def.code, def.keyCode);
  }, { passive: false });

  btn.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    btn.classList.remove('pressed');
    activeKeys.delete(def.className);
    dispatchKey('keyup', def.key, def.code, def.keyCode);
  }, { passive: false });

  parent.appendChild(btn);
  return btn;
}

// D-pad with slide support: tracks finger movement across direction buttons
function setupDpadSlide(dpad: HTMLElement, buttons: Map<HTMLElement, ButtonDef>): void {
  let activeBtn: HTMLElement | null = null;
  let activeDef: ButtonDef | null = null;

  function getBtnAt(x: number, y: number): { btn: HTMLElement; def: ButtonDef } | null {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    // Check if it's a d-pad button or inside one
    const target = (el as HTMLElement).closest?.('.dpad-up, .dpad-down, .dpad-left, .dpad-right') as HTMLElement | null;
    if (target && buttons.has(target)) {
      return { btn: target, def: buttons.get(target)! };
    }
    return null;
  }

  function pressBtn(btn: HTMLElement, def: ButtonDef): void {
    activeBtn = btn;
    activeDef = def;
    btn.classList.add('pressed');
    activeKeys.set(def.className, { key: def.key, code: def.code, keyCode: def.keyCode });
    dispatchKey('keydown', def.key, def.code, def.keyCode);
  }

  function releaseActive(): void {
    if (activeBtn && activeDef) {
      activeBtn.classList.remove('pressed');
      activeKeys.delete(activeDef.className);
      dispatchKey('keyup', activeDef.key, activeDef.code, activeDef.keyCode);
      activeBtn = null;
      activeDef = null;
    }
  }

  dpad.addEventListener('touchstart', (e) => {
    e.preventDefault();
    soundSystem.resumeOnInteraction();
    const touch = e.touches[0];
    const hit = getBtnAt(touch.clientX, touch.clientY);
    if (hit) {
      releaseActive();
      pressBtn(hit.btn, hit.def);
    }
  }, { passive: false });

  dpad.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const hit = getBtnAt(touch.clientX, touch.clientY);
    if (hit) {
      if (hit.btn !== activeBtn) {
        releaseActive();
        pressBtn(hit.btn, hit.def);
      }
    } else {
      // Finger slid off all d-pad buttons
      releaseActive();
    }
  }, { passive: false });

  dpad.addEventListener('touchend', (e) => {
    e.preventDefault();
    releaseActive();
  }, { passive: false });

  dpad.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    releaseActive();
  }, { passive: false });
}

const MOBILE_CSS = `
#mobile-controls {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  background: #1a1a2e;
  border-top: 2px solid #2a2a4a;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  z-index: 9999;
}

#mobile-controls.visible {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* D-pad container */
.dpad-container {
  display: grid;
  grid-template-columns: 46px 46px 46px;
  grid-template-rows: 46px 46px 46px;
  gap: 0;
  flex-shrink: 0;
}

/* Center buttons */
.center-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Action buttons */
.action-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-shrink: 0;
}

/* Base button style */
.mobile-btn {
  border: none;
  outline: none;
  font-family: monospace;
  font-weight: bold;
  cursor: pointer;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
}

/* D-pad buttons */
.dpad-up    { grid-column: 2; grid-row: 1; }
.dpad-left  { grid-column: 1; grid-row: 2; }
.dpad-right { grid-column: 3; grid-row: 2; }
.dpad-down  { grid-column: 2; grid-row: 3; }

.dpad-up, .dpad-down, .dpad-left, .dpad-right {
  background-color: #2d2d4e;
  background-clip: padding-box;
  color: #aaa;
  border: 1px solid transparent;
  border-radius: 7px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dpad-up.pressed, .dpad-down.pressed,
.dpad-left.pressed, .dpad-right.pressed {
  background-color: #4a4a7a;
  background-clip: padding-box;
  color: #fff;
}

/* Center/small buttons */
.btn-start, .btn-music {
  background: #3a3a5a;
  color: #999;
  border-radius: 12px;
  font-size: 10px;
  padding: 8px 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-start.pressed, .btn-music.pressed {
  background: #5a5a8a;
  color: #fff;
}

/* A/B action buttons */
.btn-a, .btn-b {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-a {
  background: #8b2252;
  color: #e0a0b8;
}

.btn-a.pressed {
  background: #b03070;
  color: #fff;
}

.btn-b {
  background: #8b2252;
  color: #e0a0b8;
}

.btn-b.pressed {
  background: #b03070;
  color: #fff;
}

/* When mobile controls are visible, ensure canvas doesn't overlap */
body.mobile-active {
  overflow: hidden;
}

body.mobile-active #game-container {
  height: calc(100vh - 150px - env(safe-area-inset-bottom, 0px));
}

body.mobile-active #game-container canvas {
  max-height: 100%;
}
`;

export function setupMobileControls(): void {
  if (!isMobile()) return;

  // Inject CSS
  const style = document.createElement('style');
  style.textContent = MOBILE_CSS;
  document.head.appendChild(style);

  document.body.classList.add('mobile-active');

  // Create controls container
  const controls = document.createElement('div');
  controls.id = 'mobile-controls';
  controls.className = 'visible';

  // D-pad with slide support
  const dpad = document.createElement('div');
  dpad.className = 'dpad-container';
  const dpadDefs: ButtonDef[] = [
    { label: '\u25B2', key: 'ArrowUp', code: 'ArrowUp', keyCode: 38, className: 'dpad-up' },
    { label: '\u25C0', key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37, className: 'dpad-left' },
    { label: '\u25B6', key: 'ArrowRight', code: 'ArrowRight', keyCode: 39, className: 'dpad-right' },
    { label: '\u25BC', key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, className: 'dpad-down' },
  ];
  const dpadButtons = new Map<HTMLElement, ButtonDef>();
  for (const def of dpadDefs) {
    const btn = document.createElement('button');
    btn.className = `mobile-btn ${def.className}`;
    btn.textContent = def.label;
    btn.setAttribute('aria-label', def.label);
    dpad.appendChild(btn);
    dpadButtons.set(btn, def);
  }
  setupDpadSlide(dpad, dpadButtons);
  controls.appendChild(dpad);

  // Center buttons (START + Music)
  const center = document.createElement('div');
  center.className = 'center-buttons';
  createButton(center, { label: 'START', key: 'Enter', code: 'Enter', keyCode: 13, className: 'btn-start' });
  createButton(center, { label: '\u266A', key: 'm', code: 'KeyM', keyCode: 77, className: 'btn-music' });
  controls.appendChild(center);

  // Action buttons (B + A)
  const actions = document.createElement('div');
  actions.className = 'action-buttons';
  createButton(actions, { label: 'B', key: 'x', code: 'KeyX', keyCode: 88, className: 'btn-b' });
  createButton(actions, { label: 'A', key: 'z', code: 'KeyZ', keyCode: 90, className: 'btn-a' });
  controls.appendChild(actions);

  document.body.appendChild(controls);
}
