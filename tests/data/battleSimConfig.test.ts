import { describe, it, expect } from 'vitest';
import {
  AI_BEHAVIOURS,
  MAX_LEVEL,
  MAX_PARTY_SIZE,
  MIN_LEVEL,
  MOVES_PER_POKEMON,
  SPECIES_CHOICES,
  SimConfig,
  TRAINER_CLASS_CHOICES,
  buildBattlePayload,
  buildParty,
  buildPokemon,
  buildSaveData,
  clampLevel,
  defaultConfig,
  defaultMoves,
  learnableMoves,
  makeSlot,
  parseStoredConfig,
  validateConfig,
  validateSlot,
} from '../../src/data/battleSimConfig';
import { POKEMON_DATA } from '../../src/data/pokemon';
import { effectiveLearnset } from '../../src/logic/learnset';
import { MOVES_DATA } from '../../src/data/moves';
import { createPokemon } from '../../src/entities/Pokemon';
import { getTrainerSpriteKey } from '../../src/utils/trainerSpriteGenerator';

describe('species and trainer choices', () => {
  it('offers every species the game knows, in Pokedex order', () => {
    expect(SPECIES_CHOICES.length).toBe(Object.keys(POKEMON_DATA).length);
    const ids = SPECIES_CHOICES.map(s => s.id);
    expect([...ids].sort((a, b) => a - b)).toEqual(ids);
    for (const choice of SPECIES_CHOICES) {
      expect(POKEMON_DATA[choice.id].name).toBe(choice.name);
    }
  });

  it('offers only trainer classes that have their own battle sprite', () => {
    expect(TRAINER_CLASS_CHOICES.length).toBeGreaterThan(10);
    expect(new Set(TRAINER_CLASS_CHOICES).size).toBe(TRAINER_CLASS_CHOICES.length);
    for (const cls of TRAINER_CLASS_CHOICES) {
      expect(getTrainerSpriteKey('', cls)).not.toBe('trainer_default');
    }
  });

  it('exposes the single AI behaviour the engine actually has', () => {
    // systems/AISystem.ts exports one selectAIMove() with no difficulty argument.
    expect(AI_BEHAVIOURS).toHaveLength(1);
    expect(AI_BEHAVIOURS[0].id).toBe('default');
    expect(AI_BEHAVIOURS[0].label).toMatch(/only AI/i);
  });
});

describe('move legality', () => {
  it('lists only learnset moves at or below the level, deduplicated', () => {
    for (const { id } of SPECIES_CHOICES.slice(0, 40)) {
      const level = 30;
      const learnable = learnableMoves(id, level);
      const ids = learnable.map(m => m.id);
      expect(new Set(ids).size).toBe(ids.length);
      // effectiveLearnset, not the raw species learnset: a stone evolution with
      // a level-1-only learnset (RAICHU is #26, inside this slice) legally
      // carries its pre-evolution's moves through the stone. See
      // src/logic/learnset.ts and tests/logic/learnset.test.ts.
      const allowed = new Set(
        effectiveLearnset(id).filter(e => e.level <= level).map(e => e.moveId),
      );
      for (const moveId of ids) expect(allowed.has(moveId)).toBe(true);
    }
  });

  it('grows monotonically with level for every species', () => {
    for (const { id } of SPECIES_CHOICES) {
      const low = learnableMoves(id, 5).map(m => m.id);
      const high = learnableMoves(id, MAX_LEVEL).map(m => m.id);
      expect(high.length).toBeGreaterThanOrEqual(low.length);
      for (const moveId of low) expect(high).toContain(moveId);
    }
  });

  it('never lists a move that is not in MOVES_DATA', () => {
    for (const { id } of SPECIES_CHOICES) {
      for (const move of learnableMoves(id, MAX_LEVEL)) {
        expect(MOVES_DATA[move.id]).toBeDefined();
      }
    }
  });

  it('gives every species at least one legal move at level 1', () => {
    for (const { id } of SPECIES_CHOICES) {
      expect(defaultMoves(id, 1).length).toBeGreaterThan(0);
    }
  });

  it('defaults to the same moveset a wild encounter would roll', () => {
    for (const { id } of SPECIES_CHOICES) {
      const level = 42;
      const wild = createPokemon(id, level).moves.map(m => m.moveId);
      expect(defaultMoves(id, level)).toEqual(wild);
    }
  });

  it('never defaults to more than four moves', () => {
    for (const { id } of SPECIES_CHOICES) {
      expect(defaultMoves(id, MAX_LEVEL).length).toBeLessThanOrEqual(MOVES_PER_POKEMON);
    }
  });
});

