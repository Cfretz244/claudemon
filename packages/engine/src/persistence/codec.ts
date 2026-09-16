import type { SaveData } from '../systems/SaveSystem';
export type { SaveData } from '../systems/SaveSystem';
import { ALL_MAPS } from '../data/maps';
import { POKEMON_DATA } from '../data/pokemon';
import { MOVES_DATA } from '../data/moves';
import { migrateLegacyLocation } from '../logic/saveMigration';
function record(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
export function decodeSave(raw: string, supportedMaps?: ReadonlySet<string>): SaveData | null {
  try {
    const envelope = JSON.parse(raw);
    if (!record(envelope)) return null;
    if ('version' in envelope && ![1, 2].includes(Number(envelope.version))) return null;
    const source = 'version' in envelope ? envelope.data : envelope;
    if (!record(source)) return null;
    const d = { ...source };
    d.pcItems ??= {};
    d.coins ??= 0;
    d.lastHealMap ??= 'player_house';
    d.lastHealX ??= 3;
    d.lastHealY ??= 5;
    const loc = migrateLegacyLocation({
      mapId: String(d.currentMap),
      x: Number(d.playerX),
      y: Number(d.playerY),
    });
    d.currentMap = loc.mapId;
    d.playerX = loc.x;
    d.playerY = loc.y;
    const healLoc = migrateLegacyLocation({
      mapId: String(d.lastHealMap),
      x: Number(d.lastHealX),
      y: Number(d.lastHealY),
    });
    d.lastHealMap = healLoc.mapId;
    d.lastHealX = healLoc.x;
    d.lastHealY = healLoc.y;
    const map = ALL_MAPS[String(d.currentMap)];
    if (
      !map ||
      (supportedMaps && !supportedMaps.has(map.id)) ||
      !Number.isInteger(d.playerX) ||
      !Number.isInteger(d.playerY)
    )
      return null;
    const x = d.playerX as number,
      y = d.playerY as number;
    if (x < 0 || y < 0 || x >= map.width || y >= map.height || map.collision[y][x]) return null;
    if (
      typeof d.playerName !== 'string' ||
      typeof d.rivalName !== 'string' ||
      !Number.isFinite(d.playTime) ||
      Number(d.playTime) < 0 ||
      !Number.isInteger(d.money) ||
      Number(d.money) < 0
    )
      return null;
    for (const k of ['bag', 'pcItems'])
      if (!record(d[k]) || Object.values(d[k]).some((v) => !Number.isInteger(v) || Number(v) < 0))
        return null;
    if (!record(d.storyFlags) || Object.values(d.storyFlags).some((v) => typeof v !== 'boolean'))
      return null;
    for (const k of ['badges', 'defeatedTrainers'])
      if (!Array.isArray(d[k]) || d[k].some((v) => typeof v !== 'string')) return null;
    for (const k of ['pokedexSeen', 'pokedexCaught'])
      if (!Array.isArray(d[k]) || d[k].some((v) => !Number.isInteger(v) || !POKEMON_DATA[v]))
        return null;
    for (const k of ['party', 'pc']) {
      if (!Array.isArray(d[k])) return null;
      for (const p of d[k]) {
        if (
          !record(p) ||
          !POKEMON_DATA[Number(p.speciesId)] ||
          !Number.isInteger(p.level) ||
          Number(p.level) < 1 ||
          Number(p.level) > 100
        )
          return null;
        for (const s of ['stats', 'ivs', 'evs'])
          if (
            !record(p[s]) ||
            ['hp', 'attack', 'defense', 'special', 'speed'].some(
              (k) => !Number.isFinite((p[s] as Record<string, unknown>)[k]),
            )
          )
            return null;
        if (
          !Number.isFinite(p.currentHp) ||
          Number(p.currentHp) < 0 ||
          Number(p.currentHp) > Number((p.stats as Record<string, unknown>).hp) ||
          !Number.isFinite(p.exp)
        )
          return null;
        if (!['NONE', 'SLEEP', 'POISON', 'BURN', 'PARALYSIS', 'FREEZE'].includes(String(p.status)))
          return null;
        if (
          !Array.isArray(p.moves) ||
          p.moves.length > 4 ||
          p.moves.some(
            (m) =>
              !record(m) ||
              !MOVES_DATA[Number(m.moveId)] ||
              !Number.isInteger(m.maxPp) ||
              Number(m.maxPp) < 1 ||
              !Number.isInteger(m.currentPp) ||
              Number(m.currentPp) < 0 ||
              Number(m.currentPp) > Number(m.maxPp),
          )
        )
          return null;
      }
    }
    if ((d.party as unknown[]).length > 6) return null;
    if (supportedMaps && !supportedMaps.has(String(d.lastHealMap))) return null;
    const heal = ALL_MAPS[String(d.lastHealMap)];
    if (
      !heal ||
      !Number.isInteger(d.lastHealX) ||
      !Number.isInteger(d.lastHealY) ||
      heal.tiles[Number(d.lastHealY)]?.[Number(d.lastHealX)] === undefined
    )
      return null;
    if (heal.collision[Number(d.lastHealY)][Number(d.lastHealX)]) return null;
    if (d.engineState !== undefined) {
      const e = d.engineState;
      if (
        !record(e) ||
        !Number.isInteger(e.randomState) ||
        Number(e.randomState) < 0 ||
        Number(e.randomState) > 4294967295 ||
        !Number.isInteger(e.steps) ||
        Number(e.steps) < 0 ||
        !Number.isInteger(e.lastEncounter) ||
        !['up', 'down', 'left', 'right'].includes(String(e.direction))
      )
        return null;
    }
    return d as unknown as SaveData;
  } catch {
    return null;
  }
}

export function encodeSave(data: SaveData): string {
  if (!decodeSave(JSON.stringify(data))) throw new Error('Invalid save');
  return JSON.stringify({ version: 2, engine: '@claudemon/engine@0.1.0', data });
}
