/**
 * Fix Pokemon learnsets based on PokeAPI Yellow version data.
 * Reads cached PokeAPI data and patches src/data/pokemon.ts.
 *
 * Usage: npx tsx scripts/fix-learnsets.ts
 *
 * Requires: scripts/pokemon-cache.json (run validate-pokemon.ts first)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { MOVES_DATA } from '../src/data/moves';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = path.join(__dirname, 'pokemon-cache.json');
const POKEMON_PATH = path.join(__dirname, '..', 'src', 'data', 'pokemon.ts');

// --- Load cache ---

if (!fs.existsSync(CACHE_PATH)) {
  console.error('Cache not found. Run validate-pokemon.ts first.');
  process.exit(1);
}

const cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));

// --- Build move name map: PokeAPI name -> our move ID ---

const moveNameMap = new Map<string, number>();
for (const [idStr, move] of Object.entries(MOVES_DATA)) {
  const normalized = (move as any).name.toLowerCase().replace(/ /g, '-');
  moveNameMap.set(normalized, Number(idStr));
}

// --- Compute correct learnsets from PokeAPI Yellow data ---

const correctLearnsets = new Map<number, [number, number][]>();

for (let id = 1; id <= 151; id++) {
  const pokemon = cache[String(id)];
  const learnset: [number, number][] = [];

  for (const moveEntry of pokemon.moves) {
    const yellowDetail = moveEntry.version_group_details.find(
      (d: any) =>
        d.version_group.name === 'yellow' &&
        d.move_learn_method.name === 'level-up'
    );
    if (!yellowDetail) continue;

    const moveId = moveNameMap.get(moveEntry.move.name);
    if (moveId === undefined) {
      console.warn(
        `WARNING: Unmapped move "${moveEntry.move.name}" for #${id} ${pokemon.name}`
      );
      continue;
    }

    learnset.push([yellowDetail.level_learned_at, moveId]);
  }

  // Sort by level, then by move ID
  learnset.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  correctLearnsets.set(id, learnset);
}

// --- Patch pokemon.ts ---

let content = fs.readFileSync(POKEMON_PATH, 'utf-8');
let changeCount = 0;

// Process from highest ID to lowest so string index shifts don't affect earlier entries
for (let id = 151; id >= 1; id--) {
  const learnset = correctLearnsets.get(id)!;
  const learnsetStr =
    learnset.length === 0
      ? '[]'
      : '[' + learnset.map(([l, m]) => `[${l}, ${m}]`).join(', ') + ']';

  // Find this Pokemon's entry: "  ID: s(ID, "
  const marker = `  ${id}: s(${id}, `;
  const entryIdx = content.indexOf(marker);
  if (entryIdx === -1) {
    console.warn(`Could not find entry for Pokemon #${id}`);
    continue;
  }

  // Find the newline at the end of the first line
  const newlineIdx = content.indexOf('\n', entryIdx);
  if (newlineIdx === -1) continue;

  // Skip whitespace to find learnset start
  let learnsetStart = newlineIdx + 1;
  while (content[learnsetStart] === ' ') learnsetStart++;

  // Balance brackets to find learnset end
  let depth = 0;
  let learnsetEnd = learnsetStart;
  for (let i = learnsetStart; i < content.length; i++) {
    if (content[i] === '[') depth++;
    else if (content[i] === ']') {
      depth--;
      if (depth === 0) {
        learnsetEnd = i + 1;
        break;
      }
    }
  }

  const oldLearnset = content.substring(learnsetStart, learnsetEnd);

  if (oldLearnset === learnsetStr) continue; // No change needed

  content =
    content.substring(0, learnsetStart) +
    learnsetStr +
    content.substring(learnsetEnd);
  changeCount++;
  console.log(`  Fixed #${id}: ${oldLearnset.length > 60 ? oldLearnset.substring(0, 60) + '...' : oldLearnset}`);
  console.log(`     -> ${learnsetStr.length > 60 ? learnsetStr.substring(0, 60) + '...' : learnsetStr}`);
}

if (changeCount > 0) {
  fs.writeFileSync(POKEMON_PATH, content);
  console.log(`\nPatched ${changeCount} Pokemon learnsets in pokemon.ts`);
} else {
  console.log('\nNo changes needed.');
}
