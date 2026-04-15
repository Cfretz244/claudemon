import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';
import { SaveSystem } from '../systems/SaveSystem';
import { soundSystem } from '../systems/SoundSystem';
import { resyncMobileInput } from '../utils/mobileControls';

type TitleState = 'menu' | 'name_player' | 'name_rival' | 'oak_intro' | 'shrinking';

const NAME_OPTIONS_PLAYER = ['RED', 'ASH', 'JACK'];
const NAME_OPTIONS_RIVAL = ['BLUE', 'GARY', 'JOHN'];
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const ALPHA_COLS = 9;

export class TitleScene extends Phaser.Scene {
  private selectedOption = 0;
  private options: string[] = [];
  private optionTexts: Phaser.GameObjects.Text[] = [];
  private cursor!: Phaser.GameObjects.Text;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private hasSave = false;

  // Naming state
  private state: TitleState = 'menu';
  private namingContainer!: Phaser.GameObjects.Container;
  private playerName = '';
  private rivalName = '';
  private currentName = '';
  private nameDisplay!: Phaser.GameObjects.Text;
  private nameCursorX = 0;
  private nameCursorY = 0;
  private nameCursor!: Phaser.GameObjects.Text;
  private namePresets: string[] = [];
  private namePresetTexts: Phaser.GameObjects.Text[] = [];
  private namePresetCursor!: Phaser.GameObjects.Text;
  private nameSelectedPreset = 0;
  private namingMode: 'preset' | 'custom' = 'preset';

  // Oak intro state
  private introContainer!: Phaser.GameObjects.Container;
  private introPageIndex = 0;
  private introText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#88ccff');
    this.cameras.main.fadeIn(500, 255, 255, 255);
    this.state = 'menu';
    soundSystem.startMusic('title');

    // Sky gradient background
    const sky = this.add.graphics();
    const skyColors = [0x88ccff, 0x82c6fa, 0x7cc0f5, 0x76baf0, 0x70b4eb, 0x6aaee6, 0x64a8e1, 0x5ea2dc];
    for (let i = 0; i < skyColors.length; i++) {
      sky.fillStyle(skyColors[i]);
      sky.fillRect(0, i * 18, GAME_WIDTH, 18);
    }

    // Clouds
    sky.fillStyle(0xffffff);
    sky.fillRect(2, 88, 22, 4); sky.fillRect(5, 86, 16, 8); sky.fillRect(8, 84, 10, 4);
    sky.fillStyle(0xe0e8f0);
    sky.fillRect(2, 92, 22, 2);
    sky.fillStyle(0xffffff);
    sky.fillRect(128, 90, 26, 4); sky.fillRect(132, 88, 18, 8); sky.fillRect(136, 86, 10, 4);
    sky.fillStyle(0xe0e8f0);
    sky.fillRect(128, 94, 26, 2);

