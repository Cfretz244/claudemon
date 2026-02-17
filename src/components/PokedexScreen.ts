import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';
import { POKEMON_DATA } from '../data/pokemon';
import { soundSystem } from '../systems/SoundSystem';
import { generatePokemonSprite, getShapeForSpecies } from '../utils/spriteGenerator';

export class PokedexScreen {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private visible = false;
  private onClose: (() => void) | null = null;

  // List state
  private cursorIndex = 0;
  private scrollOffset = 0;
  private readonly visibleRows = 8;
  private readonly totalEntries = 151;

  // Pokedex data refs
  private pokedexSeen: number[] = [];
  private pokedexCaught: number[] = [];

  // Display objects
  private bg!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;
  private footerText!: Phaser.GameObjects.Text;
  private rowTexts: Phaser.GameObjects.Text[] = [];
  private cursorText!: Phaser.GameObjects.Text;

  // Detail sub-view
  private detailContainer!: Phaser.GameObjects.Container;
  private detailSprite: Phaser.GameObjects.Sprite | null = null;
  private inDetail = false;

  // Input
  private inputBound = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.bg = scene.add.graphics();
    this.bg.fillStyle(0xf8f8f8, 1);
    this.bg.fillRoundedRect(0, 0, GAME_WIDTH, GAME_HEIGHT, 2);
    this.bg.lineStyle(2, 0x383838, 1);
    this.bg.strokeRoundedRect(1, 1, GAME_WIDTH - 2, GAME_HEIGHT - 2, 2);

    this.titleText = scene.add.text(GAME_WIDTH / 2, 6, 'POKeDEX', {
      fontSize: '8px', color: '#383838', fontFamily: 'monospace',
    }).setOrigin(0.5, 0);

    // List rows
    for (let i = 0; i < this.visibleRows; i++) {
      const text = scene.add.text(16, 18 + i * 13, '', {
        fontSize: '7px', color: '#383838', fontFamily: 'monospace',
      });
      this.rowTexts.push(text);
    }

