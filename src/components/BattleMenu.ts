import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';
import { PokemonInstance, PokemonMove } from '../types/pokemon.types';
import { MOVES_DATA } from '../data/moves';
import { POKEMON_DATA } from '../data/pokemon';
import { soundSystem } from '../systems/SoundSystem';

export interface BagItem {
  id: string;
  name: string;
  quantity: number;
}

export type MenuSelection = {
  type: 'fight';
  moveIndex: number;
} | {
  type: 'bag';
  itemId: string;
} | {
  type: 'pokemon';
  partyIndex: number;
} | {
  type: 'run';
};

export class BattleMenu {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private mainMenuItems: Phaser.GameObjects.Text[] = [];
  private mainCursor: Phaser.GameObjects.Text;
  private selectedIndex = 0;
  private mode: 'main' | 'fight' | 'bag' | 'pokemon' = 'main';
  private moveTexts: Phaser.GameObjects.Text[] = [];
  private movePPTexts: Phaser.GameObjects.Text[] = [];
  private moveContainer: Phaser.GameObjects.Container;
  private moveCursor: Phaser.GameObjects.Text;
  private moveSelectedIndex = 0;
  private currentMoves: PokemonMove[] = [];
  private onSelect: ((selection: MenuSelection) => void) | null = null;
  private active = false;

  // Bag sub-menu state
  private bagItems: BagItem[] = [];
  private bagContainer: Phaser.GameObjects.Container;
  private bagTexts: Phaser.GameObjects.Text[] = [];
  private bagQtyTexts: Phaser.GameObjects.Text[] = [];
  private bagCursor: Phaser.GameObjects.Text;
  private bagSelectedIndex = 0;
  private bagScrollOffset = 0;
  private static readonly BAG_VISIBLE_ROWS = 3;

  // Party sub-menu state
  private partyPokemon: PokemonInstance[] = [];
  private partyContainer!: Phaser.GameObjects.Container;
  private partyTexts: Phaser.GameObjects.Text[] = [];
  private partyCursor!: Phaser.GameObjects.Text;
  private partySelectedIndex = 0;
  private partyScrollOffset = 0;
  private currentActivePokemonIndex = 0;
  private static readonly PARTY_VISIBLE_ROWS = 3;

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

    // Bag selection menu (overlays the whole bottom, like move menu)
    const bagBg = scene.add.graphics();
    bagBg.fillStyle(0xf8f8f8, 1);
    bagBg.fillRoundedRect(2, GAME_HEIGHT - 38, GAME_WIDTH - 4, 36, 2);
    bagBg.lineStyle(1, 0x383838, 1);
    bagBg.strokeRoundedRect(2, GAME_HEIGHT - 38, GAME_WIDTH - 4, 36, 2);

    this.bagTexts = [];
    this.bagQtyTexts = [];
    for (let i = 0; i < BattleMenu.BAG_VISIBLE_ROWS; i++) {
      const nameText = scene.add.text(
        16,
        GAME_HEIGHT - 34 + i * 11,
        '',
        { fontSize: '7px', color: '#383838', fontFamily: 'monospace' }
      );
      this.bagTexts.push(nameText);

      const qtyText = scene.add.text(
        GAME_WIDTH - 30,
        GAME_HEIGHT - 34 + i * 11,
        '',
        { fontSize: '7px', color: '#383838', fontFamily: 'monospace' }
      );
      this.bagQtyTexts.push(qtyText);
    }

    this.bagCursor = scene.add.text(
      8,
      GAME_HEIGHT - 34,
      '>',
      { fontSize: '7px', color: '#383838', fontFamily: 'monospace' }
    );

    this.bagContainer = scene.add.container(0, 0, [bagBg, ...this.bagTexts, ...this.bagQtyTexts, this.bagCursor]);
    this.bagContainer.setDepth(200);
    this.bagContainer.setScrollFactor(0);
    this.bagContainer.setVisible(false);

    // Party selection menu
    const partyBg = scene.add.graphics();
    partyBg.fillStyle(0xf8f8f8, 1);
    partyBg.fillRoundedRect(2, GAME_HEIGHT - 38, GAME_WIDTH - 4, 36, 2);
    partyBg.lineStyle(1, 0x383838, 1);
    partyBg.strokeRoundedRect(2, GAME_HEIGHT - 38, GAME_WIDTH - 4, 36, 2);

