import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, MAX_PARTY_SIZE } from '../utils/constants';
import { PokemonInstance } from '../types/pokemon.types';
import { POKEMON_DATA } from '../data/pokemon';
import { ITEMS } from '../data/items';
import { soundSystem } from '../systems/SoundSystem';
import { PlayerState } from '../entities/Player';

type PCMode =
  | 'main'
  | 'pokemon_list' | 'pokemon_options' | 'pokemon_deposit'
  | 'item_list' | 'item_options' | 'item_deposit'
  | 'item_withdraw_qty' | 'item_deposit_qty';

export class PCScreen {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private visible = false;
  private onClose: (() => void) | null = null;

  private playerState!: PlayerState;
  private mode: PCMode = 'main';

  // Main menu
  private mainMenuLabels = ['POKeMON', 'ITEMS', 'LOG OFF'];
  private mainCursorIndex = 0;

  // List state
  private listCursorIndex = 0;
  private listScrollOffset = 0;
  private readonly visibleRows = 7;

  // Options overlay
  private optionsCursorIndex = 0;
  private currentOptions: string[] = [];

  // Qty picker
  private qty = 1;
  private maxQty = 1;

  // Display objects
  private bg!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;
  private rowTexts: Phaser.GameObjects.Text[] = [];
  private cursorText!: Phaser.GameObjects.Text;

  // Main menu display
  private mainMenuContainer!: Phaser.GameObjects.Container;
  private mainMenuCursor!: Phaser.GameObjects.Text;

  // Options overlay
  private optionsContainer!: Phaser.GameObjects.Container;
  private optionsTexts: Phaser.GameObjects.Text[] = [];
  private optionsCursor!: Phaser.GameObjects.Text;
  private optionsBg!: Phaser.GameObjects.Graphics;

  // Qty picker display
  private qtyContainer!: Phaser.GameObjects.Container;
  private qtyText!: Phaser.GameObjects.Text;

  // Message
  private messageContainer!: Phaser.GameObjects.Container;
  private messageText!: Phaser.GameObjects.Text;
  private messageVisible = false;

  // Input
  private inputBound = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Background
    this.bg = scene.add.graphics();
    this.bg.fillStyle(0xf8f8f8, 1);
    this.bg.fillRoundedRect(0, 0, GAME_WIDTH, GAME_HEIGHT, 2);
    this.bg.lineStyle(2, 0x383838, 1);
    this.bg.strokeRoundedRect(1, 1, GAME_WIDTH - 2, GAME_HEIGHT - 2, 2);

    this.titleText = scene.add.text(6, 4, 'PC', {
      fontSize: '8px', color: '#383838', fontFamily: 'monospace',
    });

    // Main menu
    const mainBg = scene.add.graphics();
    mainBg.fillStyle(0xf8f8f8, 1);
    mainBg.fillRoundedRect(0, 0, GAME_WIDTH, GAME_HEIGHT, 2);
    mainBg.lineStyle(2, 0x383838, 1);
    mainBg.strokeRoundedRect(1, 1, GAME_WIDTH - 2, GAME_HEIGHT - 2, 2);

    const mainTitle = scene.add.text(GAME_WIDTH / 2, 10, "What do you want?", {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    }).setOrigin(0.5, 0);

    const mainMenuTexts = this.mainMenuLabels.map((label, i) =>
      scene.add.text(30, 34 + i * 18, label, {
        fontSize: '8px', color: '#383838', fontFamily: 'monospace',
      })
    );
    this.mainMenuCursor = scene.add.text(18, 34, '>', {
      fontSize: '8px', color: '#383838', fontFamily: 'monospace',
    });

    this.mainMenuContainer = scene.add.container(0, 0, [mainBg, mainTitle, ...mainMenuTexts, this.mainMenuCursor]);

