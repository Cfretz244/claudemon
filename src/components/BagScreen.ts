import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';
import { PokemonInstance, StatusCondition } from '../types/pokemon.types';
import { POKEMON_DATA } from '../data/pokemon';
import { MOVES_DATA } from '../data/moves';
import { ITEMS } from '../data/items';
import { soundSystem } from '../systems/SoundSystem';
import { PlayerState } from '../entities/Player';
import { addExperience, learnMove } from '../systems/ExperienceSystem';
import { MoveForgetUI } from './MoveForgetUI';

export class BagScreen {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private visible = false;
  private onClose: (() => void) | null = null;

  // State
  private playerState!: PlayerState;
  private itemList: { id: string; count: number }[] = [];
  private cursorIndex = 0;
  private scrollOffset = 0;
  private readonly visibleRows = 7;
  private mode: 'list' | 'options' | 'party_pick' | 'toss_qty' | 'move_forget' = 'list';

  // Display objects
  private bg!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;
  private moneyText!: Phaser.GameObjects.Text;
  private descText!: Phaser.GameObjects.Text;
  private rowTexts: Phaser.GameObjects.Text[] = [];
  private cursorText!: Phaser.GameObjects.Text;

  // Options sub-menu
  private optionsContainer!: Phaser.GameObjects.Container;
  private optionsCursor!: Phaser.GameObjects.Text;
  private optionsIndex = 0;
  private readonly optionLabels = ['USE', 'TOSS', 'CANCEL'];

  // Party picker
  private partyContainer!: Phaser.GameObjects.Container;
  private partyTexts: Phaser.GameObjects.Text[] = [];
  private partyCursor!: Phaser.GameObjects.Text;
  private partyIndex = 0;

  // Toss quantity
  private tossContainer!: Phaser.GameObjects.Container;
  private tossQtyText!: Phaser.GameObjects.Text;
  private tossQty = 1;

  // Message
  private messageContainer!: Phaser.GameObjects.Container;
  private messageText!: Phaser.GameObjects.Text;
  private messageVisible = false;

  // Input
  private inputBound = false;

  // Move forget UI
  private moveForgetUI!: MoveForgetUI;
  private pendingMoves: { pokemon: PokemonInstance; moveId: number }[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.bg = scene.add.graphics();
    this.bg.fillStyle(0xf8f8f8, 1);
    this.bg.fillRoundedRect(0, 0, GAME_WIDTH, GAME_HEIGHT, 2);
    this.bg.lineStyle(2, 0x383838, 1);
    this.bg.strokeRoundedRect(1, 1, GAME_WIDTH - 2, GAME_HEIGHT - 2, 2);

    this.titleText = scene.add.text(6, 4, 'BAG', {
      fontSize: '8px', color: '#383838', fontFamily: 'monospace',
    });

    this.moneyText = scene.add.text(GAME_WIDTH - 6, 4, '', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    }).setOrigin(1, 0);

    // Item rows
    for (let i = 0; i < this.visibleRows; i++) {
      const text = scene.add.text(16, 18 + i * 13, '', {
        fontSize: '7px', color: '#383838', fontFamily: 'monospace',
      });
      this.rowTexts.push(text);
    }

