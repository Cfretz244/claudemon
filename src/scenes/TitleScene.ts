import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';
import { SaveSystem } from '../systems/SaveSystem';
import { soundSystem } from '../systems/SoundSystem';

type TitleState = 'menu' | 'name_player' | 'name_rival';

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

  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#000000');
    this.state = 'menu';

    // Title text
    this.add.text(GAME_WIDTH / 2, 20, 'POKeMON', {
      fontSize: '16px',
      color: '#f8d030',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 36, 'YELLOW', {
      fontSize: '12px',
      color: '#f8d030',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Pikachu silhouette
    const gfx = this.add.graphics();
    gfx.fillStyle(0xf8d030);
    gfx.fillRect(68, 54, 24, 24);
    gfx.fillRect(64, 58, 32, 18);
    gfx.fillRect(66, 46, 6, 10);
    gfx.fillRect(88, 46, 6, 10);
    gfx.fillStyle(0x000000);
    gfx.fillRect(72, 60, 4, 4);
    gfx.fillRect(84, 60, 4, 4);
    gfx.fillStyle(0xe03030);
    gfx.fillRect(66, 64, 4, 4);
    gfx.fillRect(90, 64, 4, 4);

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
      color: '#606060',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Naming container (hidden initially)
    this.namingContainer = this.add.container(0, 0);
    this.namingContainer.setDepth(100);
    this.namingContainer.setVisible(false);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();

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
    soundSystem.menuSelect();
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
      this.state = 'name_player';
      this.showNamingScreen('YOUR NAME?', NAME_OPTIONS_PLAYER);
    } else if (option === 'CONTINUE') {
      const save = SaveSystem.load();
      if (save) {
        this.scene.start('OverworldScene', {
          mapId: save.currentMap,
          playerX: save.playerX,
          playerY: save.playerY,
          saveData: save,
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
      this.state = 'name_rival';
      this.showNamingScreen('RIVAL NAME?', NAME_OPTIONS_RIVAL);
    } else if (this.state === 'name_rival') {
      this.rivalName = this.currentName;
      this.namingContainer.setVisible(false);
      // Start the game
      this.scene.start('OverworldScene', {
        mapId: 'player_house',
        playerX: 3,
        playerY: 5,
        newGame: true,
        playerName: this.playerName,
        rivalName: this.rivalName,
      });
    }
  }
}
