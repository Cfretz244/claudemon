// Route 22 rival gating smoke runner. For each story state, boots onto Route 22
// and reads which rival NPC sprite the REAL OverworldScene spawned. The last
// scenario walks into the rematch's line of sight and asserts the battle that
// starts.
import { createRunner } from '../lib.mjs';

const t = await createRunner('route22');
const { page, battle } = t;

// --- route22-only state reader (the battle reader lives in lib.mjs) ---------
const rivalSprites = () => page.evaluate(() => {
  const g = window.__claudemon; if (!g) return null;
  const s = g.scene.getScene('OverworldScene');
  if (!s || !s.scene.isActive()) return null;
  return [...s.npcSprites.keys()].filter(k => k.startsWith('rival'));
});

const ALL_BADGES = ['BOULDER', 'CASCADE', 'THUNDER', 'RAINBOW', 'SOUL', 'MARSH', 'VOLCANO', 'EARTH'];
const boot = seed => t.boot({
  map: 'route22', rivalName: 'GARY', badges: [], defeated: [],
  ...seed,
  flags: { has_pikachu: true, rival_battle_lab: true, ...seed.flags },
});

async function visibility(name, seed, expectNpcs) {
  await boot({ x: 14, y: 6, ...seed });
  await t.shot(name.replace(/\W+/g, '_'));
  const got = JSON.stringify(await rivalSprites()), want = JSON.stringify(expectNpcs);
  t.record(`${name}: rival sprites ${want}`, got === want, `got ${got}`);
}

await visibility('parcel not delivered', { flags: {} }, []);
await visibility('parcel delivered, no badges', { flags: { delivered_parcel: true } }, ['rival_route22']);
await visibility('parcel delivered, first fight done', { flags: { delivered_parcel: true }, defeated: ['rival_route22'] }, []);
await visibility('Boulder Badge held', { flags: { delivered_parcel: true }, badges: ['BOULDER'] }, []);
await visibility('7 badges', { flags: { delivered_parcel: true }, badges: ALL_BADGES.slice(0, 7) }, []);
await visibility('8 badges', { flags: { delivered_parcel: true }, badges: ALL_BADGES }, ['rival_route22_2']);
await visibility('8 badges, rematch done', { flags: { delivered_parcel: true }, badges: ALL_BADGES, defeated: ['rival_route22_2'] }, []);

// Walk into the rematch's sight (NPC at 12,4 faces LEFT, range 4) and confirm the battle.
{
  const name = '8 badges: walking into sight starts the rematch battle';
  await boot({ x: 7, y: 4, flags: { delivered_parcel: true }, badges: ALL_BADGES, party: [[25, 60]] });
  await t.tap('ArrowRight', 700); // one step east -> (8,4)
  await page.waitForTimeout(3500); // "!" bubble + walk-up
  await t.shot('rematch_spotted');
  let b = null;
  for (let i = 0; i < 25 && !b; i++) { await t.tap('KeyZ'); await page.waitForTimeout(600); b = await battle(); }
  await page.waitForTimeout(1500);
  await t.shot('rematch_battle');
  b = b ?? await battle();
  const ok = !!b && b.trainerId === 'rival_route22_2' && b.team.length === 6 && b.team.every(([, lv]) => lv >= 45);
  t.record(name, ok, JSON.stringify({ overworld: await t.overworld(), battle: b }));
}

await t.finish();
