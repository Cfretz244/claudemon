import { PokemonInstance, StatusCondition } from '../types/pokemon.types';
import { POKEMON_DATA } from '../data/pokemon';

export interface CatchResult {
  caught: boolean;
  shakes: number; // 0-3 shakes before breaking free or catching
}

// Gen 1 catch formula
export function attemptCatch(
  pokemon: PokemonInstance,
  ballType: string = 'poke_ball',
): CatchResult {
  const species = POKEMON_DATA[pokemon.speciesId];
  if (!species) return { caught: false, shakes: 0 };

  const catchRate = species.catchRate;
  const maxHP = pokemon.stats.hp;
  const currentHP = pokemon.currentHp;

  // Ball modifier
  let ballMod = 1;
  if (ballType === 'great_ball') ballMod = 1.5;
  else if (ballType === 'ultra_ball') ballMod = 2;
  else if (ballType === 'master_ball') return { caught: true, shakes: 3 };

  // Status modifier
  let statusMod = 1;
  if (pokemon.status === StatusCondition.SLEEP || pokemon.status === StatusCondition.FREEZE) {
    statusMod = 2;
  } else if (pokemon.status !== StatusCondition.NONE) {
    statusMod = 1.5;
  }

  // Gen 1 catch formula (simplified)
  // f = (HPmax * 255 * 4) / (HPcurrent * ball)
  // If random(0,255) < f -> proceed to catch check
  const f = Math.min(255, Math.floor((maxHP * 255 * 4) / (currentHP * 12 / ballMod)));
  const n = Math.floor(catchRate * ballMod * statusMod);

  // The actual catch check
  const p = Math.min(255, Math.floor(n * f / 255));

  // Shake probability
  const shakeProb = Math.floor(1048560 / Math.sqrt(Math.sqrt(16711680 / Math.max(1, p))));

  let shakes = 0;
  for (let i = 0; i < 3; i++) {
    if (Math.random() * 65536 < shakeProb) {
      shakes++;
    } else {
      break;
    }
  }

  const caught = shakes === 3;
  return { caught, shakes };
}