describe('level bounds', () => {
  it('clamps out-of-range and non-integer levels', () => {
    expect(clampLevel(0)).toBe(MIN_LEVEL);
    expect(clampLevel(-5)).toBe(MIN_LEVEL);
    expect(clampLevel(101)).toBe(MAX_LEVEL);
    expect(clampLevel(17.8)).toBe(17);
    expect(clampLevel(Number.NaN)).toBe(MIN_LEVEL);
  });

  it('rejects a slot whose level is out of range', () => {
    expect(validateSlot({ speciesId: 25, level: 0, moveIds: [84] }, 'slot')).toContainEqual(
      expect.stringContaining('outside 1-100'),
    );
    expect(validateSlot({ speciesId: 25, level: 101, moveIds: [84] }, 'slot')).toContainEqual(
      expect.stringContaining('outside 1-100'),
    );
  });
});

describe('slot validation', () => {
  it('accepts a default slot for every species at a few levels', () => {
    for (const { id } of SPECIES_CHOICES) {
      for (const level of [1, 25, 50, 100]) {
        expect(validateSlot(makeSlot(id, level), 'slot')).toEqual([]);
      }
    }
  });

  it('rejects an unknown species', () => {
    expect(validateSlot({ speciesId: 999, level: 5, moveIds: [33] }, 'slot')).toEqual([
      'slot: unknown species 999',
    ]);
  });

  it('rejects an illegal move for the species', () => {
    // Pikachu (25) cannot learn FLAMETHROWER (53) at any level.
    const errors = validateSlot({ speciesId: 25, level: 50, moveIds: [53] }, 'slot');
    expect(errors).toContainEqual(expect.stringContaining('cannot learn FLAMETHROWER'));
  });

  it('rejects a move the species has not learned yet at this level', () => {
    // Pikachu learns THUNDER (87) at 43 in this build; level 10 is too early.
    const late = POKEMON_DATA[25].learnset.filter(e => e.level > 10)[0];
    expect(late).toBeDefined();
    const errors = validateSlot({ speciesId: 25, level: 10, moveIds: [late.moveId] }, 'slot');
    expect(errors).toContainEqual(expect.stringContaining('by level 10'));
  });

  it('rejects duplicates, too many moves and no moves', () => {
    const base = makeSlot(25, 50);
    const dup = [base.moveIds[0], base.moveIds[0]];
    expect(validateSlot({ ...base, moveIds: dup }, 'slot')).toContainEqual(
      expect.stringContaining('duplicate moves'),
    );
    expect(validateSlot({ ...base, moveIds: [] }, 'slot')).toContainEqual(
      expect.stringContaining('at least one move'),
    );
    const legal = learnableMoves(25, 100).map(m => m.id);
    expect(validateSlot({ speciesId: 25, level: 100, moveIds: legal.slice(0, 5) }, 'slot'))
      .toContainEqual(expect.stringContaining('the limit is 4'));
  });

  it('rejects an unknown move id', () => {
    expect(validateSlot({ speciesId: 25, level: 50, moveIds: [9999] }, 'slot')).toContainEqual(
      'slot: unknown move 9999',
    );
  });
});

