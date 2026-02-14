import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';
import { PokemonInstance, PokemonMove } from '../types/pokemon.types';
import { MOVES_DATA } from '../data/moves';
import { soundSystem } from '../systems/SoundSystem';

export type MenuSelection = {
  type: 'fight';
  moveIndex: number;
} | {
  type: 'bag';
} | {
  type: 'pokemon';
} | {
  type: 'run';
};

export class BattleMenu {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private mainMenuItems: Phaser.GameObjects.Text[] = [];
  private mainCursor: Phaser.GameObjects.Text;
  private selectedIndex = 0;
  private mode: 'main' | 'fight' = 'main';
  private moveTexts: Phaser.GameObjects.Text[] = [];
  private movePPTexts: Phaser.GameObjects.Text[] = [];
  private moveContainer: Phaser.GameObjects.Container;
  private moveCursor: Phaser.GameObjects.Text;
  private moveSelectedIndex = 0;
  private currentMoves: PokemonMove[] = [];
  private onSelect: ((selection: MenuSelection) => void) | null = null;
  private active = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Main menu (FIGHT / BAG / POKeMON / RUN)
    const bg = scene.add.graphics();
    bg.fillStyle(0xf8f8f8, 1);
    bg.fillRoundedRect(GAME_WIDTH - 72, GAME_HEIGHT - 38, 70, 36, 2);
    bg.lineStyle(1, 0x383838, 1);
    bg.strokeRoundedRect(GAME_WIDTH - 72, GAME_HEIGHT - 38, 70, 36, 2);

    const labels = ['FIGHT', 'BAG', 'POKeMON', 'RUN'];
    this.mainMenuItems = labels.map((label, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      return scene.add.text(
        GAME_WIDTH - 60 + col * 34,
        GAME_HEIGHT - 34 + row * 14,
        label,
        { fontSize: '7px', color: '#383838', fontFamily: 'monospace' }
      );
    });

    this.mainCursor = scene.add.text(
      GAME_WIDTH - 68,
      GAME_HEIGHT - 34,
      '>',
      { fontSize: '7px', color: '#383838', fontFamily: 'monospace' }
    );

    this.container = scene.add.container(0, 0, [bg, ...this.mainMenuItems, this.mainCursor]);
    this.container.setDepth(200);
    this.container.setScrollFactor(0);

    // Move selection menu (overlays the whole bottom)
    const moveBg = scene.add.graphics();
    moveBg.fillStyle(0xf8f8f8, 1);
    moveBg.fillRoundedRect(2, GAME_HEIGHT - 38, GAME_WIDTH - 4, 36, 2);
    moveBg.lineStyle(1, 0x383838, 1);
    moveBg.strokeRoundedRect(2, GAME_HEIGHT - 38, GAME_WIDTH - 4, 36, 2);

    this.moveTexts = [];
    this.movePPTexts = [];
    for (let i = 0; i < 4; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const text = scene.add.text(
        16 + col * 72,
        GAME_HEIGHT - 34 + row * 14,
        '-',
        { fontSize: '7px', color: '#383838', fontFamily: 'monospace' }
      );
      this.moveTexts.push(text);

      const pp = scene.add.text(
        56 + col * 72,
        GAME_HEIGHT - 34 + row * 14,
        '',
        { fontSize: '6px', color: '#808080', fontFamily: 'monospace' }
      );
      this.movePPTexts.push(pp);
    }

    this.moveCursor = scene.add.text(
      8,
      GAME_HEIGHT - 34,
      '>',
      { fontSize: '7px', color: '#383838', fontFamily: 'monospace' }
    );

