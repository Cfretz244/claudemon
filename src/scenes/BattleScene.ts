import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../utils/constants';
import { PokemonInstance, StatusCondition, MoveCategory, MoveEffect } from '../types/pokemon.types';
import { BattleType } from '../types/battle.types';
import { POKEMON_DATA } from '../data/pokemon';
import { MOVES_DATA } from '../data/moves';
import { BattleHUD } from '../components/BattleHUD';
import { BattleMenu, MenuSelection } from '../components/BattleMenu';
import { TextBox } from '../components/TextBox';
import { calculateDamage, checkCritical, checkAccuracy } from '../systems/DamageCalculator';
import { calculateExpGain, addExperience, learnMove } from '../systems/ExperienceSystem';
import { checkEvolution, evolvePokemon } from '../systems/EvolutionSystem';
import { attemptCatch } from '../systems/CatchSystem';
import { selectAIMove } from '../systems/AISystem';
import { soundSystem } from '../systems/SoundSystem';
import { generatePokemonSprite } from '../utils/spriteGenerator';
import { PlayerState } from '../entities/Player';
import { SaveData } from '../systems/SaveSystem';
import { getEffectivenessText } from '../data/typeChart';
import { createPokemon } from '../entities/Pokemon';
import { TRAINERS } from '../data/trainers';
import { GYM_LEADERS } from '../data/gymLeaders';
import { ELITE_FOUR, CHAMPION, HALL_OF_FAME_TEXT } from '../data/eliteFour';

interface BattleSceneData {
  type: string;
  wildPokemon?: PokemonInstance;
  trainerId?: string;
  trainerName?: string;
  trainerTeam?: PokemonInstance[];
  playerState: SaveData;
  returnMap: string;
  returnX: number;
  returnY: number;
  // Elite Four chain support
  eliteFourQueue?: Array<{ trainerId: string; trainerName: string }>;
  hallOfFame?: boolean;
}

export class BattleScene extends Phaser.Scene {
  // State
  private playerState!: PlayerState;
  private playerPokemon!: PokemonInstance;
  private opponentPokemon!: PokemonInstance;
  private opponentParty: PokemonInstance[] = [];
  private battleType!: BattleType;
  private trainerId?: string;
  private trainerName?: string;
  private returnMap!: string;
  private returnX!: number;
  private returnY!: number;
  private eliteFourQueue: Array<{ trainerId: string; trainerName: string }> = [];
  private hallOfFame = false;

  // Sprites
  private playerSprite!: Phaser.GameObjects.Sprite;
  private opponentSprite!: Phaser.GameObjects.Sprite;

  // UI
  private hud!: BattleHUD;
  private menu!: BattleMenu;
  private textBox!: TextBox;

