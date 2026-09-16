import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';
import { HealthBar } from './HealthBar';
import { PokemonInstance } from '../types/pokemon.types';
import { POKEMON_DATA } from '../data/pokemon';
import { statusBadge } from '../logic/statusBadge';
import { expProgress, ExpSegment } from '../logic/expBar';

// Gen I Yellow draws a thin EXP bar along the bottom of the PLAYER's box only
// (the opponent's box has no room and no meaning for it). Geometry is in whole
// pixels on the 160x144 framebuffer: a 1px dark track with a light fill.
const EXP_BAR_X = GAME_WIDTH - 74;   // same left edge as the player HP bar
const EXP_BAR_Y = 92;
const EXP_BAR_WIDTH = 62;            // same width as the player HP bar
const EXP_BAR_HEIGHT = 2;
const EXP_TRACK_COLOR = 0x383838;    // COLORS.MENU_BORDER, as the HP bar's track
const EXP_FILL_COLOR = 0xc0c0c0;     // COLORS.LIGHT_GRAY
// A full bar that wraps on the very frame it fills is never actually seen:
// hold it full for a beat, the way Yellow does, before the level ticks over.
const EXP_LEVEL_HOLD_MS = 150;

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
  private playerExpTrack: Phaser.GameObjects.Graphics;
  private playerExpFill: Phaser.GameObjects.Graphics;
  private playerExpFraction = 0;

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

    // EXP bar - player box only.
    this.playerExpTrack = scene.add.graphics();
    this.playerExpTrack.fillStyle(EXP_TRACK_COLOR, 1);
    this.playerExpTrack.fillRect(
      EXP_BAR_X - 1, EXP_BAR_Y - 1, EXP_BAR_WIDTH + 2, EXP_BAR_HEIGHT + 2,
    );
    this.playerExpTrack.setDepth(101);
    this.playerExpTrack.setScrollFactor(0);

    this.playerExpFill = scene.add.graphics();
    this.playerExpFill.setDepth(102);
    this.playerExpFill.setScrollFactor(0);
    this.setPlayerExp(0);
  }

  /** Draw the EXP fill at `fraction` (0..1). Widths stay whole pixels. */
  private setPlayerExp(fraction: number): void {
    this.playerExpFraction = Phaser.Math.Clamp(fraction, 0, 1);
    this.playerExpFill.clear();
    const width = Math.round(EXP_BAR_WIDTH * this.playerExpFraction);
    if (width <= 0) return;
    this.playerExpFill.fillStyle(EXP_FILL_COLOR, 1);
    this.playerExpFill.fillRect(EXP_BAR_X, EXP_BAR_Y, width, EXP_BAR_HEIGHT);
  }

  /** How full the EXP bar currently is - the value the bar is drawn from. */
  getPlayerExpFraction(): number {
    return this.playerExpFraction;
  }

  /** Where the EXP bar's fill lives, for the e2e runner's geometry check. */
  getPlayerExpBarRect(): { x: number; y: number; width: number; height: number } {
    return { x: EXP_BAR_X, y: EXP_BAR_Y, width: EXP_BAR_WIDTH, height: EXP_BAR_HEIGHT };
  }

  /**
   * Run the bar through `segments` in order: fill to the segment's end, and
   * when that end is a full bar (a level was crossed) tick the level text to
   * the next segment's level and snap back to empty before carrying on.
   *
   * Each leg is timed by how much of the bar it covers, so `msPerFull` is the
   * cost of a whole empty-to-full sweep and a tiny gain stays snappy.
   */
  animatePlayerExp(segments: ExpSegment[], msPerFull: number = 600): Promise<void> {
    if (!segments.length) return Promise.resolve();

    const runSegment = (index: number): Promise<void> => {
      const seg = segments[index];
      if (!seg) return Promise.resolve();
      const next = segments[index + 1];
      const duration = Math.max(1, Math.round(msPerFull * Math.abs(seg.to - seg.from)));

      return new Promise<void>(resolve => {
        this.setPlayerExp(seg.from);
        const counter = { value: 0 };
        this.scene.tweens.add({
          targets: counter,
          value: 1,
          duration,
          onUpdate: () => this.setPlayerExp(seg.from + (seg.to - seg.from) * counter.value),
          onComplete: () => {
            this.setPlayerExp(seg.to);
            if (!next) { resolve(); return; }
            // The level the bar just finished is behind us: let the full bar
            // sit for a beat, then show the new level and wrap to empty before
            // the next leg starts.
            this.scene.time.delayedCall(EXP_LEVEL_HOLD_MS, () => {
              this.playerLevelText.setText(`Lv${next.level}`);
              this.setPlayerExp(next.from);
              resolve();
            });
          },
        });
      }).then(() => (next ? runSegment(index + 1) : undefined));
    };

    return runSegment(0);
  }

  private updateStatus(
    pokemon: PokemonInstance,
    statusBg: Phaser.GameObjects.Graphics,
    statusText: Phaser.GameObjects.Text,
  ): void {
    const info = statusBadge(pokemon.status);
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
    this.setPlayerExp(expProgress(pokemon).fraction);
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

  setGhostMode(): void {
    this.opponentNameText.setText('GHOST');
    this.opponentLevelText.setText('??');
    this.opponentHealthBar.setVisible(false);
  }

  destroy(): void {
    this.playerBox.destroy();
    this.playerNameText.destroy();
    this.playerLevelText.destroy();
    this.playerHPText.destroy();
    this.playerHealthBar.destroy();
    this.playerStatusBg.destroy();
    this.playerStatusText.destroy();
    this.playerExpTrack.destroy();
    this.playerExpFill.destroy();
    this.opponentBox.destroy();
    this.opponentNameText.destroy();
    this.opponentLevelText.destroy();
    this.opponentHealthBar.destroy();
    this.opponentStatusBg.destroy();
    this.opponentStatusText.destroy();
  }
}
