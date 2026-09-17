import { describe, it, expect } from 'vitest';
import {
  shouldGiveOaksParcel, PARCEL_MART_ID, OAKS_PARCEL_DIALOGUE, oaksParcelDialogue,
  grantOaksParcel,
} from '../../src/logic/oaksParcel';
import { ALL_MAPS } from '../../src/data/maps';
import OVERWORLD_SRC from '../../src/scenes/OverworldScene.ts?raw';

const has = (...ids: string[]) => (id: string) => ids.includes(id);

describe('shouldGiveOaksParcel', () => {
  it('Viridian mart gives the parcel once Pikachu is in hand', () => {
    expect(shouldGiveOaksParcel(PARCEL_MART_ID, { has_pikachu: true }, has())).toBe(true);
  });
  it('not before Pikachu', () => {
    expect(shouldGiveOaksParcel(PARCEL_MART_ID, {}, has())).toBe(false);
  });
  it('not while already carrying it, nor after delivery', () => {
    expect(shouldGiveOaksParcel(PARCEL_MART_ID, { has_pikachu: true }, has('oaks_parcel'))).toBe(false);
    expect(shouldGiveOaksParcel(PARCEL_MART_ID, { has_pikachu: true, delivered_parcel: true }, has())).toBe(false);
  });
  it('no other mart hands it out', () => {
    const otherMarts = Object.keys(ALL_MAPS).filter(id => id !== PARCEL_MART_ID && /mart/.test(id));
    expect(otherMarts.length).toBeGreaterThan(0);
    for (const id of otherMarts) {
      expect(shouldGiveOaksParcel(id, { has_pikachu: true }, has()), id).toBe(false);
    }
  });
  it('PARCEL_MART_ID is the Viridian mart map', () => {
    expect(ALL_MAPS[PARCEL_MART_ID]?.name).toBe('POKeMON MART');
    expect(ALL_MAPS['viridian_city'].warps.some(w => w.targetMap === PARCEL_MART_ID)).toBe(true);
  });
});

/**
 * The hand-off itself, moved out of `OverworldScene.handleNPCInteraction()` so
 * a second renderer says the same three lines and makes the same grant. The
 * strings below are the literals the scene used before the move, character for
 * character — a diff here is a change to shipped dialogue.
 */
describe('the mart hand-off', () => {
  it('says exactly what the scene used to say', () => {
    expect(oaksParcelDialogue('RED')).toEqual([
      "Hey! You came from\nPALLET TOWN?",
      "I have a package\nfor PROF. OAK!",
      "RED received\nOAK's PARCEL!",
    ]);
  });

  it('substitutes the player name only in the third line', () => {
    const lines = oaksParcelDialogue('ASH');
    expect(lines.slice(0, 2)).toEqual(OAKS_PARCEL_DIALOGUE.slice(0, 2));
    expect(lines[2]).toBe("ASH received\nOAK's PARCEL!");
    expect(lines.join('')).not.toContain('{PLAYER}');
  });

  it('handles a name that is empty or contains the placeholder', () => {
    // A blank name leaves the leading space, exactly as the old
    // `${this.playerState.name} received` template did.
    expect(oaksParcelDialogue('')[2]).toBe(" received\nOAK's PARCEL!");
    expect(oaksParcelDialogue('{PLAYER}')[2]).toBe("{PLAYER} received\nOAK's PARCEL!");
  });

  it('grants the parcel once and is idempotent', () => {
    const bag: string[] = [];
    const state = {
      hasItem: (id: string) => bag.includes(id),
      addItem: (id: string) => { bag.push(id); },
    };
    grantOaksParcel(state);
    grantOaksParcel(state);
    expect(bag).toEqual(['oaks_parcel']);
  });
});

/**
 * Source-as-text, the repo's idiom for a Phaser scene that cannot be imported
 * in the node env: the scene must CALL the shared helpers rather than keep its
 * own copy of the lines.
 */
describe('OverworldScene uses the shared helpers', () => {
  it('imports them from the parcel module', () => {
    expect(OVERWORLD_SRC).toContain(
      "import { shouldGiveOaksParcel, oaksParcelDialogue, grantOaksParcel } from '../logic/oaksParcel';",
    );
  });

  it('the mart branch shows the helper lines and makes the helper grant', () => {
    const start = OVERWORLD_SRC.indexOf('shouldGiveOaksParcel(this.currentMap.id');
    expect(start).toBeGreaterThan(-1);
    const block = OVERWORLD_SRC.slice(start, start + 400);
    expect(block).toContain('oaksParcelDialogue(this.playerState.name)');
    expect(block).toContain('grantOaksParcel(this.playerState)');
  });

  it('keeps no inline copy of the dialogue or the grant', () => {
    expect(OVERWORLD_SRC).not.toContain('PALLET TOWN?');
    expect(OVERWORLD_SRC).not.toContain("addItem('oaks_parcel')");
  });
});
