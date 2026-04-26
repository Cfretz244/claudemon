import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';
import { soundSystem } from '../systems/SoundSystem';
import { PlayerState } from '../entities/Player';
import {
  spin,
  REEL_STRIPS,
  PAYOUT_TABLE,
  Bet,
  SlotSymbol,
  SpinResult,
} from '../logic/slotMachine';
import { SLOT_SYMBOL_TEXTURE } from '../utils/slotSymbolGenerator';

const CELL_H = 20;
const CELL_W = 22;
const WINDOW_H = CELL_H * 3;          // 60 px — 3 visible cells
const STRIP_LEN = 21;
const REEL_X = [8, 32, 56];           // left edge of each reel container
const REEL_Y = 22;                    // top of reel mask
const WIN_LINE_Y = REEL_Y + CELL_H + Math.floor(CELL_H / 2); // y=42, middle of middle cell

type Mode = 'idle' | 'spinning' | 'stopping' | 'evaluating' | 'message';
type Action = 'SPIN' | 'STOP' | 'QUIT';

const TEXT_DARK = '#383838';
const TEXT_RED = '#c84830';
const FILL_BG = 0xf8f8f8;
const BORDER = 0x383838;
const WIN_LINE_COLOR = 0xf8d030;
const MAT_GREEN = 0x88c070;

export class SlotMachineScreen {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private active = false;
  private inputBound = false;
  private playerState!: PlayerState;
  private onClose: (() => void) | null = null;

  // HUD
  private coinText!: Phaser.GameObjects.Text;
  private betSquares: Phaser.GameObjects.Graphics[] = [];
  private costText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;

  // Reels
  private reelContainers: Phaser.GameObjects.Container[] = [];
  private reelSpinTweens: Array<Phaser.Tweens.Tween | null> = [null, null, null];
  private reelGlows: Phaser.GameObjects.Graphics[] = [];
  private winLine!: Phaser.GameObjects.Graphics;

  // Action bar
  private actionTexts: Phaser.GameObjects.Text[] = [];
  private actionCursor!: Phaser.GameObjects.Text;
  private actionLabels: Action[] = ['SPIN', 'QUIT'];
  private actionIndex = 0;

