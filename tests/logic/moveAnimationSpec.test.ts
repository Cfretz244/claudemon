import { describe, it, expect } from 'vitest';
import {
  resolveAnimation,
  resolveMotion,
  resolveIntensity,
  TYPE_VOCAB,
  MOVE_OVERRIDES,
  MAX_DURATION_MS,
  MAX_OVERRIDE_DURATION_MS,
  OVERRIDE_DURATION,
  AnimationSpec,
  BaseMotion,
} from '../../src/logic/moveAnimationSpec';
import { MOVES_DATA } from '../../src/data/moves';
import { PokemonType, MoveCategory, MoveEffect } from '../../src/types/pokemon.types';

const ALL_IDS = Object.keys(MOVES_DATA).map(Number).sort((a, b) => a - b);

describe('moveAnimationSpec — coverage', () => {
  it('resolves every move in MOVES_DATA with no missing field', () => {
    expect(ALL_IDS.length).toBe(165);
    for (const id of ALL_IDS) {
      const spec = resolveAnimation(id);
      expect(spec.moveId).toBe(id);
      for (const key of ['motion', 'type', 'color', 'accentColor', 'intensity', 'particle', 'accent', 'sfx', 'duration'] as const) {
        expect(spec[key], `move ${id} field ${key}`).toBeDefined();
      }
      expect(spec.type).toBe(MOVES_DATA[id].type);
    }
  });

  it('is pure — the same id always resolves to the same spec', () => {
    for (const id of ALL_IDS) {
      expect(resolveAnimation(id)).toEqual(resolveAnimation(id));
    }
  });

  it('tolerates an unknown move id (METRONOME can call anything)', () => {
    const spec = resolveAnimation(9999);
    expect(spec.motion).toBe('contact');
    expect(spec.type).toBe(PokemonType.NORMAL);
    expect(spec.color).toBe(TYPE_VOCAB[PokemonType.NORMAL].color);
  });
});

describe('moveAnimationSpec — type vocabulary', () => {
  it('covers all 15 types', () => {
    expect(Object.keys(TYPE_VOCAB).sort()).toEqual(Object.values(PokemonType).sort());
  });

  it('has 15 unique colours — one per type, so colour means type', () => {
    const colors = Object.values(TYPE_VOCAB).map(v => v.color);
    expect(new Set(colors).size).toBe(15);
  });

  it('has a unique particle shape, accent and sfx per type', () => {
    expect(new Set(Object.values(TYPE_VOCAB).map(v => v.particle)).size).toBe(15);
    expect(new Set(Object.values(TYPE_VOCAB).map(v => v.accent)).size).toBe(15);
    expect(new Set(Object.values(TYPE_VOCAB).map(v => v.sfx)).size).toBe(15);
  });

  it('every resolved colour is a TYPE_VOCAB colour — no ad-hoc literals', () => {
    const palette = new Set(Object.values(TYPE_VOCAB).map(v => v.color));
    const used = new Set(ALL_IDS.map(id => resolveAnimation(id).color));
    for (const c of used) expect(palette.has(c)).toBe(true);
    expect(used.size).toBe(15);
  });

  it('a move always gets its own type colour', () => {
    for (const id of ALL_IDS) {
      const spec = resolveAnimation(id);
      expect(spec.color).toBe(TYPE_VOCAB[MOVES_DATA[id].type].color);
    }
  });
});