describe('config validation', () => {
  it('accepts the default config', () => {
    expect(validateConfig(defaultConfig())).toEqual([]);
  });

  it('accepts a full six-a-side trainer battle', () => {
    const config: SimConfig = {
      ...defaultConfig(),
      opponentKind: 'trainer',
      playerParty: [1, 4, 7, 25, 143, 150].map(id => makeSlot(id, 50)),
      opponentParty: [6, 9, 3, 65, 94, 130].map(id => makeSlot(id, 50)),
    };
    expect(validateConfig(config)).toEqual([]);
  });

  it('rejects more than six on either side', () => {
    const seven = new Array(MAX_PARTY_SIZE + 1).fill(0).map(() => makeSlot(25, 10));
    expect(validateConfig({ ...defaultConfig(), playerParty: seven })).toContainEqual(
      expect.stringContaining('the limit is 6'),
    );
    expect(validateConfig({
      ...defaultConfig(), opponentKind: 'trainer', opponentParty: seven,
    })).toContainEqual(expect.stringContaining('the limit is 6'));
  });

  it('rejects an empty side', () => {
    expect(validateConfig({ ...defaultConfig(), playerParty: [] })).toContainEqual(
      expect.stringContaining('Your side needs at least one'),
    );
    expect(validateConfig({ ...defaultConfig(), opponentParty: [] })).toContainEqual(
      expect.stringContaining('opponent needs at least one'),
    );
  });

  it('rejects a wild battle with more than one opponent', () => {
    const config = { ...defaultConfig(), opponentParty: [makeSlot(19, 8), makeSlot(16, 8)] };
    expect(validateConfig(config)).toContainEqual(expect.stringContaining('exactly one opponent'));
    expect(validateConfig({ ...config, opponentKind: 'trainer', trainerName: 'JOEY' })).toEqual([]);
  });

  it('rejects a trainer battle with no name or a bogus class', () => {
    const config: SimConfig = { ...defaultConfig(), opponentKind: 'trainer', trainerName: '  ' };
    expect(validateConfig(config)).toContainEqual(expect.stringContaining('trainer name'));
    expect(validateConfig({ ...defaultConfig(), opponentKind: 'trainer', trainerClass: 'Wizard' }))
      .toContainEqual(expect.stringContaining('Unknown trainer class'));
  });

  it('rejects a missing or over-long player name', () => {
    expect(validateConfig({ ...defaultConfig(), playerName: '' })).toContainEqual(
      expect.stringContaining('Player name is required'),
    );
    expect(validateConfig({ ...defaultConfig(), playerName: 'ABCDEFGHIJK' })).toContainEqual(
      expect.stringContaining('at most 10'),
    );
  });

  it('reports which slot is wrong', () => {
    const config = { ...defaultConfig(), playerParty: [makeSlot(25, 10), { speciesId: 25, level: 10, moveIds: [53] }] };
    expect(validateConfig(config)).toContainEqual(expect.stringContaining('Your slot 2'));
  });
});

describe('building battle instances', () => {
  it('gives the Pokemon exactly the configured moves at full PP', () => {
    const slot = { speciesId: 25, level: 30, moveIds: [84, 98] };
    const mon = buildPokemon(slot, 'SIM');
    expect(mon.moves.map(m => m.moveId)).toEqual([84, 98]);
    for (const move of mon.moves) {
      expect(move.currentPp).toBe(MOVES_DATA[move.moveId].pp);
      expect(move.currentPp).toBe(move.maxPp);
    }
    expect(mon.level).toBe(30);
    expect(mon.currentHp).toBe(mon.stats.hp);
  });

  it('clamps the level while building', () => {
    expect(buildPokemon({ speciesId: 25, level: 500, moveIds: [] }, 'SIM').level).toBe(MAX_LEVEL);
    expect(buildPokemon({ speciesId: 25, level: -3, moveIds: [] }, 'SIM').level).toBe(MIN_LEVEL);
  });

  it('builds a party in order', () => {
    const party = buildParty([makeSlot(1, 5), makeSlot(4, 6), makeSlot(7, 7)], 'SIM');
    expect(party.map(p => p.speciesId)).toEqual([1, 4, 7]);
    expect(party.map(p => p.level)).toEqual([5, 6, 7]);
  });

  it('builds a save whose party is the configured party', () => {
    const config = { ...defaultConfig(), playerName: 'ash', playerParty: [makeSlot(25, 10), makeSlot(1, 12)] };
    const save = buildSaveData(config);
    expect(save.playerName).toBe('ASH');
    expect(save.party.map(p => p.speciesId)).toEqual([25, 1]);
    expect(save.party[0].currentHp).toBeGreaterThan(0);
    expect(save.bag.potion).toBeGreaterThan(0);
  });
});