  // Battle flow
  private battleOver = false;
  private turnInProgress = false;
  private currentPlayerPokemonIndex = 0;

  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data: BattleSceneData): void {
    this.playerState = PlayerState.fromSave(data.playerState);
    this.returnMap = data.returnMap;
    this.returnX = data.returnX;
    this.returnY = data.returnY;
    this.trainerId = data.trainerId;
    this.trainerName = data.trainerName;
    this.eliteFourQueue = data.eliteFourQueue || [];
    this.hallOfFame = data.hallOfFame || false;

    if (data.type === 'wild') {
      this.battleType = BattleType.WILD;
      this.opponentPokemon = data.wildPokemon!;
      this.opponentParty = [this.opponentPokemon];
    } else {
      this.battleType = BattleType.TRAINER;
      if (data.trainerTeam && data.trainerTeam.length > 0) {
        this.opponentParty = data.trainerTeam;
      } else {
        // Generate trainer team based on ID
        this.opponentParty = this.generateTrainerTeam(data.trainerId || '');
      }
      this.opponentPokemon = this.opponentParty[0];
    }

    // Find first alive Pokemon in player party
    this.currentPlayerPokemonIndex = this.playerState.party.findIndex(p => p.currentHp > 0);
    if (this.currentPlayerPokemonIndex < 0) this.currentPlayerPokemonIndex = 0;
    this.playerPokemon = this.playerState.party[this.currentPlayerPokemonIndex];

    this.battleOver = false;
    this.turnInProgress = false;
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#f8f8f8');

    // Battle background
    const bg = this.add.graphics();
    // Top area (opponent side) - grassy field
    bg.fillStyle(0x88c070, 1);
    bg.fillRect(0, 40, GAME_WIDTH, 20);
    bg.fillStyle(0x78b060, 1);
    bg.fillRect(0, 50, GAME_WIDTH, 10);
    // Bottom area (player side)
    bg.fillStyle(0xa8d898, 1);
    bg.fillRect(0, 88, GAME_WIDTH, 20);

    // Generate Pokemon sprites
    this.ensurePokemonSprite(this.playerPokemon.speciesId);
    this.ensurePokemonSprite(this.opponentPokemon.speciesId);

    // Opponent sprite (top-right, front view, frame 0)
    const oppSpriteKey = `pokemon_${this.opponentPokemon.speciesId}`;
    this.opponentSprite = this.add.sprite(GAME_WIDTH - 40, 28, oppSpriteKey, 0);
    this.opponentSprite.setDepth(5);
    this.opponentSprite.setScrollFactor(0);

    // Player sprite (bottom-left, back view, frame 1)
    const plrSpriteKey = `pokemon_${this.playerPokemon.speciesId}`;
    this.playerSprite = this.add.sprite(36, 76, plrSpriteKey, 1);
    this.playerSprite.setDepth(5);
    this.playerSprite.setScrollFactor(0);

    // HUD
    this.hud = new BattleHUD(this);
    this.hud.updatePlayer(this.playerPokemon);
    this.hud.updateOpponent(this.opponentPokemon);

    // Text box
    this.textBox = new TextBox(this);

    // Menu
    this.menu = new BattleMenu(this);
    this.menu.hide();

    // Mark as seen in Pokedex
    this.playerState.markSeen(this.opponentPokemon.speciesId);

    // Battle intro
    const opponentName = this.getSpeciesName(this.opponentPokemon.speciesId);
    const playerName = this.getSpeciesName(this.playerPokemon.speciesId);

    let introMessages: string[];
    if (this.battleType === BattleType.WILD) {
      introMessages = [`Wild ${opponentName}\nappeared!`];
    } else {
      introMessages = [
        `${this.trainerName || 'TRAINER'}\nwants to battle!`,
        `${this.trainerName || 'TRAINER'} sent\nout ${opponentName}!`,
      ];
    }
    introMessages.push(`Go! ${playerName}!`);

    soundSystem.pokemonCry(300 + this.opponentPokemon.speciesId * 3);

    this.textBox.show(introMessages, () => {
      this.showBattleMenu();
    });

    // Handle Z/Enter for text box advancement
    const zKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    const enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    zKey.on('down', () => {
      if (this.textBox.getIsVisible()) {
        this.textBox.advance();
      }
    });
    enterKey.on('down', () => {
      if (this.textBox.getIsVisible()) {
        this.textBox.advance();
      }
    });
  }

  private ensurePokemonSprite(speciesId: number): void {
    const key = `pokemon_${speciesId}`;
    if (!this.textures.exists(key)) {
      const species = POKEMON_DATA[speciesId];
      if (species) {
        const shapes: Array<'round' | 'angular' | 'tall' | 'wide' | 'bird' | 'snake' | 'bug'> =
          ['round', 'angular', 'tall', 'wide', 'bird', 'snake', 'bug'];
        // Pick shape based on species ID for variety
        const shape = shapes[speciesId % shapes.length];
        generatePokemonSprite(this, key, species.spriteColor, species.spriteColor2, shape);
      } else {
        generatePokemonSprite(this, key, 0x808080, undefined, 'round');
      }
    }
  }

  private showBattleMenu(): void {
    if (this.battleOver) return;
    this.menu.show(this.playerPokemon, (selection) => this.handleMenuSelection(selection));
  }

  private handleMenuSelection(selection: MenuSelection): void {
    this.menu.hide();

    switch (selection.type) {
      case 'fight':
        this.executeTurn(selection.moveIndex);
        break;
      case 'bag':
        this.showBagInBattle();
        break;
      case 'pokemon':
        this.showPartyInBattle();
        break;
      case 'run':
        this.tryRun();
        break;
    }
  }

  private async executeTurn(playerMoveIndex: number): Promise<void> {
    if (this.turnInProgress) return;
    this.turnInProgress = true;

    const playerMove = this.playerPokemon.moves[playerMoveIndex];
    const aiMoveIndex = selectAIMove(this.opponentPokemon, this.playerPokemon);
    const aiMove = this.opponentPokemon.moves[aiMoveIndex];

    if (!playerMove || !aiMove) {
      this.turnInProgress = false;
      this.showBattleMenu();
      return;
    }

    const playerMoveData = MOVES_DATA[playerMove.moveId];
    const aiMoveData = MOVES_DATA[aiMove.moveId];

    if (!playerMoveData || !aiMoveData) {
      this.turnInProgress = false;
      this.showBattleMenu();
      return;
    }

    // Speed check for turn order
    const playerPriority = playerMoveData.priority ?? 0;
    const aiPriority = aiMoveData.priority ?? 0;

    let playerFirst: boolean;
    if (playerPriority !== aiPriority) {
      playerFirst = playerPriority > aiPriority;
    } else {
      playerFirst = this.playerPokemon.stats.speed >= this.opponentPokemon.stats.speed;
    }

    // Apply paralysis speed reduction
    if (this.playerPokemon.status === StatusCondition.PARALYSIS) {
      playerFirst = this.playerPokemon.stats.speed * 0.25 >= this.opponentPokemon.stats.speed;
    }
    if (this.opponentPokemon.status === StatusCondition.PARALYSIS) {
      playerFirst = this.playerPokemon.stats.speed >= this.opponentPokemon.stats.speed * 0.25;
    }

    if (playerFirst) {
      await this.executeMove(this.playerPokemon, this.opponentPokemon, playerMove, playerMoveData, true);
      if (this.battleOver) return;

      if (this.opponentPokemon.currentHp > 0) {
        await this.executeMove(this.opponentPokemon, this.playerPokemon, aiMove, aiMoveData, false);
        if (this.battleOver) return;
      }
    } else {
      await this.executeMove(this.opponentPokemon, this.playerPokemon, aiMove, aiMoveData, false);
      if (this.battleOver) return;

      if (this.playerPokemon.currentHp > 0) {
        await this.executeMove(this.playerPokemon, this.opponentPokemon, playerMove, playerMoveData, true);
        if (this.battleOver) return;
      }
    }

    // Apply end-of-turn status effects
    await this.applyStatusDamage(this.playerPokemon, true);
    if (this.battleOver) return;
    await this.applyStatusDamage(this.opponentPokemon, false);
    if (this.battleOver) return;

    // Check for fainting
    if (this.opponentPokemon.currentHp <= 0) {
      await this.handleOpponentFaint();
      return;
    }

    if (this.playerPokemon.currentHp <= 0) {
      await this.handlePlayerFaint();
      return;
    }

    this.turnInProgress = false;
    this.showBattleMenu();
  }

  private executeMove(
    attacker: PokemonInstance,
    defender: PokemonInstance,
    move: { moveId: number; currentPp: number; maxPp: number },
    moveData: { id: number; name: string; type: any; category: any; power: number; accuracy: number; pp: number; effect?: MoveEffect; priority?: number },
    isPlayer: boolean,
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      // Check status conditions that prevent action
      if (attacker.status === StatusCondition.SLEEP) {
        // 50% chance to wake up each turn
        if (Math.random() < 0.5) {
          attacker.status = StatusCondition.NONE;
          const name = this.getSpeciesName(attacker.speciesId);
          this.textBox.show([`${name} woke up!`], resolve);
          return;
        } else {
          const name = this.getSpeciesName(attacker.speciesId);
          this.textBox.show([`${name} is fast\nasleep!`], resolve);
          return;
        }
      }

      if (attacker.status === StatusCondition.PARALYSIS && Math.random() < 0.25) {
        const name = this.getSpeciesName(attacker.speciesId);
        this.textBox.show([`${name} is fully\nparalyzed!`], resolve);
        return;
      }

      if (attacker.status === StatusCondition.FREEZE) {
        // 20% chance to thaw in Gen 1
        if (Math.random() < 0.2) {
          attacker.status = StatusCondition.NONE;
          const name = this.getSpeciesName(attacker.speciesId);
          this.textBox.show([`${name} thawed out!`], resolve);
          // Continue to attack after thawing
        } else {
          const name = this.getSpeciesName(attacker.speciesId);
          this.textBox.show([`${name} is frozen\nsolid!`], resolve);
          return;
        }
      }

      // Use PP
      move.currentPp = Math.max(0, move.currentPp - 1);

      const attackerName = isPlayer
        ? this.getSpeciesName(attacker.speciesId)
        : `Foe ${this.getSpeciesName(attacker.speciesId)}`;

      const messages: string[] = [`${attackerName} used\n${moveData.name}!`];

      // Accuracy check
      if (!checkAccuracy(moveData as any)) {
        messages.push("But it missed!");
        this.textBox.show(messages, resolve);
        return;
      }

      // Damage calculation
      if (moveData.power > 0 && moveData.category !== MoveCategory.STATUS) {
        const isCrit = checkCritical(attacker);
        const result = calculateDamage(attacker, defender, moveData as any, isCrit);

        if (result.effectiveness === 0) {
          messages.push(getEffectivenessText(0));
          this.textBox.show(messages, resolve);
          return;
        }

        // Apply damage
        defender.currentHp = Math.max(0, defender.currentHp - result.damage);

        if (result.isCritical) {
          messages.push("A critical hit!");
        }

        const effText = getEffectivenessText(result.effectiveness);
        if (effText) {
          messages.push(effText);
          if (result.effectiveness > 1) {
            soundSystem.superEffective();
          } else if (result.effectiveness < 1) {
            soundSystem.notVeryEffective();
          }
        }

        soundSystem.hit();

        // Animate HP change
        const hpPromise = isPlayer
          ? this.hud.animateOpponentHP(defender.currentHp / defender.stats.hp)
          : this.hud.animatePlayerHP(defender.currentHp / defender.stats.hp);

        // Flash the target sprite
        const targetSprite = isPlayer ? this.opponentSprite : this.playerSprite;
        this.tweens.add({
          targets: targetSprite,
          alpha: 0,
          duration: 80,
          yoyo: true,
          repeat: 2,
        });

        // Apply secondary effects
        if (moveData.effect && defender.currentHp > 0) {
          this.applyMoveEffect(moveData.effect, attacker, defender, messages);
        }

        hpPromise.then(() => {
          this.updateHUD();
          this.textBox.show(messages, resolve);
        });
      } else {
        // Status move
        if (moveData.effect) {
          this.applyMoveEffect(moveData.effect, attacker, defender, messages);
        }
        this.textBox.show(messages, resolve);
      }
    });
  }

  private applyMoveEffect(effect: MoveEffect, attacker: PokemonInstance, defender: PokemonInstance, messages: string[]): void {
    const defName = this.getSpeciesName(defender.speciesId);

    switch (effect) {
      case MoveEffect.PARALYZE:
        if (defender.status === StatusCondition.NONE && Math.random() < 0.3) {
          defender.status = StatusCondition.PARALYSIS;
          messages.push(`${defName} is paralyzed!`);
        }
        break;
      case MoveEffect.BURN:
        if (defender.status === StatusCondition.NONE && Math.random() < 0.1) {
          defender.status = StatusCondition.BURN;
          messages.push(`${defName} was burned!`);
        }
        break;
      case MoveEffect.FREEZE:
        if (defender.status === StatusCondition.NONE && Math.random() < 0.1) {
          defender.status = StatusCondition.FREEZE;
          messages.push(`${defName} was frozen!`);
        }
        break;
      case MoveEffect.POISON:
        if (defender.status === StatusCondition.NONE && Math.random() < 0.3) {
          defender.status = StatusCondition.POISON;
          messages.push(`${defName} was poisoned!`);
        }
        break;
      case MoveEffect.SLEEP:
        if (defender.status === StatusCondition.NONE) {
          defender.status = StatusCondition.SLEEP;
          messages.push(`${defName} fell asleep!`);
        }
        break;
      case MoveEffect.CONFUSE:
        messages.push(`${defName} became confused!`);
        break;
      case MoveEffect.RECOVER:
      case MoveEffect.REST: {
        const healAmount = Math.floor(attacker.stats.hp / 2);
        attacker.currentHp = Math.min(attacker.stats.hp, attacker.currentHp + healAmount);
        const atkName = this.getSpeciesName(attacker.speciesId);
        messages.push(`${atkName} recovered\nhealth!`);
        break;
      }
      case MoveEffect.RECOIL: {
        // Handled during damage calc for simplicity
        break;
      }
    }
  }

  private applyStatusDamage(pokemon: PokemonInstance, isPlayer: boolean): Promise<void> {
    return new Promise(resolve => {
      const name = this.getSpeciesName(pokemon.speciesId);

      if (pokemon.status === StatusCondition.BURN) {
        const damage = Math.max(1, Math.floor(pokemon.stats.hp / 16));
        pokemon.currentHp = Math.max(0, pokemon.currentHp - damage);
        this.updateHUD();
        this.textBox.show([`${name} is hurt by\nits burn!`], () => {
          if (pokemon.currentHp <= 0) {
            if (isPlayer) this.handlePlayerFaint().then(resolve);
            else this.handleOpponentFaint().then(resolve);
          } else {
            resolve();
          }
        });
        return;
      }

      if (pokemon.status === StatusCondition.POISON) {
        const damage = Math.max(1, Math.floor(pokemon.stats.hp / 16));
        pokemon.currentHp = Math.max(0, pokemon.currentHp - damage);
        this.updateHUD();
        this.textBox.show([`${name} is hurt by\npoison!`], () => {
          if (pokemon.currentHp <= 0) {
            if (isPlayer) this.handlePlayerFaint().then(resolve);
            else this.handleOpponentFaint().then(resolve);
          } else {
            resolve();
          }
        });
        return;
      }

      resolve();
    });
  }

  private async handleOpponentFaint(): Promise<void> {
    this.battleOver = true;
    const oppName = this.getSpeciesName(this.opponentPokemon.speciesId);
    soundSystem.faint();

    // Faint animation
    this.tweens.add({
      targets: this.opponentSprite,
      y: this.opponentSprite.y + 32,
      alpha: 0,
      duration: 500,
    });

    const faintMsg = this.battleType === BattleType.WILD
      ? `Wild ${oppName}\nfainted!`
      : `Foe ${oppName}\nfainted!`;

    // Calculate EXP
    const isTrainer = this.battleType !== BattleType.WILD;
    const expGain = calculateExpGain(this.opponentPokemon, isTrainer);

    await this.showText([faintMsg]);

    // Award EXP
    const playerName = this.getSpeciesName(this.playerPokemon.speciesId);
    await this.showText([`${playerName} gained\n${expGain} EXP. Points!`]);

    soundSystem.levelUp();
    const levelUps = addExperience(this.playerPokemon, expGain);

    for (const lu of levelUps) {
      await this.showText([`${playerName} grew to\nLv. ${lu.newLevel}!`]);

      // Check for new moves
      for (const moveId of lu.newMoves) {
        const moveData = MOVES_DATA[moveId];
        if (moveData) {
          if (this.playerPokemon.moves.length < 4) {
            learnMove(this.playerPokemon, moveId);
            await this.showText([`${playerName} learned\n${moveData.name}!`]);
          } else {
            // For simplicity, auto-replace oldest move
            learnMove(this.playerPokemon, moveId, 0);
            await this.showText([`${playerName} learned\n${moveData.name}!`, `(Replaced first move)`]);
          }
        }
      }

      // Check evolution
      const evoResult = checkEvolution(this.playerPokemon);
      if (evoResult) {
        soundSystem.evolution();
        await this.showText([
          `What? ${evoResult.fromName}\nis evolving!`,
          `${evoResult.fromName} evolved\ninto ${evoResult.toName}!`,
        ]);
        evolvePokemon(this.playerPokemon, evoResult.toSpecies);
      }
    }

    // Check if trainer has more Pokemon
    if (isTrainer) {
      const nextOpponent = this.opponentParty.find(p => p !== this.opponentPokemon && p.currentHp > 0);
      if (nextOpponent) {
        this.opponentPokemon = nextOpponent;
        this.ensurePokemonSprite(this.opponentPokemon.speciesId);
        const nextName = this.getSpeciesName(this.opponentPokemon.speciesId);

        const spriteKey = `pokemon_${this.opponentPokemon.speciesId}`;
        this.opponentSprite.setTexture(spriteKey, 0);
        this.opponentSprite.setAlpha(1);
        this.opponentSprite.setY(28);

        this.hud.updateOpponent(this.opponentPokemon);
        this.battleOver = false;
        this.turnInProgress = false;

        await this.showText([`${this.trainerName} sent\nout ${nextName}!`]);
        this.showBattleMenu();
        return;
      }

      // Trainer defeated
      if (this.trainerId) {
        this.playerState.defeatedTrainers.push(this.trainerId);
      }

      // Prize money
      const prizeMoney = this.opponentPokemon.level * 50;
      this.playerState.money += prizeMoney;

      // Check if gym leader
      const gymLeader = this.trainerId ? GYM_LEADERS[this.trainerId] : undefined;
      if (gymLeader && !this.playerState.badges.includes(gymLeader.badge)) {
        this.playerState.badges.push(gymLeader.badge);
        soundSystem.victory();
        await this.showText([
          `${this.trainerName} was\ndefeated!`,
          `Got $${prizeMoney} for winning!`,
          `${this.playerState.name} received\nthe ${gymLeader.badge} BADGE!`,
        ]);
      } else {
        soundSystem.victory();
        await this.showText([
          `${this.trainerName} was\ndefeated!`,
          `Got $${prizeMoney} for winning!`,
        ]);
      }
    }

    this.endBattle();
  }

  private async handlePlayerFaint(): Promise<void> {
    const name = this.getSpeciesName(this.playerPokemon.speciesId);
    soundSystem.faint();

    // Faint animation
    this.tweens.add({
      targets: this.playerSprite,
      y: this.playerSprite.y + 32,
      alpha: 0,
      duration: 500,
    });

    await this.showText([`${name} fainted!`]);

    // Check for more alive Pokemon
    const nextIndex = this.playerState.party.findIndex(
      (p, i) => i !== this.currentPlayerPokemonIndex && p.currentHp > 0
    );

    if (nextIndex >= 0) {
      // Switch to next Pokemon
      this.currentPlayerPokemonIndex = nextIndex;
      this.playerPokemon = this.playerState.party[nextIndex];
      this.ensurePokemonSprite(this.playerPokemon.speciesId);

      const nextName = this.getSpeciesName(this.playerPokemon.speciesId);
      const spriteKey = `pokemon_${this.playerPokemon.speciesId}`;
      this.playerSprite.setTexture(spriteKey, 1);
      this.playerSprite.setAlpha(1);
      this.playerSprite.setY(76);

      this.hud.updatePlayer(this.playerPokemon);
      this.turnInProgress = false;

      await this.showText([`Go! ${nextName}!`]);
      this.showBattleMenu();
    } else {
      // All Pokemon fainted - white out
      this.battleOver = true;
      await this.showText([
        `${this.playerState.name} is out of\nusable POKeMON!`,
        `${this.playerState.name} blacked out!`,
      ]);

      // Heal party and return to last healed location
      for (const p of this.playerState.party) {
        p.currentHp = p.stats.hp;
        p.status = StatusCondition.NONE;
        for (const m of p.moves) m.currentPp = m.maxPp;
      }

      this.playerState.money = Math.floor(this.playerState.money / 2);

      this.scene.start('OverworldScene', {
        mapId: this.playerState.lastHealMap,
        playerX: this.playerState.lastHealX,
        playerY: this.playerState.lastHealY,
        saveData: this.playerState.toSave(),
      });
    }
  }

  private tryRun(): void {
    if (this.battleType !== BattleType.WILD) {
      this.textBox.show(["Can't run from a\ntrainer battle!"], () => {
        this.showBattleMenu();
      });
      return;
    }

    // Gen 1 run formula: speed-based
    const playerSpeed = this.playerPokemon.stats.speed;
    const oppSpeed = this.opponentPokemon.stats.speed;
    const escapeChance = (playerSpeed * 32) / (oppSpeed / 4) + 30;

    if (Math.random() * 256 < escapeChance) {
      this.textBox.show(['Got away safely!'], () => {
        this.endBattle();
      });
    } else {
      this.textBox.show(["Can't escape!"], () => {
        // Opponent gets a free attack
        const aiMoveIndex = selectAIMove(this.opponentPokemon, this.playerPokemon);
        const aiMove = this.opponentPokemon.moves[aiMoveIndex];
        const aiMoveData = MOVES_DATA[aiMove?.moveId];
        if (aiMove && aiMoveData) {
          this.executeMove(this.opponentPokemon, this.playerPokemon, aiMove, aiMoveData, false).then(() => {
            if (this.playerPokemon.currentHp <= 0) {
              this.handlePlayerFaint();
            } else {
              this.turnInProgress = false;
              this.showBattleMenu();
            }
          });
        } else {
          this.turnInProgress = false;
          this.showBattleMenu();
        }
      });
    }
  }

  private showBagInBattle(): void {
    const items = Object.entries(this.playerState.bag).filter(([id]) => {
      return ['poke_ball', 'great_ball', 'ultra_ball', 'master_ball', 'potion', 'super_potion', 'hyper_potion', 'full_restore'].includes(id);
    });

    if (items.length === 0) {
      this.textBox.show(["No usable items!"], () => this.showBattleMenu());
      return;
    }

    // For simplicity, auto-use first available ball (wild) or first potion
    if (this.battleType === BattleType.WILD) {
      const ball = items.find(([id]) => id.includes('ball'));
      if (ball) {
        this.useBall(ball[0]);
        return;
      }
    }

    const potion = items.find(([id]) => id.includes('potion') || id === 'full_restore');
    if (potion) {
      this.usePotion(potion[0]);
      return;
    }

    this.textBox.show(["No usable items!"], () => this.showBattleMenu());
  }

  private async useBall(ballType: string): Promise<void> {
    if (!this.playerState.useItem(ballType)) {
      this.textBox.show(["No balls left!"], () => this.showBattleMenu());
      return;
    }

    const ballName = ballType.replace(/_/g, ' ').toUpperCase();
    const oppName = this.getSpeciesName(this.opponentPokemon.speciesId);

    await this.showText([`${this.playerState.name} used\n${ballName}!`]);

    const result = attemptCatch(this.opponentPokemon, ballType);

    // Shake animation
    for (let i = 0; i < result.shakes; i++) {
      soundSystem.catchShake();
      await this.delay(500);

      this.tweens.add({
        targets: this.opponentSprite,
        angle: 10,
        duration: 100,
        yoyo: true,
        repeat: 1,
      });
      await this.delay(300);
    }

    if (result.caught) {
      soundSystem.catchSuccess();
      this.battleOver = true;

      this.tweens.add({
        targets: this.opponentSprite,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 500,
      });

      await this.showText([`Gotcha! ${oppName}\nwas caught!`]);

      // Add to party/PC
      const addedToParty = this.playerState.addToParty(this.opponentPokemon);
      if (!addedToParty) {
        await this.showText([`${oppName} was sent\nto the PC!`]);
      }

      this.endBattle();
    } else {
      await this.showText(["Oh no! The POKeMON\nbroke free!"]);

      // Opponent attacks
      const aiMoveIndex = selectAIMove(this.opponentPokemon, this.playerPokemon);
      const aiMove = this.opponentPokemon.moves[aiMoveIndex];
      const aiMoveData = MOVES_DATA[aiMove?.moveId];
      if (aiMove && aiMoveData) {
        await this.executeMove(this.opponentPokemon, this.playerPokemon, aiMove, aiMoveData, false);
        if (this.playerPokemon.currentHp <= 0) {
          await this.handlePlayerFaint();
          return;
        }
      }
      this.turnInProgress = false;
      this.showBattleMenu();
    }
  }

  private usePotion(potionType: string): void {
    if (!this.playerState.useItem(potionType)) {
      this.textBox.show(["No potions left!"], () => this.showBattleMenu());
      return;
    }

    let healAmount = 20;
    if (potionType === 'super_potion') healAmount = 50;
    else if (potionType === 'hyper_potion') healAmount = 200;
    else if (potionType === 'full_restore') healAmount = 999;

    this.playerPokemon.currentHp = Math.min(
      this.playerPokemon.stats.hp,
      this.playerPokemon.currentHp + healAmount
    );

    if (potionType === 'full_restore') {
      this.playerPokemon.status = StatusCondition.NONE;
    }

    this.hud.updatePlayer(this.playerPokemon);
    soundSystem.heal();

    const name = this.getSpeciesName(this.playerPokemon.speciesId);
    this.textBox.show([`Used POTION on\n${name}!`], () => {
      // Opponent attacks
      const aiMoveIndex = selectAIMove(this.opponentPokemon, this.playerPokemon);
      const aiMove = this.opponentPokemon.moves[aiMoveIndex];
      const aiMoveData = MOVES_DATA[aiMove?.moveId];
      if (aiMove && aiMoveData) {
        this.executeMove(this.opponentPokemon, this.playerPokemon, aiMove, aiMoveData, false).then(() => {
          if (this.playerPokemon.currentHp <= 0) {
            this.handlePlayerFaint();
          } else {
            this.turnInProgress = false;
            this.showBattleMenu();
          }
        });
      } else {
        this.turnInProgress = false;
        this.showBattleMenu();
      }
    });
  }

  private showPartyInBattle(): void {
    const lines = this.playerState.party.map((p, i) => {
      const name = this.getSpeciesName(p.speciesId);
      const marker = i === this.currentPlayerPokemonIndex ? '>' : ' ';
      return `${marker}${name} Lv${p.level}\n  HP: ${p.currentHp}/${p.stats.hp}`;
    });

    this.textBox.show(lines, () => this.showBattleMenu());
  }

  private endBattle(): void {
    // Update party state back
    this.playerState.party[this.currentPlayerPokemonIndex] = this.playerPokemon;

    // Check for Hall of Fame (just beat the Champion)
    if (this.hallOfFame) {
      this.cameras.main.fadeOut(500, 255, 255, 255);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.showHallOfFame();
      });
      return;
    }

    // Check for next Elite Four battle in queue
    if (this.eliteFourQueue.length > 0) {
      const next = this.eliteFourQueue.shift()!;
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('BattleScene', {
          type: 'trainer',
          trainerId: next.trainerId,
          trainerName: next.trainerName,
          playerState: this.playerState.toSave(),
          returnMap: this.returnMap,
          returnX: this.returnX,
          returnY: this.returnY,
          eliteFourQueue: this.eliteFourQueue,
          hallOfFame: this.eliteFourQueue.length === 0, // Last one triggers Hall of Fame
        });
      });
      return;
    }

    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('OverworldScene', {
        mapId: this.returnMap,
        playerX: this.returnX,
        playerY: this.returnY,
        saveData: this.playerState.toSave(),
      });
    });
  }

  private async showHallOfFame(): Promise<void> {
    // Clear battle scene and show credits
    this.children.removeAll(true);
    this.cameras.main.fadeIn(500, 0, 0, 0);
    this.cameras.main.setBackgroundColor('#000000');

    // Show Hall of Fame messages one at a time
    const textBox = new TextBox(this);

    // Handle text advancement
    const zKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    const enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    zKey.on('down', () => { if (textBox.getIsVisible()) textBox.advance(); });
    enterKey.on('down', () => { if (textBox.getIsVisible()) textBox.advance(); });

    soundSystem.victory();
    this.playerState.storyFlags['champion'] = true;

    textBox.show(HALL_OF_FAME_TEXT, () => {
      // Return to Pallet Town after credits
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        // Heal party before returning
        for (const p of this.playerState.party) {
          p.currentHp = p.stats.hp;
          p.status = StatusCondition.NONE;
          for (const m of p.moves) m.currentPp = m.maxPp;
        }
        this.scene.start('OverworldScene', {
          mapId: 'player_house',
          playerX: 3,
          playerY: 5,
          saveData: this.playerState.toSave(),
        });
      });
    });
  }

  private updateHUD(): void {
    this.hud.updatePlayer(this.playerPokemon);
    this.hud.updateOpponent(this.opponentPokemon);
  }

  private showText(messages: string[]): Promise<void> {
    return new Promise(resolve => {
      this.textBox.show(messages, resolve);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      this.time.delayedCall(ms, resolve);
    });
  }

  private getSpeciesName(speciesId: number): string {
    return POKEMON_DATA[speciesId]?.name || `#${speciesId}`;
  }

  private generateTrainerTeam(trainerId: string): PokemonInstance[] {
    // Check Elite Four
    const e4Member = ELITE_FOUR.find(e => e.id === trainerId);
    if (e4Member) {
      return e4Member.team.map(p => createPokemon(p.speciesId, p.level));
    }

    // Check Champion
    if (trainerId === CHAMPION.id) {
      return CHAMPION.team.map(p => createPokemon(p.speciesId, p.level));
    }

    // Check gym leaders
    const gymLeader = GYM_LEADERS[trainerId];
    if (gymLeader) {
      return gymLeader.team.map(p => createPokemon(p.speciesId, p.level));
    }

    // Check regular trainers
    const trainer = TRAINERS[trainerId];
    if (trainer) {
      return trainer.team.map(p => createPokemon(p.speciesId, p.level));
    }

    // Generic fallback
    return [createPokemon(19, 8)]; // Rattata
  }
}
