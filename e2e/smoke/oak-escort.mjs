// Exercise the shared choreography through Phaser's actual movement/textbox adapter.
import { createRunner, DIR_KEY } from '../lib.mjs';
const t = await createRunner('oak-escort');
const { page } = t;
try {
  for (const test of [
    { x: 4, y: 10, dir: 'down', name: 'grass' },
    { x: 9, y: 2, dir: 'up', name: 'north exit' },
  ]) {
    await t.boot({ map: 'pallet_town', x: test.x, y: test.y, party: [], flags: {} });
    await t.tap(DIR_KEY[test.dir], 250);
    await page.waitForFunction(() => {
      const s = window.__claudemon.scene.getScene('OverworldScene');
      return s.currentMap.id === 'pallet_town' && s.textBox.getIsVisible();
    });
    const before = await t.state();
    t.record(`${test.name}: approaches before speaking`, before.text.join(' ').includes('OAK') && before.map === 'pallet_town');
    await t.advanceText();
    await page.waitForFunction(() => {
      const s = window.__claudemon.scene.getScene('OverworldScene');
      return s.currentMap.id === 'oaks_lab' && !s.isWarping;
    });
    const after = await t.state();
    t.record(`${test.name}: walks into canonical lab destination without granting starter`, after.x === 4 && after.y === 11 && after.party.length === 0);
  }
  t.record('no browser errors', t.errors.length === 0, t.errors.join('\n'));
  await t.finish();
} catch (error) {
  await t.browser.close();
  throw error;
}
