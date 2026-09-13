// Battle simulator: configure both sides, then drop straight into the stock
// BattleScene with those parties. No overworld, no save file, no fork of the
// battle flow - this page only builds the BattleSceneData payload that
// OverworldScene would have built (see data/battleSimConfig.ts) and hands it to
// the real scene.
//
// How the hand-off works without touching BattleScene:
//   BootScene.create()  -> scene.start('IntroScene')   -> SimLaunchScene
//   SimLaunchScene      -> scene.start('BattleScene', payload)
//   BattleScene end     -> scene.start('OverworldScene', ...) -> SimReturnScene
// SimLaunchScene and SimReturnScene simply register themselves under the scene
// keys BattleScene and BootScene already jump to, so the existing transitions
// land here instead of in the overworld.
import Phaser from 'phaser';

import { GAME_WIDTH, GAME_HEIGHT, SCALE } from './utils/constants';
import { BootScene } from './scenes/BootScene';
import { BattleScene } from './scenes/BattleScene';
import { POKEMON_DATA } from './data/pokemon';
import {
  AI_BEHAVIOURS,
  MAX_LEVEL,
  MAX_PARTY_SIZE,
  MIN_LEVEL,
  SIM_CONFIG_STORAGE_KEY,
  SPECIES_CHOICES,
  SimBattlePayload,
  SimConfig,
  SimSlot,
  TRAINER_CLASS_CHOICES,
  buildBattlePayload,
  clampLevel,
  defaultConfig,
  defaultMoves,
  learnableMoves,
  makeSlot,
  parseStoredConfig,
  validateConfig,
} from './data/battleSimConfig';

// ── State ─────────────────────────────────────────────────────────────────────

let config: SimConfig = parseStoredConfig(localStorage.getItem(SIM_CONFIG_STORAGE_KEY)) ?? defaultConfig();
let pendingPayload: SimBattlePayload | null = null;
let game: Phaser.Game | null = null;

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;

function persist(): void {
  try {
    localStorage.setItem(SIM_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {
    /* private mode: the config just will not be remembered */
  }
}

// ── Scenes that stand in for the overworld ────────────────────────────────────

/** Registered as 'IntroScene' so BootScene's own start() lands here. */
class SimLaunchScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  create(): void {
    if (!pendingPayload) return;
    const payload = pendingPayload;
    pendingPayload = null;
    this.scene.start('BattleScene', payload);
  }
}

/** Registered as 'OverworldScene' so BattleScene's exit transition lands here. */
class SimReturnScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OverworldScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0a0e14');
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'BATTLE OVER', {
      fontFamily: 'monospace', fontSize: '10px', color: '#9bbc0f',
    }).setOrigin(0.5);
    this.time.delayedCall(400, () => endBattle('Battle over - back to the setup.'));
  }
}

// ── Battle lifecycle ──────────────────────────────────────────────────────────

function startBattle(): void {
  const errors = validateConfig(config);
  if (errors.length > 0) {
    showErrors(errors);
    return;
  }
  showErrors([]);
  pendingPayload = buildBattlePayload(config);
  persist();

  $('sim-setup').hidden = true;
  $('sim-battle').hidden = false;

  game = new Phaser.Game({
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    pixelArt: true,
    zoom: SCALE,
    parent: 'game-container',
    backgroundColor: '#000000',
    scene: [BootScene, SimLaunchScene, BattleScene, SimReturnScene],
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    input: { keyboard: true },
    render: { antialias: false, pixelArt: true, roundPixels: true },
  });

  if (import.meta.env.DEV) {
    (window as unknown as { __claudemon: Phaser.Game }).__claudemon = game;
  }
}

function endBattle(message: string): void {
  if (game) {
    game.destroy(true);
    game = null;
  }
  pendingPayload = null;
  $('sim-battle').hidden = true;
  $('sim-setup').hidden = false;
  toast(message);
  render();
}

// ── Rendering ─────────────────────────────────────────────────────────────────

