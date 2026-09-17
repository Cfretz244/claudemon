import { PokemonInstance } from '../types/pokemon.types';

export interface SaveData {
  playerName: string;
  rivalName: string;
  currentMap: string;
  playerX: number;
  playerY: number;
  lastHealMap: string;
  lastHealX: number;
  lastHealY: number;
  party: PokemonInstance[];
  pc: PokemonInstance[];
  bag: Record<string, number>;
  pcItems: Record<string, number>;
  money: number;
  coins?: number;
  badges: string[];
  defeatedTrainers: string[];
  pokedexSeen: number[];
  pokedexCaught: number[];
  storyFlags: Record<string, boolean>;
  playTime: number;
  isSurfing?: boolean;
  isRidingBike?: boolean;
  repelSteps?: number;
}
