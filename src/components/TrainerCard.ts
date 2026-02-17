import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';
import { PlayerState } from '../entities/Player';
import { soundSystem } from '../systems/SoundSystem';

const BADGE_DEFS = [
  { name: 'BOULDER', color: 0x888888, letter: 'B' },
  { name: 'CASCADE', color: 0x3890f8, letter: 'C' },
  { name: 'THUNDER', color: 0xf8d030, letter: 'T' },
  { name: 'RAINBOW', color: 0x78c850, letter: 'R' },
  { name: 'SOUL',    color: 0xa040a0, letter: 'S' },
  { name: 'MARSH',   color: 0xf85888, letter: 'M' },
  { name: 'VOLCANO', color: 0xf08030, letter: 'V' },
  { name: 'EARTH',   color: 0xe0c068, letter: 'E' },
];

const TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontSize: '8px',
  color: '#f8f8f8',
  fontFamily: 'monospace',
};

function formatMoney(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatPlayTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

export class TrainerCard {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private visible = false;
  private onClose: (() => void) | null = null;
  private inputBound = false;

  // Display objects
  private bg!: Phaser.GameObjects.Graphics;
  private portrait!: Phaser.GameObjects.Image;
  private nameText!: Phaser.GameObjects.Text;
  private moneyText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private badgeGraphics!: Phaser.GameObjects.Graphics;
  private badgeLetters: Phaser.GameObjects.Text[] = [];
  private seenText!: Phaser.GameObjects.Text;
  private ownText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Background fill
    this.bg = scene.add.graphics();
    this.bg.fillStyle(0x181848, 1);
    this.bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // White border
    this.bg.lineStyle(2, 0xf8f8f8, 1);
    this.bg.strokeRect(2, 2, GAME_WIDTH - 4, GAME_HEIGHT - 4);

    // Title
    const titleText = scene.add.text(GAME_WIDTH / 2, 6, 'TRAINER CARD', TEXT_STYLE).setOrigin(0.5, 0);

    // Horizontal separator line below title
    const separator = scene.add.graphics();
    separator.lineStyle(1, 0xf8f8f8, 1);
    separator.lineBetween(4, 17, GAME_WIDTH - 4, 17);

    // Player portrait
    this.portrait = scene.add.image(8, 20, 'player_portrait').setOrigin(0, 0);

    // Player info text (right of portrait)
    this.nameText = scene.add.text(44, 22, '', TEXT_STYLE);
    this.moneyText = scene.add.text(44, 34, '', TEXT_STYLE);
    this.timeText = scene.add.text(44, 46, '', TEXT_STYLE);

    // Badges label
    const badgesLabel = scene.add.text(GAME_WIDTH / 2, 66, 'BADGES', TEXT_STYLE).setOrigin(0.5, 0);

    // Badge slots graphics
    this.badgeGraphics = scene.add.graphics();

    // Badge letter texts
    const badgeSlotSize = 14;
    const totalBadgeWidth = 8 * badgeSlotSize + 7 * 2; // 8 badges with 2px gaps
    const badgeStartX = Math.floor((GAME_WIDTH - totalBadgeWidth) / 2);
    const badgeY = 78;

    for (let i = 0; i < 8; i++) {
      const bx = badgeStartX + i * (badgeSlotSize + 2);
      const letterText = scene.add.text(
        bx + badgeSlotSize / 2,
        badgeY + badgeSlotSize / 2,
        BADGE_DEFS[i].letter,
        TEXT_STYLE
      ).setOrigin(0.5, 0.5);
      letterText.setVisible(false);
      this.badgeLetters.push(letterText);
    }

    // Pokedex section
    const pokedexLabel = scene.add.text(GAME_WIDTH / 2, 100, 'POKeDEX', TEXT_STYLE).setOrigin(0.5, 0);
    this.seenText = scene.add.text(30, 112, '', TEXT_STYLE);
    this.ownText = scene.add.text(30, 124, '', TEXT_STYLE);

    // Assemble container
    this.container = scene.add.container(0, 0, [
      this.bg, titleText, separator, this.portrait,
      this.nameText, this.moneyText, this.timeText,
      badgesLabel, this.badgeGraphics, ...this.badgeLetters,
      pokedexLabel, this.seenText, this.ownText,
    ]);
    this.container.setDepth(950);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);
  }

  show(playerState: PlayerState, onClose: () => void): void {
    this.onClose = onClose;
    this.visible = true;

    // Populate player info
    this.nameText.setText(`NAME: ${playerState.name}`);
    this.moneyText.setText(`MONEY: $${formatMoney(playerState.money)}`);
    this.timeText.setText(`TIME: ${formatPlayTime(playerState.playTime)}`);

    // Draw badge slots
    this.badgeGraphics.clear();
    const badgeSlotSize = 14;
    const totalBadgeWidth = 8 * badgeSlotSize + 7 * 2;
    const badgeStartX = Math.floor((GAME_WIDTH - totalBadgeWidth) / 2);
    const badgeY = 78;

    for (let i = 0; i < 8; i++) {
      const bx = badgeStartX + i * (badgeSlotSize + 2);
      const earned = playerState.badges.includes(BADGE_DEFS[i].name);

      if (earned) {
        this.badgeGraphics.fillStyle(BADGE_DEFS[i].color, 1);
        this.badgeGraphics.fillRect(bx, badgeY, badgeSlotSize, badgeSlotSize);
        this.badgeLetters[i].setVisible(true);
      } else {
        this.badgeGraphics.lineStyle(1, 0x404040, 1);
        this.badgeGraphics.strokeRect(bx, badgeY, badgeSlotSize, badgeSlotSize);
        this.badgeLetters[i].setVisible(false);
      }
    }

    // Pokedex counts
    this.seenText.setText(`SEEN: ${playerState.pokedexSeen.length}`);
    this.ownText.setText(`OWN:  ${playerState.pokedexCaught.length}`);

    this.container.setVisible(true);
    this.setupInput();
  }

  hide(): void {
    this.visible = false;
    this.container.setVisible(false);
    soundSystem.menuSelect();
    if (this.onClose) {
      this.onClose();
      this.onClose = null;
    }
  }

  private setupInput(): void {
    if (this.inputBound) return;
    this.inputBound = true;

    const kb = this.scene.input.keyboard!;
    const z = kb.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    const enter = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const x = kb.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    const esc = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    z.on('down', () => { if (this.visible) this.hide(); });
    enter.on('down', () => { if (this.visible) this.hide(); });
    x.on('down', () => { if (this.visible) this.hide(); });
    esc.on('down', () => { if (this.visible) this.hide(); });
  }
}
