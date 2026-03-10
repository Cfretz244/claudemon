import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SaveSystem } from '../../src/systems/SaveSystem';

const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
};
vi.stubGlobal('localStorage', localStorageMock);

describe('SaveSystem', () => {
  beforeEach(() => {
    // Clear store between tests
    for (const key of Object.keys(store)) {
      delete store[key];
    }
    vi.clearAllMocks();
  });

  it('hasSave returns false initially', () => {
    expect(SaveSystem.hasSave()).toBe(false);
  });

  it('save then load round-trips correctly', () => {
    const saveData = SaveSystem.createNewSave('ASH', 'GARY');
    SaveSystem.save(saveData);

    const loaded = SaveSystem.load();
    expect(loaded).not.toBeNull();
    expect(loaded!.playerName).toBe('ASH');
    expect(loaded!.rivalName).toBe('GARY');
    expect(loaded!.money).toBe(3000);
    expect(loaded!.currentMap).toBe('player_house');
    expect(loaded!.party).toEqual([]);
    expect(loaded!.badges).toEqual([]);
  });

  it('hasSave returns true after save', () => {
    const saveData = SaveSystem.createNewSave();
    SaveSystem.save(saveData);
    expect(SaveSystem.hasSave()).toBe(true);
  });

  it('deleteSave removes the save (hasSave false after)', () => {
    const saveData = SaveSystem.createNewSave();
    SaveSystem.save(saveData);
    expect(SaveSystem.hasSave()).toBe(true);

    SaveSystem.deleteSave();
    expect(SaveSystem.hasSave()).toBe(false);
    expect(SaveSystem.load()).toBeNull();
  });

  it('createNewSave returns valid SaveData with defaults', () => {
    const save = SaveSystem.createNewSave();
    expect(save.playerName).toBe('RED');
    expect(save.rivalName).toBe('BLUE');
    expect(save.currentMap).toBe('player_house');
    expect(save.playerX).toBe(3);
    expect(save.playerY).toBe(5);
    expect(save.lastHealMap).toBe('player_house');
    expect(save.lastHealX).toBe(3);
    expect(save.lastHealY).toBe(5);
    expect(save.party).toEqual([]);
    expect(save.pc).toEqual([]);
    expect(save.money).toBe(3000);
    expect(save.badges).toEqual([]);
    expect(save.defeatedTrainers).toEqual([]);
    expect(save.pokedexSeen).toEqual([]);
    expect(save.pokedexCaught).toEqual([]);
    expect(save.storyFlags).toEqual({});
    expect(save.playTime).toBe(0);
    expect(save.bag).toHaveProperty('poke_ball');
    expect(save.bag).toHaveProperty('potion');
  });

  it('createNewSave accepts custom names', () => {
    const save = SaveSystem.createNewSave('MISTY', 'BROCK');
    expect(save.playerName).toBe('MISTY');
    expect(save.rivalName).toBe('BROCK');
  });

  it('load returns null when no save exists', () => {
    expect(SaveSystem.load()).toBeNull();
  });
});
