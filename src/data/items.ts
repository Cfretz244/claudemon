export interface ItemData {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'ball' | 'medicine' | 'battle' | 'key' | 'hm' | 'tm';
  effect?: string;
  healAmount?: number;
}

export const ITEMS: Record<string, ItemData> = {
  poke_ball: {
    id: 'poke_ball',
    name: 'POKe BALL',
    description: 'A ball for catching POKeMON.',
    price: 200,
    category: 'ball',
  },
  great_ball: {
    id: 'great_ball',
    name: 'GREAT BALL',
    description: 'A better ball with a higher catch rate.',
    price: 600,
    category: 'ball',
  },
  ultra_ball: {
    id: 'ultra_ball',
    name: 'ULTRA BALL',
    description: 'A high-performance ball.',
    price: 1200,
    category: 'ball',
  },
  master_ball: {
    id: 'master_ball',
    name: 'MASTER BALL',
    description: 'The best ball. Never fails.',
    price: 0,
    category: 'ball',
  },
  potion: {
    id: 'potion',
    name: 'POTION',
    description: 'Restores 20 HP.',
    price: 300,
    category: 'medicine',
    healAmount: 20,
  },
  super_potion: {
    id: 'super_potion',
    name: 'SUPER POTION',
    description: 'Restores 50 HP.',
    price: 700,
    category: 'medicine',
    healAmount: 50,
  },
  hyper_potion: {
    id: 'hyper_potion',
    name: 'HYPER POTION',
    description: 'Restores 200 HP.',
    price: 1200,
    category: 'medicine',
    healAmount: 200,
  },
  max_potion: {
    id: 'max_potion',
    name: 'MAX POTION',
    description: 'Fully restores HP.',
    price: 2500,
    category: 'medicine',
    healAmount: 999,
  },
  full_restore: {
    id: 'full_restore',
    name: 'FULL RESTORE',
    description: 'Fully restores HP and status.',
    price: 3000,
    category: 'medicine',
    healAmount: 999,
  },
  revive: {
    id: 'revive',
    name: 'REVIVE',
    description: 'Revives a fainted POKeMON to half HP.',
    price: 1500,
    category: 'medicine',
  },
  antidote: {
    id: 'antidote',
    name: 'ANTIDOTE',
    description: 'Cures poison.',
    price: 100,
    category: 'medicine',
    effect: 'cure_poison',
  },
  burn_heal: {
    id: 'burn_heal',
    name: 'BURN HEAL',
    description: 'Cures a burn.',
    price: 250,
    category: 'medicine',
    effect: 'cure_burn',
  },
  ice_heal: {
    id: 'ice_heal',
    name: 'ICE HEAL',
    description: 'Cures freezing.',
    price: 250,
    category: 'medicine',
    effect: 'cure_freeze',
  },
  awakening: {
    id: 'awakening',
    name: 'AWAKENING',
    description: 'Cures sleep.',
    price: 250,
    category: 'medicine',
    effect: 'cure_sleep',
  },
  paralyze_heal: {
    id: 'paralyze_heal',
    name: 'PARLYZ HEAL',
    description: 'Cures paralysis.',
    price: 200,
    category: 'medicine',
    effect: 'cure_paralysis',
  },
  full_heal: {
    id: 'full_heal',
    name: 'FULL HEAL',
    description: 'Cures all status problems.',
    price: 600,
    category: 'medicine',
    effect: 'cure_all',
  },
  escape_rope: {
    id: 'escape_rope',
    name: 'ESCAPE ROPE',
    description: 'Escape from a dungeon.',
    price: 550,
    category: 'battle',
  },
  repel: {
    id: 'repel',
    name: 'REPEL',
    description: 'Repels weak wild POKeMON for a while.',
    price: 350,
    category: 'battle',
  },
  rare_candy: {
    id: 'rare_candy',
    name: 'RARE CANDY',
    description: 'Raises level by 1.',
    price: 0,
    category: 'medicine',
  },
};