    // ── CLAUDÉMON wordmark ─────────────────────────────────
    // Big yellow title with blue outline + white highlight (shadow/hi pair)
    const title = this.add.container(GAME_WIDTH / 2, 22);
    // Drop shadow
    title.add(this.add.text(1, 1, 'CLAUDÉMON', {
      fontSize: '14px', color: '#1030a0', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5));
    // Outline layers (4-direction stroke)
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      title.add(this.add.text(dx, dy, 'CLAUDÉMON', {
        fontSize: '14px', color: '#1030a0', fontFamily: 'monospace', fontStyle: 'bold',
      }).setOrigin(0.5));
    }
    // Yellow fill
    title.add(this.add.text(0, 0, 'CLAUDÉMON', {
      fontSize: '14px', color: '#f8d030', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5));
    // White highlight on top
    title.add(this.add.text(0, -2, 'CLAUDÉMON', {
      fontSize: '14px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0.35));

    // "Pika!" script badge — small, tilted, in red
    const pikaTag = this.add.container(GAME_WIDTH / 2 + 28, 36);
    pikaTag.angle = -12;
    pikaTag.add(this.add.text(1, 1, 'Pika!', {
      fontSize: '8px', color: '#6a0010', fontFamily: 'monospace', fontStyle: 'italic bold',
    }).setOrigin(0.5));
    pikaTag.add(this.add.text(0, 0, 'Pika!', {
      fontSize: '8px', color: '#ff3030', fontFamily: 'monospace', fontStyle: 'italic bold',
    }).setOrigin(0.5));

    // YELLOW VERSION subtitle (white-on-red pill)
    const subPill = this.add.graphics();
    subPill.fillStyle(0x1030a0);
    subPill.fillRoundedRect(GAME_WIDTH / 2 - 36, 40, 72, 10, 2);
    subPill.fillStyle(0xc03030);
    subPill.fillRoundedRect(GAME_WIDTH / 2 - 35, 41, 70, 8, 2);
    this.add.text(GAME_WIDTH / 2, 45, 'YELLOW VERSION', {
      fontSize: '7px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Front-facing happy Pikachu (uses the title_pika_front sprite from introSprites.ts)
    const titlePika = this.add.image(GAME_WIDTH / 2, 82, 'title_pika_front');
    this.tweens.add({
      targets: titlePika,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Footer copyright
    this.add.text(GAME_WIDTH / 2, 138, '©2026 CLAUDEMON inc.', {
      fontSize: '6px', color: '#1030a0', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Check for save data
    this.hasSave = SaveSystem.hasSave();

    // Menu options
    this.options = this.hasSave ? ['CONTINUE', 'NEW GAME'] : ['NEW GAME'];
    this.selectedOption = 0;

    const menuY = 100;
    this.optionTexts = this.options.map((opt, i) => {
      return this.add.text(40, menuY + i * 14, opt, {
        fontSize: '8px',
        color: '#ffffff',
        fontFamily: 'monospace',
      });
    });

    this.cursor = this.add.text(30, menuY, '>', {
      fontSize: '8px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });

    // Version text
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 10, '2026 RETRO STUDIOS', {
      fontSize: '6px',
      color: '#a0b8d0',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Naming container (hidden initially)
    this.namingContainer = this.add.container(0, 0);
    this.namingContainer.setDepth(300);
    this.namingContainer.setVisible(false);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    resyncMobileInput();

    const confirmKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    const enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const cancelKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    confirmKey.on('down', () => this.handleConfirm());
    enterKey.on('down', () => this.handleConfirm());
    cancelKey.on('down', () => this.handleCancel());

    this.cursors.up.on('down', () => this.handleNav('up'));
    this.cursors.down.on('down', () => this.handleNav('down'));
    this.cursors.left.on('down', () => this.handleNav('left'));
    this.cursors.right.on('down', () => this.handleNav('right'));
  }

  private handleNav(dir: string): void {
    if (this.state === 'oak_intro' || this.state === 'shrinking') return;
    if (this.state === 'menu') {
      if (dir === 'up') {
        this.selectedOption = Math.max(0, this.selectedOption - 1);
      } else if (dir === 'down') {
        this.selectedOption = Math.min(this.options.length - 1, this.selectedOption + 1);
      }
      this.cursor.setY(100 + this.selectedOption * 14);
      soundSystem.menuMove();
    } else if (this.state === 'name_player' || this.state === 'name_rival') {
      if (this.namingMode === 'preset') {
        const max = this.namePresets.length; // last index = "CUSTOM"
        if (dir === 'up') this.nameSelectedPreset = Math.max(0, this.nameSelectedPreset - 1);
        else if (dir === 'down') this.nameSelectedPreset = Math.min(max, this.nameSelectedPreset + 1);
        this.namePresetCursor.setY(30 + this.nameSelectedPreset * 14);
        soundSystem.menuMove();
      } else {
        // Custom alphabet grid
        const rows = Math.ceil(ALPHABET.length / ALPHA_COLS) + 1; // +1 for END row
        if (dir === 'up') this.nameCursorY = Math.max(0, this.nameCursorY - 1);
        else if (dir === 'down') this.nameCursorY = Math.min(rows - 1, this.nameCursorY + 1);
        else if (dir === 'left') this.nameCursorX = Math.max(0, this.nameCursorX - 1);
        else if (dir === 'right') this.nameCursorX = Math.min(ALPHA_COLS - 1, this.nameCursorX + 1);
        this.updateCustomCursor();
        soundSystem.menuMove();
      }
    }
  }

  private handleConfirm(): void {
    if (this.state === 'shrinking') return;
    soundSystem.menuSelect();
    if (this.state === 'oak_intro') {
      this.advanceIntro();
      return;
    }
    if (this.state === 'menu') {
      this.selectOption();
    } else if (this.state === 'name_player' || this.state === 'name_rival') {
      if (this.namingMode === 'preset') {
        if (this.nameSelectedPreset < this.namePresets.length) {
          // Selected a preset name
          this.currentName = this.namePresets[this.nameSelectedPreset];
          this.finishNaming();
        } else {
          // Selected "CUSTOM" - switch to alphabet grid
          this.namingMode = 'custom';
          this.currentName = '';
          this.nameCursorX = 0;
          this.nameCursorY = 0;
          this.showCustomNaming();
        }
      } else {
        // Custom alphabet mode
        const rows = Math.ceil(ALPHABET.length / ALPHA_COLS);
        if (this.nameCursorY >= rows) {
          // On the END/DEL row
          if (this.nameCursorX < 3) {
            // DEL - delete last character
            this.currentName = this.currentName.slice(0, -1);
          } else {
            // END - finish naming
            if (this.currentName.length === 0) this.currentName = this.state === 'name_player' ? 'RED' : 'BLUE';
            this.finishNaming();
            return;
          }
        } else {
          const idx = this.nameCursorY * ALPHA_COLS + this.nameCursorX;
          if (idx < ALPHABET.length && this.currentName.length < 7) {
            this.currentName += ALPHABET[idx];
          }
        }
        this.nameDisplay.setText(this.currentName + '_');
      }
    }
  }

  private handleCancel(): void {
    if (this.state === 'name_player' || this.state === 'name_rival') {
      if (this.namingMode === 'custom') {
        if (this.currentName.length > 0) {
          this.currentName = this.currentName.slice(0, -1);
          this.nameDisplay.setText(this.currentName + '_');
          soundSystem.menuMove();
        } else {
          // Go back to preset mode
          this.namingMode = 'preset';
          this.showNamingScreen(
            this.state === 'name_player' ? 'YOUR NAME?' : 'RIVAL NAME?',
            this.state === 'name_player' ? NAME_OPTIONS_PLAYER : NAME_OPTIONS_RIVAL
          );
        }
      }
    }
  }

  private selectOption(): void {
    const option = this.options[this.selectedOption];
    if (option === 'NEW GAME') {
      this.showOakIntro();
    } else if (option === 'CONTINUE') {
      const save = SaveSystem.load();
      if (save) {
        soundSystem.stopMusic();
        this.scene.start('OverworldScene', {
          mapId: save.currentMap,
          playerX: save.playerX,
          playerY: save.playerY,
          saveData: save,
          isSurfing: save.isSurfing,
        });
      }
    }
  }

  private showNamingScreen(title: string, presets: string[]): void {
    this.namingMode = 'preset';
    this.namePresets = presets;
    this.nameSelectedPreset = 0;
    this.namingContainer.removeAll(true);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x000000);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.namingContainer.add(bg);

    // Title
    const titleText = this.add.text(GAME_WIDTH / 2, 12, title, {
      fontSize: '10px',
      color: '#f8f8f8',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.namingContainer.add(titleText);

    // Preset names
    this.namePresetTexts = presets.map((name, i) => {
      const t = this.add.text(30, 30 + i * 14, name, {
        fontSize: '8px',
        color: '#f8f8f8',
        fontFamily: 'monospace',
      });
      this.namingContainer.add(t);
      return t;
    });

    // "CUSTOM" option
    const customText = this.add.text(30, 30 + presets.length * 14, 'CUSTOM', {
      fontSize: '8px',
      color: '#f8d030',
      fontFamily: 'monospace',
    });
    this.namingContainer.add(customText);

    // Cursor
    this.namePresetCursor = this.add.text(20, 30, '>', {
      fontSize: '8px',
      color: '#f8f8f8',
      fontFamily: 'monospace',
    });
    this.namingContainer.add(this.namePresetCursor);

    this.namingContainer.setVisible(true);
  }

  private showCustomNaming(): void {
    this.namingContainer.removeAll(true);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x000000);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.namingContainer.add(bg);

    // Title
    const title = this.state === 'name_player' ? 'YOUR NAME?' : 'RIVAL NAME?';
    const titleText = this.add.text(GAME_WIDTH / 2, 6, title, {
      fontSize: '8px',
      color: '#f8f8f8',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.namingContainer.add(titleText);

    // Name display
    this.nameDisplay = this.add.text(GAME_WIDTH / 2, 20, this.currentName + '_', {
      fontSize: '10px',
      color: '#f8d030',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.namingContainer.add(this.nameDisplay);

    // Alphabet grid
    const gridStartX = 12;
    const gridStartY = 36;
    const cellW = 15;
    const cellH = 12;

    for (let i = 0; i < ALPHABET.length; i++) {
      const col = i % ALPHA_COLS;
      const row = Math.floor(i / ALPHA_COLS);
      const letterText = this.add.text(
        gridStartX + col * cellW,
        gridStartY + row * cellH,
        ALPHABET[i],
        {
          fontSize: '8px',
          color: '#f8f8f8',
          fontFamily: 'monospace',
        }
      );
      this.namingContainer.add(letterText);
    }

    // DEL and END buttons
    const rows = Math.ceil(ALPHABET.length / ALPHA_COLS);
    const delText = this.add.text(gridStartX, gridStartY + rows * cellH, 'DEL', {
      fontSize: '8px',
      color: '#f08080',
      fontFamily: 'monospace',
    });
    this.namingContainer.add(delText);

    const endText = this.add.text(gridStartX + 3 * cellW, gridStartY + rows * cellH, 'END', {
      fontSize: '8px',
      color: '#80f080',
      fontFamily: 'monospace',
    });
    this.namingContainer.add(endText);

    // Cursor
    this.nameCursor = this.add.text(gridStartX - 6, gridStartY, '>', {
      fontSize: '8px',
      color: '#f8f8f8',
      fontFamily: 'monospace',
    });
    this.namingContainer.add(this.nameCursor);
  }

  private updateCustomCursor(): void {
    const gridStartX = 12;
    const gridStartY = 36;
    const cellW = 15;
    const cellH = 12;

    this.nameCursor.setPosition(
      gridStartX + this.nameCursorX * cellW - 6,
      gridStartY + this.nameCursorY * cellH
    );
  }

  private finishNaming(): void {
    if (this.state === 'name_player') {
      this.playerName = this.currentName;
      this.currentName = '';
      // Return to Oak intro
      this.namingContainer.setVisible(false);
      this.state = 'oak_intro';
      this.introContainer.setVisible(true);
      this.introText.setText(this.getIntroPageText());
    } else if (this.state === 'name_rival') {
      this.rivalName = this.currentName;
      this.namingContainer.setVisible(false);
      // Return to Oak intro
      this.state = 'oak_intro';
      this.introContainer.setVisible(true);
      this.introText.setText(this.getIntroPageText());
    }
  }

  private introNidorino: Phaser.GameObjects.Image | null = null;

  private getIntroPageText(): string {
    switch (this.introPageIndex) {
      case 0: return 'Hello there!\nWelcome to the world\nof POKeMON!';
      case 1: return "My name is OAK!\nPeople call me the\nPOKeMON PROF!";
      case 2: return 'This world is\ninhabited by creatures\ncalled POKeMON!';
      case 3: return 'For some people,\nPOKeMON are pets.\nOthers use them\nfor fights.';
      case 4: return 'Myself...\nI study POKeMON\nas a profession.';
      case 5: return 'First, what is\nyour name?';
      case 6: return `Right! So your\nname is ${this.playerName}!`;
      case 7: return "This is my grandson.\nHe's been your rival\nsince you were\na baby.";
      case 8: return '...Erm, what was\nhis name again?';
      case 9: return `That's right!\nI remember now!\nHis name is ${this.rivalName}!`;
      case 10: return `${this.playerName}!\nYour very own\nPOKeMON legend is\nabout to unfold!`;
      case 11: return "A world of dreams\nand adventures with\nPOKeMON awaits!\nLet's go!";
      default: return '';
    }
  }

  private showOakIntro(): void {
    this.state = 'oak_intro';
    this.introPageIndex = 0;
    soundSystem.stopMusic();
    soundSystem.startMusic('route24');

    this.introContainer = this.add.container(0, 0);
    this.introContainer.setDepth(200);

    const bg = this.add.graphics();
    bg.fillStyle(0x000000);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.introContainer.add(bg);

    // Oak full-body trainer-style sprite
    const oakPortrait = this.add.image(GAME_WIDTH / 2, 2, 'oak_portrait');
    oakPortrait.setOrigin(0.5, 0);
    oakPortrait.setScale(1.35);
    this.introContainer.add(oakPortrait);

    // Pikachu - hidden initially, appears on page 2
    this.introNidorino = this.add.image(GAME_WIDTH / 2 + 42, 42, 'nidorino_portrait');
    this.introNidorino.setScale(1.5);
    this.introNidorino.setAlpha(0);
    this.introContainer.add(this.introNidorino);

    // Text box at bottom
    const textBox = this.add.graphics();
    textBox.fillStyle(0x000000);
    textBox.fillRect(4, 80, GAME_WIDTH - 8, 60);
    textBox.lineStyle(1, 0xf8f8f8);
    textBox.strokeRect(4, 80, GAME_WIDTH - 8, 60);
    this.introContainer.add(textBox);

    this.introText = this.add.text(12, 84, this.getIntroPageText(), {
      fontSize: '8px',
      color: '#f8f8f8',
      fontFamily: 'monospace',
      wordWrap: { width: GAME_WIDTH - 28 },
      lineSpacing: 2,
    });
    this.introContainer.add(this.introText);

    // Prompt arrow
    const arrow = this.add.text(GAME_WIDTH - 14, 132, 'v', {
      fontSize: '8px',
      color: '#f8f8f8',
      fontFamily: 'monospace',
    });
    this.tweens.add({
      targets: arrow,
      y: 136,
      duration: 400,
      yoyo: true,
      repeat: -1,
    });
    this.introContainer.add(arrow);
  }

  private advanceIntro(): void {
    this.introPageIndex++;

    // Trigger player naming after "what is your name?"
    if (this.introPageIndex === 6 && !this.playerName) {
      this.state = 'name_player';
      this.introContainer.setVisible(false);
      this.showNamingScreen('YOUR NAME?', NAME_OPTIONS_PLAYER);
      return;
    }

    // Trigger rival naming after "what was his name?"
    if (this.introPageIndex === 9 && !this.rivalName) {
      this.state = 'name_rival';
      this.introContainer.setVisible(false);
      this.showNamingScreen('RIVAL NAME?', NAME_OPTIONS_RIVAL);
      return;
    }

    if (this.introPageIndex > 11) {
      this.startShrinkAnimation();
      return;
    }

    this.introText.setText(this.getIntroPageText());
    soundSystem.menuSelect();

    // Show Pikachu on page 2, hide on page 4
    if (this.introNidorino) {
      if (this.introPageIndex === 2) {
        this.tweens.add({
          targets: this.introNidorino,
          alpha: 1,
          duration: 300,
        });
      } else if (this.introPageIndex === 4) {
        this.tweens.add({
          targets: this.introNidorino,
          alpha: 0,
          duration: 300,
        });
      }
    }
  }

  private startShrinkAnimation(): void {
    this.state = 'shrinking';
    this.introContainer.removeAll(true);

    // Black background
    const bg = this.add.graphics();
    bg.fillStyle(0x000000);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.introContainer.add(bg);

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Start with large detailed player portrait
    const sprite = this.add.image(cx, cy, 'player_portrait');
    sprite.setOrigin(0.5);
    sprite.setScale(2);
    this.introContainer.add(sprite);

    // Step-down shrink: portrait 2x → 1.5x → 1x → mid 1x → overworld 1x
    this.time.delayedCall(700, () => {
      sprite.setScale(1.5);
    });
    this.time.delayedCall(1000, () => {
      sprite.setScale(1);
    });
    this.time.delayedCall(1300, () => {
      sprite.setTexture('player_portrait_mid');
      sprite.setScale(1);
    });
    this.time.delayedCall(1600, () => {
      sprite.setTexture('player', 0);
      sprite.setScale(1);
    });
    this.time.delayedCall(1900, () => {
      // Don't destroy introContainer - scene.start cleans it up.
      // This prevents the title menu from flashing for a frame.
      soundSystem.stopMusic();
      this.scene.start('OverworldScene', {
        mapId: 'player_house',
        playerX: 3,
        playerY: 5,
        newGame: true,
        playerName: this.playerName,
        rivalName: this.rivalName,
        introTransition: true,
      });
    });
  }
}
