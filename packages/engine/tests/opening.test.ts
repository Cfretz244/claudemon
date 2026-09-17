import { describe, expect, it } from 'vitest';
import { ALL_MAPS } from '../src/content';
import { createOakEscortScript, createSession, OAK_INTRO_PAGES, oakIntroText } from '../src/index';
import { newGameState, createPokemon } from '../src/testing';
import { Direction, TileType } from '../src/types';
import { OAK_INTERCEPT_MESSAGES, OAK_ESCORT_DESTINATION } from '../src/logic/roadBlocks';

describe('shared opening scripts', () => {
  const map = ALL_MAPS.pallet_town;
  const positions = map.tiles.flatMap((row, y) =>
    row.flatMap((tile, x) => (tile === TileType.TALL_GRASS ? [{ x, y }] : [])),
  );
  positions.push(
    ...map.warps.filter((w) => w.targetMap === 'route1').map(({ x, y }) => ({ x, y })),
  );
  for (const player of positions)
    it(`Oak safely approaches and escorts from ${player.x},${player.y}`, () => {
      const script = createOakEscortScript(map, player);
      expect(script.destination).toEqual(OAK_ESCORT_DESTINATION);
      expect(script.steps.filter((s) => s.kind === 'dialogue').map((s) => s.lines)).toEqual(
        OAK_INTERCEPT_MESSAGES,
      );
      const actors = new Map([['player', player]]);
      for (const step of script.steps) {
        if (step.kind === 'spawn') actors.set(step.actor.id, { x: step.actor.x, y: step.actor.y });
        if (step.kind === 'walk') {
          for (const track of step.tracks) {
            let prev = actors.get(track.actor)!;
            for (const point of track.path) {
              expect(Math.abs(point.x - prev.x) + Math.abs(point.y - prev.y)).toBe(1);
              expect(map.collision[point.y][point.x]).toBe(false);
              expect(map.npcs.some((n) => n.x === point.x && n.y === point.y)).toBe(false);
              prev = point;
            }
            actors.set(track.actor, prev);
          }
          if (step.tracks.length === 2) {
            const oak = step.tracks.find((t) => t.actor === 'oak')!.path;
            const player = step.tracks.find((t) => t.actor === 'player')!.path;
            expect(player.slice(1)).toEqual(oak.slice(0, -1));
          }
        }
      }
      expect(actors.get('player')).toEqual({ x: 10, y: 15 });
    });
  for (const [x, y, direction] of [
    [9, 2, Direction.UP],
    [4, 10, Direction.DOWN],
  ] as const)
    it(`session waits for full script acknowledgement at ${x},${y}`, () => {
      const save = {
        ...newGameState('RED', 'BLUE').toSave(),
        currentMap: 'pallet_town',
        playerX: x,
        playerY: y,
      };
      const s = createSession({ seed: 1, save });
      const oldInput = s.getSnapshot().inputId;
      s.dispatch({ type: 'move', direction, inputId: oldInput });
      let pending = s.getSnapshot().pending!;
      expect(pending.effect.kind).toBe('move');
      s.dispatch({ type: 'ack', id: pending.id });
      pending = s.getSnapshot().pending!;
      expect(pending.effect.kind).toBe('cutscene');
      expect(s.getSnapshot().map.id).toBe('pallet_town');
      expect(s.canSave).toBe(false);
      expect(() => s.exportSave()).toThrow();
      expect(s.dispatch({ type: 'move', direction, inputId: oldInput }).accepted).toBe(false);
      s.dispatch({ type: 'ack', id: pending.id });
      expect(s.dispatch({ type: 'ack', id: pending.id }).accepted).toBe(false);
      const next = s.getSnapshot();
      expect(next.map.id).toBe(OAK_ESCORT_DESTINATION.mapId);
      expect([next.x, next.y]).toEqual([4, 11]);
      expect(next.player.party).toHaveLength(0);
      expect(next.pending?.effect.kind).toBe('map');
    });
  it('recovers a partyless imported save outside Pallet without a missing-door error', () => {
    const route = ALL_MAPS.route1;
    const save = { ...newGameState().toSave(), currentMap: route.id };
    // Choose a grass tile with a walkable southern neighbor in the real map.
    const entry = route.tiles.flatMap((tiles, y) => tiles.map((tile, x) => ({ tile, x, y })))
      .find(({ tile, x, y }) => tile === TileType.TALL_GRASS && route.collision[y + 1]?.[x] === false && !route.npcs.some(n => n.x === x && (n.y === y || n.y === y + 1)))!;
    save.playerX = entry.x;
    save.playerY = entry.y + 1;
    const s = createSession({ seed: 1, save });
    s.dispatch({ type: 'move', direction: Direction.UP, inputId: s.getSnapshot().inputId });
    s.dispatch({ type: 'ack', id: s.getSnapshot().pending!.id });
    const pending = s.getSnapshot().pending!;
    expect(pending.effect.kind).toBe('dialogue');
    s.dispatch({ type: 'ack', id: pending.id });
    expect(s.getSnapshot().map.id).toBe('oaks_lab');
    expect(s.getSnapshot().player.party).toHaveLength(0);
  });
  it('does not interrupt an existing trainer', () => {
    const save = { ...newGameState().toSave(), currentMap: 'pallet_town', playerX: 9, playerY: 2 };
    save.party = [createPokemon(25, 5)];
    const s = createSession({ seed: 1, save });
    s.dispatch({ type: 'move', direction: Direction.UP, inputId: s.getSnapshot().inputId });
    s.dispatch({ type: 'ack', id: s.getSnapshot().pending!.id });
    expect(s.getSnapshot().map.id).toBe('route1');
  });
  it('keeps the canonical twelve pages and both naming pauses', () => {
    expect(OAK_INTRO_PAGES).toHaveLength(12);
    expect(OAK_INTRO_PAGES.flatMap((p) => (p.name ? [p.name] : []))).toEqual(['player', 'rival']);
    expect(oakIntroText(6, 'ASH', 'GARY')).toContain('ASH');
    expect(oakIntroText(9, 'ASH', 'GARY')).toContain('GARY');
    expect(OAK_INTRO_PAGES[2].focus).toBe('pokemon');
  });
});
