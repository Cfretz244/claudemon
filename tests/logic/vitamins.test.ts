import { describe, it, expect } from 'vitest';
import {
  applyVitamin, VITAMIN_STAT, STAT_DISPLAY_NAME,
  VITAMIN_EV_GAIN, VITAMIN_EV_LIMIT, MAX_EV,
} from '../../src/logic/vitamins';
import { createTestPokemon } from '../helpers/pokemon.factory';
import { calculateStats } from '../../src/entities/Pokemon';
import { POKEMON_DATA } from '../../src/data/pokemon';
import { ITEMS } from '../../src/data/items';
import { BaseStats } from '../../src/types/pokemon.types';

const BULBASAUR = 1;
const mon = (level = 50) => createTestPokemon(BULBASAUR, level);
const species = () => POKEMON_DATA[BULBASAUR];

/** The four vitamins that exist as items (iron is in the table but has no ball). */
const SHIPPED_VITAMINS = ['hp_up', 'protein', 'calcium', 'carbos'];

describe('VITAMIN_STAT', () => {
  it('maps each Gen I vitamin to the stat it raises', () => {
    expect(VITAMIN_STAT).toEqual<Record<string, keyof BaseStats>>({
      hp_up: 'hp',
      protein: 'attack',
      iron: 'defense',
      calcium: 'special',
      carbos: 'speed',
    });
  });

  it('every shipped vitamin is a real medicine item; IRON deliberately is not', () => {
    for (const id of SHIPPED_VITAMINS) {
      expect(ITEMS[id], id).toBeDefined();
      expect(ITEMS[id].category, id).toBe('medicine');
    }
    // No Silph Co ball gives an IRON, so no IRON item was added; the table
    // entry is there so a future ball only needs the data row.
    expect(ITEMS.iron).toBeUndefined();
  });

  it('has a display name for every stat', () => {
    for (const stat of Object.values(VITAMIN_STAT)) {
      expect(STAT_DISPLAY_NAME[stat], stat).toBeTruthy();
    }
    expect(STAT_DISPLAY_NAME.special).toBe('SPECIAL');   // Gen I has one Special
  });
});

describe('applyVitamin', () => {
  it('raises its own stat exp by 2560 and leaves the others alone', () => {
    for (const id of SHIPPED_VITAMINS) {
      const p = mon();
      const before = { ...p.evs };
      const stat = VITAMIN_STAT[id];
      expect(applyVitamin(p, id, species()), id).toEqual({ ok: true, stat });
      expect(p.evs[stat], id).toBe(before[stat] + VITAMIN_EV_GAIN);
      for (const other of Object.keys(before) as (keyof BaseStats)[]) {
        if (other === stat) continue;
        expect(p.evs[other], `${id}/${other}`).toBe(before[other]);
      }
    }
  });

  it('recomputes the whole stat block from the new stat exp', () => {
    const p = mon();
    applyVitamin(p, 'protein', species());
    expect(p.stats).toEqual(calculateStats(species(), p.level, p.ivs, p.evs));
  });

  it('actually raises the stat it names', () => {
    for (const id of SHIPPED_VITAMINS) {
      const p = mon(80);
      const stat = VITAMIN_STAT[id];
      const before = p.stats[stat];
      applyVitamin(p, id, species());
      expect(p.stats[stat], id).toBeGreaterThan(before);
    }
  });

  it('refuses at or above the 25600 limit, without touching the Pokemon', () => {
    for (const id of SHIPPED_VITAMINS) {
      const p = mon();
      const stat = VITAMIN_STAT[id];
      p.evs[stat] = VITAMIN_EV_LIMIT;
      const stats = { ...p.stats };
      expect(applyVitamin(p, id, species()), id).toEqual({ ok: false });
      expect(p.evs[stat], id).toBe(VITAMIN_EV_LIMIT);
      expect(p.stats, id).toEqual(stats);

      p.evs[stat] = MAX_EV;
      expect(applyVitamin(p, id, species()), id).toEqual({ ok: false });
      expect(p.evs[stat], id).toBe(MAX_EV);
    }
  });

  it('accepts one last dose just below the limit, and never exceeds 65535', () => {
    const p = mon();
    p.evs.attack = VITAMIN_EV_LIMIT - 1;
    expect(applyVitamin(p, 'protein', species())).toEqual({ ok: true, stat: 'attack' });
    expect(p.evs.attack).toBe(VITAMIN_EV_LIMIT - 1 + VITAMIN_EV_GAIN);
    // The 25600 gate keeps a vitamin well under the ceiling, so the clamp can
    // never actually fire — but the invariant is what matters here.
    expect(p.evs.attack).toBeLessThanOrEqual(MAX_EV);
  });

  it('HP UP gives the extra maximum HP as current HP too', () => {
    const p = mon();
    p.currentHp = 20;
    const oldMax = p.stats.hp;
    expect(applyVitamin(p, 'hp_up', species())).toEqual({ ok: true, stat: 'hp' });
    expect(p.stats.hp).toBeGreaterThan(oldMax);
    expect(p.currentHp).toBe(20 + (p.stats.hp - oldMax));
    expect(p.currentHp).toBeLessThanOrEqual(p.stats.hp);
  });

  it('a full-HP mon stays at full HP after an HP UP', () => {
    const p = mon();
    p.currentHp = p.stats.hp;
    applyVitamin(p, 'hp_up', species());
    expect(p.currentHp).toBe(p.stats.hp);
  });

  it('leaves current HP alone for the non-HP vitamins', () => {
    for (const id of ['protein', 'calcium', 'carbos']) {
      const p = mon();
      p.currentHp = 17;
      applyVitamin(p, id, species());
      expect(p.currentHp, id).toBe(17);
    }
  });

  it('does not revive a fainted Pokemon', () => {
    const p = mon();
    p.currentHp = 0;
    expect(applyVitamin(p, 'hp_up', species())).toEqual({ ok: true, stat: 'hp' });
    expect(p.currentHp).toBe(0);
  });

  it('is null for anything that is not a vitamin', () => {
    for (const id of ['potion', 'revive', 'max_revive', 'rare_candy', 'pp_up', 'x_accuracy', '']) {
      const p = mon();
      const before = { ...p.evs };
      expect(applyVitamin(p, id, species()), id).toBeNull();
      expect(p.evs, id).toEqual(before);
    }
  });

  it('ten doses are ten increments — the limit is the only brake', () => {
    const p = mon();
    for (let i = 0; i < 10; i++) {
      expect(applyVitamin(p, 'carbos', species()), `dose ${i}`).toEqual({ ok: true, stat: 'speed' });
    }
    expect(p.evs.speed).toBe(VITAMIN_EV_LIMIT);
    expect(applyVitamin(p, 'carbos', species())).toEqual({ ok: false });
  });
});
