import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';
import { PokemonInstance } from '../types/pokemon.types';
import { MOVES_DATA } from '../data/moves';
import { soundSystem } from '../systems/SoundSystem';

/**
 * Full-screen overlay that lets the player choose which move to forget
 * (or cancel) when a Pokemon with 4 moves tries to learn a new one.
 *
 * Usage:
 *   const ui = new MoveForgetUI(scene);
 *   ui.show(pokemon, newMoveId, (replaceIndex) => { ... });
 *   // replaceIndex is 0-3 or null (cancelled)
 */
export class MoveForgetUI {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private cursorText: Phaser.GameObjects.Text;
  private rowTexts: Phaser.GameObjects.Text[] = [];
  private cursorIndex = 0;
  private totalRows = 6; // 4 existing + 1 new + CANCEL
  private callback: ((replaceIndex: number | null) => void) | null = null;
  private active = false;
  private inputBound = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Background
    const bg = scene.add.graphics();
    bg.fillStyle(0xf8f8f8, 1);
    bg.fillRoundedRect(2, 2, GAME_WIDTH - 4, GAME_HEIGHT - 4, 2);
    bg.lineStyle(2, 0x383838, 1);
    bg.strokeRoundedRect(2, 2, GAME_WIDTH - 4, GAME_HEIGHT - 4, 2);

    // Header
    const header = scene.add.text(8, 6, 'Which move should\nbe forgotten?', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    });

    // Move rows (4 existing + 1 new + CANCEL)
    for (let i = 0; i < 6; i++) {
      const t = scene.add.text(18, 28 + i * 16, '', {
        fontSize: '7px', color: '#383838', fontFamily: 'monospace',
      });
      this.rowTexts.push(t);
    }

    // Cursor
    this.cursorText = scene.add.text(8, 28, '\u25b8', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    });

    this.container = scene.add.container(0, 0, [
      bg, header, ...this.rowTexts, this.cursorText,
    ]);
    this.container.setDepth(1000);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);
  }

  show(
    pokemon: PokemonInstance,
    newMoveId: number,
    callback: (replaceIndex: number | null) => void,
  ): void {
    this.callback = callback;
    this.cursorIndex = 0;
    this.active = true;

    // Populate existing moves
    for (let i = 0; i < 4; i++) {
      if (i < pokemon.moves.length) {
        const m = pokemon.moves[i];
        const md = MOVES_DATA[m.moveId];
        const name = (md?.name || '???').padEnd(13);
        this.rowTexts[i].setText(`${name}PP ${m.currentPp}/${m.maxPp}`);
        this.rowTexts[i].setColor('#383838');
      } else {
        this.rowTexts[i].setText('-');
        this.rowTexts[i].setColor('#383838');
      }
    }

    // New move row (highlighted)
    const newMd = MOVES_DATA[newMoveId];
    if (newMd) {
      const name = newMd.name.padEnd(13);
      this.rowTexts[4].setText(`${name}PP ${newMd.pp}/${newMd.pp}`);
    } else {
      this.rowTexts[4].setText('???');
    }
    this.rowTexts[4].setColor('#c04040'); // highlight new move in red

    // Cancel row
    this.rowTexts[5].setText('CANCEL');
    this.rowTexts[5].setColor('#383838');

    this.totalRows = 6;
    this.updateCursor();
    this.container.setVisible(true);
    this.setupInput();
  }

  hide(): void {
    this.active = false;
    this.container.setVisible(false);
  }

  private setupInput(): void {
    if (this.inputBound) return;
    this.inputBound = true;

    const kb = this.scene.input.keyboard!;
    const up = kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const down = kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    const z = kb.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    const enter = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const x = kb.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    up.on('down', () => { if (this.active) this.navigate(-1); });
    down.on('down', () => { if (this.active) this.navigate(1); });
    z.on('down', () => { if (this.active) this.confirm(); });
    enter.on('down', () => { if (this.active) this.confirm(); });
    x.on('down', () => { if (this.active) this.cancel(); });
  }

  private navigate(dir: number): void {
    soundSystem.menuMove();
    this.cursorIndex += dir;
    if (this.cursorIndex < 0) this.cursorIndex = 0;
    if (this.cursorIndex >= this.totalRows) this.cursorIndex = this.totalRows - 1;
    this.updateCursor();
  }

  private confirm(): void {
    soundSystem.menuSelect();
    this.hide();

    if (!this.callback) return;
    const cb = this.callback;
    this.callback = null;

    if (this.cursorIndex < 4) {
      // Replace existing move at this index
      cb(this.cursorIndex);
    } else if (this.cursorIndex === 4) {
      // Selected the new move row — that means forget the new move (cancel)
      // Actually in the original game, selecting the new move means "don't learn it"
      // But to match classic behavior: row 4 (new move) = cancel, same as CANCEL
      cb(null);
    } else {
      // CANCEL
      cb(null);
    }
  }

  private cancel(): void {
    soundSystem.menuMove();
    this.hide();

    if (!this.callback) return;
    const cb = this.callback;
    this.callback = null;
    cb(null);
  }

  private updateCursor(): void {
    this.cursorText.setY(28 + this.cursorIndex * 16);
  }

  destroy(): void {
    this.container.destroy();
  }
}
