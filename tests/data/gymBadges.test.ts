// The badge strings are a shared vocabulary: BattleScene pushes
// `GYM_LEADERS[id].badge` onto `playerState.badges` (BattleScene.ts:1042-1043)
// and the overworld gates field moves, routes and the Route 23 badge checks on
// string literals. A typo on either side is silent — the gate simply never
// opens — so the literals are mirrored here and checked against the data.
import { describe, it, expect } from 'vitest';
import { GYM_LEADERS } from '../../src/data/gymLeaders';
import { PRESETS, STORY_FLAG_GROUPS } from '../../src/data/saveEditorPresets';
import { SaveSystem, SaveData } from '../../src/systems/SaveSystem';

const BADGES = Object.values(GYM_LEADERS).map(l => l.badge);
const BADGE_SET = new Set(BADGES);

/** Badge literals the OverworldScene field-move gates test, keyed by move. */
const FIELD_MOVE_BADGES: Record<string, string> = {
  // OverworldScene.ts:2389 (Fly), 2396/2920 (Surf), 2797 (Cut), 2942 (Strength), 3193 (Flash)
  FLY: 'THUNDER',
  SURF: 'SOUL',
  CUT: 'CASCADE',
  STRENGTH: 'RAINBOW',
  FLASH: 'BOULDER',
};
/** Route 23 badge-check guards (OverworldScene.ts:1984-1986). */
const BADGE_CHECKS: Record<string, string> = {
  badge_check1: 'BOULDER',
  badge_check2: 'CASCADE',
  badge_check3: 'THUNDER',
};
/** Other overworld literals: the Pewter guide blocks Route 3 (OverworldScene.ts:898). */
const OTHER_GATE_BADGES = ['BOULDER'];

describe('gym badges', () => {
  it('there are exactly 8 gym leaders, each with a distinct non-empty badge', () => {
    expect(Object.keys(GYM_LEADERS)).toHaveLength(8);
    expect(BADGE_SET.size).toBe(8);
    for (const badge of BADGES) {
      expect(badge, `badge "${badge}" is not a bare uppercase name`).toMatch(/^[A-Z]+$/);
    }
  });

  it('no badge name is a prefix or suffix of another (the award check is a plain includes)', () => {
    // `badges.includes(badge)` is an exact-string array check, so collisions
    // would not be caught there — but near-identical names would make a typo
    // in a gate literal invisible in review.
    for (const a of BADGES) {
      for (const b of BADGES) {
        if (a === b) continue;
        expect(a.startsWith(b) || a.endsWith(b), `${a} overlaps ${b}`).toBe(false);
      }
    }
  });

  it('every badge a field move gates on is a badge some gym leader awards', () => {
    for (const [move, badge] of Object.entries(FIELD_MOVE_BADGES)) {
      expect(BADGE_SET.has(badge), `${move} gates on "${badge}", which no gym leader awards`).toBe(true);
    }
  });

  it('every Route 23 badge check and route gate names a real badge', () => {
    for (const [npc, badge] of Object.entries(BADGE_CHECKS)) {
      expect(BADGE_SET.has(badge), `${npc} checks "${badge}", which no gym leader awards`).toBe(true);
    }
    for (const badge of OTHER_GATE_BADGES) {
      expect(BADGE_SET.has(badge)).toBe(true);
    }
  });

  it('the first five badges in gym order are the ones the field moves need', () => {
    // Yellow's HM gates line up with the first five gyms; if a leader's badge
    // is renamed or reordered, an HM would become unusable at the point the
    // game hands it over.
    expect(BADGES.slice(0, 5)).toEqual(['BOULDER', 'CASCADE', 'THUNDER', 'RAINBOW', 'SOUL']);
    expect(new Set(Object.values(FIELD_MOVE_BADGES))).toEqual(new Set(BADGES.slice(0, 5)));
  });

  it('each gym leader has a `<id>_cleared` story-flag chip in the save editor', () => {
    const known = new Set(STORY_FLAG_GROUPS.flatMap(g => g.flags.map(f => f.id)));
    for (const id of Object.keys(GYM_LEADERS)) {
      expect(known.has(`${id}_cleared`), `no chip for ${id}_cleared`).toBe(true);
    }
  });

  it('every badge a save-editor preset grants is a real badge, awarded in gym order', () => {
    for (const preset of PRESETS) {
      const save: SaveData = SaveSystem.createNewSave('TEST', 'RIVAL');
      preset.apply(save);
      for (const badge of save.badges) {
        expect(BADGE_SET.has(badge), `${preset.name} grants unknown badge "${badge}"`).toBe(true);
      }
      expect(save.badges, `${preset.name} grants badges out of gym order`)
        .toEqual(BADGES.slice(0, save.badges.length));
      expect(new Set(save.badges).size, `${preset.name} grants a duplicate badge`).toBe(save.badges.length);
    }
  });
});