    this.partyTexts = [];
    for (let i = 0; i < BattleMenu.PARTY_VISIBLE_ROWS; i++) {
      const text = scene.add.text(
        16,
        GAME_HEIGHT - 34 + i * 11,
        '',
        { fontSize: '7px', color: '#383838', fontFamily: 'monospace' }
      );
      this.partyTexts.push(text);
    }

    this.partyCursor = scene.add.text(
      8,
      GAME_HEIGHT - 34,
      '>',
      { fontSize: '7px', color: '#383838', fontFamily: 'monospace' }
    );

    this.partyContainer = scene.add.container(0, 0, [partyBg, ...this.partyTexts, this.partyCursor]);
    this.partyContainer.setDepth(200);
    this.partyContainer.setScrollFactor(0);
    this.partyContainer.setVisible(false);
  }

  show(
    pokemon: PokemonInstance,
    onSelect: (selection: MenuSelection) => void,
    bagItems?: BagItem[],
    party?: PokemonInstance[],
    activePokemonIndex?: number,
  ): void {
    this.currentMoves = pokemon.moves;
    this.onSelect = onSelect;
    this.bagItems = bagItems || [];
    this.partyPokemon = party || [];
    this.currentActivePokemonIndex = activePokemonIndex ?? 0;
    this.active = true;
    this.mode = 'main';
    this.selectedIndex = 0;
    this.container.setVisible(true);
    this.moveContainer.setVisible(false);
    this.bagContainer.setVisible(false);
    this.partyContainer.setVisible(false);
    this.updateMainCursor();
    this.setupInput();
  }

  hide(): void {
    this.active = false;
    this.container.setVisible(false);
    this.moveContainer.setVisible(false);
    this.bagContainer.setVisible(false);
    this.partyContainer.setVisible(false);
  }

  private inputBound = false;

  private setupInput(): void {
    // Only bind input once to prevent stacking listeners
    if (this.inputBound) return;
    this.inputBound = true;

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
    } else if (this.mode === 'fight') {
      const col = this.moveSelectedIndex % 2;
      const row = Math.floor(this.moveSelectedIndex / 2);
      const maxIndex = Math.min(3, this.currentMoves.length - 1);

      if (dir === 'up' && row > 0) this.moveSelectedIndex -= 2;
      if (dir === 'down' && row < 1) this.moveSelectedIndex += 2;
      if (dir === 'left' && col > 0) this.moveSelectedIndex -= 1;
      if (dir === 'right' && col < 1) this.moveSelectedIndex += 1;

      this.moveSelectedIndex = Phaser.Math.Clamp(this.moveSelectedIndex, 0, maxIndex);
      this.updateMoveCursor();
    } else if (this.mode === 'bag') {
      if (dir === 'up') {
        if (this.bagSelectedIndex > 0) {
          this.bagSelectedIndex--;
          if (this.bagSelectedIndex < this.bagScrollOffset) {
            this.bagScrollOffset = this.bagSelectedIndex;
            this.updateBagTexts();
          }
          this.updateBagCursor();
        }
      } else if (dir === 'down') {
        if (this.bagSelectedIndex < this.bagItems.length - 1) {
          this.bagSelectedIndex++;
          if (this.bagSelectedIndex >= this.bagScrollOffset + BattleMenu.BAG_VISIBLE_ROWS) {
            this.bagScrollOffset = this.bagSelectedIndex - BattleMenu.BAG_VISIBLE_ROWS + 1;
            this.updateBagTexts();
          }
          this.updateBagCursor();
        }
      }
    } else if (this.mode === 'pokemon') {
      if (dir === 'up') {
        if (this.partySelectedIndex > 0) {
          this.partySelectedIndex--;
          if (this.partySelectedIndex < this.partyScrollOffset) {
            this.partyScrollOffset = this.partySelectedIndex;
            this.updatePartyTexts();
          }
          this.updatePartyCursor();
        }
      } else if (dir === 'down') {
        if (this.partySelectedIndex < this.partyPokemon.length - 1) {
          this.partySelectedIndex++;
          if (this.partySelectedIndex >= this.partyScrollOffset + BattleMenu.PARTY_VISIBLE_ROWS) {
            this.partyScrollOffset = this.partySelectedIndex - BattleMenu.PARTY_VISIBLE_ROWS + 1;
            this.updatePartyTexts();
          }
          this.updatePartyCursor();
        }
      }
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
          this.showBagMenu();
          break;
        case 2: // POKeMON
          this.showPartyMenu();
          break;
        case 3: // RUN
          this.onSelect({ type: 'run' });
          break;
      }
    } else if (this.mode === 'fight') {
      // Move selected
      const move = this.currentMoves[this.moveSelectedIndex];
      if (move && move.currentPp > 0) {
        this.onSelect({ type: 'fight', moveIndex: this.moveSelectedIndex });
      }
    } else if (this.mode === 'bag') {
      const item = this.bagItems[this.bagSelectedIndex];
      if (item) {
        this.onSelect({ type: 'bag', itemId: item.id });
      }
    } else if (this.mode === 'pokemon') {
      const pokemon = this.partyPokemon[this.partySelectedIndex];
      if (!pokemon) return;
      // Can't select fainted Pokemon
      if (pokemon.currentHp <= 0) return;
      // Can't select the already-active Pokemon
      if (this.partySelectedIndex === this.currentActivePokemonIndex) return;
      this.onSelect({ type: 'pokemon', partyIndex: this.partySelectedIndex });
    }
  }

  private cancel(): void {
    if (this.mode === 'fight') {
      this.mode = 'main';
      this.container.setVisible(true);
      this.moveContainer.setVisible(false);
      soundSystem.menuMove();
    } else if (this.mode === 'bag') {
      this.mode = 'main';
      this.container.setVisible(true);
      this.bagContainer.setVisible(false);
      soundSystem.menuMove();
    } else if (this.mode === 'pokemon') {
      this.mode = 'main';
      this.container.setVisible(true);
      this.partyContainer.setVisible(false);
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

  private showBagMenu(): void {
    if (this.bagItems.length === 0) {
      // No items - emit a special selection that BattleScene handles
      if (this.onSelect) {
        this.onSelect({ type: 'bag', itemId: '' });
      }
      return;
    }

    this.mode = 'bag';
    this.bagSelectedIndex = 0;
    this.bagScrollOffset = 0;
    this.container.setVisible(false);
    this.bagContainer.setVisible(true);

    this.updateBagTexts();
    this.updateBagCursor();
  }

  private updateBagTexts(): void {
    for (let i = 0; i < BattleMenu.BAG_VISIBLE_ROWS; i++) {
      const itemIndex = this.bagScrollOffset + i;
      if (itemIndex < this.bagItems.length) {
        const item = this.bagItems[itemIndex];
        this.bagTexts[i].setText(item.name.substring(0, 12));
        this.bagQtyTexts[i].setText(`x${item.quantity}`);
        this.bagTexts[i].setVisible(true);
        this.bagQtyTexts[i].setVisible(true);
      } else {
        this.bagTexts[i].setText('');
        this.bagQtyTexts[i].setText('');
        this.bagTexts[i].setVisible(false);
        this.bagQtyTexts[i].setVisible(false);
      }
    }
  }

  private updateBagCursor(): void {
    const visibleRow = this.bagSelectedIndex - this.bagScrollOffset;
    this.bagCursor.setPosition(8, GAME_HEIGHT - 34 + visibleRow * 11);
  }

  private showPartyMenu(): void {
    if (this.partyPokemon.length === 0) return;

    this.mode = 'pokemon';
    this.partySelectedIndex = 0;
    this.partyScrollOffset = 0;
    this.container.setVisible(false);
    this.partyContainer.setVisible(true);

    this.updatePartyTexts();
    this.updatePartyCursor();
  }

  private updatePartyTexts(): void {
    for (let i = 0; i < BattleMenu.PARTY_VISIBLE_ROWS; i++) {
      const idx = this.partyScrollOffset + i;
      if (idx < this.partyPokemon.length) {
        const p = this.partyPokemon[idx];
        const name = POKEMON_DATA[p.speciesId]?.name || `#${p.speciesId}`;
        const active = idx === this.currentActivePokemonIndex ? '*' : ' ';
        const status = p.currentHp <= 0 ? 'FNT' : `${p.currentHp}/${p.stats.hp}`;
        this.partyTexts[i].setText(`${active}${name} L${p.level} ${status}`);
        this.partyTexts[i].setVisible(true);
      } else {
        this.partyTexts[i].setText('');
        this.partyTexts[i].setVisible(false);
      }
    }
  }

  private updatePartyCursor(): void {
    const visibleRow = this.partySelectedIndex - this.partyScrollOffset;
    this.partyCursor.setPosition(8, GAME_HEIGHT - 34 + visibleRow * 11);
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
    this.bagContainer.destroy();
    this.partyContainer.destroy();
  }
}
