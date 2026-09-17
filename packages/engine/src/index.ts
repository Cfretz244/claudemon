export const ENGINE_VERSION = '0.1.0';
export { executeBattleMove, speciesName, combatant } from './battle/move';
export type { Combatant, MoveEvent } from './battle/move';
export { trainerPrizeMoney } from './battle/rewards';
export { createSession, GameSession, OPENING_MAPS, currentObjective } from './session/session';
export type {
  SessionOptions,
  SessionSnapshot,
  PlayerView,
  BattleView,
  Command,
  Effect,
  Objective,
} from './session/session';
export { SeededRandom } from './random/seed';

export { createOakEscortScript, OAK_INTRO_PAGES, oakIntroText, NAME_OPTIONS_PLAYER, NAME_OPTIONS_RIVAL } from './story/opening';
export type { StoryScript, StoryStep, StoryPoint, IntroPage } from './story/opening';
