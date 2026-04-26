import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';
import { soundSystem } from '../systems/SoundSystem';
import { PlayerState } from '../entities/Player';
import { POKEMON_DATA } from '../data/pokemon';
import { createPokemon } from '../entities/Pokemon';
import { generatePokemonSprite, getShapeForSpecies } from '../utils/spriteGenerator';
import { PRIZE_POKEMON } from '../data/prizePokemon';

export { PRIZE_POKEMON };

const FILL_BG = 0xf8f8f8;
const BORDER = 0x383838;
const TEXT_DARK = '#383838';

type Mode = 'list' | 'confirm' | 'message';

export class PrizeExchangeScreen {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private active = false;
  private inputBound = false;
  private playerState!: PlayerState;
  private onClose: (() => void) | null = null;

  private mode: Mode = 'list';

  // List
  private rowTexts: Phaser.GameObjects.Text[] = [];
  private rowSprites: Phaser.GameObjects.Image[] = [];
  private listCursor!: Phaser.GameObjects.Text;
  private listIndex = 0;

  // HUD
  private coinText!: Phaser.GameObjects.Text;

  // Confirm overlay
  private confirmContainer!: Phaser.GameObjects.Container;
  private confirmText!: Phaser.GameObjects.Text;
  private confirmCursor!: Phaser.GameObjects.Text;
  private confirmIndex = 0; // 0 = YES, 1 = NO

