// "A faint ends the round" smoke runner — the suite's first BATTLE runner.
//
// Gen I ends the round as soon as EITHER Pokemon faints. SELF-DESTRUCT zeroes
// the USER's HP, so when the first mover self-destructs the second mover must
// not get to swing. Both scenarios boot a real wild battle, rewrite the two
// Pokemon through the dev hook (moves / speed / bulk) so the turn is forced,
// then assert on every message the round put through `textBox.show()`
// (`recordTextBox()` in lib.mjs).
//
// Scenario 1: the opponent self-destructs first — the player's move text must
// NOT follow. Scenario 2: the player self-destructs first — the opponent's move
// text must not follow, and the player has a 2-mon party so the faint flow is a
// switch, not a white-out.
import { createRunner } from '../lib.mjs';

const t = await createRunner('faint-ends-round');
const { page } = t;

const SELF_DESTRUCT = 120; // MOVES_DATA id, effect SELF_DESTRUCT
const TACKLE = 33;         // a plain damaging move that always prints text

const check = (name, ok, detail = '') => t.record(name, !!ok, detail);

/** Boot onto Route 1 with an `n`-mon party and walk the grass until a wild battle starts. */
async function bootBattle(n) {
  await t.boot({
    map: 'route1', x: 5, y: 6, bag: { potion: 1 },
    party: Array.from({ length: n }, () => [25, 30]),
    flags: { has_pikachu: true, has_pokedex: true, rival_battle_lab: true, delivered_parcel: true },
  });
  let inBattle = false;
  for (let i = 0; i < 24 && !inBattle; i++) {
    await t.tap(i % 2 ? 'ArrowRight' : 'ArrowLeft', 700);
    await page.waitForTimeout(500);
    inBattle = !!(await t.battle());
  }
  if (!inBattle) throw new Error('no wild battle in 24 steps');
  await page.waitForTimeout(3500); // intro slide
}

/**
 * Rewrite both Pokemon so the round is deterministic. `selfDestructor` is
 * 'opponent' or 'player' — that side gets SELF-DESTRUCT and the speed to move
 * first; the other side gets TACKLE and enough bulk to live through the blast
 * (so the check is about the round, not about a double KO).
 */
const setupTurn = selfDestructor => page.evaluate(({ side, SELF_DESTRUCT, TACKLE }) => {
  const s = window.__claudemon.scene.getScene('BattleScene');
  const mv = (id, pp) => [{ moveId: id, currentPp: pp, maxPp: pp }];
  const boom = side === 'opponent' ? s.opponentPokemon : s.playerPokemon;
  const other = side === 'opponent' ? s.playerPokemon : s.opponentPokemon;

  boom.moves = mv(SELF_DESTRUCT, 5);
  boom.status = 'NONE';
  boom.currentHp = boom.stats.hp;
  boom.stats.speed = 999;
  boom.stats.attack = 10; // keep the blast survivable

  other.moves = mv(TACKLE, 35);
  other.status = 'NONE';
  // Bulk: the second mover must survive so "it did not act" is unambiguous.
  other.stats.hp = 999; other.currentHp = 999;
  other.stats.defense = 999;
  other.stats.speed = 1;

  // The menu caches the move list when it is shown; point it at the new one.
  if (s.menu) s.menu.currentMoves = s.playerPokemon.moves;
  return { playerMoves: s.playerPokemon.moves.length };
}, { side: selfDestructor, SELF_DESTRUCT, TACKLE });

/** BattleScene internals the round's progress is read from. */
const battleState = () => page.evaluate(() => {
  const g = window.__claudemon;
  if (!g.scene.isActive('BattleScene')) return { gone: true };
  const s = g.scene.getScene('BattleScene');
  return {
    gone: false,
    turnInProgress: s.turnInProgress,
    battleOver: s.battleOver,
    playerHp: s.playerPokemon.currentHp,
    opponentHp: s.opponentPokemon.currentHp,
  };
});

// FIGHT -> first move. The battle menu is a 2x2: UP+LEFT lands on FIGHT.
async function pickFirstMove() {
  for (let i = 0; i < 3; i++) { await t.tap('KeyZ'); await page.waitForTimeout(900); }
  await t.tap('ArrowUp'); await t.tap('ArrowLeft');
  await t.tap('KeyZ'); await page.waitForTimeout(700);
  await t.tap('ArrowUp');
  await t.tap('KeyZ');
}

// The blast's own result lines — flavour that belongs to SELF-DESTRUCT, not to
// a second move. The evidence frame is the first line AFTER these: without the
// fix the second mover's "used <MOVE>!", with it the faint.
const BLAST_FLAVOUR = /SELF-DESTRUCT|critical hit|super effective|not very effective|doesn't affect|A critical/i;

const boxText = () => page.evaluate(() => {
  const g = window.__claudemon;
  if (!g.scene.isActive('BattleScene')) return { gone: true };
  const tb = g.scene.getScene('BattleScene').textBox;
  return {
    gone: false,
    shown: tb.textObject.text,
    full: tb.messages[tb.currentMessageIndex] ?? '',
    visible: tb.getIsVisible(),
  };
});

/**
 * Screenshot the text box once it has moved PAST the line matching `re` and the
 * new line has finished typing. Driven off the box's own state, not a
 * stopwatch: the blast animation swallows presses, and advancing past a message
 * takes two (one to finish typing, one to advance).
 */
