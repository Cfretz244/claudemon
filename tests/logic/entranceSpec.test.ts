import { describe, it, expect } from 'vitest';
import {
  resolveEntrance,
  resolveCry,
  cryBaseFreq,
  contourLengthMs,
  ENTRANCE_OVERRIDES,
  SHAPE_FLOURISH,
  CRY_CONTOURS,
  MAX_WILD_MS,
  MAX_SENDOUT_MS,
  MASS_HP_THRESHOLD,
  RARE_CATCH_RATE,
  EntranceKind,
  EntranceShape,
  CryContour,
} from '../../src/logic/entranceSpec';
import { getShapeForSpecies } from '../../src/logic/pokemonShape';
import { POKEMON_DATA } from '../../src/data/pokemon';
import { PokemonType } from '../../src/types/pokemon.types';

const ALL_IDS = Object.keys(POKEMON_DATA).map(Number).sort((a, b) => a - b);
const KINDS: EntranceKind[] = ['wild', 'sendout'];
const SHAPES: EntranceShape[] = ['round', 'angular', 'tall', 'wide', 'bird', 'snake', 'bug'];

const BULBASAUR = POKEMON_DATA[1];
const PIKACHU = POKEMON_DATA[25];

describe('entranceSpec — coverage', () => {
  it('resolves every species x kind with no missing field', () => {
    expect(ALL_IDS.length).toBe(151);
    for (const id of ALL_IDS) {
      for (const kind of KINDS) {
        const spec = resolveEntrance(POKEMON_DATA[id], kind);
        expect(spec.speciesId).toBe(id);
        expect(spec.kind).toBe(kind);
        for (const key of ['shape', 'palette', 'mass', 'rare', 'flourish', 'duration'] as const) {
          expect(spec[key], `species ${id} field ${key}`).toBeDefined();
        }
      }
    }
  });

  it('is pure — the same species always resolves to the same spec', () => {
    for (const id of ALL_IDS) {
      for (const kind of KINDS) {
        expect(resolveEntrance(POKEMON_DATA[id], kind)).toEqual(resolveEntrance(POKEMON_DATA[id], kind));
      }
    }
  });

  it('takes its motion class straight from the shipped body-shape classifier', () => {
    for (const id of ALL_IDS) {
      const species = POKEMON_DATA[id];
      expect(resolveEntrance(species, 'wild').shape).toBe(getShapeForSpecies(id, species.types));
    }
  });

  it('paints from the primary type', () => {
    for (const id of ALL_IDS) {
      expect(resolveEntrance(POKEMON_DATA[id], 'wild').palette).toBe(POKEMON_DATA[id].types[0]);
    }
  });
});

describe('entranceSpec — the budget is a hard cap', () => {
  it('keeps every wild entrance at or under MAX_WILD_MS', () => {
    for (const id of ALL_IDS) {
      const spec = resolveEntrance(POKEMON_DATA[id], 'wild');
      expect(spec.duration, `species ${id}`).toBeLessThanOrEqual(MAX_WILD_MS);
      expect(spec.duration).toBeGreaterThan(0);
    }
  });

  it('keeps every send-out at or under MAX_SENDOUT_MS', () => {
    for (const id of ALL_IDS) {
      const spec = resolveEntrance(POKEMON_DATA[id], 'sendout');
      expect(spec.duration, `species ${id}`).toBeLessThanOrEqual(MAX_SENDOUT_MS);
    }
  });

  it('gives every send-out the same budget — the ball throw dominates, not the shape', () => {
    const durations = new Set(ALL_IDS.map(id => resolveEntrance(POKEMON_DATA[id], 'sendout').duration));
    expect([...durations]).toEqual([MAX_SENDOUT_MS]);
  });

  it('varies the wild budget by shape and nothing else', () => {
    for (const id of ALL_IDS) {
      const species = POKEMON_DATA[id];
      const shape = getShapeForSpecies(id, species.types);
      const peers = ALL_IDS.filter(other => getShapeForSpecies(other, POKEMON_DATA[other].types) === shape);
      const durations = new Set(peers.map(other => resolveEntrance(POKEMON_DATA[other], 'wild').duration));
      expect(durations.size, `shape ${shape}`).toBe(1);
    }
  });

  it('charges mass nothing — the landing shake overlaps the flourish', () => {
    // Snorlax (wide, 160 HP) costs exactly what a weightless wide mon costs.
    const snorlax = resolveEntrance(POKEMON_DATA[143], 'wild');
    const oddish = resolveEntrance(POKEMON_DATA[43], 'wild'); // wide, 45 HP
    expect(snorlax.mass).toBe(true);
    expect(oddish.mass).toBe(false);
    expect(snorlax.duration).toBe(oddish.duration);
  });
});

