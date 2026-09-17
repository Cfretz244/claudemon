import { describe, it, expect } from 'vitest';
import { followerVisible } from '../../src/logic/follower';
import { mockPokemon } from '../helpers/pokemon.factory';
import { PIKACHU_SPECIES_ID } from '../../src/logic/oakLab';

const pikachu = (currentHp: number) => mockPokemon({ speciesId: PIKACHU_SPECIES_ID, currentHp });
const other = (speciesId: number, currentHp = 20) => mockPokemon({ speciesId, currentHp });

describe('followerVisible', () => {
  it('is false for an empty party', () => {
    expect(followerVisible([])).toBe(false);
  });

  it('is true for a healthy Pikachu', () => {
    expect(followerVisible([pikachu(20)])).toBe(true);
  });

  it('is false for a fainted Pikachu — the bug this module exists for', () => {
    // The scene used to test the species only, so a 0 HP Pikachu kept walking
    // behind the player until the map changed.
    expect(followerVisible([pikachu(0)])).toBe(false);
  });

  it('is true again once the fainted Pikachu is healed', () => {
    const party = [pikachu(0), other(16)];
    expect(followerVisible(party)).toBe(false);
    party[0].currentHp = 20; // a POKeMON CENTER heal, or a REVIVE from the bag
    expect(followerVisible(party)).toBe(true);
  });

  it('does not care where in the party Pikachu is', () => {
    expect(followerVisible([other(16), other(19), pikachu(20)])).toBe(true);
    expect(followerVisible([other(16), other(19), pikachu(0)])).toBe(false);
  });

  it('ignores the HP of everything that is not Pikachu', () => {
    // A party wipe except Pikachu still has a follower; a healthy team with no
    // Pikachu never does.
    expect(followerVisible([other(16, 0), pikachu(1)])).toBe(true);
    expect(followerVisible([other(16), other(19)])).toBe(false);
  });

  it('treats 1 HP as alive and negative HP (over-kill damage) as fainted', () => {
    expect(followerVisible([pikachu(1)])).toBe(true);
    expect(followerVisible([pikachu(-3)])).toBe(false);
  });
});
