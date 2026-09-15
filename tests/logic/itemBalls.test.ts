// Pins item-ball pickup to the exact behaviour that lived in
// OverworldScene.pickUpItemBall() — the message verbatim, the same flags in the
// same order, the same sprite removals — and pins the flags against the two
// systems that read them: `shouldSkipNPC()` (which hides a taken ball) and the
// `has_<key>` flag gates in the map data (which a door key opens the moment
// `syncDerivedStoryFlags()` runs).
import { describe, it, expect } from 'vitest';
import {
  itemBallPickup, otherFossilBall, pickedUpFlag,
  FOSSIL_BALL_IDS, HELIX_FOSSIL_BALL, DOME_FOSSIL_BALL, GOT_FOSSIL_FLAG,
  ItemBallPickup,
} from '../../src/logic/itemBalls';
import { itemBallAction } from '../../src/logic/encounters';
import { shouldSkipNPC } from '../../src/logic/npcVisibility';
import { syncDerivedStoryFlags, DOOR_KEY_ITEMS, doorKeyFlag } from '../../src/logic/storyFlagSync';
import { isFlagGateOpen } from '../../src/logic/boulders';
import { PlayerState } from '../../src/entities/Player';
import { ALL_MAPS } from '../../src/data/maps';
import { ITEMS } from '../../src/data/items';
import { NPCData } from '../../src/types/map.types';
import { Direction } from '../../src/utils/constants';

const ball = (id: string, itemId?: string, extra: Partial<NPCData> = {}): NPCData => ({
  id, x: 0, y: 0, spriteColor: 0, direction: Direction.DOWN, dialogue: [],
  isItemBall: true, itemId, ...extra,
});
const RED = { name: 'RED' };

/** Every real (non-ambush) item ball in the shipped maps. */
const SHIPPED_BALLS = Object.entries(ALL_MAPS).flatMap(([mapId, m]) =>
  m.npcs.filter(n => n.isItemBall && !n.ambush).map(n => ({ mapId, npc: n })));

/**
 * Seven Silph Co balls name items that are not in `ITEMS`, so picking them up
 * has always been a silent no-op (see the "the no-op cases" block). They are
 * excluded from the sweeps over "balls that actually give something".
 */
const DEAD_BALL_IDS = [
  'silph_2f_protein', 'silph_4f_max_revive', 'silph_6f_hp_up', 'silph_6f_x_accuracy',
  'silph_7f_calcium', 'silph_9f_carbos', 'silph_10f_pp_up',
];
const LIVE_BALLS = SHIPPED_BALLS.filter(b => !DEAD_BALL_IDS.includes(b.npc.id));

describe('itemBallPickup — the no-op cases', () => {
  it('an unknown itemId is a no-op: no text, no flag, no sprite removal', () => {
    expect(itemBallPickup(ball('route1_mystery', 'not_a_real_item'), RED)).toBeNull();
  });

  it('a ball with no itemId at all is a no-op', () => {
    expect(itemBallPickup(ball('route1_empty'), RED)).toBeNull();
    expect(itemBallPickup({ id: 'route1_empty', itemId: undefined }, RED)).toBeNull();
    expect(itemBallPickup({ id: 'route1_empty', itemId: '' }, RED)).toBeNull();
  });

  it('pins the seven shipped balls that ARE duds — a pre-existing Silph Co bug', () => {
    // Not a regression from this refactor: `pickUpItemBall` has always bailed on
    // `ITEMS[npc.itemId]` being undefined, so these seven balls sit on the floor
    // for ever — no text, no item, no `picked_up_` flag, the sprite stays.
    // `data/items.ts` simply has no protein/carbos/calcium/hp_up/pp_up/
    // x_accuracy/max_revive entry (only plain `revive` exists).
    const dud = SHIPPED_BALLS.filter(b => itemBallPickup(b.npc, RED) === null);
    expect(dud.map(b => b.npc.id).sort()).toEqual([...DEAD_BALL_IDS].sort());
    for (const { npc } of dud) {
      expect(npc.itemId, npc.id).toBeTruthy();       // it names an item...
      expect(ITEMS[npc.itemId!], npc.id).toBeUndefined();   // ...that does not exist
      expect(npc.id.startsWith('silph_'), npc.id).toBe(true);
    }
  });

  it('every other shipped item ball names a real item', () => {
    for (const { mapId, npc } of LIVE_BALLS) {
      expect(itemBallPickup(npc, RED), `${mapId}/${npc.id}`).not.toBeNull();
    }
    expect(SHIPPED_BALLS.length).toBe(97);
    expect(LIVE_BALLS.length).toBe(90);
  });
});