describe('moveAnimationSpec — motion assignment', () => {
  const byEffect = (effect: MoveEffect) => ALL_IDS.filter(id => MOVES_DATA[id].effect === effect);

  it('every MULTI_HIT / TWO_HIT move is a barrage', () => {
    const ids = [...byEffect(MoveEffect.MULTI_HIT), ...byEffect(MoveEffect.TWO_HIT)];
    expect(ids.length).toBe(10);
    for (const id of ids) expect(resolveAnimation(id).motion).toBe('barrage');
  });

  it('every SELF_DESTRUCT move is a burst', () => {
    const ids = byEffect(MoveEffect.SELF_DESTRUCT);
    expect(ids.length).toBe(2);
    for (const id of ids) expect(resolveAnimation(id).motion).toBe('burst');
  });

  it('every CHARGE move is a charge and is flagged two-turn', () => {
    const ids = byEffect(MoveEffect.CHARGE);
    expect(ids.length).toBe(6);
    for (const id of ids) {
      const spec = resolveAnimation(id);
      expect(spec.motion).toBe('charge');
      expect(spec.twoTurn).toBe('charge');
    }
  });

  it('only CHARGE moves are flagged two-turn', () => {
    for (const id of ALL_IDS) {
      const spec = resolveAnimation(id);
      if (spec.twoTurn) expect(MOVES_DATA[id].effect).toBe(MoveEffect.CHARGE);
    }
  });

  it('every WRAP move binds', () => {
    const ids = byEffect(MoveEffect.WRAP);
    expect(ids.length).toBe(4);
    for (const id of ids) expect(resolveAnimation(id).motion).toBe('bind');
  });

  it('every DRAIN / DREAM_EATER move drains', () => {
    const ids = [...byEffect(MoveEffect.DRAIN), ...byEffect(MoveEffect.DREAM_EATER)];
    expect(ids.length).toBe(4);
    for (const id of ids) expect(resolveAnimation(id).motion).toBe('drain');
  });

  it('every OHKO / FIXED_DAMAGE / LEVEL_DAMAGE move is a special-strike', () => {
    const ids = [
      ...byEffect(MoveEffect.OHKO),
      ...byEffect(MoveEffect.FIXED_DAMAGE),
      ...byEffect(MoveEffect.LEVEL_DAMAGE),
    ];
    expect(ids.length).toBe(8);
    for (const id of ids) expect(resolveAnimation(id).motion).toBe('special-strike');
  });

  it('every status move is either a self-aura or a status-cloud', () => {
    const status = ALL_IDS.filter(id => MOVES_DATA[id].category === MoveCategory.STATUS);
    expect(status.length).toBe(55);
    for (const id of status) {
      expect(['self-aura', 'status-cloud']).toContain(resolveAnimation(id).motion);
    }
  });

  it('no damaging move resolves to a status motion', () => {
    const damaging = ALL_IDS.filter(id => MOVES_DATA[id].category !== MoveCategory.STATUS);
    for (const id of damaging) {
      expect(['self-aura', 'status-cloud']).not.toContain(resolveAnimation(id).motion);
    }
  });

  it('HORN DRILL (32), the one move with no animation today, resolves', () => {
    const spec = resolveAnimation(32);
    expect(spec.motion).toBe('special-strike');
    expect(spec.type).toBe(PokemonType.NORMAL);
  });

  it('spreads the 165 moves over every motion', () => {
    const counts: Record<string, number> = {};
    for (const id of ALL_IDS) {
      const m = resolveAnimation(id).motion;
      counts[m] = (counts[m] ?? 0) + 1;
    }
    // Frozen so a data edit that re-shapes the whole battle look is visible.
    expect(counts).toEqual({
      contact: 49,
      'status-cloud': 26,
      'self-aura': 29,
      projectile: 14,
      beam: 13,
      barrage: 10,
      'special-strike': 8,
      charge: 6,
      bind: 4,
      drain: 4,
      burst: 2,
    });
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(165);
  });
});