describe('entranceSpec — mass and rarity', () => {
  it('flags mass at baseStats.hp >= 100 and nowhere else', () => {
    for (const id of ALL_IDS) {
      const species = POKEMON_DATA[id];
      expect(resolveEntrance(species, 'wild').mass, `${id} ${species.name}`)
        .toBe(species.baseStats.hp >= MASS_HP_THRESHOLD);
    }
  });

  it('flags rare at catchRate <= 45 and nowhere else', () => {
    for (const id of ALL_IDS) {
      const species = POKEMON_DATA[id];
      expect(resolveEntrance(species, 'wild').rare, `${id} ${species.name}`)
        .toBe(species.catchRate <= RARE_CATCH_RATE);
    }
  });

  it('catches the heavyweights the design names', () => {
    for (const id of [143 /* Snorlax */, 113 /* Chansey */, 131 /* Lapras */, 40 /* Wigglytuff */]) {
      expect(resolveEntrance(POKEMON_DATA[id], 'wild').mass, POKEMON_DATA[id].name).toBe(true);
    }
  });

  it('catches the legendaries and the final-form starters', () => {
    for (const id of [150 /* Mewtwo */, 144 /* Articuno */, 149 /* Dragonite */, 3, 6, 9]) {
      expect(resolveEntrance(POKEMON_DATA[id], 'wild').rare, POKEMON_DATA[id].name).toBe(true);
    }
    expect(resolveEntrance(POKEMON_DATA[19], 'wild').rare).toBe(false); // Rattata, catchRate 255
  });
});

describe('entranceSpec — flourishes', () => {
  it('gives every shape exactly one flourish', () => {
    expect(Object.keys(SHAPE_FLOURISH).sort()).toEqual([...SHAPES].sort());
    expect(new Set(Object.values(SHAPE_FLOURISH)).size).toBe(7);
  });

  it('gives every resolved spec the flourish of its shape, for both kinds', () => {
    for (const id of ALL_IDS) {
      for (const kind of KINDS) {
        const spec = resolveEntrance(POKEMON_DATA[id], kind);
        expect(spec.flourish).toBe(SHAPE_FLOURISH[spec.shape]);
      }
    }
  });
});

describe('entranceSpec — tier-3 override keys', () => {
  it('names fourteen dex ids across twelve renderers', () => {
    expect(Object.keys(ENTRANCE_OVERRIDES).length).toBe(14);
    expect(new Set(Object.values(ENTRANCE_OVERRIDES)).size).toBe(12);
  });

  it('points every override id at a real species, 1-151', () => {
    for (const idStr of Object.keys(ENTRANCE_OVERRIDES)) {
      const id = Number(idStr);
      expect(id).toBeGreaterThanOrEqual(1);
      expect(id).toBeLessThanOrEqual(151);
      expect(POKEMON_DATA[id], `override ${id}`).toBeDefined();
    }
  });

  it('shares one renderer between the three legendary birds', () => {
    for (const id of [144, 145, 146]) {
      expect(ENTRANCE_OVERRIDES[id]).toBe('legendary_bird');
    }
  });

  it('sets overrideId on exactly the listed species, for both kinds', () => {
    for (const id of ALL_IDS) {
      for (const kind of KINDS) {
        expect(resolveEntrance(POKEMON_DATA[id], kind).overrideId).toBe(ENTRANCE_OVERRIDES[id]);
      }
    }
  });

  it('still gives an overridden species a shape row to fall back to', () => {
    // The renderer ignores overrideId until the tier-3 PR lands.
    for (const idStr of Object.keys(ENTRANCE_OVERRIDES)) {
      const spec = resolveEntrance(POKEMON_DATA[Number(idStr)], 'wild');
      expect(SHAPES).toContain(spec.shape);
      expect(spec.duration).toBeLessThanOrEqual(MAX_WILD_MS);
    }
  });
});