    this.moveContainer = scene.add.container(0, 0, [moveBg, ...this.moveTexts, ...this.movePPTexts, this.moveCursor]);
    this.moveContainer.setDepth(200);
    this.moveContainer.setScrollFactor(0);
    this.moveContainer.setVisible(false);
  }

  show(pokemon: PokemonInstance, onSelect: (selection: MenuSelection) => void): void {
    this.currentMoves = pokemon.moves;
    this.onSelect = onSelect;
    this.active = true;
    this.mode = 'main';
    this.selectedIndex = 0;
    this.container.setVisible(true);
    this.moveContainer.setVisible(false);
    this.updateMainCursor();
    this.setupInput();
  }

  hide(): void {
    this.active = false;
    this.container.setVisible(false);
    this.moveContainer.setVisible(false);
    this.cleanupInput();
  }

  private setupInput(): void {
    const keyboard = this.scene.input.keyboard!;

    const upKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const downKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    const leftKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    const rightKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    const zKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    const xKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    const enterKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    upKey.on('down', () => { if (this.active) this.navigate('up'); });
    downKey.on('down', () => { if (this.active) this.navigate('down'); });
    leftKey.on('down', () => { if (this.active) this.navigate('left'); });
    rightKey.on('down', () => { if (this.active) this.navigate('right'); });
    zKey.on('down', () => { if (this.active) this.confirm(); });
    enterKey.on('down', () => { if (this.active) this.confirm(); });
    xKey.on('down', () => { if (this.active) this.cancel(); });
  }

  private cleanupInput(): void {
    // Keys persist in the scene, which is fine - they just check this.active
  }

  private navigate(dir: string): void {
    if (!this.active) return;
    soundSystem.menuMove();

    if (this.mode === 'main') {
      const col = this.selectedIndex % 2;
      const row = Math.floor(this.selectedIndex / 2);

      if (dir === 'up' && row > 0) this.selectedIndex -= 2;
      if (dir === 'down' && row < 1) this.selectedIndex += 2;
      if (dir === 'left' && col > 0) this.selectedIndex -= 1;
      if (dir === 'right' && col < 1) this.selectedIndex += 1;

      this.selectedIndex = Phaser.Math.Clamp(this.selectedIndex, 0, 3);
      this.updateMainCursor();
    } else {
      const col = this.moveSelectedIndex % 2;
      const row = Math.floor(this.moveSelectedIndex / 2);
      const maxIndex = Math.min(3, this.currentMoves.length - 1);

      if (dir === 'up' && row > 0) this.moveSelectedIndex -= 2;
      if (dir === 'down' && row < 1) this.moveSelectedIndex += 2;
      if (dir === 'left' && col > 0) this.moveSelectedIndex -= 1;
      if (dir === 'right' && col < 1) this.moveSelectedIndex += 1;

      this.moveSelectedIndex = Phaser.Math.Clamp(this.moveSelectedIndex, 0, maxIndex);
      this.updateMoveCursor();
    }
  }

  private confirm(): void {
    if (!this.active || !this.onSelect) return;
    soundSystem.menuSelect();

    if (this.mode === 'main') {
      switch (this.selectedIndex) {
        case 0: // FIGHT
          this.showMoveMenu();
          break;
        case 1: // BAG
          this.onSelect({ type: 'bag' });
          break;
        case 2: // POKeMON
          this.onSelect({ type: 'pokemon' });
          break;
        case 3: // RUN
          this.onSelect({ type: 'run' });
          break;
      }
    } else {
      // Move selected
      const move = this.currentMoves[this.moveSelectedIndex];
      if (move && move.currentPp > 0) {
        this.onSelect({ type: 'fight', moveIndex: this.moveSelectedIndex });
      }
    }
  }

  private cancel(): void {
    if (this.mode === 'fight') {
      this.mode = 'main';
      this.container.setVisible(true);
      this.moveContainer.setVisible(false);
      soundSystem.menuMove();
    }
  }

  private showMoveMenu(): void {
    this.mode = 'fight';
    this.moveSelectedIndex = 0;
    this.container.setVisible(false);
    this.moveContainer.setVisible(true);

    // Update move texts
    for (let i = 0; i < 4; i++) {
      if (i < this.currentMoves.length) {
        const move = this.currentMoves[i];
        const moveData = MOVES_DATA[move.moveId];
        this.moveTexts[i].setText(moveData?.name?.substring(0, 10) || '???');
        this.movePPTexts[i].setText(`${move.currentPp}/${move.maxPp}`);
      } else {
        this.moveTexts[i].setText('-');
        this.movePPTexts[i].setText('');
      }
    }

    this.updateMoveCursor();
  }

  private updateMainCursor(): void {
    const col = this.selectedIndex % 2;
    const row = Math.floor(this.selectedIndex / 2);
    this.mainCursor.setPosition(
      GAME_WIDTH - 68 + col * 34,
      GAME_HEIGHT - 34 + row * 14,
    );
  }

  private updateMoveCursor(): void {
    const col = this.moveSelectedIndex % 2;
    const row = Math.floor(this.moveSelectedIndex / 2);
    this.moveCursor.setPosition(
      8 + col * 72,
      GAME_HEIGHT - 34 + row * 14,
    );
  }

  destroy(): void {
    this.container.destroy();
    this.moveContainer.destroy();
  }
}
