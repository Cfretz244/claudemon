import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';
import { PokemonInstance, StatusCondition } from '../types/pokemon.types';
import { POKEMON_DATA } from '../data/pokemon';
import { MOVES_DATA } from '../data/moves';
import { soundSystem } from '../systems/SoundSystem';

// Field move IDs
const FIELD_MOVES: Record<number, { name: string; fieldName: string }> = {
  15: { name: 'CUT', fieldName: 'cut' },
  19: { name: 'FLY', fieldName: 'fly' },
  57: { name: 'SURF', fieldName: 'surf' },
  70: { name: 'STRENGTH', fieldName: 'strength' },
  148: { name: 'FLASH', fieldName: 'flash' },
};

export class PartyScreen {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private visible = false;
  private onClose: (() => void) | null = null;
  private onFieldMove: ((moveId: number) => void) | null = null;

  // State
  private party: PokemonInstance[] = [];
  private cursorIndex = 0;
  private mode: 'list' | 'options' | 'summary' | 'switch' = 'list';
  private switchFromIndex = -1;

  // Display objects
  private bg!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;
  private rowTexts: Phaser.GameObjects.Text[] = [];
  private hpBars: Phaser.GameObjects.Graphics[] = [];
  private cursorText!: Phaser.GameObjects.Text;

  // Options sub-menu
  private optionsContainer!: Phaser.GameObjects.Container;
  private optionsCursor!: Phaser.GameObjects.Text;
  private optionsIndex = 0;
  private currentOptionLabels: string[] = [];
  private readonly baseOptionLabels = ['SUMMARY', 'SWITCH', 'CANCEL'];

  // Summary sub-view
  private summaryContainer!: Phaser.GameObjects.Container;

  // Input
  private inputBound = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.bg = scene.add.graphics();
    this.bg.fillStyle(0xf8f8f8, 1);
    this.bg.fillRoundedRect(0, 0, GAME_WIDTH, GAME_HEIGHT, 2);
    this.bg.lineStyle(2, 0x383838, 1);
    this.bg.strokeRoundedRect(1, 1, GAME_WIDTH - 2, GAME_HEIGHT - 2, 2);

    this.titleText = scene.add.text(GAME_WIDTH / 2, 4, 'POKeMON', {
      fontSize: '8px', color: '#383838', fontFamily: 'monospace',
    }).setOrigin(0.5, 0);

    // Party rows (up to 6)
    for (let i = 0; i < 6; i++) {
      const text = scene.add.text(16, 16 + i * 20, '', {
        fontSize: '7px', color: '#383838', fontFamily: 'monospace',
      });
      this.rowTexts.push(text);

      const hpBar = scene.add.graphics();
      this.hpBars.push(hpBar);
    }

