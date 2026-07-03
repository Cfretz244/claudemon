import { describe, it, expect } from 'vitest';
import { GIFT_NPCS } from '../../src/data/giftNpcs';
import { PlayerState } from '../../src/entities/Player';
import { createPokemon } from '../../src/entities/Pokemon';

describe('GIFT_NPCS', () => {
  it('every entry id matches its registry key and resolves on a fresh state without throwing', () => {
    const state = new PlayerState();
    for (const [key, entry] of Object.entries(GIFT_NPCS)) {
      expect(entry.id).toBe(key);
      expect(() => entry.resolve(state)).not.toThrow();
    }
  });

  it('museum clerk charges $50 once, then greets ticket holders', () => {
    const state = new PlayerState();
    state.money = 100;
    const offer = GIFT_NPCS['museum_ticket_clerk'].resolve(state)!;
    expect(offer.dialogue.join(' ')).toContain('$50');
    offer.onComplete!(state);
    expect(state.money).toBe(50);
    expect(state.storyFlags['museum_2f_ticket']).toBe(true);

    const repeat = GIFT_NPCS['museum_ticket_clerk'].resolve(state)!;
    expect(repeat.onComplete).toBeUndefined();
    expect(repeat.dialogue[0]).toContain('space exhibit');
  });

  it('museum clerk refuses when short on money', () => {
    const state = new PlayerState();
    state.money = 20;
    const result = GIFT_NPCS['museum_ticket_clerk'].resolve(state)!;
    expect(result.onComplete).toBeUndefined();
    expect(result.dialogue[0]).toContain("don't have enough");
  });

  it('bill gives the SS Ticket exactly once', () => {
    const state = new PlayerState();
    const first = GIFT_NPCS['bill'].resolve(state)!;
    first.onComplete!(state);
    expect(state.hasItem('ss_ticket')).toBe(true);
    expect(state.storyFlags['bill_helped']).toBe(true);
    const second = GIFT_NPCS['bill'].resolve(state)!;
    expect(second.onComplete).toBeUndefined();
  });

  it('bulbasaur girl requires a happy Pikachu and grants the Pokemon declaratively', () => {
    const state = new PlayerState();
    state.party = [createPokemon(25, 10)];
    state.party[0].happiness = 100;
    expect(GIFT_NPCS['cerulean_bulbasaur_girl'].resolve(state)!.grantsPokemon).toBeUndefined();

    state.party[0].happiness = 200;
    const offer = GIFT_NPCS['cerulean_bulbasaur_girl'].resolve(state)!;
    expect(offer.grantsPokemon).toEqual({ speciesId: 1, level: 10, cryPitch: 600 });
    offer.onComplete!(state);
    expect(GIFT_NPCS['cerulean_bulbasaur_girl'].resolve(state)!.dialogue[0]).toContain('Take good care');
  });
});