describe('moveAnimationSpec — intensity and duration', () => {
  it('intensity is monotonic in power', () => {
    for (let p = 0; p < 260; p++) {
      const here = resolveIntensity(p);
      const next = resolveIntensity(p + 1);
      const rank = { light: 0, mid: 1, heavy: 2 } as const;
      expect(rank[next]).toBeGreaterThanOrEqual(rank[here]);
    }
    expect(resolveIntensity(0)).toBe('light');
    expect(resolveIntensity(44)).toBe('light');
    expect(resolveIntensity(45)).toBe('mid');
    expect(resolveIntensity(89)).toBe('mid');
    expect(resolveIntensity(90)).toBe('heavy');
  });

  it('TACKLE, BODY SLAM and HYPER FANG are no longer the same jab', () => {
    const tackle = resolveAnimation(33);   // power 35
    const bodySlam = resolveAnimation(34); // power 85
    const hyperFang = resolveAnimation(158); // power 80
    expect(tackle.intensity).toBe('light');
    expect(bodySlam.intensity).toBe('mid');
    expect(hyperFang.intensity).toBe('mid');
    expect(tackle.duration).toBeLessThan(bodySlam.duration);
  });

  it('no generic move exceeds the 900 ms cap', () => {
    for (const id of ALL_IDS) {
      const spec = resolveAnimation(id);
      expect(spec.duration).toBeGreaterThan(0);
      // A tier-3 set-piece may declare its own longer budget; everything the
      // generic renderer draws stays under the 900 ms cap.
      const cap = spec.override && OVERRIDE_DURATION[spec.override] !== undefined
        ? MAX_OVERRIDE_DURATION_MS
        : MAX_DURATION_MS;
      expect(spec.duration, `move ${id}`).toBeLessThanOrEqual(cap);
    }
  });

  it('override budgets name a real override key and stay under the set-piece cap', () => {
    const keys = new Set(Object.values(MOVE_OVERRIDES));
    for (const [key, ms] of Object.entries(OVERRIDE_DURATION)) {
      expect(keys.has(key), `OVERRIDE_DURATION key ${key}`).toBe(true);
      expect(ms).toBeGreaterThan(MAX_DURATION_MS);
      expect(ms).toBeLessThanOrEqual(MAX_OVERRIDE_DURATION_MS);
    }
  });

  it('THUNDER gets the sky-strike budget, THUNDERBOLT and THUNDER SHOCK do not', () => {
    expect(resolveAnimation(87).duration).toBe(OVERRIDE_DURATION.thunder);
    expect(resolveAnimation(85).duration).toBeLessThanOrEqual(MAX_DURATION_MS);
    expect(resolveAnimation(84).duration).toBeLessThanOrEqual(MAX_DURATION_MS);
  });

  it('duration never shrinks as intensity grows within one motion', () => {
    const byMotion = new Map<BaseMotion, AnimationSpec[]>();
    for (const id of ALL_IDS) {
      const spec = resolveAnimation(id);
      // Tier-3 set-pieces declare their own budget and deliberately ignore the
      // generic intensity ladder (FLY is a 'mid' charge but a 1000 ms film).
      if (spec.override && OVERRIDE_DURATION[spec.override] !== undefined) continue;
      const list = byMotion.get(spec.motion) ?? [];
      list.push(spec);
      byMotion.set(spec.motion, list);
    }
    const rank = { light: 0, mid: 1, heavy: 2 } as const;
    for (const [, specs] of byMotion) {
      for (const a of specs) {
        for (const b of specs) {
          if (rank[a.intensity] < rank[b.intensity]) {
            expect(a.duration).toBeLessThanOrEqual(b.duration);
          }
        }
      }
    }
  });
});

describe('moveAnimationSpec — overrides (tier 3)', () => {
  it('lists exactly the 34 iconic moves from the design', () => {
    expect(Object.keys(MOVE_OVERRIDES).length).toBe(34);
  });

  it('every override id is a real move and resolves with that override set', () => {
    for (const [idStr, key] of Object.entries(MOVE_OVERRIDES)) {
      const id = Number(idStr);
      expect(MOVES_DATA[id], `override id ${id}`).toBeDefined();
      expect(resolveAnimation(id).override).toBe(key);
    }
  });

  it('override keys are unique', () => {
    const keys = Object.values(MOVE_OVERRIDES);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('moves without an override leave the field undefined', () => {
    for (const id of ALL_IDS) {
      if (!MOVE_OVERRIDES[id]) expect(resolveAnimation(id).override).toBeUndefined();
    }
  });
});

describe('moveAnimationSpec — full table snapshot', () => {
  it('matches the recorded 165-row moveId -> spec table', () => {
    const rows = ALL_IDS.map(id => {
      const s = resolveAnimation(id);
      return [
        String(id).padStart(3, ' '),
        MOVES_DATA[id].name.padEnd(14, ' '),
        s.type.padEnd(8, ' '),
        s.motion.padEnd(14, ' '),
        s.intensity.padEnd(5, ' '),
        s.particle.padEnd(7, ' '),
        s.sfx.padEnd(9, ' '),
        String(s.duration).padStart(3, ' '),
        '#' + s.color.toString(16).toUpperCase().padStart(6, '0'),
        s.override ?? '-',
      ].join(' ');
    });
    expect(rows.join('\n')).toMatchSnapshot();
  });
});

describe('moveAnimationSpec — resolveMotion is usable directly', () => {
  it('classifies by the move record, not by id lookup', () => {
    expect(resolveMotion(MOVES_DATA[153])).toBe('burst');
    expect(resolveMotion(MOVES_DATA[3])).toBe('barrage');
    expect(resolveMotion(MOVES_DATA[105])).toBe('self-aura');
    expect(resolveMotion(MOVES_DATA[45])).toBe('status-cloud');
  });
});