let toastTimer: number | undefined;
function toast(message: string): void {
  const el = $('toast');
  el.textContent = message;
  el.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('show'), 2400);
}

function showErrors(errors: string[]): void {
  const box = $('errors');
  box.hidden = errors.length === 0;
  box.innerHTML = '';
  for (const error of errors) {
    const li = document.createElement('li');
    li.textContent = error;
    box.appendChild(li);
  }
}

function typeTags(speciesId: number): string {
  const species = POKEMON_DATA[speciesId];
  if (!species) return '';
  return species.types
    .map(t => `<span class="type-tag type-${t.toLowerCase()}">${t}</span>`)
    .join('');
}

function slotCard(side: 'player' | 'opponent', index: number, slot: SimSlot): HTMLElement {
  const card = document.createElement('div');
  card.className = 'slot';
  card.dataset.side = side;
  card.dataset.index = String(index);

  const species = document.createElement('select');
  species.className = 'slot-species';
  species.setAttribute('aria-label', `${side} slot ${index + 1} species`);
  for (const choice of SPECIES_CHOICES) {
    const option = document.createElement('option');
    option.value = String(choice.id);
    option.textContent = `#${String(choice.id).padStart(3, '0')} ${choice.name}`;
    option.selected = choice.id === slot.speciesId;
    species.appendChild(option);
  }
  species.addEventListener('change', () => {
    slot.speciesId = Number(species.value);
    slot.moveIds = defaultMoves(slot.speciesId, slot.level);
    changed();
  });

  const level = document.createElement('input');
  level.type = 'number';
  level.className = 'slot-level';
  level.min = String(MIN_LEVEL);
  level.max = String(MAX_LEVEL);
  level.value = String(slot.level);
  level.setAttribute('aria-label', `${side} slot ${index + 1} level`);
  level.addEventListener('change', () => {
    slot.level = clampLevel(Number(level.value));
    slot.moveIds = defaultMoves(slot.speciesId, slot.level);
    changed();
  });

  const head = document.createElement('div');
  head.className = 'slot-head';
  head.innerHTML = `<span class="slot-num">${index + 1}</span>`;
  head.appendChild(species);
  const lvWrap = document.createElement('label');
  lvWrap.className = 'lv';
  lvWrap.textContent = 'Lv';
  lvWrap.appendChild(level);
  head.appendChild(lvWrap);

  const remove = document.createElement('button');
  remove.className = 'btn btn-sm btn-danger slot-remove';
  remove.textContent = '×';
  remove.title = 'Remove this Pokemon';
  remove.addEventListener('click', () => {
    partyOf(side).splice(index, 1);
    changed();
  });
  head.appendChild(remove);
  card.appendChild(head);

  const tags = document.createElement('div');
  tags.className = 'slot-types';
  tags.innerHTML = typeTags(slot.speciesId);
  card.appendChild(tags);

  const legal = learnableMoves(slot.speciesId, slot.level);
  const moves = document.createElement('div');
  moves.className = 'slot-moves';
  for (let m = 0; m < 4; m++) {
    const select = document.createElement('select');
    select.className = 'slot-move';
    select.setAttribute('aria-label', `${side} slot ${index + 1} move ${m + 1}`);
    const none = document.createElement('option');
    none.value = '';
    none.textContent = '- empty -';
    select.appendChild(none);
    for (const move of legal) {
      const option = document.createElement('option');
      option.value = String(move.id);
      const lvl = move.learnedAt === 0 ? 'start' : `Lv${move.learnedAt}`;
      option.textContent = `${move.name} (${move.type}, ${move.power || '-'}pw, ${lvl})`;
      option.selected = slot.moveIds[m] === move.id;
      select.appendChild(option);
    }
    if (slot.moveIds[m] === undefined) none.selected = true;
    select.addEventListener('change', () => {
      const ids = [...slot.moveIds];
      if (select.value === '') ids.splice(m, 1);
      else ids[m] = Number(select.value);
      slot.moveIds = ids.filter(id => id !== undefined && !Number.isNaN(id));
      changed();
    });
    moves.appendChild(select);
  }
  card.appendChild(moves);

  const reset = document.createElement('button');
  reset.className = 'btn btn-sm slot-default-moves';
  reset.textContent = 'Level-appropriate moves';
  reset.addEventListener('click', () => {
    slot.moveIds = defaultMoves(slot.speciesId, slot.level);
    changed();
  });
  card.appendChild(reset);

  return card;
}

