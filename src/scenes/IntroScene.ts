import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';
import { soundSystem } from '../systems/SoundSystem';

// Animated attract sequence that plays before the title screen.
// 10 choreographed steps timed to the Yellow opening-movie theme.
//
// Skippable with any key. Plays once per browser session (sessionStorage
// guarded) so repeat visits jump straight to the title.

const SESSION_KEY = 'claudemon_intro_played';

type Step = {
  name: string;
  durationMs: number;
  enter: () => void;
  exit?: () => void;
};

export class IntroScene extends Phaser.Scene {
  private stage!: Phaser.GameObjects.Container;
  private letterboxTop!: Phaser.GameObjects.Rectangle;
  private letterboxBot!: Phaser.GameObjects.Rectangle;
  private bgRect!: Phaser.GameObjects.Rectangle;

  private steps: Step[] = [];
  private currentStepIdx = -1;
  private pendingTimers: Phaser.Time.TimerEvent[] = [];
  private finished = false;

  constructor() {
    super({ key: 'IntroScene' });
  }

  create(): void {
    // If already played this session, skip straight to title
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === '1') {
      this.scene.start('TitleScene');
      return;
    }

    // Background (changes per scene)
    this.bgRect = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0xffffff,
    ).setDepth(0);

    // Stage container holds all scene content (cleared on each transition)
    this.stage = this.add.container(0, 0).setDepth(10);

    // Letterbox bars (top/bottom) — hidden for full-bleed scenes
    this.letterboxTop = this.add.rectangle(
      GAME_WIDTH / 2,
      12,
      GAME_WIDTH,
      24,
      0x000000,
    ).setDepth(100);
    this.letterboxBot = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 12,
      GAME_WIDTH,
      24,
      0x000000,
    ).setDepth(100);

    // Build the timeline
    this.buildSteps();

    // Start music
    soundSystem.startMusic('intro');

    // Begin with an initial fade-in from black
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // Skip handler (any key)
    const keyboard = this.input.keyboard;
    if (keyboard) {
      keyboard.on('keydown', this.onSkip, this);
    }
    this.input.on('pointerdown', this.onSkip, this);

    // Kick off
    this.nextStep();
  }

  // ── Skip & cleanup ───────────────────────────────────────
  private onSkip = (): void => {
    if (this.finished) return;
    this.finish();
  };

  private finish(): void {
    if (this.finished) return;
    this.finished = true;
    for (const t of this.pendingTimers) t.remove(false);
    this.pendingTimers = [];
    soundSystem.stopMusic();
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(SESSION_KEY, '1');
    }
    this.cameras.main.fadeOut(300, 255, 255, 255);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('TitleScene');
    });
  }

  private scheduleTimer(delayMs: number, callback: () => void): void {
    this.pendingTimers.push(
      this.time.delayedCall(delayMs, () => {
        if (!this.finished) callback();
      }),
    );
  }

  private nextStep(): void {
    if (this.finished) return;
    const prev = this.steps[this.currentStepIdx];
    if (prev?.exit) prev.exit();
    this.clearStage();
    this.currentStepIdx++;
    const step = this.steps[this.currentStepIdx];
    if (!step) {
      this.finish();
      return;
    }
    step.enter();
    this.scheduleTimer(step.durationMs, () => this.nextStep());
  }

  private clearStage(): void {
    this.stage.removeAll(true);
    this.tweens.killAll();
  }

  private setLetterbox(visible: boolean): void {
    this.letterboxTop.setVisible(visible);
    this.letterboxBot.setVisible(visible);
  }

  private setBg(color: number): void {
    this.bgRect.setFillStyle(color);
  }

  // ── Timeline construction ────────────────────────────────
  private buildSteps(): void {
    this.steps = [
      this.stepClaudeLogo(),
      this.stepPikaFar(),
      this.stepPikaJump(),
      this.stepPikaMid(),
      this.stepPikaSurf(),
      this.stepPikaClosest(),
      this.stepPikaBalloons(),
      this.stepPikaCharge(),
      this.stepPikaZap(),
    ];
  }

  // Step 1 — Claude logo with shooting star flyby + star shower
  private stepClaudeLogo(): Step {
    return {
      name: 'claude_logo',
      durationMs: 5500,
      enter: () => {
        this.setLetterbox(true);
        this.setBg(0xffffff);

        const logo = this.add.image(GAME_WIDTH / 2, 72, 'intro_claude_logo')
          .setAlpha(0)
          .setScale(0.9);
        this.stage.add(logo);

        // Fade + pop in
        this.tweens.add({
          targets: logo,
          alpha: 1,
          scale: 1,
          duration: 500,
          ease: 'Back.easeOut',
        });

        // Shooting star after 1.2s
        this.scheduleTimer(1200, () => {
          soundSystem.starShimmer();
          const star = this.add.image(-16, 56, 'intro_star_big').setDepth(20);
          this.stage.add(star);
          // Trailing particles
          const trailTimer = this.time.addEvent({
            delay: 35,
            repeat: 26,
            callback: () => {
              if (this.finished) return;
              const t = this.add.rectangle(star.x, star.y, 2, 2, 0xffffff, 0.9);
              this.stage.add(t);
              this.tweens.add({
                targets: t,
                alpha: 0,
                duration: 350,
                onComplete: () => t.destroy(),
              });
            },
          });
          this.pendingTimers.push(trailTimer as unknown as Phaser.Time.TimerEvent);
          this.tweens.add({
            targets: star,
            x: GAME_WIDTH + 20,
            y: 62,
            duration: 950,
            ease: 'Sine.easeInOut',
            onComplete: () => star.destroy(),
          });

          // Star shower burst — fires when star passes midpoint
          this.scheduleTimer(420, () => {
            const colors = [0xf09030, 0x30b830, 0x3890e0, 0xe060c0];
            for (let i = 0; i < 18; i++) {
              const angle = (i / 18) * Math.PI * 2;
              const speed = 20 + Math.random() * 30;
              const vx = Math.cos(angle) * speed;
              const vy = Math.sin(angle) * speed - 10;
              const color = colors[i % colors.length];
              const p = this.add.image(80, 64, 'intro_star_tiny').setTint(color);
              this.stage.add(p);
              const start = this.time.now;
              const tick = this.time.addEvent({
                delay: 16,
                repeat: 90,
                callback: () => {
                  const t = (this.time.now - start) / 1000;
                  p.x = 80 + vx * t;
                  p.y = 64 + vy * t + 60 * t * t;
                  p.alpha = Math.max(0, 1 - t * 0.9);
                  if (p.alpha <= 0) p.destroy();
                },
              });
              this.pendingTimers.push(tick as unknown as Phaser.Time.TimerEvent);
            }
            soundSystem.menuSelect();
          });
        });
      },
      exit: () => {
        this.cameras.main.flash(180, 255, 255, 255);
      },
    };
  }

  // Step 2 — Tiny Pikachu silhouette running toward the screen (far distance)
  private stepPikaFar(): Step {
    return {
      name: 'pika_far',
      durationMs: 4500,
      enter: () => {
        this.setLetterbox(true);
        this.setBg(0xffffff);

        const pika = this.add.image(GAME_WIDTH / 2, 78, 'intro_pika_far_0');
        this.stage.add(pika);
        pika.setScale(1);

        // Horizon line
        const ground = this.add.graphics();
        ground.fillStyle(0xc0c0c0);
        ground.fillRect(0, 92, GAME_WIDTH, 1);
        this.stage.add(ground);

        // Run cycle toggle
        let frame = 0;
        const cycleTimer = this.time.addEvent({
          delay: 130,
          loop: true,
          callback: () => {
            frame = 1 - frame;
            pika.setTexture(frame === 0 ? 'intro_pika_far_0' : 'intro_pika_far_1');
            // Tiny bob
            pika.y = 78 + (frame === 0 ? 0 : -1);
          },
        });
        this.pendingTimers.push(cycleTimer as unknown as Phaser.Time.TimerEvent);

        // Grow toward camera
        this.tweens.add({
          targets: pika,
          scaleX: 2.4,
          scaleY: 2.4,
          duration: 4400,
          ease: 'Quad.easeIn',
        });

        // Staggered soft footsteps
        for (let i = 0; i < 12; i++) {
          this.scheduleTimer(i * 330, () => soundSystem.bump());
        }
      },
    };
  }

  // Step 3 — Pikachu jumping through the air over cloud platforms
  private stepPikaJump(): Step {
    return {
      name: 'pika_jump',
      durationMs: 4500,
      enter: () => {
        this.setLetterbox(false);
        this.setBg(0xffffff);

        // Cloud platforms (yellow with cyan outlines — matches screenshot)
        const clouds: { gfx: Phaser.GameObjects.Graphics; speed: number; y: number }[] = [];
        for (let i = 0; i < 6; i++) {
          const g = this.add.graphics();
          const y = 16 + i * 22;
          const x = (i * 47) % (GAME_WIDTH + 24);
          g.fillStyle(0x68c8f0);
          g.fillRect(x, y, 22, 5);
          g.fillStyle(0xffd840);
          g.fillRect(x + 1, y + 1, 20, 3);
          this.stage.add(g);
          clouds.push({ gfx: g, speed: 25 + i * 8, y });
        }
        // Scroll clouds
        const start = this.time.now;
        const scroll = this.time.addEvent({
          delay: 16,
          loop: true,
          callback: () => {
            const dt = (this.time.now - start) / 1000;
            clouds.forEach((c, i) => {
              c.gfx.x = -((dt * c.speed + i * 20) % (GAME_WIDTH + 40));
            });
          },
        });
        this.pendingTimers.push(scroll as unknown as Phaser.Time.TimerEvent);

        // Pikachu jumping in arc
        const pika = this.add.image(-30, 120, 'intro_pika_jump').setDepth(20);
        this.stage.add(pika);
        // Horizontal sweep
        this.tweens.add({
          targets: pika,
          x: GAME_WIDTH + 30,
          duration: 3800,
          ease: 'Linear',
        });
        // Parabolic arc
        this.tweens.add({
          targets: pika,
          y: 40,
          duration: 1900,
          ease: 'Sine.easeOut',
          yoyo: true,
        });
        // Slight rotation for dynamism
        this.tweens.add({
          targets: pika,
          angle: -12,
          duration: 1900,
          ease: 'Sine.easeInOut',
          yoyo: true,
        });

        soundSystem.whoosh();
        this.scheduleTimer(1900, () => soundSystem.whoosh());
      },
    };
  }

  // Step 4 — Red Pikachu silhouette with lightning bolt (closer)
  private stepPikaMid(): Step {
    return {
      name: 'pika_mid',
      durationMs: 4000,
      enter: () => {
        this.setLetterbox(true);
        this.setBg(0xffffff);

        const pika = this.add.image(GAME_WIDTH / 2, 76, 'intro_pika_mid_0');
        this.stage.add(pika);
        pika.setScale(1);

        let frame = 0;
        const cycleTimer = this.time.addEvent({
          delay: 110,
          loop: true,
          callback: () => {
            frame = 1 - frame;
            pika.setTexture(frame === 0 ? 'intro_pika_mid_0' : 'intro_pika_mid_1');
            pika.y = 76 + (frame === 0 ? 0 : -1);
          },
        });
        this.pendingTimers.push(cycleTimer as unknown as Phaser.Time.TimerEvent);

        this.tweens.add({
          targets: pika,
          scaleX: 1.6,
          scaleY: 1.6,
          duration: 3900,
          ease: 'Quad.easeIn',
        });

        // Spark flashes above (every 500ms)
        for (let i = 0; i < 7; i++) {
          this.scheduleTimer(200 + i * 500, () => {
            const spark = this.add.rectangle(
              GAME_WIDTH / 2 + (Math.random() * 20 - 10),
              38,
              3,
              3,
              0xffff40,
            );
            this.stage.add(spark);
            this.tweens.add({
              targets: spark,
              alpha: 0,
              duration: 200,
              onComplete: () => spark.destroy(),
            });
          });
        }
        soundSystem.superEffective();
        this.scheduleTimer(2000, () => soundSystem.superEffective());
      },
    };
  }

  // Step 5 — Pikachu on a surfboard over a wavy ocean
  private stepPikaSurf(): Step {
    return {
      name: 'pika_surf',
      durationMs: 5500,
      enter: () => {
        this.setLetterbox(false);
        this.setBg(0x7fd0f8);

        // Wavy ocean bands (redrawn each frame for subtle motion)
        const ocean = this.add.graphics();
        this.stage.add(ocean);
        const start = this.time.now;
        const redraw = this.time.addEvent({
          delay: 60,
          loop: true,
          callback: () => {
            const t = (this.time.now - start) / 1000;
            ocean.clear();
            for (let row = 0; row < 8; row++) {
              const y = 16 + row * 16;
              const offset = Math.sin(t * 2 + row * 0.7) * 3;
              ocean.fillStyle(0xa8e0ff);
              ocean.fillRect(0, y, GAME_WIDTH, 2);
              ocean.fillStyle(0xffffff);
              for (let x = -4; x < GAME_WIDTH + 4; x += 10) {
                ocean.fillRect(x + offset, y + 3, 4, 1);
              }
            }
          },
        });
        this.pendingTimers.push(redraw as unknown as Phaser.Time.TimerEvent);

        // Pikachu on surfboard, bobbing
        const pika = this.add.image(GAME_WIDTH / 2, 72, 'intro_pika_surf').setDepth(20);
        this.stage.add(pika);
        this.tweens.add({
          targets: pika,
          y: 76,
          duration: 700,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
        });

        // Splash particles at board edges
        const splashTimer = this.time.addEvent({
          delay: 220,
          loop: true,
          callback: () => {
            for (const side of [-1, 1]) {
              const p = this.add.rectangle(
                GAME_WIDTH / 2 + side * 24,
                pika.y + 12,
                2,
                2,
                0xffffff,
              );
              this.stage.add(p);
              this.tweens.add({
                targets: p,
                y: p.y - 8,
                alpha: 0,
                duration: 500,
                onComplete: () => p.destroy(),
              });
            }
          },
        });
        this.pendingTimers.push(splashTimer as unknown as Phaser.Time.TimerEvent);

        soundSystem.splash();
        this.scheduleTimer(1400, () => soundSystem.splash());
        this.scheduleTimer(2800, () => soundSystem.splash());
        this.scheduleTimer(4200, () => soundSystem.splash());
      },
    };
  }

  // Step 6 — Enormous Pikachu running right on top of us
  private stepPikaClosest(): Step {
    return {
      name: 'pika_closest',
      durationMs: 4000,
      enter: () => {
        this.setLetterbox(true);
        this.setBg(0xffffff);

        const pika = this.add.image(GAME_WIDTH / 2, 76, 'intro_pika_closest_0');
        this.stage.add(pika);
        pika.setScale(0.95);

        let frame = 0;
        const cycleTimer = this.time.addEvent({
          delay: 100,
          loop: true,
          callback: () => {
            frame = 1 - frame;
            pika.setTexture(frame === 0 ? 'intro_pika_closest_0' : 'intro_pika_closest_1');
          },
        });
        this.pendingTimers.push(cycleTimer as unknown as Phaser.Time.TimerEvent);

        // Slight scale up
        this.tweens.add({
          targets: pika,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 3900,
          ease: 'Sine.easeOut',
        });

        // Motion streaks from sides
        const streakTimer = this.time.addEvent({
          delay: 90,
          loop: true,
          callback: () => {
            const y = 20 + Math.random() * 104;
            const s1 = this.add.rectangle(0, y, 20, 1, 0xe0e0e0);
            const s2 = this.add.rectangle(GAME_WIDTH, y, 20, 1, 0xe0e0e0);
            this.stage.add(s1);
            this.stage.add(s2);
            this.tweens.add({ targets: [s1, s2], alpha: 0, duration: 400, onComplete: () => { s1.destroy(); s2.destroy(); } });
          },
        });
        this.pendingTimers.push(streakTimer as unknown as Phaser.Time.TimerEvent);

        soundSystem.battleStart();
      },
    };
  }

  // Step 7 — Floating peacefully with balloons (the warm emotional peak)
  private stepPikaBalloons(): Step {
    return {
      name: 'pika_balloons',
      durationMs: 7000,
      enter: () => {
        this.setLetterbox(false);

        // Sky gradient (same 8-band pattern as TitleScene)
        const sky = this.add.graphics();
        const skyColors = [0x88ccff, 0x82c6fa, 0x7cc0f5, 0x76baf0, 0x70b4eb, 0x6aaee6, 0x64a8e1, 0x5ea2dc];
        for (let i = 0; i < skyColors.length; i++) {
          sky.fillStyle(skyColors[i]);
          sky.fillRect(0, i * 18, GAME_WIDTH, 18);
        }
        this.stage.add(sky);

        // Mountain silhouette at bottom
        const mountains = this.add.graphics();
        mountains.fillStyle(0xffffff);
        const peaks = [0, 12, 4, 18, 8, 22, 6, 20, 10, 16, 2, 14, 0];
        for (let i = 0; i < peaks.length - 1; i++) {
          const x1 = (i * GAME_WIDTH) / (peaks.length - 1);
          const x2 = ((i + 1) * GAME_WIDTH) / (peaks.length - 1);
          mountains.fillTriangle(x1, 128 - peaks[i], x2, 128 - peaks[i + 1], (x1 + x2) / 2, GAME_HEIGHT);
        }
        mountains.fillRect(0, 128, GAME_WIDTH, GAME_HEIGHT - 128);
        this.stage.add(mountains);

        // Two drifting clouds
        const cloud1 = this.add.graphics();
        cloud1.fillStyle(0xffffff);
        cloud1.fillRect(0, 0, 22, 4);
        cloud1.fillRect(3, -2, 16, 7);
        cloud1.x = 20; cloud1.y = 30;
        const cloud2 = this.add.graphics();
        cloud2.fillStyle(0xffffff);
        cloud2.fillRect(0, 0, 18, 3);
        cloud2.fillRect(2, -1, 14, 5);
        cloud2.x = 100; cloud2.y = 20;
        this.stage.add(cloud1);
        this.stage.add(cloud2);
        this.tweens.add({ targets: cloud1, x: GAME_WIDTH + 20, duration: 12000, ease: 'Linear' });
        this.tweens.add({ targets: cloud2, x: -30, duration: 14000, ease: 'Linear' });

        // Pikachu floats up into frame
        const pika = this.add.image(GAME_WIDTH / 2, 160, 'intro_pika_balloons').setDepth(20);
        this.stage.add(pika);
        this.tweens.add({
          targets: pika,
          y: 72,
          duration: 2400,
          ease: 'Sine.easeOut',
          onComplete: () => {
            // Gentle bob
            this.tweens.add({
              targets: pika,
              y: 74,
              duration: 1800,
              ease: 'Sine.easeInOut',
              yoyo: true,
              repeat: -1,
            });
            this.tweens.add({
              targets: pika,
              angle: 2,
              duration: 2200,
              ease: 'Sine.easeInOut',
              yoyo: true,
              repeat: -1,
            });
          },
        });

        // Tiny heart particles drifting up
        const heartTimer = this.time.addEvent({
          delay: 800,
          loop: true,
          callback: () => {
            const hx = GAME_WIDTH / 2 + (Math.random() * 40 - 20);
            const h = this.add.graphics();
            h.fillStyle(0xff80a0);
            h.fillRect(0, 1, 3, 2);
            h.fillRect(1, 0, 1, 1);
            h.x = hx; h.y = 120;
            this.stage.add(h);
            this.tweens.add({
              targets: h,
              y: 30,
              alpha: 0,
              duration: 2500,
              onComplete: () => h.destroy(),
            });
          },
        });
        this.pendingTimers.push(heartTimer as unknown as Phaser.Time.TimerEvent);

        soundSystem.levelUp();
        this.scheduleTimer(2500, () => soundSystem.healBallDing());
        this.scheduleTimer(4500, () => soundSystem.healBallDing());
      },
    };
  }

  // Step 8 — Pikachu charging up, cheeks sparking
  private stepPikaCharge(): Step {
    return {
      name: 'pika_charge',
      durationMs: 2800,
      enter: () => {
        this.setLetterbox(true);
        this.setBg(0xffffff);

        const pika = this.add.image(GAME_WIDTH / 2, 72, 'intro_pika_charge');
        this.stage.add(pika);
        pika.setScale(1);
        this.tweens.add({
          targets: pika,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 2700,
          ease: 'Sine.easeOut',
        });

        // Spark flicker (random yellow rects around cheeks)
        const sparkTimer = this.time.addEvent({
          delay: 80,
          loop: true,
          callback: () => {
            const x = 30 + Math.random() * 100;
            const y = 60 + Math.random() * 30;
            const s = this.add.rectangle(x, y, 2, 2, 0xffff40);
            this.stage.add(s);
            this.tweens.add({
              targets: s,
              alpha: 0,
              duration: 180,
              onComplete: () => s.destroy(),
            });
          },
        });
        this.pendingTimers.push(sparkTimer as unknown as Phaser.Time.TimerEvent);

        soundSystem.superEffective();
        this.scheduleTimer(900, () => soundSystem.superEffective());
        this.scheduleTimer(1800, () => soundSystem.superEffective());

        // Background tint oscillation
        let tick = 0;
        const tintTimer = this.time.addEvent({
          delay: 180,
          loop: true,
          callback: () => {
            tick++;
            this.setBg(tick % 2 === 0 ? 0xffffff : 0xffe8e0);
          },
        });
        this.pendingTimers.push(tintTimer as unknown as Phaser.Time.TimerEvent);
      },
    };
  }

  // Step 9 — ZAP! Full-bleed red angry silhouette with lightning bolts
  private stepPikaZap(): Step {
    return {
      name: 'pika_zap',
      durationMs: 3800,
      enter: () => {
        this.setLetterbox(false);
        this.setBg(0x000000);

        const pika = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'intro_pika_zap');
        this.stage.add(pika);
        pika.setScale(1);
        this.tweens.add({
          targets: pika,
          scaleX: 1.15,
          scaleY: 1.15,
          duration: 300,
          ease: 'Quad.easeOut',
          yoyo: true,
          repeat: 2,
        });

        // Screen shake
        this.cameras.main.shake(500, 0.015);

        // Lightning bolts radiating outward
        const drawBolts = () => {
          const g = this.add.graphics();
          g.lineStyle(2, 0xffff40, 1);
          const cx = GAME_WIDTH / 2;
          const cy = GAME_HEIGHT / 2;
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.3;
            const len = 80;
            g.beginPath();
            g.moveTo(cx, cy);
            const seg = 4;
            for (let s = 1; s <= seg; s++) {
              const t = s / seg;
              const jx = Math.sin(t * Math.PI * 3) * 5;
              const x = cx + Math.cos(angle) * len * t + Math.cos(angle + Math.PI / 2) * jx;
              const y = cy + Math.sin(angle) * len * t + Math.sin(angle + Math.PI / 2) * jx;
              g.lineTo(x, y);
            }
            g.strokePath();
          }
          this.stage.add(g);
          return g;
        };

        let boltsVisible = true;
        let boltGfx = drawBolts();
        const boltTimer = this.time.addEvent({
          delay: 80,
          loop: true,
          callback: () => {
            boltGfx.destroy();
            boltsVisible = !boltsVisible;
            if (boltsVisible) boltGfx = drawBolts();
            else boltGfx = this.add.graphics();
          },
        });
        this.pendingTimers.push(boltTimer as unknown as Phaser.Time.TimerEvent);

        // Flashes
        this.cameras.main.flash(150, 255, 255, 255);
        this.scheduleTimer(300, () => this.cameras.main.flash(150, 255, 255, 255));
        this.scheduleTimer(600, () => this.cameras.main.flash(150, 255, 255, 255));

        soundSystem.thunderZap();
        this.scheduleTimer(600, () => soundSystem.thunderZap());
      },
      exit: () => {
        this.cameras.main.flash(400, 255, 255, 255);
      },
    };
  }
}