describe('resolveCry — pitch, contour and wave', () => {
  it('keeps the pitch BattleScene has always used', () => {
    for (const id of ALL_IDS) {
      expect(resolveCry(POKEMON_DATA[id]).baseFreq).toBe(id === 25 ? 600 : 300 + id * 3);
    }
    expect(cryBaseFreq(1)).toBe(303);
  });

  /**
   * DEVIATION from the brief, which asked for `resolveCry(BULBASAUR).contour
   * === 'triad'`: BULBASAUR is GRASS, so the shipped classifier calls it
   * `wide`, and design SS4 gives `wide` the long low note. The point of that
   * check — "the cry everyone already knows is byte-for-byte unchanged" — is
   * pinned here against the `triad` table itself and against a round species.
   */
  it('keeps the triad contour byte-for-byte identical to today\'s pokemonCry', () => {
    // SoundSystem.pokemonCry(baseFreq) as it stands today (SoundSystem.ts:411-417).
    const todayFor = (baseFreq: number) => [
      { freq: baseFreq, dur: 0.1, delay: 0 },
      { freq: baseFreq * 1.2, dur: 0.1, delay: 0.1 },
      { freq: baseFreq * 0.8, dur: 0.15, delay: 0.2 },
    ];
    const played = (baseFreq: number) => CRY_CONTOURS.triad.map(n => ({
      freq: baseFreq * n.freqMul, dur: n.dur, delay: n.delay,
    }));
    expect(played(303)).toEqual(todayFor(303));
    expect(played(400)).toEqual(todayFor(400));

    // SQUIRTLE is WATER -> round -> triad -> sawtooth: exactly what it plays now.
    const squirtle = resolveCry(POKEMON_DATA[7]);
    expect(squirtle.contour).toBe('triad');
    expect(squirtle.wave).toBe('sawtooth');
    expect(squirtle.baseFreq).toBe(300 + 7 * 3);
    expect(played(squirtle.baseFreq)).toEqual(todayFor(300 + 7 * 3));
  });

  it('gives BULBASAUR the wide contour its GRASS body shape asks for', () => {
    const spec = resolveCry(BULBASAUR);
    expect(getShapeForSpecies(1, BULBASAUR.types)).toBe('wide');
    expect(spec.contour).toBe('long_low');
    expect(spec.wave).toBe('sawtooth');
    expect(spec.baseFreq).toBe(303);
  });

  it('picks the contour from the body shape', () => {
    const expected: Record<EntranceShape, CryContour> = {
      round: 'triad', snake: 'slide', bird: 'chirp2', bug: 'buzz',
      angular: 'rumble', tall: 'bark2', wide: 'long_low',
    };
    for (const id of ALL_IDS) {
      if (id === 25) continue; // PIKACHU is hand-authored
      const species = POKEMON_DATA[id];
      expect(resolveCry(species).contour, `${id} ${species.name}`)
        .toBe(expected[getShapeForSpecies(id, species.types)]);
    }
  });

  it('lets FIRE, ELECTRIC and GHOST own the timbre', () => {
    const charmander = resolveCry(POKEMON_DATA[4]);   // FIRE
    expect(charmander.wave).toBe('sawtooth');
    expect(charmander.tremolo).toBe(true);

    const magnemite = resolveCry(POKEMON_DATA[81]);   // ELECTRIC
    expect(magnemite.wave).toBe('square');
    expect(magnemite.tremolo).toBeUndefined();

    const gastly = resolveCry(POKEMON_DATA[92]);      // GHOST
    expect(gastly.wave).toBe('sine');
    expect(gastly.vibrato).toBe(true);
  });

  it('otherwise falls back to the shape default', () => {
    expect(resolveCry(POKEMON_DATA[10]).wave).toBe('square');    // Caterpie, bug
    expect(resolveCry(POKEMON_DATA[74]).wave).toBe('triangle');  // Geodude, angular
    expect(resolveCry(POKEMON_DATA[1]).wave).toBe('sawtooth');   // Bulbasaur, wide
  });

  it('gives PIKACHU the mascot cry: two chirps at 600', () => {
    const spec = resolveCry(PIKACHU);
    expect(spec).toEqual({ baseFreq: 600, contour: 'chirp2', wave: 'square' });
    // ...even though its body shape would have said round/triad.
    expect(getShapeForSpecies(25, PIKACHU.types)).toBe('round');
  });

  it('is pure', () => {
    for (const id of ALL_IDS) expect(resolveCry(POKEMON_DATA[id])).toEqual(resolveCry(POKEMON_DATA[id]));
  });

  it('never returns a flag it did not mean to set', () => {
    for (const id of ALL_IDS) {
      const spec = resolveCry(POKEMON_DATA[id]);
      const type = POKEMON_DATA[id].types[0];
      if (id !== 25) {
        expect(!!spec.tremolo).toBe(type === PokemonType.FIRE);
        expect(!!spec.vibrato).toBe(type === PokemonType.GHOST);
      }
    }
  });
});