  // Message overlay
  private messageContainer!: Phaser.GameObjects.Container;
  private messageText!: Phaser.GameObjects.Text;
  private messageOnConfirm: (() => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Pre-generate sprites for all prize Pokémon (32x32 thumbs).
    for (const prize of PRIZE_POKEMON) {
      const species = POKEMON_DATA[prize.speciesId];
      if (!species) continue;
      const key = `prize_thumb_${prize.speciesId}`;
      if (!scene.textures.exists(key)) {
        const shape = getShapeForSpecies(prize.speciesId, species.types);
        generatePokemonSprite(
          scene,
          key,
          species.spriteColor,
          species.spriteColor2,
          shape,
          prize.speciesId,
        );
      }
    }

    // Background
    const bg = scene.add.graphics();
    bg.fillStyle(FILL_BG, 1);
    bg.fillRoundedRect(0, 0, GAME_WIDTH, GAME_HEIGHT, 2);
    bg.lineStyle(2, BORDER, 1);
    bg.strokeRoundedRect(1, 1, GAME_WIDTH - 2, GAME_HEIGHT - 2, 2);

    const title = scene.add.text(GAME_WIDTH / 2, 4, 'PRIZE EXCHANGE', {
      fontSize: '8px', color: TEXT_DARK, fontFamily: 'monospace',
    }).setOrigin(0.5, 0);

    this.coinText = scene.add.text(GAME_WIDTH - 4, GAME_HEIGHT - 11, '', {
      fontSize: '7px', color: TEXT_DARK, fontFamily: 'monospace',
    }).setOrigin(1, 0);

    const div = scene.add.graphics();
    div.lineStyle(1, BORDER, 1);
    div.lineBetween(4, 14, GAME_WIDTH - 4, 14);

    // List rows
    const rowStartY = 20;
    const rowH = 14;
    for (let i = 0; i < PRIZE_POKEMON.length; i++) {
      const prize = PRIZE_POKEMON[i];

      const sprite = scene.add.image(20, rowStartY + i * rowH + 6, `prize_thumb_${prize.speciesId}`, 0);
      sprite.setOrigin(0.5, 0.5);
      sprite.setScale(0.4); // 32 → 12.8 px ≈ row height
      this.rowSprites.push(sprite);

      const text = scene.add.text(32, rowStartY + i * rowH, '', {
        fontSize: '7px', color: TEXT_DARK, fontFamily: 'monospace',
      });
      this.rowTexts.push(text);
    }

    this.listCursor = scene.add.text(8, rowStartY, '>', {
      fontSize: '7px', color: TEXT_DARK, fontFamily: 'monospace',
    });

    // Hint at bottom
    const hint = scene.add.text(4, GAME_HEIGHT - 11, 'Z=trade  X=exit', {
      fontSize: '7px', color: TEXT_DARK, fontFamily: 'monospace',
    });

    // Confirm overlay (centered box)
    const confW = 88;
    const confH = 40;
    const confX = (GAME_WIDTH - confW) / 2;
    const confY = (GAME_HEIGHT - confH) / 2;

    const confBg = scene.add.graphics();
    confBg.fillStyle(FILL_BG, 1);
    confBg.fillRoundedRect(0, 0, confW, confH, 2);
    confBg.lineStyle(1, BORDER, 1);
    confBg.strokeRoundedRect(0, 0, confW, confH, 2);

    this.confirmText = scene.add.text(4, 4, '', {
      fontSize: '7px', color: TEXT_DARK, fontFamily: 'monospace',
      wordWrap: { width: confW - 8 },
    });
    const yesText = scene.add.text(20, 26, 'YES', {
      fontSize: '7px', color: TEXT_DARK, fontFamily: 'monospace',
    });
    const noText = scene.add.text(54, 26, 'NO', {
      fontSize: '7px', color: TEXT_DARK, fontFamily: 'monospace',
    });
    this.confirmCursor = scene.add.text(12, 26, '>', {
      fontSize: '7px', color: TEXT_DARK, fontFamily: 'monospace',
    });

    this.confirmContainer = scene.add.container(confX, confY, [
      confBg, this.confirmText, yesText, noText, this.confirmCursor,
    ]);
    this.confirmContainer.setVisible(false);

    // Message overlay (bottom of screen)
    const msgBg = scene.add.graphics();
    msgBg.fillStyle(FILL_BG, 1);
    msgBg.fillRoundedRect(2, GAME_HEIGHT - 32, GAME_WIDTH - 4, 28, 2);
    msgBg.lineStyle(1, BORDER, 1);
    msgBg.strokeRoundedRect(2, GAME_HEIGHT - 32, GAME_WIDTH - 4, 28, 2);

    this.messageText = scene.add.text(8, GAME_HEIGHT - 28, '', {
      fontSize: '7px', color: TEXT_DARK, fontFamily: 'monospace',
      wordWrap: { width: GAME_WIDTH - 16 },
    });

    this.messageContainer = scene.add.container(0, 0, [msgBg, this.messageText]);
    this.messageContainer.setVisible(false);

    this.container = scene.add.container(0, 0, [
      bg, title, div, this.coinText, hint,
      ...this.rowSprites, ...this.rowTexts, this.listCursor,
      this.confirmContainer, this.messageContainer,
    ]);
    this.container.setDepth(950);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);
  }

  show(playerState: PlayerState, onClose: () => void): void {
    this.playerState = playerState;
    this.onClose = onClose;
    this.mode = 'list';
    this.listIndex = 0;
    this.confirmIndex = 0;
    this.confirmContainer.setVisible(false);
    this.messageContainer.setVisible(false);

    this.updateList();
    this.updateCoin();
    this.container.setVisible(true);
    this.setupInput();

    this.active = false;
    this.scene.time.delayedCall(0, () => { this.active = true; });
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
    const left = kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    const right = kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    const z = kb.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    const enter = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const x = kb.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    up.on('down', () => { if (this.active) this.navigate(-1); });
    down.on('down', () => { if (this.active) this.navigate(1); });
    left.on('down', () => { if (this.active) this.navigate(-1); });
    right.on('down', () => { if (this.active) this.navigate(1); });
    z.on('down', () => { if (this.active) this.confirm(); });
    enter.on('down', () => { if (this.active) this.confirm(); });
    x.on('down', () => { if (this.active) this.back(); });
  }

  private navigate(dir: number): void {
    if (this.mode === 'list') {
      this.listIndex = (this.listIndex + dir + PRIZE_POKEMON.length) % PRIZE_POKEMON.length;
      this.updateListCursor();
      soundSystem.menuMove();
    } else if (this.mode === 'confirm') {
      this.confirmIndex = (this.confirmIndex + dir + 2) % 2;
      this.updateConfirmCursor();
      soundSystem.menuMove();
    }
  }

  private confirm(): void {
    if (this.mode === 'message') {
      const cb = this.messageOnConfirm;
      this.messageOnConfirm = null;
      this.messageContainer.setVisible(false);
      this.mode = 'list';
      if (cb) cb();
      return;
    }
    if (this.mode === 'list') {
      const prize = PRIZE_POKEMON[this.listIndex];
      const species = POKEMON_DATA[prize.speciesId];
      if (!species) return;

      if (this.playerState.coins < prize.cost) {
        this.showMessage("You don't have enough\ncoins for that!");
        return;
      }
      // Show confirm
      this.confirmText.setText(`Trade ${prize.cost} coins\nfor ${species.name}?`);
      this.confirmIndex = 1; // default to NO (safer)
      this.updateConfirmCursor();
      this.confirmContainer.setVisible(true);
      this.mode = 'confirm';
      soundSystem.menuSelect();
      return;
    }
    if (this.mode === 'confirm') {
      this.confirmContainer.setVisible(false);
      if (this.confirmIndex === 0) {
        this.executeTrade();
      } else {
        this.mode = 'list';
      }
      return;
    }
  }

  private back(): void {
    if (this.mode === 'message') {
      // Same as confirm: dismiss
      this.confirm();
      return;
    }
    if (this.mode === 'confirm') {
      this.confirmContainer.setVisible(false);
      this.mode = 'list';
      return;
    }
    // List mode: exit
    this.hide();
    if (this.onClose) this.onClose();
  }

  private executeTrade(): void {
    const prize = PRIZE_POKEMON[this.listIndex];
    const species = POKEMON_DATA[prize.speciesId];
    if (!species) return;

    if (!this.playerState.spendCoins(prize.cost)) {
      this.showMessage("You don't have enough\ncoins for that!");
      return;
    }
    const mon = createPokemon(prize.speciesId, prize.level, this.playerState.name);
    const wentToParty = this.playerState.addToParty(mon);
    this.updateCoin();
    soundSystem.levelUp();
    if (wentToParty) {
      this.showMessage(`You received\n${species.name}!`);
    } else {
      this.showMessage(`Got ${species.name}!\nSent to PC.`);
    }
  }

  private showMessage(msg: string, onConfirm?: () => void): void {
    this.messageText.setText(msg);
    this.messageContainer.setVisible(true);
    this.messageOnConfirm = onConfirm ?? null;
    this.mode = 'message';
  }

  private updateList(): void {
    for (let i = 0; i < PRIZE_POKEMON.length; i++) {
      const prize = PRIZE_POKEMON[i];
      const species = POKEMON_DATA[prize.speciesId];
      const name = species?.name ?? '?';
      const lvl = `L${prize.level}`;
      const cost = `${prize.cost}`;
      this.rowTexts[i].setText(`${name.padEnd(11)}${lvl.padStart(3)} ${cost.padStart(5)}`);
    }
    this.updateListCursor();
  }

  private updateListCursor(): void {
    this.listCursor.setY(20 + this.listIndex * 14);
  }

  private updateConfirmCursor(): void {
    this.confirmCursor.setX(this.confirmIndex === 0 ? 12 : 46);
  }

  private updateCoin(): void {
    const v = Math.max(0, Math.min(9999, this.playerState.coins));
    this.coinText.setText(`COIN ${v.toString().padStart(4, '0')}`);
  }

  destroy(): void {
    this.container.destroy();
  }
}
