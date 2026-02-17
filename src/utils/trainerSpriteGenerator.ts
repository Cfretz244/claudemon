import { TRAINER_SPRITES_CLASSES1 } from './trainerSprites_classes1';
import { TRAINER_SPRITES_CLASSES2 } from './trainerSprites_classes2';
import { TRAINER_SPRITES_INDIVIDUALS } from './trainerSprites_individuals';

const SPRITE_W = 40;
const SPRITE_H = 56;

// Map trainer class names (from trainers.ts) to texture keys
const TRAINER_CLASS_SPRITES: Record<string, string> = {
  'Bug Catcher': 'trainer_bug_catcher',
  'Youngster': 'trainer_youngster',
  'Camper': 'trainer_camper',
  'Super Nerd': 'trainer_super_nerd',
  'Lass': 'trainer_lass',
  'Swimmer': 'trainer_swimmer',
  'Jr. Trainer': 'trainer_jr_trainer',
  'Hiker': 'trainer_hiker',
  'Sailor': 'trainer_sailor',
  'Pokemaniac': 'trainer_pokemaniac',
  'Channeler': 'trainer_channeler',
  'Gambler': 'trainer_gambler',
  'Beauty': 'trainer_beauty',
  'Psychic': 'trainer_psychic',
  'Fisher': 'trainer_fisher',
  'Bird Keeper': 'trainer_bird_keeper',
  'Biker': 'trainer_biker',
  'Cue Ball': 'trainer_cue_ball',
  'Juggler': 'trainer_juggler',
  'Tamer': 'trainer_tamer',
  'Cooltrainer': 'trainer_cooltrainer',
  'Black Belt': 'trainer_black_belt',
  'Scientist': 'trainer_scientist',
  'Burglar': 'trainer_burglar',
  'Team Rocket': 'trainer_team_rocket',
  'Boss': 'trainer_boss',
  'Rival': 'trainer_rival',
  'Elite Four': 'trainer_default',
};

// Map specific trainer IDs to texture keys (gym leaders, E4, Giovanni, rival)
const TRAINER_ID_SPRITES: Record<string, string> = {
  // Gym leaders
  'brock': 'trainer_brock',
  'misty': 'trainer_misty',
  'lt_surge': 'trainer_lt_surge',
  'erika': 'trainer_erika',
  'koga': 'trainer_koga',
  'sabrina': 'trainer_sabrina',
  'blaine': 'trainer_blaine',
  'giovanni': 'trainer_giovanni',
  // Elite Four
  'lorelei': 'trainer_lorelei',
  'bruno': 'trainer_bruno',
  'agatha': 'trainer_agatha',
  'lance': 'trainer_lance',
  // Champion
  'champion_rival': 'trainer_rival',
  // Giovanni variants
  'giovanni_game_corner': 'trainer_giovanni',
  'giovanni_silph': 'trainer_giovanni',
  // Rival variants
  'rival_lab': 'trainer_rival',
  'rival_route22': 'trainer_rival',
  'rival_ss_anne': 'trainer_rival',
  'rival_tower': 'trainer_rival',
  'rival_silph': 'trainer_rival',
  'rival_route22_2': 'trainer_rival',
};

/**
 * Look up the sprite texture key for a given trainer.
 * Checks trainer ID first (for unique sprites), then falls back to class, then default.
 */
export function getTrainerSpriteKey(trainerId: string, trainerClass: string): string {
  if (trainerId && TRAINER_ID_SPRITES[trainerId]) {
    return TRAINER_ID_SPRITES[trainerId];
  }
  if (trainerClass && TRAINER_CLASS_SPRITES[trainerClass]) {
    return TRAINER_CLASS_SPRITES[trainerClass];
  }
  return 'trainer_default';
}

/**
 * Generate all trainer sprite textures and register them with the scene.
 */
export function generateAllTrainerSprites(scene: Phaser.Scene): void {
  const allSprites = [
    ...TRAINER_SPRITES_CLASSES1,
    ...TRAINER_SPRITES_CLASSES2,
    ...TRAINER_SPRITES_INDIVIDUALS,
  ];

  for (const sprite of allSprites) {
    const canvas = document.createElement('canvas');
    canvas.width = SPRITE_W;
    canvas.height = SPRITE_H;
    const ctx = canvas.getContext('2d')!;
    sprite.draw(ctx, SPRITE_W, SPRITE_H);
    scene.textures.addCanvas(sprite.key, canvas);
  }
}
