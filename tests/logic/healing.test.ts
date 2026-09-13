import { describe, it, expect } from 'vitest';
import { restoreParty } from '../../src/logic/healing';
import { createPokemon } from '../../src/entities/Pokemon';
import { StatusCondition } from '../../src/types/pokemon.types';

describe('restoreParty', () => {
  it('restores HP, status and PP and reports that something changed', () => {
    const a = createPokemon(25, 20);
    const b = createPokemon(1, 15);
    a.currentHp = 1;
    a.status = StatusCondition.POISON;
    b.moves[0].currentPp = 0;
    expect(restoreParty([a, b])).toBe(true);
    expect(a.currentHp).toBe(a.stats.hp);
    expect(a.status).toBe(StatusCondition.NONE);
    expect(b.moves[0].currentPp).toBe(b.moves[0].maxPp);
    expect(b.currentHp).toBe(b.stats.hp);
  });

  it('a party already at full reports no change (no jingle)', () => {
    const a = createPokemon(25, 20);
    expect(restoreParty([a])).toBe(false);
    expect(restoreParty([])).toBe(false);
  });

  it('a fainted Pokemon is revived to full', () => {
    const a = createPokemon(25, 20);
    a.currentHp = 0;
    expect(restoreParty([a])).toBe(true);
    expect(a.currentHp).toBe(a.stats.hp);
  });
});