describe('itemBallPickup — an ordinary ball', () => {
  const POTION = itemBallPickup(ball('route1_potion', 'potion'), RED)!;

  it('is exactly one flag, one sprite, one line of text', () => {
    expect(POTION).toEqual<ItemBallPickup>({
      messages: ['RED found\nPOTION!'],
      itemId: 'potion',
      flags: ['picked_up_route1_potion'],
      removeSprites: ['route1_potion'],
    });
  });

  it('puts the player name and the item NAME (not its id) in the message', () => {
    expect(itemBallPickup(ball('b', 'super_potion'), { name: 'ASH' })!.messages)
      .toEqual(['ASH found\nSUPER POTION!']);
    expect(ITEMS.super_potion.name).toBe('SUPER POTION');
  });

  it('never sets got_fossil and never touches another sprite', () => {
    for (const { npc } of LIVE_BALLS) {
      if ((FOSSIL_BALL_IDS as readonly string[]).includes(npc.id)) continue;
      const pickup = itemBallPickup(npc, RED)!;
      expect(pickup.flags, npc.id).toEqual([pickedUpFlag(npc.id)]);
      expect(pickup.removeSprites, npc.id).toEqual([npc.id]);
      expect(pickup.itemId, npc.id).toBe(npc.itemId);
    }
  });

  it('returns fresh arrays, so a caller cannot corrupt the next pickup', () => {
    const first = itemBallPickup(ball('route1_potion', 'potion'), RED)!;
    first.messages[0] = 'mutated';
    first.flags.push('injected');
    first.removeSprites.push('injected');
    expect(itemBallPickup(ball('route1_potion', 'potion'), RED)).toEqual(POTION);
  });
});

describe('itemBallPickup — the Mt. Moon fossils', () => {
  it('HELIX sets got_fossil and removes the DOME ball', () => {
    expect(itemBallPickup(ball(HELIX_FOSSIL_BALL, 'helix_fossil'), RED)).toEqual<ItemBallPickup>({
      messages: ['RED found\nHELIX FOSSIL!'],
      itemId: 'helix_fossil',
      flags: ['picked_up_mt_moon_helix_fossil', 'got_fossil'],
      removeSprites: ['mt_moon_helix_fossil', 'mt_moon_dome_fossil'],
    });
  });

  it('DOME sets got_fossil and removes the HELIX ball', () => {
    expect(itemBallPickup(ball(DOME_FOSSIL_BALL, 'dome_fossil'), RED)).toEqual<ItemBallPickup>({
      messages: ['RED found\nDOME FOSSIL!'],
      itemId: 'dome_fossil',
      flags: ['picked_up_mt_moon_dome_fossil', 'got_fossil'],
      removeSprites: ['mt_moon_dome_fossil', 'mt_moon_helix_fossil'],
    });
  });

  it('the own ball is always removed first, the other second', () => {
    for (const id of FOSSIL_BALL_IDS) {
      expect(itemBallPickup(ball(id, 'helix_fossil'), RED)!.removeSprites[0]).toBe(id);
    }
  });

  it('otherFossilBall pairs the two and nothing else', () => {
    expect(otherFossilBall(HELIX_FOSSIL_BALL)).toBe(DOME_FOSSIL_BALL);
    expect(otherFossilBall(DOME_FOSSIL_BALL)).toBe(HELIX_FOSSIL_BALL);
    for (const id of ['route1_potion', 'mt_moon_fossil', 'helix_fossil', '']) {
      expect(otherFossilBall(id), id).toBeNull();
    }
  });

  it('the pair is exactly the two fossil balls the maps ship, both on Mt. Moon B2F', () => {
    const placed = LIVE_BALLS.filter(b => otherFossilBall(b.npc.id) !== null);
    expect(placed.map(b => b.npc.id).sort()).toEqual([...FOSSIL_BALL_IDS].sort());
    for (const { mapId } of placed) expect(mapId).toBe('mt_moon_b2f');
  });

  it('taking either fossil hides BOTH balls afterwards', () => {
    for (const taken of FOSSIL_BALL_IDS) {
      const pickup = itemBallPickup(ball(taken, 'helix_fossil'), RED)!;
      const storyFlags: Record<string, boolean> = {};
      for (const f of pickup.flags) storyFlags[f] = true;
      for (const id of FOSSIL_BALL_IDS) {
        // got_fossil alone is what hides the one that was not taken.
        expect(shouldSkipNPC(ball(id, 'helix_fossil'), storyFlags, [], ['mt_moon_fossil_nerd'], () => false),
          `${taken} taken, ${id} hidden`).toBe(true);
      }
    }
  });

  it('got_fossil is not a gate flag, so writing it before applyFlagGates is unobservable', () => {
    const gateFlags = new Set(Object.values(ALL_MAPS)
      .flatMap(m => m.gates ?? []).map(g => g.flag).filter((f): f is string => !!f));
    expect(gateFlags.has(GOT_FOSSIL_FLAG)).toBe(false);
    // Nor is any picked_up_ flag: no gate in the game reacts to a ball at all.
    expect([...gateFlags].filter(f => f.startsWith('picked_up_'))).toEqual([]);
    expect([...gateFlags].sort()).toEqual([
      'has_card_key',
      'mansion_1f_switch', 'mansion_2f_switch', 'mansion_3f_switch', 'mansion_b1f_switch',
    ]);
  });
});