    this.cursorText = scene.add.text(6, 16, '>', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    });

    // Options sub-menu (built dynamically when opened)
    this.optionsCursor = scene.add.text(4, 4, '>', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    });
    this.optionsContainer = scene.add.container(GAME_WIDTH - 68, 30);
    this.optionsContainer.setVisible(false);

    // Summary sub-view
    const sumBg = scene.add.graphics();
    sumBg.fillStyle(0xf8f8f8, 1);
    sumBg.fillRoundedRect(0, 0, GAME_WIDTH, GAME_HEIGHT, 2);
    sumBg.lineStyle(2, 0x383838, 1);
    sumBg.strokeRoundedRect(1, 1, GAME_WIDTH - 2, GAME_HEIGHT - 2, 2);

    const sumText = scene.add.text(6, 6, '', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
      lineSpacing: 2,
      wordWrap: { width: GAME_WIDTH - 12 },
    });
    sumText.setName('summaryText');

    const sumHpBar = scene.add.graphics();
    sumHpBar.setName('summaryHpBar');

    this.summaryContainer = scene.add.container(0, 0, [sumBg, sumText, sumHpBar]);
    this.summaryContainer.setVisible(false);

    this.container = scene.add.container(0, 0, [
      this.bg, this.titleText, ...this.rowTexts, ...this.hpBars,
      this.cursorText, this.optionsContainer, this.summaryContainer,
    ]);
    this.container.setDepth(950);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);
  }

  show(party: PokemonInstance[], onClose: () => void, onFieldMove?: (moveId: number) => void): void {
    this.party = party;
    this.onClose = onClose;
    this.onFieldMove = onFieldMove || null;
    this.mode = 'list';
    this.cursorIndex = 0;
    this.switchFromIndex = -1;
    this.container.setVisible(true);
    this.optionsContainer.setVisible(false);
    this.summaryContainer.setVisible(false);
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
    soundSystem.menuMove();

    if (this.mode === 'list' || this.mode === 'switch') {
      this.cursorIndex += dir;
      if (this.cursorIndex < 0) this.cursorIndex = 0;
      if (this.cursorIndex >= this.party.length) this.cursorIndex = this.party.length - 1;
      this.cursorText.setY(16 + this.cursorIndex * 20);
    } else if (this.mode === 'options') {
      this.optionsIndex += dir;
      if (this.optionsIndex < 0) this.optionsIndex = 0;
      if (this.optionsIndex >= this.currentOptionLabels.length) this.optionsIndex = this.currentOptionLabels.length - 1;
      this.optionsCursor.setY(4 + this.optionsIndex * 14);
    }
  }

  private buildOptions(): void {
    // Build options for the selected Pokemon, including field moves
    this.currentOptionLabels = [];
    const pokemon = this.party[this.cursorIndex];
    if (pokemon && this.onFieldMove) {
      for (const move of pokemon.moves) {
        const fm = FIELD_MOVES[move.moveId];
        if (fm) {
          this.currentOptionLabels.push(fm.name);
        }
      }
    }
    this.currentOptionLabels.push(...this.baseOptionLabels);

    // Rebuild options container content
    this.optionsContainer.removeAll(true);
    const optBg = this.scene.add.graphics();
    const optH = this.currentOptionLabels.length * 14 + 8;
    optBg.fillStyle(0xf8f8f8, 1);
    optBg.fillRoundedRect(0, 0, 64, optH, 2);
    optBg.lineStyle(1, 0x383838, 1);
    optBg.strokeRoundedRect(0, 0, 64, optH, 2);
    this.optionsContainer.add(optBg);

    for (let i = 0; i < this.currentOptionLabels.length; i++) {
      const t = this.scene.add.text(14, 4 + i * 14, this.currentOptionLabels[i], {
        fontSize: '7px', color: '#383838', fontFamily: 'monospace',
      });
      this.optionsContainer.add(t);
    }

    this.optionsCursor = this.scene.add.text(4, 4, '>', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    });
    this.optionsContainer.add(this.optionsCursor);
  }

  private confirm(): void {
    soundSystem.menuSelect();

    if (this.mode === 'list') {
      // Open options
      this.mode = 'options';
      this.optionsIndex = 0;
      this.buildOptions();
      this.optionsCursor.setY(4);
      this.optionsContainer.setVisible(true);
    } else if (this.mode === 'options') {
      const option = this.currentOptionLabels[this.optionsIndex];
      if (option === 'SUMMARY') {
        this.showSummary(this.cursorIndex);
      } else if (option === 'SWITCH') {
        this.switchFromIndex = this.cursorIndex;
        this.mode = 'switch';
        this.optionsContainer.setVisible(false);
      } else if (option === 'CANCEL') {
        this.mode = 'list';
        this.optionsContainer.setVisible(false);
      } else {
        // Field move selected - find the move ID
        const entry = Object.entries(FIELD_MOVES).find(([, v]) => v.name === option);
        if (entry && this.onFieldMove) {
          const moveId = parseInt(entry[0]);
          this.hide();
          if (this.onClose) this.onClose();
          this.onFieldMove(moveId);
          return;
        }
      }
    } else if (this.mode === 'switch') {
      if (this.cursorIndex !== this.switchFromIndex) {
        // Swap Pokemon
        const temp = this.party[this.switchFromIndex];
        this.party[this.switchFromIndex] = this.party[this.cursorIndex];
        this.party[this.cursorIndex] = temp;
        this.updateList();
      }
      this.mode = 'list';
      this.switchFromIndex = -1;
    }
  }

  private back(): void {
    soundSystem.menuMove();

    if (this.mode === 'summary') {
      this.mode = 'list';
      this.summaryContainer.setVisible(false);
    } else if (this.mode === 'options') {
      this.mode = 'list';
      this.optionsContainer.setVisible(false);
    } else if (this.mode === 'switch') {
      this.mode = 'list';
      this.switchFromIndex = -1;
    } else {
      this.hide();
      if (this.onClose) this.onClose();
    }
  }

  private updateList(): void {
    for (let i = 0; i < 6; i++) {
      this.hpBars[i].clear();
      if (i >= this.party.length) {
        this.rowTexts[i].setText('');
        continue;
      }

      const p = this.party[i];
      const species = POKEMON_DATA[p.speciesId];
      const name = p.nickname || species?.name || '???';
      const statusStr = p.status !== StatusCondition.NONE ? ` [${p.status.substring(0, 3)}]` : '';
      const switchMark = (this.mode === 'switch' && i === this.switchFromIndex) ? '<>' : '';

      this.rowTexts[i].setText(`${name} Lv${p.level}${statusStr}${switchMark}`);

      // HP bar
      const barX = 16;
      const barY = 26 + i * 20;
      const barW = 60;
      const barH = 3;
      const hpRatio = p.currentHp / p.stats.hp;

      this.hpBars[i].fillStyle(0x383838, 1);
      this.hpBars[i].fillRect(barX, barY, barW, barH);

      let hpColor = 0x00c000;
      if (hpRatio <= 0.25) hpColor = 0xc00000;
      else if (hpRatio <= 0.5) hpColor = 0xc0c000;

      this.hpBars[i].fillStyle(hpColor, 1);
      this.hpBars[i].fillRect(barX, barY, Math.floor(barW * hpRatio), barH);
    }
  }

  private showSummary(index: number): void {
    this.mode = 'summary';
    const p = this.party[index];
    const species = POKEMON_DATA[p.speciesId];
    const name = p.nickname || species?.name || '???';
    const types = species?.types.join(' / ') || '???';
    const statusStr = p.status !== StatusCondition.NONE ? p.status : 'OK';

    const moveLines = p.moves.map(m => {
      const md = MOVES_DATA[m.moveId];
      return `  ${md?.name || '???'} ${m.currentPp}/${m.maxPp}`;
    }).join('\n');

    const lines = [
      `${name}  Lv${p.level}`,
      `Type: ${types}`,
      `HP: ${p.currentHp}/${p.stats.hp}`,
      `ATK: ${p.stats.attack}  DEF: ${p.stats.defense}`,
      `SPC: ${p.stats.special}  SPD: ${p.stats.speed}`,
      `Status: ${statusStr}`,
      '',
      'Moves:',
      moveLines,
    ];

    const sumText = this.summaryContainer.getByName('summaryText') as Phaser.GameObjects.Text;
    sumText.setText(lines.join('\n'));

    // HP bar on summary
    const sumHpBar = this.summaryContainer.getByName('summaryHpBar') as Phaser.GameObjects.Graphics;
    sumHpBar.clear();
    const barX = 40;
    const barY = 30;
    const barW = 80;
    const barH = 4;
    const hpRatio = p.currentHp / p.stats.hp;

    sumHpBar.fillStyle(0x383838, 1);
    sumHpBar.fillRect(barX, barY, barW, barH);

    let hpColor = 0x00c000;
    if (hpRatio <= 0.25) hpColor = 0xc00000;
    else if (hpRatio <= 0.5) hpColor = 0xc0c000;

    sumHpBar.fillStyle(hpColor, 1);
    sumHpBar.fillRect(barX, barY, Math.floor(barW * hpRatio), barH);

    this.summaryContainer.setVisible(true);
  }

  destroy(): void {
    this.container.destroy();
  }
}