function partyOf(side: 'player' | 'opponent'): SimSlot[] {
  return side === 'player' ? config.playerParty : config.opponentParty;
}

function renderSide(side: 'player' | 'opponent'): void {
  const host = $(`${side}-party`);
  host.innerHTML = '';
  const party = partyOf(side);
  party.forEach((slot, i) => host.appendChild(slotCard(side, i, slot)));

  const add = $(`${side}-add`) as HTMLButtonElement;
  const wildCap = side === 'opponent' && config.opponentKind === 'wild';
  add.disabled = party.length >= MAX_PARTY_SIZE || wildCap;
  add.title = wildCap ? 'A wild battle has exactly one opponent' : '';
  $(`${side}-count`).textContent = `${party.length}/${MAX_PARTY_SIZE}`;
}

function render(): void {
  renderSide('player');
  renderSide('opponent');
  ($('player-name') as HTMLInputElement).value = config.playerName;
  ($('opponent-kind') as HTMLSelectElement).value = config.opponentKind;
  ($('trainer-name') as HTMLInputElement).value = config.trainerName;
  ($('trainer-class') as HTMLSelectElement).value = config.trainerClass;
  $('trainer-fields').hidden = config.opponentKind !== 'trainer';
  showErrors(validateConfig(config));
}

function changed(): void {
  persist();
  render();
}

// ── Wiring ────────────────────────────────────────────────────────────────────

function init(): void {
  const kind = $('opponent-kind') as HTMLSelectElement;
  kind.addEventListener('change', () => {
    config.opponentKind = kind.value === 'trainer' ? 'trainer' : 'wild';
    if (config.opponentKind === 'wild') config.opponentParty = config.opponentParty.slice(0, 1);
    changed();
  });

  const trainerClass = $('trainer-class') as HTMLSelectElement;
  for (const cls of TRAINER_CLASS_CHOICES) {
    const option = document.createElement('option');
    option.value = cls;
    option.textContent = cls;
    trainerClass.appendChild(option);
  }
  trainerClass.addEventListener('change', () => { config.trainerClass = trainerClass.value; changed(); });

  const trainerName = $('trainer-name') as HTMLInputElement;
  trainerName.addEventListener('input', () => { config.trainerName = trainerName.value; changed(); });

  const playerName = $('player-name') as HTMLInputElement;
  playerName.addEventListener('input', () => { config.playerName = playerName.value; changed(); });

  for (const side of ['player', 'opponent'] as const) {
    $(`${side}-add`).addEventListener('click', () => {
      const party = partyOf(side);
      if (party.length >= MAX_PARTY_SIZE) return;
      party.push(makeSlot(side === 'player' ? 25 : 19, party[party.length - 1]?.level ?? 10));
      changed();
    });
  }

  $('sim-start').addEventListener('click', startBattle);
  $('sim-quit').addEventListener('click', () => endBattle('Battle aborted.'));
  $('sim-reset').addEventListener('click', () => {
    config = defaultConfig();
    changed();
    toast('Reset to the default matchup.');
  });

  const aiNote = $('ai-note');
  aiNote.textContent = `${AI_BEHAVIOURS[0].label} - ${AI_BEHAVIOURS[0].description}`;

  render();

  if (import.meta.env.DEV) {
    (window as unknown as Record<string, unknown>).__battleSim = {
      getConfig: () => config,
      setConfig: (next: SimConfig) => { config = next; changed(); },
      start: startBattle,
      end: () => endBattle('Battle ended by the test harness.'),
    };
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