async function shotAfterLine(re, slug, maxTaps = 16) {
  for (let i = 0; i < maxTaps; i++) {
    const st = await boxText();
    if (st.gone) break;
    if (st.visible && st.full && !re.test(st.full) && st.shown === st.full) break;
    await t.tap('KeyZ');
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(300);
  await t.shot(slug);
}

const used = (msgs, re) => msgs.findIndex(m => new RegExp(`used\\s+${re}`).test(m));
// Everything the round printed after the blast, up to and including the faint
// line — so a LATER round's TACKLE can never be mistaken for this round's.
const roundAfter = (msgs, boomIdx) => {
  const faintIdx = msgs.findIndex((m, i) => i > boomIdx && /fainted!/.test(m));
  const end = faintIdx >= 0 ? faintIdx + 1 : msgs.length;
  // Lines between the blast and the faint that belong to the blast itself
  // (damage flavour: "A critical hit!", effectiveness) are fine; a second
  // "<mon> used <MOVE>!" line there is the bug.
  const movesBefore = msgs.slice(boomIdx + 1, faintIdx >= 0 ? faintIdx : msgs.length)
    .filter(m => /used\n/.test(m));
  return { faintIdx, movesBefore, window: msgs.slice(boomIdx + 1, end) };
};

// --- scenario 1: the opponent uses SELF-DESTRUCT first ------------------------
async function scenario1() {
  const errorsBefore = t.errors.length;
  await bootBattle(1);
  const info = await setupTurn('opponent');
  const readLog = await t.recordTextBox();
  check('S1 setup: player has exactly one move', info.playerMoves === 1, `moves=${info.playerMoves}`);

  await pickFirstMove();
  await page.waitForTimeout(1400);
  await t.shot('01-self-destruct');
  // Dismiss the SELF-DESTRUCT line: the NEXT line is the evidence.
  await shotAfterLine(BLAST_FLAVOUR, '02-next-line');

  // Press through the rest of the round.
  for (let i = 0; i < 14; i++) {
    await t.tap('KeyZ'); await page.waitForTimeout(600);
    if ((await battleState()).gone) break;
  }
  await page.waitForTimeout(500);
  const st = await battleState();
  const msgs = await readLog();

  const boomIdx = used(msgs, 'SELF-DESTRUCT');
  check('S1 opponent used SELF-DESTRUCT', boomIdx >= 0, JSON.stringify(msgs));
  const { faintIdx, movesBefore, window } = roundAfter(msgs, boomIdx);
  const tackle = used(window, 'TACKLE');
  check('S1 the player does NOT act after the opponent self-destructs',
    boomIdx >= 0 && tackle < 0,
    tackle >= 0 ? `player's move text still shown: ${JSON.stringify(window[tackle])}` : 'no SELF-DESTRUCT line');
  check('S1 the faint is handled before any other move is used',
    boomIdx >= 0 && faintIdx > boomIdx && movesBefore.length === 0,
    `faint at index ${faintIdx} (blast at ${boomIdx}); moves in between: ${JSON.stringify(movesBefore)}`);
  check('S1 the battle proceeds (no hang): scene left or turn released',
    st.gone || st.turnInProgress === false || st.battleOver === true, JSON.stringify(st));
  const expIdx = msgs.findIndex(m => /EXP|gained|grew to level/i.test(m));
  check('S1 reaches the win/EXP text', st.gone || expIdx > boomIdx, `exp line at index ${expIdx}`);
  check('S1 no page/console errors', t.errors.length === errorsBefore, t.errors.slice(errorsBefore).join(' | '));
}

// --- scenario 2: the PLAYER self-destructs first (2-mon party) ----------------
async function scenario2() {
  const errorsBefore = t.errors.length;
  await bootBattle(2);
  await setupTurn('player');
  const readLog = await t.recordTextBox();

  await pickFirstMove();
  await page.waitForTimeout(1400);
  await t.shot('03-player-self-destruct');
  await shotAfterLine(BLAST_FLAVOUR, '04-next-line');

  for (let i = 0; i < 12; i++) {
    await t.tap('KeyZ'); await page.waitForTimeout(600);
    if ((await battleState()).gone) break;
  }
  const msgs = await readLog();

  const boomIdx = used(msgs, 'SELF-DESTRUCT');
  check('S2 player used SELF-DESTRUCT', boomIdx >= 0, JSON.stringify(msgs));
  const { faintIdx, movesBefore, window } = roundAfter(msgs, boomIdx);
  const tackle = used(window, 'TACKLE');
  check('S2 the opponent does NOT act after the player self-destructs',
    boomIdx >= 0 && tackle < 0,
    tackle >= 0 ? `Foe's move text still shown: ${JSON.stringify(window[tackle])}` : 'no SELF-DESTRUCT line');
  check('S2 the player faint is handled before any other move is used',
    boomIdx >= 0 && faintIdx > boomIdx && movesBefore.length === 0,
    `faint at index ${faintIdx} (blast at ${boomIdx}); moves in between: ${JSON.stringify(movesBefore)}`);
  check('S2 the party switch prompt follows (not a white-out)',
    msgs.slice(faintIdx + 1).some(m => /^Go! /.test(m)),
    JSON.stringify(msgs.slice(faintIdx + 1, faintIdx + 3)));
  check('S2 no page/console errors', t.errors.length === errorsBefore, t.errors.slice(errorsBefore).join(' | '));
}

try {
  await scenario1();
  await scenario2();
} catch (e) {
  check('the run completed without an error', false, `ERROR ${e.message}`);
}

await t.finish();
