import { Direction } from '../utils/constants';
import { NPCData } from '../types/map.types';

export class NPC {
  id: string;
  x: number;
  y: number;
  direction: Direction;
  dialogue: string[];
  isTrainer: boolean;
  sightRange: number;
  defeated: boolean;

  constructor(data: NPCData) {
    this.id = data.id;
    this.x = data.x;
    this.y = data.y;
    this.direction = data.direction;
    this.dialogue = data.dialogue;
    this.isTrainer = data.isTrainer ?? false;
    this.sightRange = data.sightRange ?? 0;
    this.defeated = false;
  }

  canSeePlayer(playerX: number, playerY: number): boolean {
    if (!this.isTrainer || this.defeated) return false;

    const dx = playerX - this.x;
    const dy = playerY - this.y;

    switch (this.direction) {
      case Direction.UP:
        return dx === 0 && dy < 0 && Math.abs(dy) <= this.sightRange;
      case Direction.DOWN:
        return dx === 0 && dy > 0 && Math.abs(dy) <= this.sightRange;
      case Direction.LEFT:
        return dy === 0 && dx < 0 && Math.abs(dx) <= this.sightRange;
      case Direction.RIGHT:
        return dy === 0 && dx > 0 && Math.abs(dx) <= this.sightRange;
    }
  }
}
