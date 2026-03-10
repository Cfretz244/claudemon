import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';
import { HealthBar } from './HealthBar';
import { PokemonInstance, StatusCondition } from '../types/pokemon.types';
import { POKEMON_DATA } from '../data/pokemon';

const STATUS_LABELS: Record<string, { text: string; color: string; bg: string }> = {
  [StatusCondition.POISON]: { text: 'PSN', color: '#ffffff', bg: '#a040a0' },
  [StatusCondition.BURN]: { text: 'BRN', color: '#ffffff', bg: '#f08030' },
  [StatusCondition.SLEEP]: { text: 'SLP', color: '#ffffff', bg: '#a8a878' },
  [StatusCondition.PARALYSIS]: { text: 'PAR', color: '#000000', bg: '#f8d030' },
  [StatusCondition.FREEZE]: { text: 'FRZ', color: '#000000', bg: '#98d8d8' },
};

export class BattleHUD {
  private scene: Phaser.Scene;

  // Player HUD (bottom-right)
  private playerBox: Phaser.GameObjects.Graphics;
  private playerNameText: Phaser.GameObjects.Text;
  private playerLevelText: Phaser.GameObjects.Text;
  private playerHPText: Phaser.GameObjects.Text;
  private playerHealthBar: HealthBar;
  private playerStatusBg: Phaser.GameObjects.Graphics;
  private playerStatusText: Phaser.GameObjects.Text;

  // Opponent HUD (top-left)
  private opponentBox: Phaser.GameObjects.Graphics;
  private opponentNameText: Phaser.GameObjects.Text;
  private opponentLevelText: Phaser.GameObjects.Text;
  private opponentHealthBar: HealthBar;
  private opponentStatusBg: Phaser.GameObjects.Graphics;
  private opponentStatusText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Opponent HUD (top-left)
    this.opponentBox = scene.add.graphics();
    this.opponentBox.fillStyle(0xf8f8f8, 1);
    this.opponentBox.fillRoundedRect(2, 4, 78, 26, 2);
    this.opponentBox.lineStyle(1, 0x383838, 1);
    this.opponentBox.strokeRoundedRect(2, 4, 78, 26, 2);
    this.opponentBox.setDepth(100);
    this.opponentBox.setScrollFactor(0);

    this.opponentNameText = scene.add.text(6, 6, '', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    }).setDepth(101).setScrollFactor(0);

    this.opponentLevelText = scene.add.text(56, 6, '', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    }).setDepth(101).setScrollFactor(0);

    this.opponentHealthBar = new HealthBar(scene, 10, 20, 62, 3);

    // Opponent status - on name row, between name and level
    this.opponentStatusBg = scene.add.graphics().setDepth(101).setScrollFactor(0).setVisible(false);
    this.opponentStatusText = scene.add.text(42, 7, '', {
      fontSize: '6px', color: '#ffffff', fontFamily: 'monospace',
    }).setDepth(102).setScrollFactor(0).setVisible(false);

    // Player HUD (bottom-right)
    this.playerBox = scene.add.graphics();
    this.playerBox.fillStyle(0xf8f8f8, 1);
    this.playerBox.fillRoundedRect(GAME_WIDTH - 82, 64, 80, 32, 2);
    this.playerBox.lineStyle(1, 0x383838, 1);
    this.playerBox.strokeRoundedRect(GAME_WIDTH - 82, 64, 80, 32, 2);
    this.playerBox.setDepth(100);
    this.playerBox.setScrollFactor(0);

    this.playerNameText = scene.add.text(GAME_WIDTH - 78, 66, '', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    }).setDepth(101).setScrollFactor(0);

    this.playerLevelText = scene.add.text(GAME_WIDTH - 30, 66, '', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    }).setDepth(101).setScrollFactor(0);

    this.playerHealthBar = new HealthBar(scene, GAME_WIDTH - 74, 78, 62, 3);

    this.playerHPText = scene.add.text(GAME_WIDTH - 74, 84, '', {
      fontSize: '6px', color: '#383838', fontFamily: 'monospace',
    }).setDepth(101).setScrollFactor(0);

    // Player status - on name row, between name and level
    this.playerStatusBg = scene.add.graphics().setDepth(101).setScrollFactor(0).setVisible(false);
    this.playerStatusText = scene.add.text(GAME_WIDTH - 44, 67, '', {
      fontSize: '6px', color: '#ffffff', fontFamily: 'monospace',
    }).setDepth(102).setScrollFactor(0).setVisible(false);
  }

  private updateStatus(
    pokemon: PokemonInstance,
    statusBg: Phaser.GameObjects.Graphics,
    statusText: Phaser.GameObjects.Text,
  ): void {
    const info = STATUS_LABELS[pokemon.status];
    if (!info) {
      statusBg.setVisible(false);
      statusText.setVisible(false);
      return;
    }
    const x = statusText.x;
    const y = statusText.y;
    statusText.setText(info.text);
    statusText.setColor(info.color);
    statusText.setVisible(true);

    statusBg.clear();
    statusBg.fillStyle(Phaser.Display.Color.HexStringToColor(info.bg).color, 1);
    const textWidth = statusText.width;
    statusBg.fillRoundedRect(x - 1, y - 1, textWidth + 2, 8, 1);
    statusBg.setVisible(true);
  }

  updatePlayer(pokemon: PokemonInstance): void {
    const species = POKEMON_DATA[pokemon.speciesId];
    const name = pokemon.nickname || species?.name || '???';
    this.playerNameText.setText(name.substring(0, 10));
    this.playerLevelText.setText(`Lv${pokemon.level}`);
    this.playerHPText.setText(`${pokemon.currentHp}/${pokemon.stats.hp}`);
    this.playerHealthBar.setPercent(pokemon.currentHp / pokemon.stats.hp);
    this.updateStatus(pokemon, this.playerStatusBg, this.playerStatusText);
  }

  updateOpponent(pokemon: PokemonInstance): void {
    const species = POKEMON_DATA[pokemon.speciesId];
    const name = pokemon.nickname || species?.name || '???';
    this.opponentNameText.setText(name.substring(0, 10));
    this.opponentLevelText.setText(`Lv${pokemon.level}`);
    this.opponentHealthBar.setPercent(pokemon.currentHp / pokemon.stats.hp);
    this.updateStatus(pokemon, this.opponentStatusBg, this.opponentStatusText);
  }

  animatePlayerHP(targetPercent: number, duration: number = 500): Promise<void> {
    return this.playerHealthBar.animateTo(targetPercent, duration);
  }

  animateOpponentHP(targetPercent: number, duration: number = 500): Promise<void> {
    return this.opponentHealthBar.animateTo(targetPercent, duration);
  }

  destroy(): void {
    this.playerBox.destroy();
    this.playerNameText.destroy();
    this.playerLevelText.destroy();
    this.playerHPText.destroy();
    this.playerHealthBar.destroy();
    this.playerStatusBg.destroy();
    this.playerStatusText.destroy();
    this.opponentBox.destroy();
    this.opponentNameText.destroy();
    this.opponentLevelText.destroy();
    this.opponentHealthBar.destroy();
    this.opponentStatusBg.destroy();
    this.opponentStatusText.destroy();
  }
}
