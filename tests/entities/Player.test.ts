import { describe, it, expect } from 'vitest';
import { PlayerState } from '../../src/entities/Player';
import { mockPokemon } from '../helpers/pokemon.factory';

describe('PlayerState', () => {
  describe('constructor defaults', () => {
    it('initializes with default values', () => {
      const player = new PlayerState();
      expect(player.name).toBe('RED');
      expect(player.rivalName).toBe('BLUE');
      expect(player.money).toBe(3000);
      expect(player.party).toEqual([]);
      expect(player.pc).toEqual([]);
      expect(player.bag).toEqual({});
      expect(player.badges).toEqual([]);
    });
  });

  describe('addToParty', () => {
    it('adds to party when fewer than 6 members and returns true', () => {
      const player = new PlayerState();
      const pokemon = mockPokemon({ speciesId: 25 });
      const result = player.addToParty(pokemon);
      expect(result).toBe(true);
      expect(player.party).toHaveLength(1);
      expect(player.party[0]).toBe(pokemon);
    });

    it('updates pokedex when adding to party', () => {
      const player = new PlayerState();
      const pokemon = mockPokemon({ speciesId: 25 });
      player.addToParty(pokemon);
      expect(player.pokedexCaught).toContain(25);
      expect(player.pokedexSeen).toContain(25);
    });

    it('sends to PC when party is full and returns false', () => {
      const player = new PlayerState();
      // Fill party to 6
      for (let i = 0; i < 6; i++) {
        player.addToParty(mockPokemon({ speciesId: i + 1 }));
      }
      expect(player.party).toHaveLength(6);

      const pokemon7 = mockPokemon({ speciesId: 7 });
      const result = player.addToParty(pokemon7);
      expect(result).toBe(false);
      expect(player.party).toHaveLength(6);
      expect(player.pc).toHaveLength(1);
      expect(player.pc[0]).toBe(pokemon7);
    });
  });

  describe('inventory management', () => {
    it('addItem and hasItem work correctly', () => {
      const player = new PlayerState();
      expect(player.hasItem('potion')).toBe(false);
      player.addItem('potion', 3);
      expect(player.hasItem('potion')).toBe(true);
      expect(player.bag['potion']).toBe(3);
    });

    it('addItem defaults to count of 1', () => {
      const player = new PlayerState();
      player.addItem('potion');
      expect(player.bag['potion']).toBe(1);
    });

    it('addItem accumulates quantity', () => {
      const player = new PlayerState();
      player.addItem('potion', 2);
      player.addItem('potion', 3);
      expect(player.bag['potion']).toBe(5);
    });

    it('useItem decrements and returns true', () => {
      const player = new PlayerState();
      player.addItem('potion', 2);
      const result = player.useItem('potion');
      expect(result).toBe(true);
      expect(player.bag['potion']).toBe(1);
    });

    it('useItem removes item from bag when count reaches 0', () => {
      const player = new PlayerState();
      player.addItem('potion', 1);
      player.useItem('potion');
      expect(player.hasItem('potion')).toBe(false);
      expect(player.bag['potion']).toBeUndefined();
    });

    it('useItem returns false when item not in bag', () => {
      const player = new PlayerState();
      const result = player.useItem('potion');
      expect(result).toBe(false);
    });
  });

  describe('toSave / fromSave', () => {
    it('round-trip preserves all fields', () => {
      const player = new PlayerState();
      player.name = 'ASH';
      player.rivalName = 'GARY';
      player.money = 9999;
      player.badges = ['BOULDER', 'CASCADE'];
      player.defeatedTrainers = ['brock', 'misty'];
      player.storyFlags = { got_starter: true };
      player.playTime = 12345;
      player.lastHealMap = 'pewter_center';
      player.lastHealX = 5;
      player.lastHealY = 10;
      player.addItem('potion', 5);
      player.addToParty(mockPokemon({ speciesId: 25 }));

      const save = player.toSave();
      const restored = PlayerState.fromSave(save);

      expect(restored.name).toBe('ASH');
      expect(restored.rivalName).toBe('GARY');
      expect(restored.money).toBe(9999);
      expect(restored.badges).toEqual(['BOULDER', 'CASCADE']);
      expect(restored.defeatedTrainers).toEqual(['brock', 'misty']);
      expect(restored.storyFlags).toEqual({ got_starter: true });
      expect(restored.playTime).toBe(12345);
      expect(restored.lastHealMap).toBe('pewter_center');
      expect(restored.lastHealX).toBe(5);
      expect(restored.lastHealY).toBe(10);
      expect(restored.bag['potion']).toBe(5);
      expect(restored.party).toHaveLength(1);
      expect(restored.party[0].speciesId).toBe(25);
      expect(restored.pokedexCaught).toContain(25);
      expect(restored.pokedexSeen).toContain(25);
    });
  });

  describe('coins (Game Corner)', () => {
    it('initializes to 0', () => {
      const player = new PlayerState();
      expect(player.coins).toBe(0);
    });

    it('addCoins increases the balance', () => {
      const player = new PlayerState();
      player.addCoins(50);
      expect(player.coins).toBe(50);
    });

    it('addCoins clamps to the 9999 cap', () => {
      const player = new PlayerState();
      player.coins = 9990;
      player.addCoins(50);
      expect(player.coins).toBe(9999);
    });

    it('addCoins clamps to 0 (cannot go negative)', () => {
      const player = new PlayerState();
      player.coins = 5;
      player.addCoins(-100);
      expect(player.coins).toBe(0);
    });

    it('spendCoins deducts and returns true on success', () => {
      const player = new PlayerState();
      player.coins = 100;
      expect(player.spendCoins(30)).toBe(true);
      expect(player.coins).toBe(70);
    });

    it('spendCoins returns false and leaves balance unchanged when insufficient', () => {
      const player = new PlayerState();
      player.coins = 10;
      expect(player.spendCoins(30)).toBe(false);
      expect(player.coins).toBe(10);
    });

    it('hasCoinCase reflects the bag', () => {
      const player = new PlayerState();
      expect(player.hasCoinCase()).toBe(false);
      player.addItem('coin_case', 1);
      expect(player.hasCoinCase()).toBe(true);
    });

    it('toSave / fromSave round-trips coins', () => {
      const player = new PlayerState();
      player.coins = 1234;
      const restored = PlayerState.fromSave(player.toSave());
      expect(restored.coins).toBe(1234);
    });

    it('fromSave defaults coins to 0 for old saves without the field', () => {
      const player = new PlayerState();
      const save = player.toSave();
      delete (save as { coins?: number }).coins;
      const restored = PlayerState.fromSave(save);
      expect(restored.coins).toBe(0);
    });
  });

  describe('hasAllBadges', () => {
    it('returns false when badges < 8', () => {
      const player = new PlayerState();
      player.badges = ['BOULDER', 'CASCADE', 'THUNDER'];
      expect(player.hasAllBadges()).toBe(false);
    });

    it('returns true when badges = 8', () => {
      const player = new PlayerState();
      player.badges = [
        'BOULDER', 'CASCADE', 'THUNDER', 'RAINBOW',
        'SOUL', 'MARSH', 'VOLCANO', 'EARTH',
      ];
      expect(player.hasAllBadges()).toBe(true);
    });

    it('returns true when badges > 8', () => {
      const player = new PlayerState();
      player.badges = [
        'BOULDER', 'CASCADE', 'THUNDER', 'RAINBOW',
        'SOUL', 'MARSH', 'VOLCANO', 'EARTH', 'EXTRA',
      ];
      expect(player.hasAllBadges()).toBe(true);
    });
  });
});
