import { NPCData } from '../types/map.types';

export function shouldSkipNPC(
  npc: NPCData,
  storyFlags: Record<string, boolean>,
  badges: string[],
  defeatedTrainers: string[],
  hasItem: (id: string) => boolean
): boolean {
  // Item balls disappear once picked up
  if (npc.isItemBall && storyFlags[`picked_up_${npc.id}`]) {
    return true;
  }
  // Pewter guide disappears after getting Boulder badge
  if (npc.id === 'pewter_guide' && badges.includes('BOULDER')) {
    return true;
  }
  // Snorlax NPCs disappear after being cleared
  if (npc.id === 'snorlax_route12' && storyFlags['snorlax_route12_cleared']) {
    return true;
  }
  if (npc.id === 'snorlax_route16' && storyFlags['snorlax_route16_cleared']) {
    return true;
  }
  // Mr. Fuji only appears after clearing tower rockets
  if (npc.id === 'mr_fuji' && !storyFlags['tower_rockets_cleared']) {
    return true;
  }
  // Tower rockets only appear with Silph Scope and before being cleared
  if ((npc.id === 'tower_rocket1' || npc.id === 'tower_rocket2') &&
      (!hasItem('silph_scope') || storyFlags['tower_rockets_cleared'])) {
    return true;
  }
  // Silph Co president dialogue changes after clearing
  if (npc.id === 'silph_president' && storyFlags['silph_co_complete']) {
    return false; // Still visible but dialogue changes in interactWithNPC
  }
  // SS Anne rival disappears after battle
  if (npc.id === 'rival_ss_anne' && defeatedTrainers.includes('rival_ss_anne')) {
    return true;
  }
  // Tower rival disappears after battle
  if (npc.id === 'rival_tower' && defeatedTrainers.includes('rival_tower')) {
    return true;
  }
  // Silph rival disappears after battle
  if (npc.id === 'rival_silph' && defeatedTrainers.includes('rival_silph')) {
    return true;
  }
  // Cerulean rival disappears after battle
  if (npc.id === 'rival_cerulean' && defeatedTrainers.includes('rival_cerulean')) {
    return true;
  }
  // Cerulean officer disappears after helping Bill
  if (npc.id === 'cerulean_officer' && storyFlags['bill_helped']) {
    return true;
  }
  // Cerulean rocket disappears after defeat
  if (npc.id === 'cerulean_rocket' && defeatedTrainers.includes('cerulean_rocket')) {
    return true;
  }
  // Giovanni NPCs disappear after defeat
  if (npc.id === 'giovanni_game_corner' && defeatedTrainers.includes('giovanni_game_corner')) {
    return true;
  }
  if (npc.id === 'giovanni_silph' && defeatedTrainers.includes('giovanni_silph')) {
    return true;
  }
  // Game corner rockets disappear after Giovanni defeated
  if ((npc.id === 'game_corner_rocket1' || npc.id === 'game_corner_rocket2' ||
       npc.id === 'game_corner_poster_rocket') &&
      defeatedTrainers.includes('giovanni_game_corner')) {
    return true;
  }
  // Rocket hideout grunts disappear after Giovanni defeated
  if (npc.id.startsWith('rocket_hideout_b') && npc.isTrainer &&
      defeatedTrainers.includes('giovanni_game_corner')) {
    return true;
  }
  // Rocket hideout B4F grunt disappears after Giovanni defeated
  if (npc.id === 'rocket_hideout_b4f_grunt1' &&
      defeatedTrainers.includes('giovanni_game_corner')) {
    return true;
  }
  // Silph rockets disappear after Giovanni defeated
  if (npc.id.startsWith('silph_') && npc.id.includes('grunt') &&
      defeatedTrainers.includes('giovanni_silph')) {
    return true;
  }
  // Mt. Moon fossils: hidden until fossil nerd defeated, disappear once one is taken
  if ((npc.id === 'mt_moon_helix_fossil' || npc.id === 'mt_moon_dome_fossil')) {
    if (!defeatedTrainers.includes('mt_moon_fossil_nerd')) {
      return true; // Can't see fossils until nerd is beaten
    }
    if (storyFlags['got_fossil']) {
      return true; // Both disappear once one is taken
    }
  }
  // Fossil nerd disappears after defeat
  if (npc.id === 'mt_moon_fossil_nerd' && defeatedTrainers.includes('mt_moon_fossil_nerd')) {
    return true;
  }
  // Jessie & James - Mt. Moon: both disappear after defeated
  if ((npc.id === 'jessie_mtmoon' || npc.id === 'james_mtmoon') &&
      defeatedTrainers.includes('jessie_mtmoon')) {
    return true;
  }
  // Mt. Moon B2F rocket guard: disappears after Jessie & James defeated
  if (npc.id === 'mt_moon_rocket_guard' &&
      defeatedTrainers.includes('jessie_mtmoon')) {
    return true;
  }
  // Jessie & James - Game Corner: disappear after defeated or after Giovanni defeated
  if ((npc.id === 'jessie_gamecorner' || npc.id === 'james_gamecorner') &&
      (defeatedTrainers.includes('jessie_gamecorner') ||
       defeatedTrainers.includes('giovanni_game_corner'))) {
    return true;
  }
  // Jessie & James - Tower: require Silph Scope, disappear when defeated or tower cleared
  if ((npc.id === 'jessie_tower' || npc.id === 'james_tower') &&
      (!hasItem('silph_scope') ||
       storyFlags['tower_rockets_cleared'] ||
       defeatedTrainers.includes('jessie_tower'))) {
    return true;
  }
  // Jessie & James - Silph Co: disappear after defeated or after Giovanni defeated
  if ((npc.id === 'jessie_silph' || npc.id === 'james_silph') &&
      (defeatedTrainers.includes('jessie_silph') ||
       defeatedTrainers.includes('giovanni_silph'))) {
    return true;
  }
  // Legendary birds disappear after encounter
  if (npc.id === 'articuno_seafoam' && storyFlags['articuno_seafoam_cleared']) return true;
  if (npc.id === 'zapdos_power_plant' && storyFlags['zapdos_power_plant_cleared']) return true;
  if (npc.id === 'moltres_victory_road' && storyFlags['moltres_victory_road_cleared']) return true;
  // Elite Four chamber guards step aside once the room's member is defeated
  if (npc.id === 'league_guard_lorelei' && defeatedTrainers.includes('lorelei')) return true;
  if (npc.id === 'league_guard_bruno' && defeatedTrainers.includes('bruno')) return true;
  if (npc.id === 'league_guard_agatha' && defeatedTrainers.includes('agatha')) return true;
  if (npc.id === 'league_guard_lance' && defeatedTrainers.includes('lance')) return true;

  return false;
}
