/**
 * Pokemon Data Validation Script
 *
 * Validates all 151 Pokemon definitions against canonical Gen 1 (Yellow version)
 * data from PokeAPI. Checks types, level-up learnsets, and base stats.
 *
 * Usage: npx tsx scripts/validate-pokemon.ts
 *
 * Caches PokeAPI responses to scripts/pokemon-cache.json to avoid re-fetching.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { POKEMON_DATA } from '../src/data/pokemon';
import { MOVES_DATA } from '../src/data/moves';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Types ---

interface PokeAPIPokemon {
  id: number;
  name: string;
  types: { slot: number; type: { name: string } }[];
  past_types: {
    generation: { name: string };
    types: { slot: number; type: { name: string } }[];
  }[];
  moves: {
    move: { name: string };
    version_group_details: {
      level_learned_at: number;
      move_learn_method: { name: string };
      version_group: { name: string };
    }[];
  }[];
  stats: {
    base_stat: number;
    stat: { name: string };
  }[];
}

interface CacheData {
  [id: string]: PokeAPIPokemon;
}

// --- Move Name Mapping ---

// Map from PokeAPI move name (lowercase-hyphen) to our move ID
function buildMoveNameMap(): Map<string, number> {
  const map = new Map<string, number>();
  for (const [idStr, move] of Object.entries(MOVES_DATA)) {
    const id = Number(idStr);
    // Normalize: "VINE WHIP" -> "vine-whip"
    const normalized = move.name.toLowerCase().replace(/ /g, '-');
    map.set(normalized, id);
  }

  // Manual overrides for name mismatches between our data and PokeAPI
  // (PokeAPI name -> our move ID)
  // "high-jump-kick" vs "high-jump-kick" should work
  // "self-destruct" in PokeAPI vs "SELF-DESTRUCT" in ours
  // Our name already has hyphen: "SELF-DESTRUCT" -> "self-destruct" ✓
  // "DOUBLE-EDGE" -> "double-edge" ✓

  return map;
}

// Reverse map: our move ID -> PokeAPI-style name (for reporting)
function buildMoveIdToName(): Map<number, string> {
  const map = new Map<number, string>();
  for (const [idStr, move] of Object.entries(MOVES_DATA)) {
    map.set(Number(idStr), move.name);
  }
  return map;
}

// --- PokeAPI Type to Our Type ---

const POKEAPI_TYPE_MAP: Record<string, string> = {
  normal: 'NORMAL',
  fire: 'FIRE',
  water: 'WATER',
  electric: 'ELECTRIC',
  grass: 'GRASS',
  ice: 'ICE',
  fighting: 'FIGHTING',
  poison: 'POISON',
  ground: 'GROUND',
  flying: 'FLYING',
  psychic: 'PSYCHIC',
  bug: 'BUG',
  rock: 'ROCK',
  ghost: 'GHOST',
  dragon: 'DRAGON',
  // Gen 2+ types that don't exist in our Gen 1 game:
  dark: 'DARK',
  steel: 'STEEL',
  fairy: 'FAIRY',
};

// --- Cache ---

const CACHE_PATH = path.join(__dirname, 'pokemon-cache.json');

function loadCache(): CacheData {
  try {
    const data = fs.readFileSync(CACHE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function saveCache(cache: CacheData): void {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

// --- Fetching ---

async function fetchPokemon(id: number, cache: CacheData): Promise<PokeAPIPokemon> {
  const key = String(id);
  if (cache[key]) return cache[key];

  const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch Pokemon ${id}: ${res.status}`);

  const data = await res.json() as PokeAPIPokemon;
  cache[key] = data;
  return data;
}

async function fetchAllPokemon(): Promise<CacheData> {
  const cache = loadCache();
  const missing: number[] = [];

  for (let i = 1; i <= 151; i++) {
    if (!cache[String(i)]) missing.push(i);
  }

  if (missing.length === 0) {
    console.log('Using cached PokeAPI data for all 151 Pokemon.');
    return cache;
  }

  console.log(`Fetching ${missing.length} Pokemon from PokeAPI...`);

  for (const id of missing) {
    process.stdout.write(`  Fetching #${id}...`);
    await fetchPokemon(id, cache);
    process.stdout.write(' done\n');
    // Small delay to be polite to the API
    await new Promise((r) => setTimeout(r, 100));
  }

  saveCache(cache);
  console.log('Cache saved.\n');
  return cache;
}

// --- Gen 1 Type Resolution ---

// Generation order for comparison
const GEN_ORDER = [
  'generation-i', 'generation-ii', 'generation-iii', 'generation-iv',
  'generation-v', 'generation-vi', 'generation-vii', 'generation-viii',
  'generation-ix',
];

function getGen1Types(pokemon: PokeAPIPokemon): string[] {
  // past_types entries indicate what the types were UP TO that generation.
  // To get Gen 1 types, we need the past_types entry that covers Gen 1,
  // which is any entry (since all past entries cover Gen 1 through their listed gen).
  // If multiple entries exist, use the one with the earliest generation.
  // If no past_types exist, current types have always been the types.
  if (pokemon.past_types.length > 0) {
    const sorted = [...pokemon.past_types].sort(
      (a, b) => GEN_ORDER.indexOf(a.generation.name) - GEN_ORDER.indexOf(b.generation.name)
    );
    const typeEntries = sorted[0].types;
    return typeEntries
      .sort((a, b) => a.slot - b.slot)
      .map((t) => POKEAPI_TYPE_MAP[t.type.name] || t.type.name.toUpperCase());
  }

  return pokemon.types
    .sort((a, b) => a.slot - b.slot)
    .map((t) => POKEAPI_TYPE_MAP[t.type.name] || t.type.name.toUpperCase());
}

// --- Comparison ---

interface TypeIssue {
  pokemon: string;
  id: number;
  ours: string[];
  expected: string[];
}

interface LearnsetIssue {
  pokemon: string;
  id: number;
  missing: { level: number; moveName: string }[];
  extra: { level: number; moveName: string }[];
  wrongLevel: { moveName: string; ourLevel: number; expectedLevel: number }[];
  unmapped: { level: number; apiName: string }[];
}

interface StatIssue {
  pokemon: string;
  id: number;
  diffs: { stat: string; ours: number; expected: number }[];
}

function comparePokemon(cache: CacheData) {
  const moveNameMap = buildMoveNameMap();
  const moveIdToName = buildMoveIdToName();

  const typeIssues: TypeIssue[] = [];
  const learnsetIssues: LearnsetIssue[] = [];
  const statIssues: StatIssue[] = [];

  for (let id = 1; id <= 151; id++) {
    const ours = POKEMON_DATA[id];
    const api = cache[String(id)];

    if (!ours) {
      console.warn(`WARNING: Pokemon #${id} not found in our data!`);
      continue;
    }
    if (!api) {
      console.warn(`WARNING: Pokemon #${id} not found in cache!`);
      continue;
    }

    // --- Compare Types ---
    const gen1Types = getGen1Types(api);
    const ourTypes = ours.types.map((t) => String(t));

    if (
      ourTypes.length !== gen1Types.length ||
      !ourTypes.every((t, i) => t === gen1Types[i])
    ) {
      typeIssues.push({
        pokemon: ours.name,
        id,
        ours: ourTypes,
        expected: gen1Types,
      });
    }

    // --- Compare Learnset ---
    const yellowMoves: { level: number; moveName: string }[] = [];
    const unmapped: { level: number; apiName: string }[] = [];

    for (const moveEntry of api.moves) {
      const yellowDetails = moveEntry.version_group_details.find(
        (d) =>
          d.version_group.name === 'yellow' &&
          d.move_learn_method.name === 'level-up'
      );
      if (!yellowDetails) continue;

      const apiName = moveEntry.move.name; // e.g., "vine-whip"
      const ourMoveId = moveNameMap.get(apiName);

      if (ourMoveId === undefined) {
        unmapped.push({
          level: yellowDetails.level_learned_at,
          apiName,
        });
      } else {
        yellowMoves.push({
          level: yellowDetails.level_learned_at,
          moveName: moveIdToName.get(ourMoveId) || apiName,
        });
      }
    }

    // Build comparable sets
    const apiLearnset = new Map<string, number>(); // moveName -> level
    for (const m of yellowMoves) {
      apiLearnset.set(m.moveName, m.level);
    }

    const ourLearnset = new Map<string, number>();
    for (const entry of ours.learnset) {
      const name = moveIdToName.get(entry.moveId);
      if (name) ourLearnset.set(name, entry.level);
    }

    const missing: { level: number; moveName: string }[] = [];
    const extra: { level: number; moveName: string }[] = [];
    const wrongLevel: {
      moveName: string;
      ourLevel: number;
      expectedLevel: number;
    }[] = [];

    // Moves in API but not in ours
    for (const [moveName, level] of apiLearnset) {
      if (!ourLearnset.has(moveName)) {
        missing.push({ level, moveName });
      } else if (ourLearnset.get(moveName) !== level) {
        wrongLevel.push({
          moveName,
          ourLevel: ourLearnset.get(moveName)!,
          expectedLevel: level,
        });
      }
    }

    // Moves in ours but not in API
    for (const [moveName, level] of ourLearnset) {
      if (!apiLearnset.has(moveName)) {
        extra.push({ level, moveName });
      }
    }

    if (
      missing.length > 0 ||
      extra.length > 0 ||
      wrongLevel.length > 0 ||
      unmapped.length > 0
    ) {
      learnsetIssues.push({
        pokemon: ours.name,
        id,
        missing,
        extra,
        wrongLevel,
        unmapped,
      });
    }

    // --- Compare Base Stats ---
    const apiStats: Record<string, number> = {};
    for (const s of api.stats) {
      apiStats[s.stat.name] = s.base_stat;
    }

    const statDiffs: { stat: string; ours: number; expected: number }[] = [];

    const checks: [string, number, number][] = [
      ['HP', ours.baseStats.hp, apiStats['hp']],
      ['Attack', ours.baseStats.attack, apiStats['attack']],
      ['Defense', ours.baseStats.defense, apiStats['defense']],
      ['Special', ours.baseStats.special, apiStats['special-attack']],
      ['Speed', ours.baseStats.speed, apiStats['speed']],
    ];

    for (const [stat, ourVal, expectedVal] of checks) {
      if (ourVal !== expectedVal) {
        statDiffs.push({ stat, ours: ourVal, expected: expectedVal });
      }
    }

    if (statDiffs.length > 0) {
      statIssues.push({ pokemon: ours.name, id, diffs: statDiffs });
    }
  }

  return { typeIssues, learnsetIssues, statIssues };
}

// --- Output ---

function printReport(results: ReturnType<typeof comparePokemon>) {
  const { typeIssues, learnsetIssues, statIssues } = results;

  console.log('='.repeat(60));
  console.log('POKEMON DATA VALIDATION REPORT');
  console.log('='.repeat(60));
  console.log(
    `Checked: 151 Pokemon | Type issues: ${typeIssues.length} | Learnset issues: ${learnsetIssues.length} | Stat issues: ${statIssues.length}`
  );
  console.log();

  // --- Type Issues ---
  if (typeIssues.length > 0) {
    console.log('-'.repeat(40));
    console.log(`TYPE ISSUES (${typeIssues.length})`);
    console.log('-'.repeat(40));
    for (const issue of typeIssues) {
      console.log(
        `  #${issue.id} ${issue.pokemon}: ours=[${issue.ours.join(', ')}] expected=[${issue.expected.join(', ')}]`
      );
    }
    console.log();
  }

  // --- Learnset Issues ---
  if (learnsetIssues.length > 0) {
    console.log('-'.repeat(40));
    console.log(`LEARNSET ISSUES (${learnsetIssues.length})`);
    console.log('-'.repeat(40));
    for (const issue of learnsetIssues) {
      console.log(`  #${issue.id} ${issue.pokemon}:`);
      for (const m of issue.missing) {
        console.log(`    MISSING: ${m.moveName} @ Lv.${m.level}`);
      }
      for (const m of issue.extra) {
        console.log(`    EXTRA:   ${m.moveName} @ Lv.${m.level}`);
      }
      for (const m of issue.wrongLevel) {
        console.log(
          `    WRONG LV: ${m.moveName} ours=Lv.${m.ourLevel} expected=Lv.${m.expectedLevel}`
        );
      }
      for (const m of issue.unmapped) {
        console.log(
          `    UNMAPPED: "${m.apiName}" @ Lv.${m.level} (not in our MOVES_DATA)`
        );
      }
    }
    console.log();
  }

  // --- Stat Issues ---
  if (statIssues.length > 0) {
    console.log('-'.repeat(40));
    console.log(`BASE STAT ISSUES (${statIssues.length})`);
    console.log('NOTE: PokeAPI returns modern stats, not Gen 1 stats.');
    console.log('Many Pokemon had stat changes in later gens. Our');
    console.log('"Special" is compared against modern "Special Attack".');
    console.log('Differences here may be intentional Gen 1 values.');
    console.log('-'.repeat(40));
    for (const issue of statIssues) {
      const diffs = issue.diffs
        .map((d) => `${d.stat}: ${d.ours}→${d.expected}`)
        .join(', ');
      console.log(`  #${issue.id} ${issue.pokemon}: ${diffs}`);
    }
    console.log();
  }

  if (
    typeIssues.length === 0 &&
    learnsetIssues.length === 0 &&
    statIssues.length === 0
  ) {
    console.log('\nAll Pokemon data matches PokeAPI! No discrepancies found.');
  }
}

// --- Main ---

async function main() {
  console.log('Pokemon Data Validator - Gen 1 (Yellow)\n');

  const cache = await fetchAllPokemon();
  const results = comparePokemon(cache);
  printReport(results);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
