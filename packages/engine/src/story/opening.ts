import { MapData, NPCData } from '../types/map.types';
import { Direction } from '../utils/constants';
import { OAK_INTERCEPT_MESSAGES, OAK_ESCORT_DESTINATION } from '../logic/roadBlocks';

export interface StoryPoint {
  x: number;
  y: number;
}
export type StoryStep =
  | { kind: 'music'; track: string }
  | { kind: 'spawn'; actor: NPCData }
  | { kind: 'walk'; tracks: { actor: string; path: StoryPoint[] }[]; msPerTile: number }
  | { kind: 'dialogue'; lines: string[]; speaker: string }
  | { kind: 'face'; actor: string; direction: Direction }
  | { kind: 'remove'; actor: string };
export interface StoryScript {
  id: string;
  steps: StoryStep[];
  destination: { mapId: string; x: number; y: number };
}

/** Deterministic, cardinal paths avoid scenery and NPCs in the canonical map. */
function path(
  map: MapData,
  from: StoryPoint,
  to: StoryPoint,
  avoid: StoryPoint[] = [],
): StoryPoint[] {
  const key = (p: StoryPoint) => `${p.x},${p.y}`;
  const queue: StoryPoint[] = [from];
  const previous = new Map<string, StoryPoint | null>([[key(from), null]]);
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i];
    if (p.x === to.x && p.y === to.y) {
      const result: StoryPoint[] = [];
      let cursor = p;
      while (previous.get(key(cursor))) {
        result.unshift(cursor);
        cursor = previous.get(key(cursor))!;
      }
      return result;
    }
    for (const [dx, dy] of [
      [0, 1],
      [-1, 0],
      [1, 0],
      [0, -1],
    ]) {
      const next = { x: p.x + dx, y: p.y + dy };
      if (
        map.collision[next.y]?.[next.x] !== false ||
        previous.has(key(next)) ||
        [...map.npcs, ...avoid].some((n) => n.x === next.x && n.y === next.y)
      )
        continue;
      previous.set(key(next), p);
      queue.push(next);
    }
  }
  throw new Error(`No story path in ${map.id}: ${key(from)} → ${key(to)}`);
}

/** The original Oak interruption: hurry over, speak, then lead the player home to the lab. */
export function createOakEscortScript(map: MapData, player: StoryPoint): StoryScript {
  const door = map.warps.find((w) => w.targetMap === 'oaks_lab');
  if (!door) throw new Error('Oak escort requires a map with the laboratory entrance');
  const start = { x: door.x, y: door.y + 1 };
  const adjacent = [
    [0, 1],
    [-1, 0],
    [1, 0],
    [0, -1],
  ].map(([dx, dy]) => ({ x: player.x + dx, y: player.y + dy }));
  let approach: StoryPoint[] | undefined;
  let beside: StoryPoint | undefined;
  for (const candidate of adjacent) {
    try {
      approach = path(map, start, candidate, [player]);
      beside = candidate;
      break;
    } catch {
      /* Try another reachable side. */
    }
  }
  if (!approach || !beside) throw new Error('Oak cannot reach the player');
  const returnPath = path(map, beside, start, [player]);
  const face = (from: StoryPoint, to: StoryPoint) =>
    to.y > from.y
      ? Direction.DOWN
      : to.y < from.y
        ? Direction.UP
        : to.x > from.x
          ? Direction.RIGHT
          : Direction.LEFT;
  return {
    id: 'oak-escort',
    steps: [
      { kind: 'music', track: 'oaks_theme' },
      {
        kind: 'spawn',
        actor: {
          id: 'oak',
          ...start,
          direction: Direction.UP,
          spriteColor: 0xc0a080,
          dialogue: [],
        },
      },
      { kind: 'walk', tracks: [{ actor: 'oak', path: approach }], msPerTile: 120 },
      { kind: 'face', actor: 'oak', direction: face(beside, player) },
      { kind: 'face', actor: 'player', direction: face(player, beside) },
      ...OAK_INTERCEPT_MESSAGES.map((lines) => ({
        kind: 'dialogue' as const,
        lines: [...lines],
        speaker: 'OAK',
      })),
      {
        kind: 'walk',
        tracks: [
          { actor: 'oak', path: [...returnPath, { x: door.x, y: door.y }] },
          { actor: 'player', path: [beside, ...returnPath] },
        ],
        msPerTile: 200,
      },
      { kind: 'remove', actor: 'oak' },
      {
        kind: 'walk',
        tracks: [{ actor: 'player', path: [{ x: door.x, y: door.y }] }],
        msPerTile: 200,
      },
    ],
    destination: { ...OAK_ESCORT_DESTINATION },
  };
}

export const NAME_OPTIONS_PLAYER = ['RED', 'ASH', 'JACK'];
export const NAME_OPTIONS_RIVAL = ['BLUE', 'GARY', 'JOHN'];
export interface IntroPage {
  text: string;
  focus: 'oak' | 'pokemon' | 'player' | 'rival';
  name?: 'player' | 'rival';
}
/** Dialogue and presentation cues extracted from TitleScene's twelve-page Oak introduction. */
export const OAK_INTRO_PAGES: readonly IntroPage[] = [
  { text: 'Hello there!\nWelcome to the world\nof POKeMON!', focus: 'oak' },
  { text: 'My name is OAK!\nPeople call me the\nPOKeMON PROF!', focus: 'oak' },
  { text: 'This world is\ninhabited by creatures\ncalled POKeMON!', focus: 'pokemon' },
  { text: 'For some people,\nPOKeMON are pets.\nOthers use them\nfor fights.', focus: 'pokemon' },
  { text: 'Myself...\nI study POKeMON\nas a profession.', focus: 'oak' },
  { text: 'First, what is\nyour name?', focus: 'player', name: 'player' },
  { text: 'Right! So your\nname is {PLAYER}!', focus: 'player' },
  { text: "This is my grandson.\nHe's been your rival\nsince you were\na baby.", focus: 'rival' },
  { text: '...Erm, what was\nhis name again?', focus: 'rival', name: 'rival' },
  { text: "That's right!\nI remember now!\nHis name is {RIVAL}!", focus: 'rival' },
  { text: '{PLAYER}!\nYour very own\nPOKeMON legend is\nabout to unfold!', focus: 'player' },
  { text: "A world of dreams\nand adventures with\nPOKeMON awaits!\nLet's go!", focus: 'oak' },
];
export function oakIntroText(index: number, player: string, rival: string): string {
  return (OAK_INTRO_PAGES[index]?.text ?? '')
    .split('{PLAYER}').join(player)
    .split('{RIVAL}').join(rival);
}