    this.cursorText = scene.add.text(6, 18, '>', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    });

    // Description at bottom
    this.descText = scene.add.text(6, GAME_HEIGHT - 22, '', {
      fontSize: '6px', color: '#606060', fontFamily: 'monospace',
      wordWrap: { width: GAME_WIDTH - 12 },
    });

    // Options sub-menu
    const optBg = scene.add.graphics();
    optBg.fillStyle(0xf8f8f8, 1);
    optBg.fillRoundedRect(0, 0, 46, 46, 2);
    optBg.lineStyle(1, 0x383838, 1);
    optBg.strokeRoundedRect(0, 0, 46, 46, 2);

    const optTexts = this.optionLabels.map((label, i) =>
      scene.add.text(14, 4 + i * 14, label, {
        fontSize: '7px', color: '#383838', fontFamily: 'monospace',
      })
    );
    this.optionsCursor = scene.add.text(4, 4, '>', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    });

    this.optionsContainer = scene.add.container(GAME_WIDTH - 50, 30, [optBg, ...optTexts, this.optionsCursor]);
    this.optionsContainer.setVisible(false);

    // Party picker
    const partyBg = scene.add.graphics();
    partyBg.fillStyle(0xf8f8f8, 1);
    partyBg.fillRoundedRect(0, 0, GAME_WIDTH, GAME_HEIGHT, 2);
    partyBg.lineStyle(2, 0x383838, 1);
    partyBg.strokeRoundedRect(1, 1, GAME_WIDTH - 2, GAME_HEIGHT - 2, 2);

    const partyTitle = scene.add.text(GAME_WIDTH / 2, 4, 'Use on which POKeMON?', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    }).setOrigin(0.5, 0);

    for (let i = 0; i < 6; i++) {
      const t = scene.add.text(16, 18 + i * 18, '', {
        fontSize: '7px', color: '#383838', fontFamily: 'monospace',
      });
      this.partyTexts.push(t);
    }
    this.partyCursor = scene.add.text(6, 18, '>', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    });

    this.partyContainer = scene.add.container(0, 0, [partyBg, partyTitle, ...this.partyTexts, this.partyCursor]);
    this.partyContainer.setVisible(false);

    // Toss quantity picker
    const tossBg = scene.add.graphics();
    tossBg.fillStyle(0xf8f8f8, 1);
    tossBg.fillRoundedRect(0, 0, 80, 30, 2);
    tossBg.lineStyle(1, 0x383838, 1);
    tossBg.strokeRoundedRect(0, 0, 80, 30, 2);

    const tossLabel = scene.add.text(6, 4, 'Toss how many?', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    });
    this.tossQtyText = scene.add.text(40, 18, 'x1', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    });

    this.tossContainer = scene.add.container(40, 50, [tossBg, tossLabel, this.tossQtyText]);
    this.tossContainer.setVisible(false);

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

    // Move forget UI (created separately, not in container — it manages its own depth)
    this.moveForgetUI = new MoveForgetUI(scene);

    this.container = scene.add.container(0, 0, [
      this.bg, this.titleText, this.moneyText, ...this.rowTexts,
      this.cursorText, this.descText, this.optionsContainer,
      this.partyContainer, this.tossContainer, this.messageContainer,
    ]);
    this.container.setDepth(950);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);
  }

  show(playerState: PlayerState, onClose: () => void): void {
    this.playerState = playerState;
    this.onClose = onClose;
    this.mode = 'list';
    this.cursorIndex = 0;
    this.scrollOffset = 0;
    this.messageVisible = false;
    this.container.setVisible(true);
    this.optionsContainer.setVisible(false);
    this.partyContainer.setVisible(false);
    this.tossContainer.setVisible(false);
    this.messageContainer.setVisible(false);
    this.rebuildItemList();
    this.updateList();
    this.setupInput();
    // Defer enabling input to the next frame so the key press that
    // opened this screen doesn't also trigger a confirm/navigate
    this.visible = false;
    this.scene.time.delayedCall(0, () => { this.visible = true; });
  }

  hide(): void {
    this.visible = false;
    this.container.setVisible(false);
  }

  private rebuildItemList(): void {
    this.itemList = Object.entries(this.playerState.bag).map(([id, count]) => ({ id, count }));
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

  private navigate(dir: number): void {
    if (this.messageVisible) return;
    if (this.mode === 'move_forget') return; // MoveForgetUI handles its own input
    soundSystem.menuMove();

    if (this.mode === 'list') {
      this.cursorIndex += dir;
      if (this.cursorIndex < 0) this.cursorIndex = 0;
      if (this.cursorIndex >= this.itemList.length) this.cursorIndex = Math.max(0, this.itemList.length - 1);

      if (this.cursorIndex < this.scrollOffset) this.scrollOffset = this.cursorIndex;
      if (this.cursorIndex >= this.scrollOffset + this.visibleRows) {
        this.scrollOffset = this.cursorIndex - this.visibleRows + 1;
      }
      this.updateList();
    } else if (this.mode === 'options') {
      this.optionsIndex += dir;
      if (this.optionsIndex < 0) this.optionsIndex = 0;
      if (this.optionsIndex >= this.optionLabels.length) this.optionsIndex = this.optionLabels.length - 1;
      this.optionsCursor.setY(4 + this.optionsIndex * 14);
    } else if (this.mode === 'party_pick') {
      this.partyIndex += dir;
      if (this.partyIndex < 0) this.partyIndex = 0;
      if (this.partyIndex >= this.playerState.party.length) this.partyIndex = this.playerState.party.length - 1;
      this.partyCursor.setY(18 + this.partyIndex * 18);
    } else if (this.mode === 'toss_qty') {
      const item = this.itemList[this.cursorIndex];
      this.tossQty += dir;
      if (this.tossQty < 1) this.tossQty = 1;
      if (this.tossQty > item.count) this.tossQty = item.count;
      this.tossQtyText.setText(`x${this.tossQty}`);
    }
  }

  private confirm(): void {
    if (this.mode === 'move_forget') return; // MoveForgetUI handles its own input

    if (this.messageVisible) {
      this.messageVisible = false;
      this.messageContainer.setVisible(false);
      // After dismissing a message, check if there are pending moves to process
      if (this.pendingMoves.length > 0) {
        this.processNextPendingMove();
        return;
      }
      return;
    }

    soundSystem.menuSelect();

    if (this.mode === 'list') {
      if (this.itemList.length === 0) return;
      this.mode = 'options';
      this.optionsIndex = 0;
      this.optionsCursor.setY(4);
      this.optionsContainer.setVisible(true);
    } else if (this.mode === 'options') {
      const option = this.optionLabels[this.optionsIndex];
      if (option === 'USE') {
        this.tryUseItem();
      } else if (option === 'TOSS') {
        this.startToss();
      } else {
        this.mode = 'list';
        this.optionsContainer.setVisible(false);
      }
    } else if (this.mode === 'party_pick') {
      this.useItemOnPokemon(this.partyIndex);
    } else if (this.mode === 'toss_qty') {
      this.doToss();
    }
  }

  private back(): void {
    if (this.mode === 'move_forget') return; // MoveForgetUI handles its own input

    if (this.messageVisible) {
      this.messageVisible = false;
      this.messageContainer.setVisible(false);
      // After dismissing a message, check if there are pending moves to process
      if (this.pendingMoves.length > 0) {
        this.processNextPendingMove();
        return;
      }
      return;
    }

    soundSystem.menuMove();

    if (this.mode === 'options') {
      this.mode = 'list';
      this.optionsContainer.setVisible(false);
    } else if (this.mode === 'party_pick') {
      this.mode = 'options';
      this.partyContainer.setVisible(false);
      this.optionsContainer.setVisible(true);
    } else if (this.mode === 'toss_qty') {
      this.mode = 'options';
      this.tossContainer.setVisible(false);
      this.optionsContainer.setVisible(true);
    } else {
      this.hide();
      if (this.onClose) this.onClose();
    }
  }

  private tryUseItem(): void {
    const item = this.itemList[this.cursorIndex];
    const itemData = ITEMS[item.id];

    if (!itemData || (itemData.category !== 'medicine' && itemData.category !== 'hm')) {
      this.mode = 'list';
      this.optionsContainer.setVisible(false);
      this.showMessage("Can't use that here!");
      return;
    }

    if (this.playerState.party.length === 0) {
      this.mode = 'list';
      this.optionsContainer.setVisible(false);
      this.showMessage("No POKeMON in party!");
      return;
    }

    // Show party picker
    this.mode = 'party_pick';
    this.partyIndex = 0;
    this.partyCursor.setY(18);
    this.optionsContainer.setVisible(false);

    // Update party list
    for (let i = 0; i < 6; i++) {
      if (i < this.playerState.party.length) {
        const p = this.playerState.party[i];
        const name = p.nickname || POKEMON_DATA[p.speciesId]?.name || '???';
        this.partyTexts[i].setText(`${name} Lv${p.level} ${p.currentHp}/${p.stats.hp}`);
      } else {
        this.partyTexts[i].setText('');
      }
    }
    this.partyContainer.setVisible(true);
  }

  private useItemOnPokemon(pokemonIndex: number): void {
    const item = this.itemList[this.cursorIndex];
    const itemData = ITEMS[item.id];
    const pokemon = this.playerState.party[pokemonIndex];

    if (!itemData || !pokemon) return;

    // HM teaching
    if (itemData.category === 'hm' && itemData.moveId != null) {
      const moveId = itemData.moveId;
      const moveName = MOVES_DATA[moveId]?.name || '???';
      const pokeName = this.getPokemonName(pokemon);

      // Check if Pokemon already knows this move
      if (pokemon.moves.some(m => m.moveId === moveId)) {
        this.showMessage(`${pokeName} already\nknows ${moveName}!`);
        return;
      }

      // If has room, learn directly (HMs are NOT consumed)
      if (pokemon.moves.length < 4) {
        learnMove(pokemon, moveId);
        soundSystem.heal();
        this.showMessage(`${pokeName} learned\n${moveName}!`);
        this.mode = 'list';
        this.partyContainer.setVisible(false);
        this.optionsContainer.setVisible(false);
        this.updateList();
        return;
      }

      // Need to forget a move — use MoveForgetUI
      this.mode = 'move_forget';
      this.partyContainer.setVisible(false);
      this.moveForgetUI.show(pokemon, moveId, (replaceIndex) => {
        if (replaceIndex !== null) {
          const oldMoveName = MOVES_DATA[pokemon.moves[replaceIndex].moveId]?.name || '???';
          learnMove(pokemon, moveId, replaceIndex);
          soundSystem.heal();
          this.showMessage(`${pokeName} forgot\n${oldMoveName} and\nlearned ${moveName}!`);
        } else {
          this.showMessage(`${pokeName} did not\nlearn ${moveName}.`);
        }
        this.mode = 'list';
        this.optionsContainer.setVisible(false);
        this.updateList();
      });
      return;
    }

    // Revive check
    if (item.id === 'revive') {
      if (pokemon.currentHp > 0) {
        this.showMessage(`${this.getPokemonName(pokemon)} isn't\nfainted!`);
        return;
      }
      pokemon.currentHp = Math.floor(pokemon.stats.hp / 2);
      this.playerState.useItem(item.id);
      soundSystem.heal();
      this.showMessage(`${this.getPokemonName(pokemon)}'s HP\nwas restored!`);
      this.afterItemUse();
      return;
    }

    // Rare Candy
    if (item.id === 'rare_candy') {
      if (pokemon.level >= 100) {
        this.showMessage("It won't have any\neffect!");
        return;
      }
      const levelUps = addExperience(pokemon, 999999);
      this.playerState.useItem(item.id);
      soundSystem.heal();

      // Collect new moves from level-ups
      this.pendingMoves = [];
      for (const lu of levelUps) {
        for (const moveId of lu.newMoves) {
          const moveData = MOVES_DATA[moveId];
          if (!moveData) continue;
          if (pokemon.moves.length < 4) {
            learnMove(pokemon, moveId);
          } else {
            this.pendingMoves.push({ pokemon, moveId });
          }
        }
      }

      this.showMessage(`${this.getPokemonName(pokemon)} grew to\nLv${pokemon.level}!`);
      this.afterItemUse();
      return;
    }

    // Status cures
    if (itemData.effect) {
      if (pokemon.currentHp <= 0) {
        this.showMessage(`${this.getPokemonName(pokemon)} has\nfainted!`);
        return;
      }

      const cureMap: Record<string, StatusCondition> = {
        cure_poison: StatusCondition.POISON,
        cure_burn: StatusCondition.BURN,
        cure_freeze: StatusCondition.FREEZE,
        cure_sleep: StatusCondition.SLEEP,
        cure_paralysis: StatusCondition.PARALYSIS,
      };

      if (itemData.effect === 'cure_all') {
        if (pokemon.status === StatusCondition.NONE && !itemData.healAmount) {
          this.showMessage("It won't have any\neffect!");
          return;
        }
        pokemon.status = StatusCondition.NONE;
        // Full Restore also heals HP
        if (itemData.healAmount) {
          pokemon.currentHp = Math.min(pokemon.stats.hp, pokemon.currentHp + itemData.healAmount);
        }
      } else {
        const targetStatus = cureMap[itemData.effect];
        if (targetStatus && pokemon.status === targetStatus) {
          pokemon.status = StatusCondition.NONE;
        } else if (!itemData.healAmount) {
          this.showMessage("It won't have any\neffect!");
          return;
        }
      }

      // If it also heals HP
      if (itemData.healAmount && !itemData.effect) {
        // Pure HP heal (handled below)
      } else {
        this.playerState.useItem(item.id);
        soundSystem.heal();
        this.showMessage(`${this.getPokemonName(pokemon)} was\ncured!`);
        this.afterItemUse();
        return;
      }
    }

    // HP healing
    if (itemData.healAmount) {
      if (pokemon.currentHp <= 0) {
        this.showMessage(`${this.getPokemonName(pokemon)} has\nfainted!`);
        return;
      }
      if (pokemon.currentHp >= pokemon.stats.hp) {
        this.showMessage("It won't have any\neffect!");
        return;
      }
      pokemon.currentHp = Math.min(pokemon.stats.hp, pokemon.currentHp + itemData.healAmount);
      this.playerState.useItem(item.id);
      soundSystem.heal();
      this.showMessage(`${this.getPokemonName(pokemon)}'s HP\nwas restored!`);
      this.afterItemUse();
      return;
    }
  }

  private afterItemUse(): void {
    this.rebuildItemList();
    // If bag is now empty or cursor past end, adjust
    if (this.cursorIndex >= this.itemList.length) {
      this.cursorIndex = Math.max(0, this.itemList.length - 1);
    }
    this.mode = 'list';
    this.partyContainer.setVisible(false);
    this.optionsContainer.setVisible(false);
    this.updateList();
  }

  private startToss(): void {
    const item = this.itemList[this.cursorIndex];
    const itemData = ITEMS[item.id];
    if (itemData && (itemData.category === 'key' || itemData.category === 'hm')) {
      this.mode = 'list';
      this.optionsContainer.setVisible(false);
      this.showMessage("That's too important\nto toss!");
      return;
    }
    this.mode = 'toss_qty';
    this.tossQty = 1;
    this.tossQtyText.setText(`x1`);
    this.optionsContainer.setVisible(false);
    this.tossContainer.setVisible(true);
  }

  private doToss(): void {
    const item = this.itemList[this.cursorIndex];
    for (let i = 0; i < this.tossQty; i++) {
      this.playerState.useItem(item.id);
    }
    this.tossContainer.setVisible(false);
    this.rebuildItemList();
    if (this.cursorIndex >= this.itemList.length) {
      this.cursorIndex = Math.max(0, this.itemList.length - 1);
    }
    this.mode = 'list';
    this.showMessage(`Tossed ${this.tossQty} item(s).`);
    this.updateList();
  }

  private showMessage(msg: string): void {
    this.messageText.setText(msg);
    this.messageContainer.setVisible(true);
    this.messageVisible = true;
  }

  private updateList(): void {
    this.moneyText.setText(`$${this.playerState.money}`);

    for (let i = 0; i < this.visibleRows; i++) {
      const itemIndex = this.scrollOffset + i;
      if (itemIndex >= this.itemList.length) {
        this.rowTexts[i].setText('');
        continue;
      }

      const item = this.itemList[itemIndex];
      const itemData = ITEMS[item.id];
      const name = itemData?.name || item.id.replace(/_/g, ' ').toUpperCase();
      this.rowTexts[i].setText(`${name.padEnd(14)}x${item.count}`);
    }

    // Cursor position
    const cursorRow = this.cursorIndex - this.scrollOffset;
    this.cursorText.setY(18 + cursorRow * 13);

    // Description
    if (this.itemList.length > 0) {
      const item = this.itemList[this.cursorIndex];
      const itemData = ITEMS[item.id];
      this.descText.setText(itemData?.description || '');
    } else {
      this.descText.setText('No items.');
    }
  }

  private processNextPendingMove(): void {
    if (this.pendingMoves.length === 0) return;

    const { pokemon, moveId } = this.pendingMoves.shift()!;
    const moveName = MOVES_DATA[moveId]?.name || '???';
    const pokeName = this.getPokemonName(pokemon);

    // If the pokemon now has room (from a previous forget), just learn it
    if (pokemon.moves.length < 4) {
      learnMove(pokemon, moveId);
      this.showMessage(`${pokeName} learned\n${moveName}!`);
      return;
    }

    // Show the move forget UI
    this.mode = 'move_forget';
    this.moveForgetUI.show(pokemon, moveId, (replaceIndex) => {
      if (replaceIndex !== null) {
        const oldMoveName = MOVES_DATA[pokemon.moves[replaceIndex].moveId]?.name || '???';
        learnMove(pokemon, moveId, replaceIndex);
        this.showMessage(`${pokeName} forgot\n${oldMoveName} and\nlearned ${moveName}!`);
      } else {
        this.showMessage(`${pokeName} did not\nlearn ${moveName}.`);
      }
      this.mode = 'list';
    });
  }

  private getPokemonName(p: PokemonInstance): string {
    return p.nickname || POKEMON_DATA[p.speciesId]?.name || '???';
  }

  destroy(): void {
    this.moveForgetUI.destroy();
    this.container.destroy();
  }
}