    // Scrollable list rows
    for (let i = 0; i < this.visibleRows; i++) {
      const text = scene.add.text(16, 18 + i * 13, '', {
        fontSize: '7px', color: '#383838', fontFamily: 'monospace',
      });
      this.rowTexts.push(text);
    }
    this.cursorText = scene.add.text(6, 18, '>', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    });

    // Options overlay (max 4 options)
    this.optionsBg = scene.add.graphics();
    for (let i = 0; i < 4; i++) {
      const t = scene.add.text(14, 4 + i * 14, '', {
        fontSize: '7px', color: '#383838', fontFamily: 'monospace',
      });
      this.optionsTexts.push(t);
    }
    this.optionsCursor = scene.add.text(4, 4, '>', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    });
    this.optionsContainer = scene.add.container(GAME_WIDTH - 70, 20,
      [this.optionsBg, ...this.optionsTexts, this.optionsCursor]);
    this.optionsContainer.setVisible(false);

    // Qty picker
    const qtyBg = scene.add.graphics();
    qtyBg.fillStyle(0xf8f8f8, 1);
    qtyBg.fillRoundedRect(0, 0, 80, 30, 2);
    qtyBg.lineStyle(1, 0x383838, 1);
    qtyBg.strokeRoundedRect(0, 0, 80, 30, 2);

    const qtyLabel = scene.add.text(6, 4, 'How many?', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    });
    this.qtyText = scene.add.text(40, 18, 'x1', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    });
    this.qtyContainer = scene.add.container(40, 50, [qtyBg, qtyLabel, this.qtyText]);
    this.qtyContainer.setVisible(false);

    // Message overlay
    const msgBg = scene.add.graphics();
    msgBg.fillStyle(0xf8f8f8, 1);
    msgBg.fillRoundedRect(2, GAME_HEIGHT - 30, GAME_WIDTH - 4, 28, 2);
    msgBg.lineStyle(1, 0x383838, 1);
    msgBg.strokeRoundedRect(2, GAME_HEIGHT - 30, GAME_WIDTH - 4, 28, 2);

    this.messageText = scene.add.text(8, GAME_HEIGHT - 26, '', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
      wordWrap: { width: GAME_WIDTH - 16 },
    });
    this.messageContainer = scene.add.container(0, 0, [msgBg, this.messageText]);
    this.messageContainer.setVisible(false);

    this.container = scene.add.container(0, 0, [
      this.bg, this.titleText,
      ...this.rowTexts, this.cursorText,
      this.mainMenuContainer,
      this.optionsContainer, this.qtyContainer, this.messageContainer,
    ]);
    this.container.setDepth(950);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);
  }

  show(playerState: PlayerState, onClose: () => void): void {
    this.playerState = playerState;
    this.onClose = onClose;
    this.visible = true;
    this.mode = 'main';
    this.mainCursorIndex = 0;
    this.mainMenuCursor.setY(34);
    this.messageVisible = false;
    this.container.setVisible(true);
    this.mainMenuContainer.setVisible(true);
    this.optionsContainer.setVisible(false);
    this.qtyContainer.setVisible(false);
    this.messageContainer.setVisible(false);
    this.hideListRows();
    this.setupInput();
  }

  hide(): void {
    this.visible = false;
    this.container.setVisible(false);
  }

  private hideListRows(): void {
    for (const t of this.rowTexts) t.setVisible(false);
    this.cursorText.setVisible(false);
  }

  private showListRows(): void {
    for (const t of this.rowTexts) t.setVisible(true);
    this.cursorText.setVisible(true);
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

    up.on('down', () => { if (this.visible) this.navigate(-1); });
    down.on('down', () => { if (this.visible) this.navigate(1); });
    z.on('down', () => { if (this.visible) this.confirm(); });
    enter.on('down', () => { if (this.visible) this.confirm(); });
    x.on('down', () => { if (this.visible) this.back(); });
  }

  // --- Navigation ---

  private navigate(dir: number): void {
    if (this.messageVisible) return;
    soundSystem.menuMove();

    if (this.mode === 'main') {
      this.mainCursorIndex += dir;
      this.mainCursorIndex = Math.max(0, Math.min(this.mainMenuLabels.length - 1, this.mainCursorIndex));
      this.mainMenuCursor.setY(34 + this.mainCursorIndex * 18);
    } else if (this.mode === 'pokemon_list' || this.mode === 'pokemon_deposit' ||
               this.mode === 'item_list' || this.mode === 'item_deposit') {
      const count = this.getListLength();
      this.listCursorIndex += dir;
      this.listCursorIndex = Math.max(0, Math.min(count - 1, this.listCursorIndex));
      if (this.listCursorIndex < this.listScrollOffset) this.listScrollOffset = this.listCursorIndex;
      if (this.listCursorIndex >= this.listScrollOffset + this.visibleRows) {
        this.listScrollOffset = this.listCursorIndex - this.visibleRows + 1;
      }
      this.updateList();
    } else if (this.mode === 'pokemon_options' || this.mode === 'item_options') {
      this.optionsCursorIndex += dir;
      this.optionsCursorIndex = Math.max(0, Math.min(this.currentOptions.length - 1, this.optionsCursorIndex));
      this.optionsCursor.setY(4 + this.optionsCursorIndex * 14);
    } else if (this.mode === 'item_withdraw_qty' || this.mode === 'item_deposit_qty') {
      this.qty += dir;
      this.qty = Math.max(1, Math.min(this.maxQty, this.qty));
      this.qtyText.setText(`x${this.qty}`);
    }
  }

  // --- Confirm ---

  private confirm(): void {
    if (this.messageVisible) {
      this.messageVisible = false;
      this.messageContainer.setVisible(false);
      return;
    }

    soundSystem.menuSelect();

    if (this.mode === 'main') {
      this.confirmMain();
    } else if (this.mode === 'pokemon_list') {
      this.openPokemonOptions();
    } else if (this.mode === 'pokemon_deposit') {
      this.doDepositPokemon();
    } else if (this.mode === 'pokemon_options') {
      this.confirmPokemonOption();
    } else if (this.mode === 'item_list') {
      this.openItemOptions();
    } else if (this.mode === 'item_deposit') {
      this.startItemDepositQty();
    } else if (this.mode === 'item_options') {
      this.confirmItemOption();
    } else if (this.mode === 'item_withdraw_qty') {
      this.doWithdrawItem();
    } else if (this.mode === 'item_deposit_qty') {
      this.doDepositItem();
    }
  }

  // --- Back ---

  private back(): void {
    if (this.messageVisible) {
      this.messageVisible = false;
      this.messageContainer.setVisible(false);
      return;
    }

    soundSystem.menuMove();

    if (this.mode === 'main') {
      this.hide();
      if (this.onClose) this.onClose();
    } else if (this.mode === 'pokemon_list' || this.mode === 'item_list') {
      this.returnToMain();
    } else if (this.mode === 'pokemon_deposit') {
      this.enterPokemonList();
    } else if (this.mode === 'pokemon_options') {
      this.optionsContainer.setVisible(false);
      this.mode = 'pokemon_list';
    } else if (this.mode === 'item_deposit') {
      this.enterItemList();
    } else if (this.mode === 'item_options') {
      this.optionsContainer.setVisible(false);
      this.mode = 'item_list';
    } else if (this.mode === 'item_withdraw_qty') {
      this.qtyContainer.setVisible(false);
      this.mode = 'item_options';
      this.optionsContainer.setVisible(true);
    } else if (this.mode === 'item_deposit_qty') {
      this.qtyContainer.setVisible(false);
      this.mode = 'item_deposit';
    }
  }

  // --- Main menu ---

  private confirmMain(): void {
    const choice = this.mainMenuLabels[this.mainCursorIndex];
    if (choice === 'POKeMON') {
      this.enterPokemonList();
    } else if (choice === 'ITEMS') {
      this.enterItemList();
    } else {
      this.hide();
      if (this.onClose) this.onClose();
    }
  }

  private returnToMain(): void {
    this.mode = 'main';
    this.mainMenuContainer.setVisible(true);
    this.hideListRows();
    this.optionsContainer.setVisible(false);
    this.qtyContainer.setVisible(false);
  }

  // --- Pokemon list (PC box) ---

  private enterPokemonList(): void {
    this.mode = 'pokemon_list';
    this.listCursorIndex = 0;
    this.listScrollOffset = 0;
    this.mainMenuContainer.setVisible(false);
    this.optionsContainer.setVisible(false);
    this.titleText.setText('PC BOX');
    this.showListRows();
    this.updateList();
  }

  private openPokemonOptions(): void {
    this.mode = 'pokemon_options';
    const opts: string[] = [];
    if (this.playerState.pc.length > 0) opts.push('WITHDRAW');
    opts.push('DEPOSIT');
    if (this.playerState.pc.length > 0) opts.push('RELEASE');
    opts.push('CANCEL');
    this.currentOptions = opts;
    this.optionsCursorIndex = 0;
    this.showOptions();
  }

  private confirmPokemonOption(): void {
    const opt = this.currentOptions[this.optionsCursorIndex];
    this.optionsContainer.setVisible(false);

    if (opt === 'WITHDRAW') {
      this.doWithdrawPokemon();
    } else if (opt === 'DEPOSIT') {
      this.enterPokemonDeposit();
    } else if (opt === 'RELEASE') {
      this.doReleasePokemon();
    } else {
      this.mode = 'pokemon_list';
    }
  }

  private doWithdrawPokemon(): void {
    if (this.playerState.party.length >= MAX_PARTY_SIZE) {
      this.showMessage("Your party is full!");
      this.mode = 'pokemon_list';
      return;
    }
    const pokemon = this.playerState.pc[this.listCursorIndex];
    if (!pokemon) { this.mode = 'pokemon_list'; return; }

    this.playerState.pc.splice(this.listCursorIndex, 1);
    this.playerState.party.push(pokemon);
    const name = this.getPokemonName(pokemon);
    this.showMessage(`Withdrew ${name}.`);
    this.adjustCursorAfterRemove(this.playerState.pc.length);
    this.mode = 'pokemon_list';
    this.updateList();
  }

  private doReleasePokemon(): void {
    const pokemon = this.playerState.pc[this.listCursorIndex];
    if (!pokemon) { this.mode = 'pokemon_list'; return; }

    const name = this.getPokemonName(pokemon);
    this.playerState.pc.splice(this.listCursorIndex, 1);
    this.showMessage(`Released ${name}.\nBye, ${name}!`);
    this.adjustCursorAfterRemove(this.playerState.pc.length);
    this.mode = 'pokemon_list';
    this.updateList();
  }

  // --- Pokemon deposit (from party) ---

  private enterPokemonDeposit(): void {
    this.mode = 'pokemon_deposit';
    this.listCursorIndex = 0;
    this.listScrollOffset = 0;
    this.titleText.setText('DEPOSIT POKeMON');
    this.updateList();
  }

  private doDepositPokemon(): void {
    if (this.playerState.party.length <= 1) {
      this.showMessage("Can't deposit your\nlast POKeMON!");
      return;
    }
    const pokemon = this.playerState.party[this.listCursorIndex];
    if (!pokemon) return;

    this.playerState.party.splice(this.listCursorIndex, 1);
    this.playerState.pc.push(pokemon);
    const name = this.getPokemonName(pokemon);
    this.showMessage(`${name} was deposited.`);
    this.adjustCursorAfterRemove(this.playerState.party.length);
    this.updateList();
  }

  // --- Item list (PC items) ---

  private enterItemList(): void {
    this.mode = 'item_list';
    this.listCursorIndex = 0;
    this.listScrollOffset = 0;
    this.mainMenuContainer.setVisible(false);
    this.optionsContainer.setVisible(false);
    this.titleText.setText('PC ITEMS');
    this.showListRows();
    this.updateList();
  }

  private openItemOptions(): void {
    this.mode = 'item_options';
    this.currentOptions = ['WITHDRAW', 'DEPOSIT', 'CANCEL'];
    this.optionsCursorIndex = 0;
    this.showOptions();
  }

  private confirmItemOption(): void {
    const opt = this.currentOptions[this.optionsCursorIndex];
    this.optionsContainer.setVisible(false);

    if (opt === 'WITHDRAW') {
      this.startItemWithdrawQty();
    } else if (opt === 'DEPOSIT') {
      this.enterItemDeposit();
    } else {
      this.mode = 'item_list';
    }
  }

  private startItemWithdrawQty(): void {
    const items = this.getPcItemList();
    if (items.length === 0) {
      this.showMessage("No items stored.");
      this.mode = 'item_list';
      return;
    }
    const item = items[this.listCursorIndex];
    if (!item) { this.mode = 'item_list'; return; }

    this.mode = 'item_withdraw_qty';
    this.qty = 1;
    this.maxQty = item.count;
    this.qtyText.setText('x1');
    this.qtyContainer.setVisible(true);
  }

  private doWithdrawItem(): void {
    const items = this.getPcItemList();
    const item = items[this.listCursorIndex];
    if (!item) { this.mode = 'item_list'; this.qtyContainer.setVisible(false); return; }

    // Move from pcItems to bag
    this.playerState.pcItems[item.id] -= this.qty;
    if (this.playerState.pcItems[item.id] <= 0) delete this.playerState.pcItems[item.id];
    this.playerState.bag[item.id] = (this.playerState.bag[item.id] ?? 0) + this.qty;

    const itemData = ITEMS[item.id];
    const name = itemData?.name || item.id.replace(/_/g, ' ').toUpperCase();
    this.showMessage(`Withdrew ${this.qty}\n${name}(s).`);
    this.qtyContainer.setVisible(false);
    this.adjustCursorAfterRemove(this.getPcItemList().length);
    this.mode = 'item_list';
    this.updateList();
  }

  // --- Item deposit (from bag) ---

  private enterItemDeposit(): void {
    this.mode = 'item_deposit';
    this.listCursorIndex = 0;
    this.listScrollOffset = 0;
    this.titleText.setText('DEPOSIT ITEM');
    this.updateList();
  }

  private startItemDepositQty(): void {
    const items = this.getBagItemList();
    if (items.length === 0) return;
    const item = items[this.listCursorIndex];
    if (!item) return;

    this.mode = 'item_deposit_qty';
    this.qty = 1;
    this.maxQty = item.count;
    this.qtyText.setText('x1');
    this.qtyContainer.setVisible(true);
  }

  private doDepositItem(): void {
    const items = this.getBagItemList();
    const item = items[this.listCursorIndex];
    if (!item) { this.mode = 'item_deposit'; this.qtyContainer.setVisible(false); return; }

    // Move from bag to pcItems
    this.playerState.bag[item.id] -= this.qty;
    if (this.playerState.bag[item.id] <= 0) delete this.playerState.bag[item.id];
    this.playerState.pcItems[item.id] = (this.playerState.pcItems[item.id] ?? 0) + this.qty;

    const itemData = ITEMS[item.id];
    const name = itemData?.name || item.id.replace(/_/g, ' ').toUpperCase();
    this.showMessage(`Deposited ${this.qty}\n${name}(s).`);
    this.qtyContainer.setVisible(false);
    this.adjustCursorAfterRemove(this.getBagItemList().length);
    this.mode = 'item_deposit';
    this.updateList();
  }

  // --- Helpers ---

  private getListLength(): number {
    if (this.mode === 'pokemon_list') return this.playerState.pc.length;
    if (this.mode === 'pokemon_deposit') return this.playerState.party.length;
    if (this.mode === 'item_list') return this.getPcItemList().length;
    if (this.mode === 'item_deposit') return this.getBagItemList().length;
    return 0;
  }

  private getPcItemList(): { id: string; count: number }[] {
    return Object.entries(this.playerState.pcItems).map(([id, count]) => ({ id, count }));
  }

  private getBagItemList(): { id: string; count: number }[] {
    return Object.entries(this.playerState.bag).map(([id, count]) => ({ id, count }));
  }

  private showOptions(): void {
    // Rebuild options bg to fit
    this.optionsBg.clear();
    const h = this.currentOptions.length * 14 + 8;
    this.optionsBg.fillStyle(0xf8f8f8, 1);
    this.optionsBg.fillRoundedRect(0, 0, 64, h, 2);
    this.optionsBg.lineStyle(1, 0x383838, 1);
    this.optionsBg.strokeRoundedRect(0, 0, 64, h, 2);

    for (let i = 0; i < this.optionsTexts.length; i++) {
      if (i < this.currentOptions.length) {
        this.optionsTexts[i].setText(this.currentOptions[i]);
        this.optionsTexts[i].setVisible(true);
      } else {
        this.optionsTexts[i].setText('');
        this.optionsTexts[i].setVisible(false);
      }
    }
    this.optionsCursor.setY(4);
    this.optionsContainer.setVisible(true);
  }

  private updateList(): void {
    if (this.mode === 'pokemon_list') {
      this.renderPokemonList(this.playerState.pc);
    } else if (this.mode === 'pokemon_deposit') {
      this.renderPokemonList(this.playerState.party);
    } else if (this.mode === 'item_list') {
      this.renderItemList(this.getPcItemList());
    } else if (this.mode === 'item_deposit') {
      this.renderItemList(this.getBagItemList());
    }
  }

  private renderPokemonList(list: PokemonInstance[]): void {
    for (let i = 0; i < this.visibleRows; i++) {
      const idx = this.listScrollOffset + i;
      if (idx >= list.length) {
        this.rowTexts[i].setText('');
        continue;
      }
      const p = list[idx];
      const name = this.getPokemonName(p);
      this.rowTexts[i].setText(`${name.padEnd(10)} Lv${String(p.level).padEnd(3)} ${p.currentHp}/${p.stats.hp}`);
    }

    if (list.length === 0) {
      this.rowTexts[0].setText('  (empty)');
    }

    const cursorRow = this.listCursorIndex - this.listScrollOffset;
    this.cursorText.setY(18 + cursorRow * 13);
  }

  private renderItemList(list: { id: string; count: number }[]): void {
    for (let i = 0; i < this.visibleRows; i++) {
      const idx = this.listScrollOffset + i;
      if (idx >= list.length) {
        this.rowTexts[i].setText('');
        continue;
      }
      const item = list[idx];
      const itemData = ITEMS[item.id];
      const name = itemData?.name || item.id.replace(/_/g, ' ').toUpperCase();
      this.rowTexts[i].setText(`${name.padEnd(14)}x${item.count}`);
    }

    if (list.length === 0) {
      this.rowTexts[0].setText('  (empty)');
    }

    const cursorRow = this.listCursorIndex - this.listScrollOffset;
    this.cursorText.setY(18 + cursorRow * 13);
  }

  private adjustCursorAfterRemove(newLength: number): void {
    if (this.listCursorIndex >= newLength) {
      this.listCursorIndex = Math.max(0, newLength - 1);
    }
    if (this.listScrollOffset > this.listCursorIndex) {
      this.listScrollOffset = this.listCursorIndex;
    }
  }

  private showMessage(msg: string): void {
    this.messageText.setText(msg);
    this.messageContainer.setVisible(true);
    this.messageVisible = true;
  }

  private getPokemonName(p: PokemonInstance): string {
    return p.nickname || POKEMON_DATA[p.speciesId]?.name || '???';
  }

  destroy(): void {
    this.container.destroy();
  }
}
