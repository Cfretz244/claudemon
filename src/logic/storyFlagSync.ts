// Derives story flags (and catch-up item grants) from the defeated-trainer
// list and inventory. Runs on every OverworldScene init so saves made before
// a flag existed stay consistent. Extracted from OverworldScene.init.

import { PlayerState } from '../entities/Player';

/**
 * Key items that open door gates. Carrying one sets the story flag
 * `has_<item>`, so a locked door is an ordinary flag gate (`GateData.flag`)
 * that opens on map load and, via the scene, the moment the key is picked up.
 */
export const DOOR_KEY_ITEMS = ['card_key'] as const;
export const doorKeyFlag = (itemId: string) => `has_${itemId}`;

export function syncDerivedStoryFlags(playerState: PlayerState): void {
  if (playerState.defeatedTrainers.includes('rival_lab')) {
    playerState.storyFlags['rival_battle_lab'] = true;
  }

  // Giovanni at Game Corner -> give Silph Scope
  if (playerState.defeatedTrainers.includes('giovanni_game_corner') &&
      !playerState.hasItem('silph_scope') && !playerState.storyFlags['got_silph_scope']) {
    playerState.addItem('silph_scope');
    playerState.storyFlags['got_silph_scope'] = true;
  }

  // Giovanni at Silph Co -> mark Silph Co complete
  if (playerState.defeatedTrainers.includes('giovanni_silph')) {
    playerState.storyFlags['giovanni_silph'] = true;
    playerState.storyFlags['silph_co_complete'] = true;
  }

  // Cerulean Rocket -> give TM28 Dig
  if (playerState.defeatedTrainers.includes('cerulean_rocket') &&
      !playerState.hasItem('tm28_dig') && !playerState.storyFlags['got_tm28']) {
    playerState.addItem('tm28_dig');
    playerState.storyFlags['got_tm28'] = true;
  }

  // Tower rockets cleared -> enable Mr. Fuji
  if (playerState.defeatedTrainers.includes('tower_rocket1') &&
      playerState.defeatedTrainers.includes('tower_rocket2') &&
      playerState.defeatedTrainers.includes('jessie_tower')) {
    playerState.storyFlags['tower_rockets_cleared'] = true;
  }

  // Saffron gate opens with Tea
  if (playerState.hasItem('tea')) {
    playerState.storyFlags['saffron_open'] = true;
  }

  // Door keys (Card Key) mirror into flags so locked doors can be flag gates
  for (const item of DOOR_KEY_ITEMS) {
    if (playerState.hasItem(item)) playerState.storyFlags[doorKeyFlag(item)] = true;
  }
}