describe('picked_up_<id> is the flag that hides the ball', () => {
  it('is exactly what shouldSkipNPC() reads, for every shipped ball', () => {
    for (const { mapId, npc } of LIVE_BALLS) {
      const pickup = itemBallPickup(npc, RED)!;
      const flag = pickup.flags[0];
      expect(flag, `${mapId}/${npc.id}`).toBe(`picked_up_${npc.id}`);
      expect(shouldSkipNPC(npc, { [flag]: true }, [], [], () => false), `${npc.id} after`).toBe(true);
    }
  });

  it('one ball\'s flag does not hide another', () => {
    const a = ball('route1_potion', 'potion');
    const b = ball('route24_nugget', 'nugget');
    expect(shouldSkipNPC(b, { [pickedUpFlag(a.id)]: true }, [], [], () => false)).toBe(false);
  });

  it('holding the item is not what hides the ball — the flag is', () => {
    const b = ball('route1_potion', 'potion');
    expect(shouldSkipNPC(b, {}, [], [], (id) => id === 'potion')).toBe(false);
    expect(shouldSkipNPC(b, { picked_up_route1_potion: true }, [], [], () => false)).toBe(true);
  });

  it('an ambush ball is not a pickup at all — itemBallAction routes it elsewhere', () => {
    const fake = ball('pp_ambush', 'potion', { ambush: { speciesId: 100, level: 30 } });
    expect(itemBallAction(fake)).toEqual({ kind: 'ambush', speciesId: 100, level: 30 });
    expect(itemBallAction(ball('route1_potion', 'potion'))).toEqual({ kind: 'item', itemId: 'potion' });
  });
});

describe('a door-key ball opens its gates through syncDerivedStoryFlags', () => {
  /** Apply a pickup the way OverworldScene.pickUpItemBall does. */
  const apply = (npc: NPCData, player: PlayerState) => {
    const pickup = itemBallPickup(npc, player)!;
    player.addItem(pickup.itemId);
    for (const flag of pickup.flags) player.storyFlags[flag] = true;
    syncDerivedStoryFlags(player);
    return pickup;
  };

  it('CARD KEY: has_card_key goes up right after the pickup, and it is the gate flag', () => {
    const map = ALL_MAPS.silph_co_5f;
    const ballNpc = map.npcs.find(n => n.id === 'silph_5f_card_key')!;
    expect(ballNpc.itemId).toBe('card_key');

    const player = new PlayerState();
    const gate = map.gates!.find(g => g.flag)!;
    expect(gate.flag).toBe(doorKeyFlag('card_key'));
    expect(isFlagGateOpen(gate, player.storyFlags)).toBe(false);

    const pickup = apply(ballNpc, player);
    expect(pickup.flags).toEqual(['picked_up_silph_5f_card_key']);   // the key flag is DERIVED, not written here
    expect(player.hasItem('card_key')).toBe(true);
    expect(player.storyFlags['has_card_key']).toBe(true);
    expect(isFlagGateOpen(gate, player.storyFlags)).toBe(true);
  });

  it('every has_<key> gate in the game names a key item some item ball grants', () => {
    const hasGates = Object.entries(ALL_MAPS).flatMap(([mapId, m]) =>
      (m.gates ?? []).filter(g => g.flag?.startsWith('has_')).map(g => ({ mapId, gate: g })));
    expect(hasGates.length).toBeGreaterThan(0);

    const grantedByBalls = new Set(LIVE_BALLS.map(b => b.npc.itemId!));
    for (const { mapId, gate } of hasGates) {
      const itemId = gate.flag!.slice('has_'.length);
      expect(DOOR_KEY_ITEMS as readonly string[], `${mapId} ${gate.flag}`).toContain(itemId);
      expect(ITEMS[itemId]?.category, itemId).toBe('key');
      expect(grantedByBalls.has(itemId), `${itemId} must be pickable`).toBe(true);
    }
    // Today that is exactly the Card Key doors on Silph 2F-11F.
    expect([...new Set(hasGates.map(h => h.gate.flag))]).toEqual(['has_card_key']);
    expect(hasGates.length).toBe(14);
    expect([...new Set(hasGates.map(h => h.mapId))].every(id => id.startsWith('silph_co_'))).toBe(true);
  });

  it('the other two key-item balls are NOT door keys: no has_ gate reads them', () => {
    // LIFT KEY (hideout B4F) and SECRET KEY (mansion B1F) are checked by entry
    // gates and lock flags, not by `has_<item>` tile gates, so they are not in
    // DOOR_KEY_ITEMS and picking them up sets only picked_up_<id>.
    for (const [id, itemId] of [['rocket_hideout_lift_key', 'lift_key'], ['mansion_b1f_secret_key', 'secret_key']]) {
      const player = new PlayerState();
      const pickup = apply(ball(id, itemId), player);
      expect(pickup.flags).toEqual([pickedUpFlag(id)]);
      expect(player.storyFlags[doorKeyFlag(itemId)]).toBeUndefined();
      expect(DOOR_KEY_ITEMS as readonly string[]).not.toContain(itemId);
    }
  });

  it('a non-key ball derives no extra flags at all', () => {
    const player = new PlayerState();
    apply(ball('route1_potion', 'potion'), player);
    expect(Object.keys(player.storyFlags).filter(k => k.startsWith('has_'))).toEqual([]);
  });
});