describe('CRY_CONTOURS — playable data, not a promise', () => {
  it('has a table for every contour a species can resolve to', () => {
    const used = new Set(ALL_IDS.map(id => resolveCry(POKEMON_DATA[id]).contour));
    for (const contour of used) expect(CRY_CONTOURS[contour], contour).toBeDefined();
    expect(used.size).toBe(7);
  });

  it('never has fewer than two notes — one note is a beep, not a cry', () => {
    for (const [contour, notes] of Object.entries(CRY_CONTOURS)) {
      expect(notes.length, contour).toBeGreaterThanOrEqual(2);
    }
  });

  it('never runs past 500 ms', () => {
    for (const contour of Object.keys(CRY_CONTOURS) as CryContour[]) {
      expect(contourLengthMs(contour), contour).toBeLessThanOrEqual(500);
      expect(contourLengthMs(contour), contour).toBeGreaterThan(0);
    }
  });

  it('has notes that start in order and never at a silly pitch', () => {
    for (const [contour, notes] of Object.entries(CRY_CONTOURS)) {
      let prev = -1;
      for (const note of notes) {
        expect(note.delay, contour).toBeGreaterThanOrEqual(prev);
        expect(note.dur, contour).toBeGreaterThan(0);
        expect(note.freqMul, contour).toBeGreaterThan(0.25);
        expect(note.freqMul, contour).toBeLessThan(4);
        prev = note.delay;
      }
    }
  });
});

describe('entranceSpec — full table snapshot', () => {
  it('matches the recorded 151 x {wild, sendout} entrance table', () => {
    const rows: string[] = [];
    for (const id of ALL_IDS) {
      const species = POKEMON_DATA[id];
      for (const kind of KINDS) {
        const s = resolveEntrance(species, kind);
        rows.push([
          String(id).padStart(3, ' '),
          species.name.padEnd(12, ' '),
          s.kind.padEnd(7, ' '),
          s.shape.padEnd(7, ' '),
          s.palette.padEnd(8, ' '),
          s.flourish.padEnd(6, ' '),
          s.mass ? 'mass' : '    ',
          s.rare ? 'rare' : '    ',
          String(s.duration).padStart(3, ' '),
          s.overrideId ?? '-',
        ].join(' '));
      }
    }
    expect(rows.join('\n')).toMatchSnapshot();
  });

  it('matches the recorded 151-row cry table', () => {
    const rows = ALL_IDS.map(id => {
      const species = POKEMON_DATA[id];
      const c = resolveCry(species);
      return [
        String(id).padStart(3, ' '),
        species.name.padEnd(12, ' '),
        String(c.baseFreq).padStart(4, ' '),
        c.contour.padEnd(8, ' '),
        c.wave.padEnd(8, ' '),
        c.tremolo ? 'tremolo' : '       ',
        c.vibrato ? 'vibrato' : '       ',
        String(contourLengthMs(c.contour)).padStart(3, ' ') + 'ms',
      ].join(' ');
    });
    expect(rows.join('\n')).toMatchSnapshot();
  });
});