  // State
  private mode: Mode = 'idle';
  private bet: Bet = 1;
  private currentResult: SpinResult | null = null;
  private nextReelToStop = 0;
  private autoStopEvents: Phaser.Time.TimerEvent[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Cabinet background — full screen, 2px rounded border, matches ShopScreen
    const bg = scene.add.graphics();
    bg.fillStyle(FILL_BG, 1);
    bg.fillRoundedRect(0, 0, GAME_WIDTH, GAME_HEIGHT, 2);
    bg.lineStyle(2, BORDER, 1);
    bg.strokeRoundedRect(1, 1, GAME_WIDTH - 2, GAME_HEIGHT - 2, 2);

    // Top HUD divider
    const topDiv = scene.add.graphics();
    topDiv.lineStyle(1, BORDER, 1);
    topDiv.lineBetween(4, 14, GAME_WIDTH - 4, 14);

    // Title
    const title = scene.add.text(4, 4, 'SLOTS', {
      fontSize: '7px', color: TEXT_DARK, fontFamily: 'monospace',
    });

    // COIN counter (top-right)
    this.coinText = scene.add.text(GAME_WIDTH - 4, 4, 'COIN 0000', {
      fontSize: '7px', color: TEXT_DARK, fontFamily: 'monospace',
    }).setOrigin(1, 0);

    // BET indicator: 3 small squares centered
    const betLabel = scene.add.text(60, 4, 'BET', {
      fontSize: '7px', color: TEXT_DARK, fontFamily: 'monospace',
    });
    for (let i = 0; i < 3; i++) {
      const sq = scene.add.graphics();
      sq.fillStyle(BORDER, 1);
      sq.lineStyle(1, BORDER, 1);
      sq.strokeRect(76 + i * 6, 5, 4, 5);
      this.betSquares.push(sq);
    }

    // Cost-of-spin (just below the BET squares would crowd; place to the right)
    this.costText = scene.add.text(98, 4, '×1', {
      fontSize: '7px', color: TEXT_DARK, fontFamily: 'monospace',
    });

    // ── Reel cabinet panel (decorative carpet-mat behind the reels) ──────────
    const reelPanel = scene.add.graphics();
    reelPanel.fillStyle(MAT_GREEN, 1);
    reelPanel.fillRoundedRect(4, REEL_Y - 4, 76, WINDOW_H + 8, 2);
    reelPanel.lineStyle(1, BORDER, 1);
    reelPanel.strokeRoundedRect(4, REEL_Y - 4, 76, WINDOW_H + 8, 2);

    // ── Reel content containers (sprites stacked vertically, 3× strip) ───────
    // Three copies stacked so the spin can wrap visually with plenty of margin
    // above and below the mask in either scroll direction.
    for (let r = 0; r < 3; r++) {
      const rc = scene.add.container(REEL_X[r] + CELL_W / 2, 0);
      rc.setScrollFactor(0);
      const strip = REEL_STRIPS[r as 0 | 1 | 2];
      for (let copy = 0; copy < 3; copy++) {
        for (let i = 0; i < strip.length; i++) {
          const idx = copy * strip.length + i;
          const sprite = scene.add.image(0, idx * CELL_H + CELL_H / 2, SLOT_SYMBOL_TEXTURE[strip[i]]);
          sprite.setOrigin(0.5, 0.5);
          rc.add(sprite);
        }
      }
      // Mask each container to its window. The mask graphics needs
      // scrollFactor=0 so it stays aligned with the screen-fixed reel
      // container even when the underlying camera has scrolled.
      const maskShape = scene.make.graphics({ x: 0, y: 0 });
      maskShape.fillStyle(0xffffff);
      maskShape.fillRect(REEL_X[r], REEL_Y, CELL_W, WINDOW_H);
      maskShape.setScrollFactor(0);
      rc.setMask(maskShape.createGeometryMask());
      this.setReelStaticPosition(rc, r as 0 | 1 | 2, 0);
      this.reelContainers.push(rc);

      // Per-reel glow (yellow flash on win)
      const glow = scene.add.graphics();
      glow.lineStyle(1, WIN_LINE_COLOR, 1);
      glow.strokeRect(REEL_X[r] - 1, REEL_Y - 1, CELL_W + 2, WINDOW_H + 2);
      glow.setVisible(false);
      this.reelGlows.push(glow);
    }

    // Win line (highlighted strip across the middle row)
    this.winLine = scene.add.graphics();
    this.winLine.fillStyle(WIN_LINE_COLOR, 0.55);
    this.winLine.fillRect(REEL_X[0], WIN_LINE_Y - 1, REEL_X[2] + CELL_W - REEL_X[0], 2);

    // Stop indicator arrows below each reel
    const stopArrows: Phaser.GameObjects.Text[] = [];
    for (let r = 0; r < 3; r++) {
      const t = scene.add.text(REEL_X[r] + CELL_W / 2, REEL_Y + WINDOW_H + 2, '▼', {
        fontSize: '7px', color: TEXT_DARK, fontFamily: 'monospace',
      }).setOrigin(0.5, 0);
      stopArrows.push(t);
    }

    // ── Prize panel on the right ─────────────────────────────────────────────
    const prizeBg = scene.add.graphics();
    prizeBg.fillStyle(FILL_BG, 1);
    prizeBg.fillRoundedRect(84, REEL_Y - 4, GAME_WIDTH - 88, WINDOW_H + 8, 2);
    prizeBg.lineStyle(1, BORDER, 1);
    prizeBg.strokeRoundedRect(84, REEL_Y - 4, GAME_WIDTH - 88, WINDOW_H + 8, 2);

    const prizeTitle = scene.add.text(86, REEL_Y - 2, 'PRIZES', {
      fontSize: '7px', color: TEXT_DARK, fontFamily: 'monospace',
    });

    const prizeRows: Array<[string, SlotSymbol | 'REPLAY']> = [
      ['777', 'SEVEN'],
      ['PIK', 'PIKACHU'],
      ['POK', 'JIGGLY'],
      ['BAR', 'BAR'],
      ['CHE', 'CHERRY'],
      ['RPL', 'REPLAY'],
    ];
    const prizeTextObjs: Phaser.GameObjects.Text[] = [];
    for (let i = 0; i < prizeRows.length; i++) {
      const [label, sym] = prizeRows[i];
      const row = scene.add.text(86, REEL_Y + 6 + i * 9, '', {
        fontSize: '7px', color: TEXT_DARK, fontFamily: 'monospace',
      });
      row.setData('label', label);
      row.setData('sym', sym);
      prizeTextObjs.push(row);
    }

    // ── Bottom panel: action bar + status message ────────────────────────────
    const bottomDiv = scene.add.graphics();
    bottomDiv.lineStyle(1, BORDER, 1);
    bottomDiv.lineBetween(4, REEL_Y + WINDOW_H + 12, GAME_WIDTH - 4, REEL_Y + WINDOW_H + 12);

    // Action labels — shown one at a time depending on mode
    this.actionTexts = [];
    const labelDefs: Action[] = ['SPIN', 'QUIT'];
    for (let i = 0; i < labelDefs.length; i++) {
      const t = scene.add.text(20 + i * 50, REEL_Y + WINDOW_H + 16, labelDefs[i], {
        fontSize: '7px', color: TEXT_DARK, fontFamily: 'monospace',
      });
      this.actionTexts.push(t);
    }
    this.actionCursor = scene.add.text(12, REEL_Y + WINDOW_H + 16, '>', {
      fontSize: '7px', color: TEXT_DARK, fontFamily: 'monospace',
    });

    // Status message
    this.statusText = scene.add.text(8, REEL_Y + WINDOW_H + 26, '', {
      fontSize: '7px', color: TEXT_DARK, fontFamily: 'monospace',
      wordWrap: { width: GAME_WIDTH - 16 },
    });

    this.container = scene.add.container(0, 0, [
      bg, topDiv, title, this.coinText, betLabel, ...this.betSquares, this.costText,
      reelPanel,
      ...this.reelContainers.map(() => scene.add.graphics()), // placeholder spacing
      this.winLine,
      ...this.reelContainers,
      ...this.reelGlows,
      ...stopArrows,
      prizeBg, prizeTitle, ...prizeTextObjs,
      bottomDiv, ...this.actionTexts, this.actionCursor,
      this.statusText,
    ]);

    // Re-add reel windows + reels to ensure proper draw order. Simpler: rebuild.
    this.container.removeAll(false);
    // Add layers in correct order
    this.container.add(bg);
    this.container.add(topDiv);
    this.container.add(title);
    this.container.add(this.coinText);
    this.container.add(betLabel);
    for (const sq of this.betSquares) this.container.add(sq);
    this.container.add(this.costText);
    this.container.add(reelPanel);
    // Per-reel: window box first, then the masked content container, then glow ring
    for (let r = 0; r < 3; r++) {
      const win = scene.add.graphics();
      win.fillStyle(FILL_BG, 1);
      win.fillRect(REEL_X[r], REEL_Y, CELL_W, WINDOW_H);
      win.lineStyle(1, BORDER, 1);
      win.strokeRect(REEL_X[r] - 1, REEL_Y - 1, CELL_W + 2, WINDOW_H + 2);
      this.container.add(win);
    }
    for (const rc of this.reelContainers) this.container.add(rc);
    this.container.add(this.winLine);
    for (const g of this.reelGlows) this.container.add(g);
    for (const a of stopArrows) this.container.add(a);
    this.container.add(prizeBg);
    this.container.add(prizeTitle);
    for (const t of prizeTextObjs) this.container.add(t);
    this.container.add(bottomDiv);
    for (const t of this.actionTexts) this.container.add(t);
    this.container.add(this.actionCursor);
    this.container.add(this.statusText);

    this.container.setDepth(950);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);

