import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';
import { HealthBar } from './HealthBar';
import { PokemonInstance } from '../types/pokemon.types';
import { POKEMON_DATA } from '../data/pokemon';

export class BattleHUD {
  private scene: Phaser.Scene;

  // Player HUD (bottom-right)
  private playerBox: Phaser.GameObjects.Graphics;
  private playerNameText: Phaser.GameObjects.Text;
  private playerLevelText: Phaser.GameObjects.Text;
  private playerHPText: Phaser.GameObjects.Text;
  private playerHealthBar: HealthBar;

  // Opponent HUD (top-left)
  private opponentBox: Phaser.GameObjects.Graphics;
  private opponentNameText: Phaser.GameObjects.Text;
  private opponentLevelText: Phaser.GameObjects.Text;
  private opponentHealthBar: HealthBar;

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
  }

  updatePlayer(pokemon: PokemonInstance): void {
    const species = POKEMON_DATA[pokemon.speciesId];
    const name = pokemon.nickname || species?.name || '???';
    this.playerNameText.setText(name.substring(0, 10));
    this.playerLevelText.setText(`Lv${pokemon.level}`);
    this.playerHPText.setText(`${pokemon.currentHp}/${pokemon.stats.hp}`);
    this.playerHealthBar.setPercent(pokemon.currentHp / pokemon.stats.hp);
  }

  updateOpponent(pokemon: PokemonInstance): void {
    const species = POKEMON_DATA[pokemon.speciesId];
    const name = pokemon.nickname || species?.name || '???';
    this.opponentNameText.setText(name.substring(0, 10));
    this.opponentLevelText.setText(`Lv${pokemon.level}`);
    this.opponentHealthBar.setPercent(pokemon.currentHp / pokemon.stats.hp);
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
    this.opponentBox.destroy();
    this.opponentNameText.destroy();
    this.opponentLevelText.destroy();
    this.opponentHealthBar.destroy();
  }
}
