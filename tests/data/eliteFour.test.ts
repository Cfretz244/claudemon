// The Elite Four gauntlet is wired by string convention across four modules:
// ELITE_FOUR ids name the chamber maps (`elite_four_<id>`), the door guards
// (`league_guard_<id>`) and the defeated-trainer entries npcVisibility checks,
// and OverworldScene re-runs the gauntlet by clearing a hardcoded id set.
// Nothing type-checks those strings against each other, so they are pinned
// here — derived from ELITE_FOUR, so adding or renaming a member fails loudly.
import { describe, it, expect } from 'vitest';
import { ELITE_FOUR, CHAMPION } from '../../src/data/eliteFour';
import { ALL_MAPS } from '../../src/data/maps';
import { shouldSkipNPC } from '../../src/logic/npcVisibility';
import { NPCData } from '../../src/types/map.types';

const ids = ELITE_FOUR.map(e => e.id);
const chamber = (id: string) => `elite_four_${id}`;
const guardId = (id: string) => `league_guard_${id}`;
const CHAMPION_MAP = 'elite_four_champion';

const npcsById = (mapId: string) => {
  const map = ALL_MAPS[mapId];
  expect(map, `map '${mapId}' missing`).toBeDefined();
  return new Map(map.npcs.map(n => [n.id, n] as const));
};
const visible = (npc: NPCData, defeated: string[]) =>
  !shouldSkipNPC(npc, {}, [], defeated, () => false);

describe('Elite Four sequencing', () => {
  it('every member has a chamber map named after its id, holding its trainer NPC', () => {
    for (const member of ELITE_FOUR) {
      const npcs = npcsById(chamber(member.id));
      const trainer = npcs.get(member.id);
      expect(trainer, `${chamber(member.id)} has no NPC '${member.id}'`).toBeDefined();
      expect(trainer!.isTrainer).toBe(true);
      // The NPC's dialogue is the member's pre-battle script, so the data and
      // the map cannot drift apart.
      expect(trainer!.dialogue).toEqual(member.dialogue.before);
    }
  });

  it('the chambers chain in ELITE_FOUR order and end at the Champion', () => {
    const expected = [...ids.map(chamber), CHAMPION_MAP];
    for (let i = 0; i < expected.length - 1; i++) {
      const forward = ALL_MAPS[expected[i]].warps.filter(w => w.targetMap.startsWith('elite_four_'));
      expect(forward.map(w => w.targetMap), `${expected[i]} leads on`).toEqual([expected[i + 1]]);
    }
    // Indigo Plateau enters at the first member only.
    const entries = Object.values(ALL_MAPS)
      .filter(m => !m.id.startsWith('elite_four_'))
      .flatMap(m => m.warps.filter(w => w.targetMap.startsWith('elite_four_')).map(w => w.targetMap));
    expect([...new Set(entries)]).toEqual([chamber(ids[0])]);
  });

  it('the league guards are exactly one per member, standing on that chamber\'s exit', () => {
    const placed = Object.values(ALL_MAPS).flatMap(m =>
      m.npcs.filter(n => n.id.startsWith('league_guard_')).map(n => ({ map: m.id, npc: n })));
    expect(placed.map(p => p.npc.id).sort()).toEqual(ids.map(guardId).sort());

    for (const { map, npc } of placed) {
      const member = npc.id.slice('league_guard_'.length);
      expect(map, `${npc.id} is in the wrong chamber`).toBe(chamber(member));
      const exit = ALL_MAPS[map].warps.find(w => w.x === npc.x && w.y === npc.y);
      expect(exit, `${npc.id} does not stand on the chamber exit`).toBeDefined();
    }
    // The Champion's chamber is the end of the line: no exit, so no guard.
    expect(ALL_MAPS[CHAMPION_MAP].npcs.some(n => n.id.startsWith('league_guard_'))).toBe(false);
  });

  it('each guard steps aside for its own member and nobody else', () => {
    for (const member of ELITE_FOUR) {
      const guard = npcsById(chamber(member.id)).get(guardId(member.id))!;
      expect(visible(guard, []), `${guard.id} should block on arrival`).toBe(true);
      expect(visible(guard, [member.id]), `${guard.id} should step aside`).toBe(false);
      for (const other of ids.filter(i => i !== member.id)) {
        expect(visible(guard, [other]), `${guard.id} opened for ${other}`).toBe(true);
      }
      expect(visible(guard, [CHAMPION.id]), `${guard.id} opened for the Champion`).toBe(true);
    }
  });

  it('the Champion chamber holds CHAMPION and nothing leaves it but the Hall of Fame', () => {
    const npcs = npcsById(CHAMPION_MAP);
    expect([...npcs.keys()]).toEqual([CHAMPION.id]);
    expect(npcs.get(CHAMPION.id)!.isTrainer).toBe(true);
    expect(npcs.get(CHAMPION.id)!.dialogue).toEqual(CHAMPION.dialogue.before);
    expect(ALL_MAPS[CHAMPION_MAP].warps).toEqual([]);
  });

  it('the gauntlet reset clears exactly the five league trainers', () => {
    // Mirrors the literal set in OverworldScene.warpTo (OverworldScene.ts:950):
    // entering the first chamber wipes these so the run always starts at the top.
    const RESET_IDS = ['lorelei', 'bruno', 'agatha', 'lance', 'champion_rival'];
    expect(RESET_IDS).toEqual([...ids, CHAMPION.id]);
  });

  it('difficulty climbs monotonically from Lorelei to the Champion', () => {
    const top = (team: Array<{ level: number }>) => Math.max(...team.map(p => p.level));
    const ladder = [...ELITE_FOUR, CHAMPION];
    for (let i = 1; i < ladder.length; i++) {
      expect(top(ladder[i].team), `${ladder[i].name} is not above ${ladder[i - 1].name}`)
        .toBeGreaterThanOrEqual(top(ladder[i - 1].team));
      expect(ladder[i].prizeMoney).toBeGreaterThan(ladder[i - 1].prizeMoney);
    }
  });

  it('the `champion` flag gates exactly one map: the Cerulean Cave mouth', () => {
    // BattleScene sets storyFlags.champion in the Hall of Fame (BattleScene.ts:1426);
    // Cerulean Cave is the only thing it unlocks.
    const gated = Object.values(ALL_MAPS)
      .filter(m => m.entryGates?.some(g => g.requires.flag === 'champion'))
      .map(m => m.id);
    expect(gated).toEqual(['cerulean_cave_1f']);

    // ...and the gate only lists `cerulean_city`, so any other warp in from
    // outside the cave would walk straight past it.
    const outsideEntrances = Object.values(ALL_MAPS)
      .filter(m => !m.id.startsWith('cerulean_cave'))
      .filter(m => m.warps.some(w => w.targetMap.startsWith('cerulean_cave')))
      .map(m => m.id);
    expect(outsideEntrances).toEqual(['cerulean_city']);
  });
});