    // Stash prize text refs for updates
    this.container.setData('prizeTexts', prizeTextObjs);
  }

  show(playerState: PlayerState, onClose: () => void): void {
    this.playerState = playerState;
    this.onClose = onClose;
    this.bet = 1;
    this.mode = 'idle';
    this.actionIndex = 0;
    this.currentResult = null;
    this.nextReelToStop = 0;

    // Hide STOP initially; show SPIN + QUIT
    this.actionLabels = ['SPIN', 'QUIT'];
    this.actionTexts[0].setText('SPIN').setVisible(true);
    this.actionTexts[1].setText('QUIT').setVisible(true);

    this.updateBetDisplay();
    this.updateCoinDisplay();
    this.updatePrizeTable();
    this.updateActionCursor();
    this.statusText.setText('Press ↑↓ to bet, Z to spin.');

    // Reset reels to a neutral position (target index 0 on each)
    for (let r = 0; r < 3; r++) {
      this.setReelStaticPosition(this.reelContainers[r], r as 0 | 1 | 2, 0);
      this.reelGlows[r].setVisible(false);
    }
    this.winLine.setAlpha(0.55);

    this.container.setVisible(true);
    this.setupInput();
    this.active = false;
    this.scene.time.delayedCall(0, () => { this.active = true; });
  }

  hide(): void {
    this.active = false;
    this.cancelAllSpins();
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

    up.on('down', () => { if (this.active) this.handleVertical(-1); });
    down.on('down', () => { if (this.active) this.handleVertical(1); });
    left.on('down', () => { if (this.active) this.handleHorizontal(-1); });
    right.on('down', () => { if (this.active) this.handleHorizontal(1); });
    z.on('down', () => { if (this.active) this.handleConfirm(); });
    enter.on('down', () => { if (this.active) this.handleConfirm(); });
    x.on('down', () => { if (this.active) this.handleBack(); });
  }

  private handleVertical(dir: number): void {
    if (this.mode !== 'idle' && this.mode !== 'message') return;
    // ↑/↓ change the bet
    const next = (this.bet + dir);
    if (next < 1 || next > 3) return;
    this.bet = next as Bet;
    this.updateBetDisplay();
    this.updatePrizeTable();
    soundSystem.menuMove();
  }

  private handleHorizontal(dir: number): void {
    if (this.mode !== 'idle') return;
    this.actionIndex = (this.actionIndex + dir + this.actionLabels.length) % this.actionLabels.length;
    this.updateActionCursor();
    soundSystem.menuMove();
  }

  private handleConfirm(): void {
    if (this.mode === 'idle') {
      const action = this.actionLabels[this.actionIndex];
      if (action === 'QUIT') {
        this.hide();
        if (this.onClose) this.onClose();
        return;
      }
      if (action === 'SPIN') {
        this.beginSpin();
        return;
      }
    }
    if (this.mode === 'spinning' || this.mode === 'stopping') {
      // Skill stop the next reel
      this.stopNextReel();
      return;
    }
    if (this.mode === 'message') {
      this.exitMessageState();
      return;
    }
  }

  private handleBack(): void {
    if (this.mode === 'idle') {
      this.hide();
      if (this.onClose) this.onClose();
      return;
    }
    if (this.mode === 'message') {
      this.exitMessageState();
      return;
    }
    // Otherwise ignored — can't quit mid-spin
  }

  // ── Spin lifecycle ─────────────────────────────────────────────────────────

  private beginSpin(): void {
    if (this.playerState.coins < this.bet) {
      this.showMessage('Not enough coins!');
      return;
    }
    this.playerState.spendCoins(this.bet);
    this.updateCoinDisplay();
    soundSystem.menuSelect();

    // Determine the outcome up-front; the reels will tween to land on it.
    this.currentResult = spin(Math.random, this.bet);

    this.mode = 'spinning';
    this.nextReelToStop = 0;
    this.statusText.setText('Press Z to stop reels!');

    // Switch action bar to STOP
    this.actionLabels = ['STOP'];
    this.actionTexts[0].setText('STOP').setVisible(true);
    this.actionTexts[1].setVisible(false);
    this.actionIndex = 0;
    this.updateActionCursor();

    // Start all three reels spinning
    for (let r = 0; r < 3; r++) {
      this.startReelSpin(r as 0 | 1 | 2);
    }

    // Auto-stop fallback if the player doesn't press Z
    this.autoStopEvents = [];
    this.autoStopEvents.push(this.scene.time.delayedCall(1500, () => this.stopNextReel()));
    this.autoStopEvents.push(this.scene.time.delayedCall(2100, () => this.stopNextReel()));
    this.autoStopEvents.push(this.scene.time.delayedCall(2700, () => this.stopNextReel()));
  }

  private startReelSpin(r: 0 | 1 | 2): void {
    const rc = this.reelContainers[r];
    const stripPx = STRIP_LEN * CELL_H;
    const baseY = rc.y;
    // Counter goes 0 → stripPx and repeats; rc.y = baseY - (counter mod stripPx).
    // With three strip copies stacked, the wrap from baseY-stripPx back to baseY
    // is visually identical content (every sprite has a duplicate one strip
    // length above/below it), so the cycle reads as continuous scrolling.
    const tween = this.scene.tweens.addCounter({
      from: 0,
      to: stripPx,
      duration: 200,
      ease: 'Linear',
      repeat: -1,
      onUpdate: (t) => {
        rc.y = baseY - (t.getValue() ?? 0);
      },
    });
    this.reelSpinTweens[r] = tween;
  }

  private stopNextReel(): void {
    if (this.mode !== 'spinning' && this.mode !== 'stopping') return;
    if (this.nextReelToStop >= 3) return;
    if (!this.currentResult) return;

    this.mode = 'stopping';
    const reelIdx = this.nextReelToStop;
    const targetIdx = this.currentResult.reelIndices[reelIdx];

    // Cancel that auto-stop event if any
    if (this.autoStopEvents[reelIdx]) {
      this.autoStopEvents[reelIdx].remove(false);
    }

    const tween = this.reelSpinTweens[reelIdx];
    if (tween) {
      tween.stop();
      this.reelSpinTweens[reelIdx] = null;
    }

    // Compute landing y and tween there with easeOut
    const rc = this.reelContainers[reelIdx];
    const desired = this.computeLandY(reelIdx as 0 | 1 | 2, targetIdx);
    // Ensure we always scroll forward (down on screen = container y decreases)
    let landY = desired;
    while (landY > rc.y - 30) landY -= STRIP_LEN * CELL_H;

    this.scene.tweens.add({
      targets: rc,
      y: landY,
      duration: 280,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        soundSystem.menuSelect();
        this.flashReel(reelIdx);
        this.nextReelToStop++;
        if (this.nextReelToStop >= 3) {
          this.evaluate();
        } else {
          this.mode = 'spinning';
        }
      },
    });
  }

  private flashReel(r: number): void {
    const glow = this.reelGlows[r];
    glow.setVisible(true);
    this.scene.time.delayedCall(80, () => glow.setVisible(false));
    this.scene.time.delayedCall(160, () => glow.setVisible(true));
    this.scene.time.delayedCall(240, () => glow.setVisible(false));
  }

  private evaluate(): void {
    if (!this.currentResult) return;
    this.mode = 'evaluating';

    const result = this.currentResult;
    if (result.matchType === 'none') {
      this.statusText.setText('Darn!');
      soundSystem.notVeryEffective?.();
      this.scene.time.delayedCall(500, () => this.returnToIdle());
      return;
    }

    if (result.isReplay) {
      // Refund the bet
      this.playerState.addCoins(this.bet);
      this.updateCoinDisplay();
      this.statusText.setText('REPLAY! Free spin!');
      this.flashAllReels();
      soundSystem.menuSelect();
      this.scene.time.delayedCall(700, () => this.returnToIdle());
      return;
    }

    // Win! Animate payout.
    const label = this.matchTypeLabel(result.matchType);
    this.statusText.setText(`${label} Won ${result.payout} coins!`);
    this.flashAllReels();
    if (result.matchType === 'jackpot_seven') {
      soundSystem.victory?.();
    } else if (result.matchType === 'three_pikachu' || result.matchType === 'three_pokemon') {
      soundSystem.levelUp?.();
    } else {
      soundSystem.balloonPop?.();
    }
    this.tickPayout(result.payout, () => this.returnToIdle());
  }

  private matchTypeLabel(t: SpinResult['matchType']): string {
    switch (t) {
      case 'jackpot_seven': return 'JACKPOT!';
      case 'three_pikachu': return 'BIG WIN!';
      case 'three_pokemon': return 'POKE LINE!';
      case 'three_bar':     return 'BARS!';
      case 'three_cherry':  return 'CHERRIES!';
      case 'two_cherry':    return 'CHERRY!';
      default:              return '';
    }
  }

  private tickPayout(total: number, done: () => void): void {
    let remaining = total;
    const step = total >= 100 ? 5 : 1;
    const tick = () => {
      if (remaining <= 0) { done(); return; }
      const give = Math.min(step, remaining);
      this.playerState.addCoins(give);
      remaining -= give;
      this.updateCoinDisplay();
      if (remaining > 0) {
        this.scene.time.delayedCall(40, tick);
      } else {
        done();
      }
    };
    tick();
  }

  private flashAllReels(): void {
    for (let r = 0; r < 3; r++) this.flashReel(r);
  }

  private returnToIdle(): void {
    this.currentResult = null;
    this.mode = 'idle';
    this.actionLabels = ['SPIN', 'QUIT'];
    this.actionTexts[0].setText('SPIN').setVisible(true);
    this.actionTexts[1].setText('QUIT').setVisible(true);
    this.actionIndex = 0;
    this.updateActionCursor();

    if (this.playerState.coins < this.bet) {
      // Auto-shrink bet if needed
      if (this.playerState.coins >= 1) {
        this.bet = Math.min(this.bet, this.playerState.coins) as Bet;
      }
    }
    if (this.playerState.coins === 0) {
      this.actionIndex = 1; // point at QUIT
      this.updateActionCursor();
      this.statusText.setText('Out of coins!');
    } else {
      this.statusText.setText('Press ↑↓ to bet, Z to spin.');
    }
    this.updateBetDisplay();
  }

  private exitMessageState(): void {
    this.mode = 'idle';
    this.statusText.setText('Press ↑↓ to bet, Z to spin.');
  }

  private cancelAllSpins(): void {
    for (let r = 0; r < 3; r++) {
      const t = this.reelSpinTweens[r];
      if (t) { t.stop(); this.reelSpinTweens[r] = null; }
    }
    for (const evt of this.autoStopEvents) evt.remove(false);
    this.autoStopEvents = [];
  }

  private showMessage(msg: string): void {
    this.statusText.setText(msg);
    this.mode = 'message';
  }

  // ── Helpers: visual reel positioning ───────────────────────────────────────

  /**
   * Place reel `r`'s content so that strip-index `idx` lies on the win line.
   * The content container has 2 copies of the strip (indices 0..2L-1); we
   * pick the second-copy slot so there is always content above and below.
   */
  private setReelStaticPosition(rc: Phaser.GameObjects.Container, _r: 0 | 1 | 2, idx: number): void {
    rc.y = this.computeLandY(_r, idx);
  }

  private computeLandY(_r: 0 | 1 | 2, idx: number): number {
    // Sprite center for strip-index i in copy c is at local y = (c*L + i)*CELL_H + CELL_H/2.
    // We want that screen y == WIN_LINE_Y, so container.y == WIN_LINE_Y - localY.
    const localY = (STRIP_LEN + idx) * CELL_H + CELL_H / 2;
    return WIN_LINE_Y - localY;
  }

  // ── Helpers: HUD updates ───────────────────────────────────────────────────

  private updateCoinDisplay(): void {
    const v = Math.max(0, Math.min(9999, this.playerState.coins));
    this.coinText.setText(`COIN ${v.toString().padStart(4, '0')}`);
  }

  private updateBetDisplay(): void {
    for (let i = 0; i < 3; i++) {
      const sq = this.betSquares[i];
      sq.clear();
      sq.lineStyle(1, BORDER, 1);
      sq.strokeRect(76 + i * 6, 5, 4, 5);
      if (i < this.bet) {
        sq.fillStyle(BORDER, 1);
        sq.fillRect(77 + i * 6, 6, 3, 4);
      }
    }
    this.costText.setText(`×${this.bet}`);
    if (this.playerState && this.playerState.coins < this.bet) {
      this.costText.setColor(TEXT_RED);
    } else {
      this.costText.setColor(TEXT_DARK);
    }
  }

  private updatePrizeTable(): void {
    const rows = (this.container.getData('prizeTexts') as Phaser.GameObjects.Text[]) ?? [];
    for (const row of rows) {
      const label = row.getData('label') as string;
      const sym = row.getData('sym') as SlotSymbol;
      let value: string;
      if (sym === 'REPLAY') {
        value = 'free';
      } else {
        const payout = PAYOUT_TABLE[sym][this.bet - 1];
        value = `×${payout}`;
      }
      row.setText(`${label.padEnd(4)} ${value.padStart(5)}`);
    }
  }

  private updateActionCursor(): void {
    if (this.actionLabels.length === 1) {
      this.actionCursor.setX(12);
      this.actionCursor.setY(REEL_Y + WINDOW_H + 16);
      this.actionCursor.setVisible(this.mode === 'spinning' || this.mode === 'stopping' || this.mode === 'idle');
      return;
    }
    const xPos = 12 + this.actionIndex * 50;
    this.actionCursor.setX(xPos);
    this.actionCursor.setY(REEL_Y + WINDOW_H + 16);
    this.actionCursor.setVisible(true);
  }

  destroy(): void {
    this.container.destroy();
  }
}
