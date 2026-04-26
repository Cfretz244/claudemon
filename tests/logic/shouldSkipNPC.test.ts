import { describe, it, expect } from 'vitest';
import { shouldSkipNPC } from '../../src/logic/npcVisibility';
import { Direction } from '../../src/utils/constants';
import { NPCData } from '../../src/types/map.types';

function makeNPC(id: string, overrides: Partial<NPCData> = {}): NPCData {
  return { id, x: 0, y: 0, spriteColor: 0xffffff, direction: Direction.DOWN, dialogue: ['Hi'], ...overrides };
}

const noFlags: Record<string, boolean> = {};
const noBadges: string[] = [];
const noDefeated: string[] = [];
const noItems = (_id: string) => false;

describe('shouldSkipNPC', () => {
  it('returns false for an unknown NPC by default', () => {
    const npc = makeNPC('random_villager');
    expect(shouldSkipNPC(npc, noFlags, noBadges, noDefeated, noItems)).toBe(false);
  });

  describe('item balls', () => {
    it('hides item ball after pickup', () => {
      const npc = makeNPC('item_potion_route1', { isItemBall: true });
      const flags = { 'picked_up_item_potion_route1': true };
      expect(shouldSkipNPC(npc, flags, noBadges, noDefeated, noItems)).toBe(true);
    });

    it('shows item ball before pickup', () => {
      const npc = makeNPC('item_potion_route1', { isItemBall: true });
      expect(shouldSkipNPC(npc, noFlags, noBadges, noDefeated, noItems)).toBe(false);
    });
  });

  describe('Snorlax', () => {
    it('hides Snorlax after cleared', () => {
      const npc = makeNPC('snorlax_route12');
      const flags = { 'snorlax_route12_cleared': true };
      expect(shouldSkipNPC(npc, flags, noBadges, noDefeated, noItems)).toBe(true);
    });

    it('shows Snorlax before cleared', () => {
      const npc = makeNPC('snorlax_route12');
      expect(shouldSkipNPC(npc, noFlags, noBadges, noDefeated, noItems)).toBe(false);
    });

    it('hides route 16 Snorlax after cleared', () => {
      const npc = makeNPC('snorlax_route16');
      const flags = { 'snorlax_route16_cleared': true };
      expect(shouldSkipNPC(npc, flags, noBadges, noDefeated, noItems)).toBe(true);
    });
  });

  describe('Mr. Fuji', () => {
    it('hidden before tower rockets cleared', () => {
      const npc = makeNPC('mr_fuji');
      expect(shouldSkipNPC(npc, noFlags, noBadges, noDefeated, noItems)).toBe(true);
    });

    it('visible after tower rockets cleared', () => {
      const npc = makeNPC('mr_fuji');
      const flags = { 'tower_rockets_cleared': true };
      expect(shouldSkipNPC(npc, flags, noBadges, noDefeated, noItems)).toBe(false);
    });
  });

  describe('Tower rockets', () => {
    it('hidden when no Silph Scope', () => {
      const npc = makeNPC('tower_rocket1');
      expect(shouldSkipNPC(npc, noFlags, noBadges, noDefeated, noItems)).toBe(true);
    });

    it('visible with Silph Scope and not yet cleared', () => {
      const npc = makeNPC('tower_rocket1');
      const hasItem = (id: string) => id === 'silph_scope';
      expect(shouldSkipNPC(npc, noFlags, noBadges, noDefeated, hasItem)).toBe(false);
    });

    it('hidden after tower rockets cleared even with Silph Scope', () => {
      const npc = makeNPC('tower_rocket2');
      const flags = { 'tower_rockets_cleared': true };
      const hasItem = (id: string) => id === 'silph_scope';
      expect(shouldSkipNPC(npc, flags, noBadges, noDefeated, hasItem)).toBe(true);
    });
  });

  describe('rival NPCs', () => {
    it('hides rival_ss_anne after defeat', () => {
      const npc = makeNPC('rival_ss_anne');
      expect(shouldSkipNPC(npc, noFlags, noBadges, ['rival_ss_anne'], noItems)).toBe(true);
    });

    it('shows rival_ss_anne before defeat', () => {
      const npc = makeNPC('rival_ss_anne');
      expect(shouldSkipNPC(npc, noFlags, noBadges, noDefeated, noItems)).toBe(false);
    });

    it('hides rival_cerulean after defeat', () => {
      const npc = makeNPC('rival_cerulean');
      expect(shouldSkipNPC(npc, noFlags, noBadges, ['rival_cerulean'], noItems)).toBe(true);
    });

    it('shows rival_cerulean before defeat', () => {
      const npc = makeNPC('rival_cerulean');
      expect(shouldSkipNPC(npc, noFlags, noBadges, noDefeated, noItems)).toBe(false);
    });
  });

  describe('Giovanni', () => {
    it('hides giovanni_game_corner after defeat', () => {
      const npc = makeNPC('giovanni_game_corner');
      expect(shouldSkipNPC(npc, noFlags, noBadges, ['giovanni_game_corner'], noItems)).toBe(true);
    });

    it('shows giovanni_game_corner before defeat', () => {
      const npc = makeNPC('giovanni_game_corner');
      expect(shouldSkipNPC(npc, noFlags, noBadges, noDefeated, noItems)).toBe(false);
    });

    it('hides giovanni_silph after defeat', () => {
      const npc = makeNPC('giovanni_silph');
      expect(shouldSkipNPC(npc, noFlags, noBadges, ['giovanni_silph'], noItems)).toBe(true);
    });
  });

  describe('Mt. Moon fossils', () => {
    it('hidden before fossil nerd defeated', () => {
      const npc = makeNPC('mt_moon_helix_fossil');
      expect(shouldSkipNPC(npc, noFlags, noBadges, noDefeated, noItems)).toBe(true);
    });

    it('visible after fossil nerd defeated and before pickup', () => {
      const npc = makeNPC('mt_moon_helix_fossil');
      expect(shouldSkipNPC(npc, noFlags, noBadges, ['mt_moon_fossil_nerd'], noItems)).toBe(false);
    });

    it('hidden after fossil picked up', () => {
      const npc = makeNPC('mt_moon_dome_fossil');
      const flags = { 'got_fossil': true };
      expect(shouldSkipNPC(npc, flags, noBadges, ['mt_moon_fossil_nerd'], noItems)).toBe(true);
    });
  });

  describe('Jessie & James - Mt. Moon', () => {
    it('hidden after jessie_mtmoon defeated', () => {
      const jessie = makeNPC('jessie_mtmoon');
      const james = makeNPC('james_mtmoon');
      expect(shouldSkipNPC(jessie, noFlags, noBadges, ['jessie_mtmoon'], noItems)).toBe(true);
      expect(shouldSkipNPC(james, noFlags, noBadges, ['jessie_mtmoon'], noItems)).toBe(true);
    });

    it('visible before jessie_mtmoon defeated', () => {
      const jessie = makeNPC('jessie_mtmoon');
      const james = makeNPC('james_mtmoon');
      expect(shouldSkipNPC(jessie, noFlags, noBadges, noDefeated, noItems)).toBe(false);
      expect(shouldSkipNPC(james, noFlags, noBadges, noDefeated, noItems)).toBe(false);
    });
  });

  describe('Jessie & James - Tower', () => {
    it('hidden without Silph Scope', () => {
      const jessie = makeNPC('jessie_tower');
      expect(shouldSkipNPC(jessie, noFlags, noBadges, noDefeated, noItems)).toBe(true);
    });

    it('visible with Silph Scope and not yet defeated/cleared', () => {
      const jessie = makeNPC('jessie_tower');
      const hasItem = (id: string) => id === 'silph_scope';
      expect(shouldSkipNPC(jessie, noFlags, noBadges, noDefeated, hasItem)).toBe(false);
    });

    it('hidden after jessie_tower defeated', () => {
      const james = makeNPC('james_tower');
      const hasItem = (id: string) => id === 'silph_scope';
      expect(shouldSkipNPC(james, noFlags, noBadges, ['jessie_tower'], hasItem)).toBe(true);
    });

    it('hidden after tower rockets cleared', () => {
      const jessie = makeNPC('jessie_tower');
      const flags = { 'tower_rockets_cleared': true };
      const hasItem = (id: string) => id === 'silph_scope';
      expect(shouldSkipNPC(jessie, flags, noBadges, noDefeated, hasItem)).toBe(true);
    });
  });

  describe('Jessie & James - Silph Co', () => {
    it('hidden after jessie_silph defeated', () => {
      const jessie = makeNPC('jessie_silph');
      const james = makeNPC('james_silph');
      expect(shouldSkipNPC(jessie, noFlags, noBadges, ['jessie_silph'], noItems)).toBe(true);
      expect(shouldSkipNPC(james, noFlags, noBadges, ['jessie_silph'], noItems)).toBe(true);
    });

    it('hidden after giovanni_silph defeated', () => {
      const jessie = makeNPC('jessie_silph');
      const james = makeNPC('james_silph');
      expect(shouldSkipNPC(jessie, noFlags, noBadges, ['giovanni_silph'], noItems)).toBe(true);
      expect(shouldSkipNPC(james, noFlags, noBadges, ['giovanni_silph'], noItems)).toBe(true);
    });

    it('visible before defeated and before giovanni_silph defeated', () => {
      const jessie = makeNPC('jessie_silph');
      const james = makeNPC('james_silph');
      expect(shouldSkipNPC(jessie, noFlags, noBadges, noDefeated, noItems)).toBe(false);
      expect(shouldSkipNPC(james, noFlags, noBadges, noDefeated, noItems)).toBe(false);
    });
  });

  describe('Elite Four chamber guards', () => {
    const guards = [
      { id: 'league_guard_lorelei', defeats: 'lorelei' },
      { id: 'league_guard_bruno', defeats: 'bruno' },
      { id: 'league_guard_agatha', defeats: 'agatha' },
      { id: 'league_guard_lance', defeats: 'lance' },
    ];

    for (const { id, defeats } of guards) {
      it(`${id} blocks the door before ${defeats} is defeated`, () => {
        const npc = makeNPC(id);
        expect(shouldSkipNPC(npc, noFlags, noBadges, noDefeated, noItems)).toBe(false);
      });

      it(`${id} steps aside once ${defeats} is defeated`, () => {
        const npc = makeNPC(id);
        expect(shouldSkipNPC(npc, noFlags, noBadges, [defeats], noItems)).toBe(true);
      });

      it(`${id} stays put when an unrelated trainer is defeated`, () => {
        const npc = makeNPC(id);
        expect(shouldSkipNPC(npc, noFlags, noBadges, ['rival_cerulean'], noItems)).toBe(false);
      });
    }
  });
});
