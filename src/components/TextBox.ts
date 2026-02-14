import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TEXT_SPEED, TILE_SIZE } from '../utils/constants';

export class TextBox {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private textObject: Phaser.GameObjects.Text;
  private bg: Phaser.GameObjects.Graphics;
  private messages: string[] = [];
  private currentMessageIndex = 0;
  private currentCharIndex = 0;
  private isTyping = false;
  private isVisible = false;
  private timerEvent: Phaser.Time.TimerEvent | null = null;
  private onComplete: (() => void) | null = null;
  private continueIndicator: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Background
    this.bg = scene.add.graphics();
    this.bg.fillStyle(0xf8f8f8, 1);
    this.bg.fillRoundedRect(2, GAME_HEIGHT - 38, GAME_WIDTH - 4, 36, 2);
    this.bg.lineStyle(2, 0x383838, 1);
    this.bg.strokeRoundedRect(2, GAME_HEIGHT - 38, GAME_WIDTH - 4, 36, 2);

    // Text
    this.textObject = scene.add.text(8, GAME_HEIGHT - 34, '', {
      fontSize: '8px',
      color: '#383838',
      fontFamily: 'monospace',
      wordWrap: { width: GAME_WIDTH - 20 },
      lineSpacing: 2,
    });

    // Continue indicator (▼)
    this.continueIndicator = scene.add.text(
      GAME_WIDTH - 14,
      GAME_HEIGHT - 8,
      'v',
      { fontSize: '8px', color: '#383838', fontFamily: 'monospace' }
    );
    this.continueIndicator.setVisible(false);

    this.container = scene.add.container(0, 0, [
      this.bg,
      this.textObject,
      this.continueIndicator,
    ]);
    this.container.setDepth(1000);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);
  }

  show(messages: string[], onComplete?: () => void): void {
    this.messages = messages;
    this.currentMessageIndex = 0;
    this.currentCharIndex = 0;
    this.isVisible = true;
    this.onComplete = onComplete || null;
    this.container.setVisible(true);
    this.continueIndicator.setVisible(false);
    this.startTyping();
  }

  private startTyping(): void {
    const message = this.messages[this.currentMessageIndex];
    this.textObject.setText('');
    this.currentCharIndex = 0;
    this.isTyping = true;
    this.continueIndicator.setVisible(false);

    this.timerEvent = this.scene.time.addEvent({
      delay: TEXT_SPEED,
      callback: () => {
        if (this.currentCharIndex < message.length) {
          this.textObject.setText(message.substring(0, this.currentCharIndex + 1));
          this.currentCharIndex++;
        } else {
          this.isTyping = false;
          this.timerEvent?.destroy();
          this.timerEvent = null;
          // Show continue indicator if more messages
          if (this.currentMessageIndex < this.messages.length - 1) {
            this.continueIndicator.setVisible(true);
          } else {
            this.continueIndicator.setVisible(true); // Show to dismiss
          }
        }
      },
      repeat: message.length - 1,
    });
  }

  advance(): boolean {
    if (!this.isVisible) return false;

    if (this.isTyping) {
      // Skip to end of current message
      this.timerEvent?.destroy();
      this.timerEvent = null;
      this.isTyping = false;
      this.textObject.setText(this.messages[this.currentMessageIndex]);
      this.continueIndicator.setVisible(true);
      return true;
    }

    // Move to next message
    this.currentMessageIndex++;
    if (this.currentMessageIndex < this.messages.length) {
      this.startTyping();
      return true;
    }

    // All messages shown, hide
    this.hide();
    if (this.onComplete) {
      this.onComplete();
    }
    return false;
  }

  hide(): void {
    this.isVisible = false;
    this.container.setVisible(false);
    this.timerEvent?.destroy();
    this.timerEvent = null;
  }

  getIsVisible(): boolean {
    return this.isVisible;
  }

  destroy(): void {
    this.timerEvent?.destroy();
    this.container.destroy();
  }
}
