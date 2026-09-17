// The SaveData shape is engine-owned; the localStorage class below is the
// browser-side half and stays in the app.
import type { SaveData } from '@claudemon/engine/systems/SaveSystem';
export type { SaveData } from '@claudemon/engine/systems/SaveSystem';

const SAVE_KEY = 'pokemon_yellow_save';

export class SaveSystem {
  static save(data: SaveData): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save:', e);
    }
  }

  static load(): SaveData | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        return JSON.parse(raw) as SaveData;
      }
    } catch (e) {
      console.error('Failed to load save:', e);
    }
    return null;
  }

  static hasSave(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  static deleteSave(): void {
    localStorage.removeItem(SAVE_KEY);
  }

  static createNewSave(playerName: string = 'RED', rivalName: string = 'BLUE'): SaveData {
    return {
      playerName,
      rivalName,
      currentMap: 'player_house',
      playerX: 3,
      playerY: 5,
      lastHealMap: 'player_house',
      lastHealX: 3,
      lastHealY: 5,
      party: [],
      pc: [],
      bag: {
        'poke_ball': 5,
        'potion': 3,
      },
      pcItems: {},
      money: 3000,
      coins: 0,
      badges: [],
      defeatedTrainers: [],
      pokedexSeen: [],
      pokedexCaught: [],
      storyFlags: {},
      playTime: 0,
    };
  }
}