describe('battle payload', () => {
  it('builds a wild payload BattleScene can consume', () => {
    const payload = buildBattlePayload(defaultConfig());
    expect(payload.type).toBe('wild');
    expect(payload.wildPokemon?.speciesId).toBe(19);
    expect(payload.trainerTeam).toBeUndefined();
    expect(payload.playerState.party).toHaveLength(1);
    expect(payload.returnMap).toBe(payload.playerState.currentMap);
  });

  it('builds a trainer payload with an empty trainerId so no team is generated', () => {
    const config: SimConfig = {
      ...defaultConfig(),
      opponentKind: 'trainer',
      trainerClass: 'Hiker',
      trainerName: 'rocky',
      opponentParty: [makeSlot(74, 20), makeSlot(95, 22)],
    };
    const payload = buildBattlePayload(config);
    expect(payload.type).toBe('trainer');
    expect(payload.trainerId).toBe('');
    expect(payload.trainerName).toBe('ROCKY');
    expect(payload.trainerClass).toBe('Hiker');
    expect(payload.trainerTeam?.map(p => p.speciesId)).toEqual([74, 95]);
    expect(payload.wildPokemon).toBeUndefined();
  });

  it('round-trips every species as a wild opponent', () => {
    for (const { id } of SPECIES_CHOICES) {
      const payload = buildBattlePayload({ ...defaultConfig(), opponentParty: [makeSlot(id, 20)] });
      expect(payload.wildPokemon?.moves.length).toBeGreaterThan(0);
      expect(payload.wildPokemon?.stats.hp).toBeGreaterThan(0);
    }
  });
});

describe('stored config parsing', () => {
  it('returns null for junk', () => {
    expect(parseStoredConfig(null)).toBeNull();
    expect(parseStoredConfig('')).toBeNull();
    expect(parseStoredConfig('not json')).toBeNull();
    expect(parseStoredConfig('[]')).toBeNull();
    expect(parseStoredConfig('{"playerParty":[]}')).toBeNull();
  });

  it('round-trips a valid config', () => {
    const config = { ...defaultConfig(), opponentKind: 'trainer' as const, playerParty: [makeSlot(25, 30)] };
    const parsed = parseStoredConfig(JSON.stringify(config));
    expect(parsed).not.toBeNull();
    expect(validateConfig(parsed!)).toEqual([]);
    expect(parsed!.playerParty[0].speciesId).toBe(25);
    expect(parsed!.opponentKind).toBe('trainer');
  });

  it('drops illegal moves and unknown species instead of failing', () => {
    const raw = JSON.stringify({
      playerName: 'SIM',
      opponentKind: 'wild',
      playerParty: [{ speciesId: 25, level: 10, moveIds: [53, 9999] }, { speciesId: 999, level: 5, moveIds: [] }],
      opponentParty: [{ speciesId: 19, level: 500, moveIds: [] }],
    });
    const parsed = parseStoredConfig(raw);
    expect(parsed!.playerParty).toHaveLength(1);
    expect(parsed!.playerParty[0].moveIds).toEqual(defaultMoves(25, 10));
    expect(parsed!.opponentParty[0].level).toBe(MAX_LEVEL);
    expect(validateConfig(parsed!)).toEqual([]);
  });
});