    this.cursorText = scene.add.text(6, 18, '>', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    });

    this.footerText = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 10, '', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    }).setOrigin(0.5, 0);

    // Detail sub-view
    const detailBg = scene.add.graphics();
    detailBg.fillStyle(0xf8f8f8, 1);
    detailBg.fillRoundedRect(0, 0, GAME_WIDTH, GAME_HEIGHT, 2);
    detailBg.lineStyle(2, 0x383838, 1);
    detailBg.strokeRoundedRect(1, 1, GAME_WIDTH - 2, GAME_HEIGHT - 2, 2);

    const detailText = scene.add.text(8, 8, '', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
      lineSpacing: 3,
      wordWrap: { width: GAME_WIDTH - 16 },
    });
    detailText.setName('detailText');

    this.detailContainer = scene.add.container(0, 0, [detailBg, detailText]);
    this.detailContainer.setVisible(false);

    this.container = scene.add.container(0, 0, [
      this.bg, this.titleText, ...this.rowTexts, this.cursorText,
      this.footerText, this.detailContainer,
    ]);
    this.container.setDepth(950);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);
  }

  show(pokedexSeen: number[], pokedexCaught: number[], onClose: () => void): void {
    this.pokedexSeen = pokedexSeen;
    this.pokedexCaught = pokedexCaught;
    this.onClose = onClose;
    this.inDetail = false;
    this.cursorIndex = 0;
    this.scrollOffset = 0;
    this.container.setVisible(true);
    this.detailContainer.setVisible(false);
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
    if (this.inDetail) return;
    soundSystem.menuMove();

    this.cursorIndex += dir;
    if (this.cursorIndex < 0) this.cursorIndex = 0;
    if (this.cursorIndex >= this.totalEntries) this.cursorIndex = this.totalEntries - 1;

    // Scroll window
    if (this.cursorIndex < this.scrollOffset) {
      this.scrollOffset = this.cursorIndex;
    }
    if (this.cursorIndex >= this.scrollOffset + this.visibleRows) {
      this.scrollOffset = this.cursorIndex - this.visibleRows + 1;
    }

    this.updateList();
  }

  private confirm(): void {
    if (this.inDetail) return;

    const dexNum = this.cursorIndex + 1;
    if (this.pokedexSeen.includes(dexNum) || this.pokedexCaught.includes(dexNum)) {
      soundSystem.menuSelect();
      this.showDetail(dexNum);
    }
  }

  private back(): void {
    soundSystem.menuMove();
    if (this.inDetail) {
      this.inDetail = false;
      this.detailContainer.setVisible(false);
      if (this.detailSprite) {
        this.detailSprite.destroy();
        this.detailSprite = null;
      }
    } else {
      this.hide();
      if (this.onClose) this.onClose();
    }
  }

  private updateList(): void {
    for (let i = 0; i < this.visibleRows; i++) {
      const entryIndex = this.scrollOffset + i;
      if (entryIndex >= this.totalEntries) {
        this.rowTexts[i].setText('');
        continue;
      }

      const dexNum = entryIndex + 1;
      const numStr = String(dexNum).padStart(3, '0');
      const species = POKEMON_DATA[dexNum];
      const name = species?.name || '?????';

      let icon = '-';
      if (this.pokedexCaught.includes(dexNum)) icon = '@';
      else if (this.pokedexSeen.includes(dexNum)) icon = '*';

      const displayName = (icon === '-') ? '-----' : name;
      this.rowTexts[i].setText(`${icon} #${numStr} ${displayName}`);
    }

    // Update cursor position
    const cursorRow = this.cursorIndex - this.scrollOffset;
    this.cursorText.setY(18 + cursorRow * 13);

    // Update footer
    const seen = this.pokedexSeen.length;
    const caught = this.pokedexCaught.length;
    this.footerText.setText(`SEEN:${seen}  CAUGHT:${caught}`);
  }

  private ensurePokemonSprite(speciesId: number): void {
    const key = `pokemon_${speciesId}`;
    if (!this.scene.textures.exists(key)) {
      const species = POKEMON_DATA[speciesId];
      if (species) {
        const shape = getShapeForSpecies(speciesId, species.types);
        generatePokemonSprite(this.scene, key, species.spriteColor, species.spriteColor2, shape, speciesId);
      }
    }
  }

  private showDetail(dexNum: number): void {
    this.inDetail = true;
    const species = POKEMON_DATA[dexNum];
    if (!species) return;

    const isCaught = this.pokedexCaught.includes(dexNum);
    const status = isCaught ? 'CAUGHT' : 'SEEN';
    const types = species.types.join(' / ');
    const bs = species.baseStats;

    // Remove previous sprite if any
    if (this.detailSprite) {
      this.detailSprite.destroy();
      this.detailSprite = null;
    }

    // Show sprite for caught Pokemon
    let textY = 8;
    if (isCaught) {
      this.ensurePokemonSprite(dexNum);
      const key = `pokemon_${dexNum}`;
      if (this.scene.textures.exists(key)) {
        this.detailSprite = this.scene.add.sprite(GAME_WIDTH / 2, 28, key, 0);
        this.detailContainer.add(this.detailSprite);
        textY = 50;
      }
    }

    const lines = [
      `#${String(dexNum).padStart(3, '0')} ${species.name}`,
      `Type: ${types}`,
      `Status: ${status}`,
      '',
      'Base Stats:',
      ` HP:  ${bs.hp}`,
      ` ATK: ${bs.attack}`,
      ` DEF: ${bs.defense}`,
      ` SPC: ${bs.special}`,
      ` SPD: ${bs.speed}`,
    ];

    const detailText = this.detailContainer.getByName('detailText') as Phaser.GameObjects.Text;
    detailText.setY(textY);
    detailText.setText(lines.join('\n'));
    this.detailContainer.setVisible(true);
  }

  destroy(): void {
    this.container.destroy();
  }
}
