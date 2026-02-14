import { PokemonInstance } from '../types/pokemon.types';
import { SaveData } from '../systems/SaveSystem';
import { MAX_PARTY_SIZE } from '../utils/constants';

export class PlayerState {
  name: string;
  rivalName: string;
  party: PokemonInstance[];
  pc: PokemonInstance[];
  bag: Record<string, number>;
  money: number;
  badges: string[];
  defeatedTrainers: string[];
  pokedexSeen: number[];
  pokedexCaught: number[];
  storyFlags: Record<string, boolean>;
  playTime: number;
  lastHealMap: string;
  lastHealX: number;
  lastHealY: number;

  constructor() {
    this.name = 'RED';
    this.rivalName = 'BLUE';
    this.party = [];
    this.pc = [];
    this.bag = { poke_ball: 5, potion: 3 };
    this.money = 3000;
    this.badges = [];
    this.defeatedTrainers = [];
    this.pokedexSeen = [];
    this.pokedexCaught = [];
    this.storyFlags = {};
    this.playTime = 0;
    this.lastHealMap = 'player_house';
    this.lastHealX = 3;
    this.lastHealY = 5;
  }

  static fromSave(save: SaveData): PlayerState {
    const state = new PlayerState();
    state.name = save.playerName;
    state.rivalName = save.rivalName;
    state.party = save.party;
    state.pc = save.pc;
    state.bag = save.bag;
    state.money = save.money;
    state.badges = save.badges;
    state.defeatedTrainers = save.defeatedTrainers;
    state.pokedexSeen = save.pokedexSeen;
    state.pokedexCaught = save.pokedexCaught;
    state.storyFlags = save.storyFlags;
    state.playTime = save.playTime;
    state.lastHealMap = save.lastHealMap || 'player_house';
    state.lastHealX = save.lastHealX ?? 3;
    state.lastHealY = save.lastHealY ?? 5;
    return state;
  }

  toSave(): SaveData {
    return {
      playerName: this.name,
      rivalName: this.rivalName,
      currentMap: '',
      playerX: 0,
      playerY: 0,
      party: this.party,
      pc: this.pc,
      bag: this.bag,
      money: this.money,
      badges: this.badges,
      defeatedTrainers: this.defeatedTrainers,
      pokedexSeen: this.pokedexSeen,
      pokedexCaught: this.pokedexCaught,
      storyFlags: this.storyFlags,
      playTime: this.playTime,
      lastHealMap: this.lastHealMap,
      lastHealX: this.lastHealX,
      lastHealY: this.lastHealY,
    };
  }

  addToParty(pokemon: PokemonInstance): boolean {
    if (this.party.length >= MAX_PARTY_SIZE) {
      this.pc.push(pokemon);
      return false; // Went to PC
    }
    this.party.push(pokemon);

    // Update Pokedex
    if (!this.pokedexCaught.includes(pokemon.speciesId)) {
      this.pokedexCaught.push(pokemon.speciesId);
    }
    if (!this.pokedexSeen.includes(pokemon.speciesId)) {
      this.pokedexSeen.push(pokemon.speciesId);
    }

    return true; // Added to party
  }

  markSeen(speciesId: number): void {
    if (!this.pokedexSeen.includes(speciesId)) {
      this.pokedexSeen.push(speciesId);
    }
  }

  hasItem(itemId: string): boolean {
    return (this.bag[itemId] ?? 0) > 0;
  }

  useItem(itemId: string): boolean {
    if (!this.hasItem(itemId)) return false;
    this.bag[itemId]--;
    if (this.bag[itemId] <= 0) {
      delete this.bag[itemId];
    }
    return true;
  }

  addItem(itemId: string, count: number = 1): void {
    this.bag[itemId] = (this.bag[itemId] ?? 0) + count;
  }

  getFirstAlivePokemon(): PokemonInstance | null {
    return this.party.find(p => p.currentHp > 0) ?? null;
  }

  hasAllBadges(): boolean {
    return this.badges.length >= 8;
  }
}
