import { PokemonInstance } from '../types/pokemon.types';
import { SaveData } from '../systems/SaveSystem';
import { MAX_PARTY_SIZE } from '../utils/constants';

export class PlayerState {
  name: string;
  rivalName: string;
  party: PokemonInstance[];
  pc: PokemonInstance[];
  bag: Record<string, number>;
  pcItems: Record<string, number>;
  money: number;
  coins: number;
  badges: string[];
  defeatedTrainers: string[];
  pokedexSeen: number[];
  pokedexCaught: number[];
  storyFlags: Record<string, boolean>;
  playTime: number;
  lastHealMap: string;
  lastHealX: number;
  lastHealY: number;
  repelSteps: number;

  constructor() {
    this.name = 'RED';
    this.rivalName = 'BLUE';
    this.party = [];
    this.pc = [];
    this.bag = {};
    this.pcItems = {};
    this.money = 3000;
    this.coins = 0;
    this.badges = [];
    this.defeatedTrainers = [];
    this.pokedexSeen = [];
    this.pokedexCaught = [];
    this.storyFlags = {};
    this.playTime = 0;
    this.lastHealMap = 'player_house';
    this.lastHealX = 3;
    this.lastHealY = 5;
    this.repelSteps = 0;
  }

  static fromSave(save: SaveData): PlayerState {
    const state = new PlayerState();
    state.name = save.playerName;
    state.rivalName = save.rivalName;
    state.party = save.party;
    state.pc = save.pc;
    state.bag = save.bag;
    state.pcItems = save.pcItems || {};
    state.money = save.money;
    state.coins = save.coins ?? 0;
    state.badges = save.badges;
    state.defeatedTrainers = save.defeatedTrainers;
    state.pokedexSeen = save.pokedexSeen;
    state.pokedexCaught = save.pokedexCaught;
    state.storyFlags = save.storyFlags;
    state.playTime = save.playTime;
    state.lastHealMap = save.lastHealMap || 'player_house';
    state.lastHealX = save.lastHealX ?? 3;
    state.lastHealY = save.lastHealY ?? 5;
    state.repelSteps = save.repelSteps ?? 0;
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
      pcItems: this.pcItems,
      money: this.money,
      coins: this.coins,
      badges: this.badges,
      defeatedTrainers: this.defeatedTrainers,
      pokedexSeen: this.pokedexSeen,
      pokedexCaught: this.pokedexCaught,
      storyFlags: this.storyFlags,
      playTime: this.playTime,
      lastHealMap: this.lastHealMap,
      lastHealX: this.lastHealX,
      lastHealY: this.lastHealY,
      repelSteps: this.repelSteps,
    };
  }

  addToParty(pokemon: PokemonInstance): boolean {
    if (this.party.length >= MAX_PARTY_SIZE) {
      this.pc.push(pokemon);
      return false; // Went to PC
    }
    this.party.push(pokemon);

    this.markCaught(pokemon.speciesId);

    return true; // Added to party
  }

  /**
   * Register a species as OWNED. Owning implies having seen it, so this marks
   * both - the Pokedex screen reads the two lists separately.
   *
   * Every way a species joins the party goes through here: a catch and a gift
   * via `addToParty`, and an evolution via `EvolutionSystem.evolvePokemon`,
   * which changes the species of a mon that is already in the party and so
   * never touches `addToParty`.
   */
  markCaught(speciesId: number): void {
    if (!this.pokedexCaught.includes(speciesId)) {
      this.pokedexCaught.push(speciesId);
    }
    this.markSeen(speciesId);
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

  addCoins(n: number): void {
    this.coins = Math.min(9999, Math.max(0, this.coins + n));
  }

  spendCoins(n: number): boolean {
    if (this.coins < n) return false;
    this.coins -= n;
    return true;
  }

  hasCoinCase(): boolean {
    return this.hasItem('coin_case');
  }
}
