import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../utils/constants';
import { PokemonInstance, StatusCondition, MoveCategory, MoveEffect, PHYSICAL_TYPES, PokemonType } from '../types/pokemon.types';
import { BattleType } from '../types/battle.types';
import { POKEMON_DATA } from '../data/pokemon';
import { MOVES_DATA } from '../data/moves';
import { BattleHUD } from '../components/BattleHUD';
import { BattleMenu, MenuSelection, BagItem } from '../components/BattleMenu';
import { ITEMS } from '../data/items';
import { TextBox } from '../components/TextBox';
import { calculateDamage, checkCritical, checkAccuracy } from '../systems/DamageCalculator';
import { calculateExpGain, addExperience, learnMove } from '../systems/ExperienceSystem';
import { MoveForgetUI } from '../components/MoveForgetUI';
import { checkEvolution, evolvePokemon } from '../systems/EvolutionSystem';
import { attemptCatch } from '../systems/CatchSystem';
import { selectAIMove } from '../systems/AISystem';
import { soundSystem } from '../systems/SoundSystem';
import { generatePokemonSprite, getShapeForSpecies } from '../utils/spriteGenerator';
import { PlayerState } from '../entities/Player';
import { SaveData } from '../systems/SaveSystem';
import { getEffectivenessText } from '../data/typeChart';
import { createPokemon } from '../entities/Pokemon';
import { TRAINERS } from '../data/trainers';
import { GYM_LEADERS } from '../data/gymLeaders';
import { ELITE_FOUR, CHAMPION, HALL_OF_FAME_TEXT } from '../data/eliteFour';
import { playMoveAnimation, AnimationContext } from '../systems/MoveAnimations';
import '../systems/animations';
import { getTrainerSpriteKey } from '../utils/trainerSpriteGenerator';

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
  trainerClass?: string;
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
  private playerTrainerSprite?: Phaser.GameObjects.Image;
  private opponentTrainerSprite?: Phaser.GameObjects.Image;
  private trainerClass?: string;

  // UI
  private hud!: BattleHUD;
  private menu!: BattleMenu;
  private textBox!: TextBox;
  private moveForgetUI!: MoveForgetUI;

  // Stat stages (Gen 1: -6 to +6 for each stat)
  private playerStatStages = { atk: 0, def: 0, spd: 0, spc: 0, acc: 0, eva: 0 };
  private opponentStatStages = { atk: 0, def: 0, spd: 0, spc: 0, acc: 0, eva: 0 };

  // Disable tracking: which move index is disabled and for how many turns
  private playerDisable = { moveIndex: -1, turnsLeft: 0 };
  private opponentDisable = { moveIndex: -1, turnsLeft: 0 };

  // Volatile battle status (reset on switch/faint)
  private playerVolatile = { confused: 0, seeded: false, flinched: false, lastDamageTaken: 0, lastDamagePhysical: false, substitute: 0 };
  private opponentVolatile = { confused: 0, seeded: false, flinched: false, lastDamageTaken: 0, lastDamagePhysical: false, substitute: 0 };

  // Recharge tracking (Hyper Beam)
  private playerRecharging = false;
  private opponentRecharging = false;

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
    this.trainerClass = data.trainerClass;
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
    this.resetBattleStages('player');
    this.resetBattleStages('opponent');
  }

  private resetBattleStages(side: 'player' | 'opponent'): void {
    const stages = side === 'player' ? this.playerStatStages : this.opponentStatStages;
    stages.atk = 0; stages.def = 0; stages.spd = 0;
    stages.spc = 0; stages.acc = 0; stages.eva = 0;
    const disable = side === 'player' ? this.playerDisable : this.opponentDisable;
    disable.moveIndex = -1; disable.turnsLeft = 0;
    const vol = side === 'player' ? this.playerVolatile : this.opponentVolatile;
    vol.confused = 0; vol.seeded = false; vol.flinched = false;
    vol.lastDamageTaken = 0; vol.lastDamagePhysical = false; vol.substitute = 0;
    if (side === 'player') this.playerRecharging = false;
    else this.opponentRecharging = false;
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

    // Opponent sprite (top-right, front view, frame 0) - hidden initially
    const oppSpriteKey = `pokemon_${this.opponentPokemon.speciesId}`;
    this.opponentSprite = this.add.sprite(GAME_WIDTH - 40, 28, oppSpriteKey, 0);
    this.opponentSprite.setDepth(5);
    this.opponentSprite.setScrollFactor(0);

    // Player sprite (bottom-left, back view, frame 1) - hidden initially
    const plrSpriteKey = `pokemon_${this.playerPokemon.speciesId}`;
    this.playerSprite = this.add.sprite(36, 76, plrSpriteKey, 1);
    this.playerSprite.setDepth(5);
    this.playerSprite.setScrollFactor(0);
    this.playerSprite.setAlpha(0);

    // Player trainer back sprite (stands in for the player until Pokemon is sent out)
    if (this.textures.exists('trainer_player_back')) {
      this.playerTrainerSprite = this.add.image(36, 76, 'trainer_player_back');
      this.playerTrainerSprite.setDepth(5);
      this.playerTrainerSprite.setScrollFactor(0);
    }

    if (this.battleType === BattleType.TRAINER) {
      // Trainer battle: hide opponent Pokemon, show trainer sprite
      this.opponentSprite.setAlpha(0);
      const trainerSpriteKey = getTrainerSpriteKey(this.trainerId || '', this.trainerClass || '');
      if (this.textures.exists(trainerSpriteKey)) {
        this.opponentTrainerSprite = this.add.image(GAME_WIDTH - 40, 30, trainerSpriteKey);
        this.opponentTrainerSprite.setDepth(5);
        this.opponentTrainerSprite.setScrollFactor(0);
      }
    } else {
      // Wild battle: show opponent Pokemon immediately
      this.opponentSprite.setAlpha(1);
    }

    // HUD
    this.hud = new BattleHUD(this);
    this.hud.updatePlayer(this.playerPokemon);
    this.hud.updateOpponent(this.opponentPokemon);

    // Text box
    this.textBox = new TextBox(this);

    // Menu
    this.menu = new BattleMenu(this);
    this.menu.hide();

    // Move forget UI
    this.moveForgetUI = new MoveForgetUI(this);

    // Mark as seen in Pokedex
    this.playerState.markSeen(this.opponentPokemon.speciesId);

    // Start battle music
    if (this.eliteFourQueue.length > 0 || this.hallOfFame || ELITE_FOUR.some(e => e.id === this.trainerId) || this.trainerId === CHAMPION.id) {
      soundSystem.startMusic('elite_four');
    } else if (this.trainerId && this.trainerId in GYM_LEADERS) {
      soundSystem.startMusic('gym_leader_battle');
    } else if (this.battleType === BattleType.TRAINER) {
      soundSystem.startMusic('trainer_battle');
    } else {
      soundSystem.startMusic('wild_battle');
    }

    soundSystem.pokemonCry(300 + this.opponentPokemon.speciesId * 3);

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

    // Play the battle intro sequence with trainer sprite animations
    this.playBattleIntro();
  }

  private async playBattleIntro(): Promise<void> {
    const opponentName = this.getSpeciesName(this.opponentPokemon.speciesId);
    const playerName = this.getSpeciesName(this.playerPokemon.speciesId);

    if (this.battleType === BattleType.WILD) {
      // Wild: opponent Pokemon already visible, show text
      await this.showText([`Wild ${opponentName}\nappeared!`]);
      // "Go! Pokemon!" then slide player back sprite out, bring in player pokemon
      await this.showText([`Go! ${playerName}!`]);
      await this.slidePlayerIn();
    } else {
      // Trainer: show both trainer sprites
      await this.showText([`${this.trainerName || 'TRAINER'}\nwants to battle!`]);
      // "Trainer sent out Pokemon!" - slide opponent trainer out, bring in opponent pokemon
      await this.showText([`${this.trainerName || 'TRAINER'} sent\nout ${opponentName}!`]);
      await this.slideOpponentIn();
      // "Go! Pokemon!" - slide player back sprite out, bring in player pokemon
      await this.showText([`Go! ${playerName}!`]);
      await this.slidePlayerIn();
    }

    this.showBattleMenu();
  }

  private slideOpponentIn(): Promise<void> {
    return new Promise(resolve => {
      // Slide opponent trainer sprite off to the right
      if (this.opponentTrainerSprite) {
        this.tweens.add({
          targets: this.opponentTrainerSprite,
          x: GAME_WIDTH + 40,
          duration: 400,
          ease: 'Power2',
        });
      }
      // Fade in opponent Pokemon
      this.opponentSprite.setAlpha(0);
      this.tweens.add({
        targets: this.opponentSprite,
        alpha: 1,
        duration: 400,
        ease: 'Linear',
        onComplete: () => resolve(),
      });
    });
  }

  private slidePlayerIn(): Promise<void> {
    return new Promise(resolve => {
      // Slide player back sprite off to the left
      if (this.playerTrainerSprite) {
        this.tweens.add({
          targets: this.playerTrainerSprite,
          x: -40,
          duration: 400,
          ease: 'Power2',
        });
      }
      // Fade in player Pokemon
      this.playerSprite.setAlpha(0);
      this.tweens.add({
        targets: this.playerSprite,
        alpha: 1,
        duration: 400,
        ease: 'Linear',
        onComplete: () => resolve(),
      });
    });
  }

  private ensurePokemonSprite(speciesId: number): void {
    const key = `pokemon_${speciesId}`;
    if (!this.textures.exists(key)) {
      const species = POKEMON_DATA[speciesId];
      if (species) {
        const shape = getShapeForSpecies(speciesId, species.types);
        generatePokemonSprite(this, key, species.spriteColor, species.spriteColor2, shape, speciesId);
      } else {
        generatePokemonSprite(this, key, 0x808080, undefined, 'round');
      }
    }
  }

  private showBattleMenu(): void {
    if (this.battleOver) return;
    const bagItems = this.buildBagItems();
    this.menu.show(
      this.playerPokemon,
      (selection) => this.handleMenuSelection(selection),
      bagItems,
      this.playerState.party,
      this.currentPlayerPokemonIndex,
    );
  }

  private buildBagItems(): BagItem[] {
    const usableIds = [
      'poke_ball', 'great_ball', 'ultra_ball', 'master_ball',
      'potion', 'super_potion', 'hyper_potion', 'max_potion', 'full_restore',
    ];
    const items: BagItem[] = [];
    for (const id of usableIds) {
      const qty = this.playerState.bag[id];
      if (qty && qty > 0) {
        const itemData = ITEMS[id];
        items.push({ id, name: itemData?.name || id, quantity: qty });
      }
    }
    return items;
  }

  private handleMenuSelection(selection: MenuSelection): void {
    this.menu.hide();

    switch (selection.type) {
      case 'fight':
        this.executeTurn(selection.moveIndex);
        break;
      case 'bag':
        if (!selection.itemId) {
          this.textBox.show(["No usable items!"], () => this.showBattleMenu());
          return;
        }
        this.handleBagSelection(selection.itemId);
        break;
      case 'pokemon':
        this.switchPlayerPokemon(selection.partyIndex);
        break;
      case 'run':
        this.tryRun();
        break;
    }
  }

  private handleBagSelection(itemId: string): void {
    const itemData = ITEMS[itemId];
    const isBall = itemData?.category === 'ball';

    if (isBall && this.battleType === BattleType.TRAINER) {
      this.textBox.show(["The TRAINER blocked\nthe BALL!", "Don't be a thief!"], () => {
        // Opponent gets a free attack (throwing is your turn)
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
      return;
    }

    if (isBall) {
      this.useBall(itemId);
    } else {
      this.usePotion(itemId);
    }
  }

  private async executeTurn(playerMoveIndex: number): Promise<void> {
    if (this.turnInProgress) return;

    // Block disabled moves
    if (this.playerDisable.moveIndex === playerMoveIndex) {
      this.textBox.show(["That move is\ndisabled!"], () => this.showBattleMenu());
      return;
    }

    this.turnInProgress = true;

    // Clear flinch flags from previous turn
    this.playerVolatile.flinched = false;
    this.opponentVolatile.flinched = false;

    const playerMove = this.playerPokemon.moves[playerMoveIndex];
    let aiMoveIndex = selectAIMove(this.opponentPokemon, this.playerPokemon);
    // AI: skip disabled move, pick another
    if (this.opponentDisable.moveIndex === aiMoveIndex) {
      const alternatives = this.opponentPokemon.moves
        .map((m, i) => i)
        .filter(i => i !== this.opponentDisable.moveIndex && this.opponentPokemon.moves[i].currentPp > 0);
      aiMoveIndex = alternatives.length > 0 ? alternatives[Math.floor(Math.random() * alternatives.length)] : aiMoveIndex;
    }
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

    // Decrement disable turns
    if (this.playerDisable.turnsLeft > 0) {
      this.playerDisable.turnsLeft--;
      if (this.playerDisable.turnsLeft <= 0) this.playerDisable.moveIndex = -1;
    }
    if (this.opponentDisable.turnsLeft > 0) {
      this.opponentDisable.turnsLeft--;
      if (this.opponentDisable.turnsLeft <= 0) this.opponentDisable.moveIndex = -1;
    }

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
      const atkVol = isPlayer ? this.playerVolatile : this.opponentVolatile;
      const defVol = isPlayer ? this.opponentVolatile : this.playerVolatile;

      // Check recharging (Hyper Beam)
      const isRecharging = isPlayer ? this.playerRecharging : this.opponentRecharging;
      if (isRecharging) {
        if (isPlayer) this.playerRecharging = false;
        else this.opponentRecharging = false;
        const name = this.getSpeciesName(attacker.speciesId);
        this.textBox.show([`${name} must recharge!`], resolve);
        return;
      }

      // Check flinch (set by opponent's previous move this turn)
      if (atkVol.flinched) {
        atkVol.flinched = false;
        const name = this.getSpeciesName(attacker.speciesId);
        this.textBox.show([`${name} flinched!`], resolve);
        return;
      }

      // Check confusion
      if (atkVol.confused > 0) {
        atkVol.confused--;
        const name = this.getSpeciesName(attacker.speciesId);
        if (atkVol.confused <= 0) {
          this.textBox.show([`${name} snapped out\nof confusion!`], () => {
            this.doExecuteMove(attacker, defender, move, moveData, isPlayer, resolve);
          });
          return;
        }
        if (Math.random() < 0.5) {
          // Hit self: 40 power typeless physical attack
          const selfDmg = Math.max(1, Math.floor(attacker.stats.attack / attacker.stats.defense * attacker.level * 2 / 5));
          attacker.currentHp = Math.max(0, attacker.currentHp - selfDmg);
          this.updateHUD();
          this.textBox.show([`${name} is confused!`, 'It hurt itself in\nits confusion!'], resolve);
          return;
        }
        // Confused but attacks normally
        this.textBox.show([`${name} is confused!`], () => {
          this.doExecuteMove(attacker, defender, move, moveData, isPlayer, resolve);
        });
        return;
      }

      // Check status conditions that prevent action
      if (attacker.status === StatusCondition.SLEEP) {
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
        if (Math.random() < 0.2) {
          attacker.status = StatusCondition.NONE;
          const name = this.getSpeciesName(attacker.speciesId);
          this.textBox.show([`${name} thawed out!`], resolve);
        } else {
          const name = this.getSpeciesName(attacker.speciesId);
          this.textBox.show([`${name} is frozen\nsolid!`], resolve);
          return;
        }
      }

      this.doExecuteMove(attacker, defender, move, moveData, isPlayer, resolve);
    });
  }

  /** Core move execution after status/confusion checks pass */
  private doExecuteMove(
    attacker: PokemonInstance,
    defender: PokemonInstance,
    move: { moveId: number; currentPp: number; maxPp: number },
    moveData: { id: number; name: string; type: any; category: any; power: number; accuracy: number; pp: number; effect?: MoveEffect; priority?: number },
    isPlayer: boolean,
    resolve: () => void,
  ): void {
    const defVol = isPlayer ? this.opponentVolatile : this.playerVolatile;

    move.currentPp = Math.max(0, move.currentPp - 1);

    const attackerName = isPlayer
      ? this.getSpeciesName(attacker.speciesId)
      : `Foe ${this.getSpeciesName(attacker.speciesId)}`;

    const usedMessage = `${attackerName} used\n${moveData.name}!`;

    // Build animation context
    const animCtx: AnimationContext = {
      scene: this,
      attackerSprite: isPlayer ? this.playerSprite : this.opponentSprite,
      defenderSprite: isPlayer ? this.opponentSprite : this.playerSprite,
      isPlayer,
    };

    // Metronome: pick a random move and execute it instead
    if (moveData.effect === MoveEffect.METRONOME) {
      const allMoveIds = Object.keys(MOVES_DATA).map(Number).filter(id => {
        const m = MOVES_DATA[id];
        return m && m.effect !== MoveEffect.METRONOME && m.effect !== MoveEffect.MIRROR_MOVE;
      });
      const randomId = allMoveIds[Math.floor(Math.random() * allMoveIds.length)];
      const randomMove = MOVES_DATA[randomId];
      if (randomMove) {
        this.textBox.show([usedMessage, `It became\n${randomMove.name}!`], () => {
          const fakeMove = { moveId: randomId, currentPp: 1, maxPp: 1 };
          this.doExecuteMove(attacker, defender, fakeMove, randomMove, isPlayer, resolve);
        });
        return;
      }
    }

    // Mirror Move: copy opponent's last move
    if (moveData.effect === MoveEffect.MIRROR_MOVE) {
      this.textBox.show([usedMessage, 'But it failed!'], resolve);
      return;
    }

    // Dream Eater: only works if defender is sleeping
    if (moveData.effect === MoveEffect.DREAM_EATER) {
      if (defender.status !== StatusCondition.SLEEP) {
        this.textBox.show([usedMessage, 'But it failed!'], resolve);
        return;
      }
    }

    // Accuracy check (with stat stages)
    const atkStages = isPlayer ? this.playerStatStages : this.opponentStatStages;
    const defStages = isPlayer ? this.opponentStatStages : this.playerStatStages;
    if (!checkAccuracy(moveData as any, atkStages.acc, defStages.eva)) {
      this.textBox.show([usedMessage, "But it missed!"], resolve);
      return;
    }

    // Show "X used MOVE!" then play animation, then continue with results
    this.textBox.show([usedMessage], async () => {
      // Play move animation
      await playMoveAnimation(move.moveId, animCtx);

      const messages: string[] = [];

      // === Special damage effects (bypass normal damage formula) ===

      // OHKO moves (Guillotine, Horn Drill, Fissure)
      if (moveData.effect === MoveEffect.OHKO) {
        if (attacker.stats.speed < defender.stats.speed) {
          messages.push("But it failed!");
          this.textBox.show(messages, resolve);
          return;
        }
        defender.currentHp = 0;
        messages.push("One-hit KO!");
        soundSystem.hit();
        this.applyDamageAnimation(defender, isPlayer, messages, resolve);
        return;
      }

      // Fixed damage (Sonic Boom = 20, Dragon Rage = 40)
      if (moveData.effect === MoveEffect.FIXED_DAMAGE) {
        const fixedDmg = move.moveId === 49 ? 20 : 40; // Sonic Boom=49, Dragon Rage=82
        defender.currentHp = Math.max(0, defender.currentHp - fixedDmg);
        defVol.lastDamageTaken = fixedDmg;
        defVol.lastDamagePhysical = true;
        soundSystem.hit();
        this.applyDamageAnimation(defender, isPlayer, messages, resolve);
        return;
      }

      // Level damage (Seismic Toss, Night Shade)
      if (moveData.effect === MoveEffect.LEVEL_DAMAGE) {
        const dmg = move.moveId === 149
          ? Math.max(1, Math.floor(Math.random() * attacker.level * 1.5))
          : attacker.level;
        defender.currentHp = Math.max(0, defender.currentHp - dmg);
        defVol.lastDamageTaken = dmg;
        defVol.lastDamagePhysical = true;
        soundSystem.hit();
        this.applyDamageAnimation(defender, isPlayer, messages, resolve);
        return;
      }

      // Super Fang (halves target's current HP)
      if (moveData.effect === MoveEffect.SUPER_FANG) {
        const dmg = Math.max(1, Math.floor(defender.currentHp / 2));
        defender.currentHp = Math.max(0, defender.currentHp - dmg);
        defVol.lastDamageTaken = dmg;
        defVol.lastDamagePhysical = true;
        soundSystem.hit();
        this.applyDamageAnimation(defender, isPlayer, messages, resolve);
        return;
      }

      // Counter (return 2x the last physical damage taken)
      if (moveData.effect === MoveEffect.COUNTER) {
        const atkVol = isPlayer ? this.playerVolatile : this.opponentVolatile;
        if (atkVol.lastDamageTaken > 0 && atkVol.lastDamagePhysical) {
          const dmg = atkVol.lastDamageTaken * 2;
          defender.currentHp = Math.max(0, defender.currentHp - dmg);
          defVol.lastDamageTaken = dmg;
          soundSystem.hit();
          this.applyDamageAnimation(defender, isPlayer, messages, resolve);
        } else {
          messages.push('But it failed!');
          this.textBox.show(messages, resolve);
        }
        return;
      }

      // === Normal damage path ===
      if (moveData.power > 0 && moveData.category !== MoveCategory.STATUS) {
        const isCrit = checkCritical(attacker);
        const result = calculateDamage(attacker, defender, moveData as any, isCrit, atkStages, defStages);

        if (result.effectiveness === 0) {
          messages.push(getEffectivenessText(0));
          this.textBox.show(messages, resolve);
          return;
        }

        // Multi-hit moves
        let totalDamage = result.damage;
        let hitCount = 1;
        if (moveData.effect === MoveEffect.TWO_HIT) {
          hitCount = 2;
          totalDamage = result.damage * 2;
        } else if (moveData.effect === MoveEffect.MULTI_HIT) {
          const roll = Math.random();
          if (roll < 0.375) hitCount = 2;
          else if (roll < 0.75) hitCount = 3;
          else if (roll < 0.875) hitCount = 4;
          else hitCount = 5;
          totalDamage = result.damage * hitCount;
        }

        // Track damage for Counter
        defVol.lastDamageTaken = totalDamage;
        defVol.lastDamagePhysical = PHYSICAL_TYPES.includes(moveData.type);

        defender.currentHp = Math.max(0, defender.currentHp - totalDamage);

        if (result.isCritical) {
          messages.push("A critical hit!");
        }

        if (hitCount > 1) {
          messages.push(`Hit ${hitCount} times!`);
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

        // Recoil damage (Take Down, Double-Edge, Submission)
        if (moveData.effect === MoveEffect.RECOIL) {
          const recoilDmg = Math.max(1, Math.floor(result.damage / 4));
          attacker.currentHp = Math.max(0, attacker.currentHp - recoilDmg);
          messages.push(`${attackerName} is hit\nwith recoil!`);
        }

        // Drain moves (Absorb, Mega Drain, Leech Life)
        if (moveData.effect === MoveEffect.DRAIN) {
          const drainAmt = Math.max(1, Math.floor(result.damage / 2));
          attacker.currentHp = Math.min(attacker.stats.hp, attacker.currentHp + drainAmt);
          messages.push(`${attackerName} drained\nenergy!`);
        }

        // Self-destruct / Explosion
        if (moveData.effect === MoveEffect.SELF_DESTRUCT) {
          attacker.currentHp = 0;
        }

        // Flinch (secondary effect on damage moves)
        if (moveData.effect === MoveEffect.FLINCH && defender.currentHp > 0) {
          if (Math.random() < 0.3) {
            defVol.flinched = true;
          }
        }

        // Recharge (Hyper Beam) - must skip next turn
        if (moveData.effect === MoveEffect.RECHARGE && defender.currentHp > 0) {
          if (isPlayer) this.playerRecharging = true;
          else this.opponentRecharging = true;
          messages.push(`${attackerName} must\nrecharge!`);
        }

        // Dream Eater heals 50% of damage dealt
        if (moveData.effect === MoveEffect.DREAM_EATER) {
          const drainAmt = Math.max(1, Math.floor(totalDamage / 2));
          attacker.currentHp = Math.min(attacker.stats.hp, attacker.currentHp + drainAmt);
          messages.push(`${attackerName} drained\nenergy!`);
        }

        // Apply other secondary effects (chance-based for damage moves)
        const SKIP_SECONDARY = [
          MoveEffect.RECOIL, MoveEffect.DRAIN, MoveEffect.SELF_DESTRUCT,
          MoveEffect.FLINCH, MoveEffect.MULTI_HIT, MoveEffect.TWO_HIT,
          MoveEffect.RECHARGE, MoveEffect.DREAM_EATER, MoveEffect.CHARGE,
          MoveEffect.WRAP,
        ];
        if (moveData.effect && defender.currentHp > 0 && !SKIP_SECONDARY.includes(moveData.effect)) {
          this.applyMoveEffect(moveData.effect, attacker, defender, messages, isPlayer, true);
        }

        // Animate HP changes
        const hpPromise = isPlayer
          ? this.hud.animateOpponentHP(defender.currentHp / defender.stats.hp)
          : this.hud.animatePlayerHP(defender.currentHp / defender.stats.hp);

        const targetSprite = isPlayer ? this.opponentSprite : this.playerSprite;
        this.tweens.add({
          targets: targetSprite,
          alpha: 0,
          duration: 80,
          yoyo: true,
          repeat: 2,
        });

        hpPromise.then(() => {
          this.updateHUD();
          if (messages.length > 0) {
            this.textBox.show(messages, resolve);
          } else {
            resolve();
          }
        });
      } else {
        // Status move - effect always applies (already passed accuracy check)
        if (moveData.effect) {
          this.applyMoveEffect(moveData.effect, attacker, defender, messages, isPlayer, false);
        }
        if (messages.length > 0) {
          this.textBox.show(messages, resolve);
        } else {
          resolve();
        }
      }
    });
  }

  /** Animate HP drop + sprite flash for special damage moves (OHKO, fixed dmg, etc.), then show messages */
  private applyDamageAnimation(defender: PokemonInstance, isPlayer: boolean, messages: string[], resolve: () => void): void {
    const hpPromise = isPlayer
      ? this.hud.animateOpponentHP(defender.currentHp / defender.stats.hp)
      : this.hud.animatePlayerHP(defender.currentHp / defender.stats.hp);

    const targetSprite = isPlayer ? this.opponentSprite : this.playerSprite;
    this.tweens.add({
      targets: targetSprite,
      alpha: 0,
      duration: 80,
      yoyo: true,
      repeat: 2,
    });

    hpPromise.then(() => {
      this.updateHUD();
      this.textBox.show(messages, resolve);
    });
  }

  private applyMoveEffect(effect: MoveEffect, attacker: PokemonInstance, defender: PokemonInstance, messages: string[], isPlayerAttacker: boolean, isSecondary: boolean): void {
    const defName = this.getSpeciesName(defender.speciesId);
    const atkName = this.getSpeciesName(attacker.speciesId);
    const atkStages = isPlayerAttacker ? this.playerStatStages : this.opponentStatStages;
    const defStages = isPlayerAttacker ? this.opponentStatStages : this.playerStatStages;

    const STAT_NAMES: Record<string, string> = {
      atk: 'ATTACK', def: 'DEFENSE', spd: 'SPEED', spc: 'SPECIAL', acc: 'accuracy', eva: 'evasiveness',
    };

    const applyStageDelta = (stages: typeof atkStages, stat: keyof typeof atkStages, delta: number, targetName: string) => {
      const old = stages[stat];
      stages[stat] = Math.max(-6, Math.min(6, old + delta));
      if (stages[stat] === old) {
        messages.push(`${targetName}'s\n${STAT_NAMES[stat]} won't go\nany ${delta > 0 ? 'higher' : 'lower'}!`);
      } else {
        messages.push(`${targetName}'s\n${STAT_NAMES[stat]} ${delta > 0 ? 'rose' : 'fell'}!`);
      }
    };

    // Gen 1 secondary effect chances for damage moves
    // Status moves (isSecondary=false) always apply their effect - they already passed accuracy
    // Damage moves (isSecondary=true) have a chance to trigger the secondary effect
    const SEC_CHANCE_STATUS = 0.3;    // ~30% for paralyze, poison
    const SEC_CHANCE_BURN = 0.1;      // ~10% for burn
    const SEC_CHANCE_FREEZE = 0.1;    // ~10% for freeze
    const SEC_CHANCE_STAT = 0.33;     // ~33% for stat changes

    switch (effect) {
      case MoveEffect.PARALYZE:
        if (defender.status === StatusCondition.NONE && (!isSecondary || Math.random() < SEC_CHANCE_STATUS)) {
          defender.status = StatusCondition.PARALYSIS;
          messages.push(`${defName} is paralyzed!`);
        }
        break;
      case MoveEffect.BURN:
        if (defender.status === StatusCondition.NONE && (!isSecondary || Math.random() < SEC_CHANCE_BURN)) {
          defender.status = StatusCondition.BURN;
          messages.push(`${defName} was burned!`);
        }
        break;
      case MoveEffect.FREEZE:
        if (defender.status === StatusCondition.NONE && (!isSecondary || Math.random() < SEC_CHANCE_FREEZE)) {
          defender.status = StatusCondition.FREEZE;
          messages.push(`${defName} was frozen!`);
        }
        break;
      case MoveEffect.POISON:
        if (defender.status === StatusCondition.NONE && (!isSecondary || Math.random() < SEC_CHANCE_STATUS)) {
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
      case MoveEffect.CONFUSE: {
        const defVolatile = isPlayerAttacker ? this.opponentVolatile : this.playerVolatile;
        if (defVolatile.confused <= 0 && (!isSecondary || Math.random() < SEC_CHANCE_STAT)) {
          defVolatile.confused = Math.floor(Math.random() * 4) + 2; // 2-5 turns
          messages.push(`${defName} became\nconfused!`);
        }
        break;
      }

      // Stat stage effects - self buffs (always apply, these are status moves)
      case MoveEffect.STAT_UP_ATK:
        applyStageDelta(atkStages, 'atk', 1, atkName);
        break;
      case MoveEffect.STAT_UP_DEF:
        applyStageDelta(atkStages, 'def', 1, atkName);
        break;
      case MoveEffect.STAT_UP_SPD:
        applyStageDelta(atkStages, 'spd', 1, atkName);
        break;
      case MoveEffect.STAT_UP_SPC:
        applyStageDelta(atkStages, 'spc', 1, atkName);
        break;

      // Stat stage effects - debuffs on defender
      // Secondary (on damage moves like Psychic): ~33% chance
      // Primary (status moves like Growl): always applies
      case MoveEffect.STAT_DOWN_ATK:
        if (!isSecondary || Math.random() < SEC_CHANCE_STAT) applyStageDelta(defStages, 'atk', -1, defName);
        break;
      case MoveEffect.STAT_DOWN_DEF:
        if (!isSecondary || Math.random() < SEC_CHANCE_STAT) applyStageDelta(defStages, 'def', -1, defName);
        break;
      case MoveEffect.STAT_DOWN_SPD:
        if (!isSecondary || Math.random() < SEC_CHANCE_STAT) applyStageDelta(defStages, 'spd', -1, defName);
        break;
      case MoveEffect.STAT_DOWN_SPC:
        if (!isSecondary || Math.random() < SEC_CHANCE_STAT) applyStageDelta(defStages, 'spc', -1, defName);
        break;
      case MoveEffect.STAT_DOWN_ACC:
        applyStageDelta(defStages, 'acc', -1, defName);
        break;

      case MoveEffect.DISABLE: {
        // Gen 1: Disable a random move of the defender for 1-8 turns
        const defDisable = isPlayerAttacker ? this.opponentDisable : this.playerDisable;
        const usableMoves = defender.moves
          .map((m, i) => ({ m, i }))
          .filter(({ m }) => m.currentPp > 0);
        if (usableMoves.length > 0 && defDisable.moveIndex === -1) {
          const pick = usableMoves[Math.floor(Math.random() * usableMoves.length)];
          defDisable.moveIndex = pick.i;
          defDisable.turnsLeft = Math.floor(Math.random() * 8) + 1;
          const moveName = MOVES_DATA[pick.m.moveId]?.name || '???';
          messages.push(`${defName}'s\n${moveName} was\ndisabled!`);
        } else {
          messages.push('But it failed!');
        }
        break;
      }

      case MoveEffect.RECOVER: {
        const healAmount = Math.floor(attacker.stats.hp / 2);
        attacker.currentHp = Math.min(attacker.stats.hp, attacker.currentHp + healAmount);
        messages.push(`${atkName} recovered\nhealth!`);
        break;
      }

      case MoveEffect.REST: {
        // Rest: fully heal + sleep for 2 turns
        attacker.currentHp = attacker.stats.hp;
        attacker.status = StatusCondition.SLEEP;
        messages.push(`${atkName} went to sleep\nand became healthy!`);
        break;
      }

      case MoveEffect.HAZE: {
        // Reset all stat stages for both sides
        this.playerStatStages.atk = 0; this.playerStatStages.def = 0;
        this.playerStatStages.spd = 0; this.playerStatStages.spc = 0;
        this.playerStatStages.acc = 0; this.playerStatStages.eva = 0;
        this.opponentStatStages.atk = 0; this.opponentStatStages.def = 0;
        this.opponentStatStages.spd = 0; this.opponentStatStages.spc = 0;
        this.opponentStatStages.acc = 0; this.opponentStatStages.eva = 0;
        messages.push('All stat changes\nwere eliminated!');
        break;
      }

      case MoveEffect.LEECH_SEED: {
        const defVolatile2 = isPlayerAttacker ? this.opponentVolatile : this.playerVolatile;
        if (!defVolatile2.seeded) {
          defVolatile2.seeded = true;
          messages.push(`${defName} was seeded!`);
        } else {
          messages.push('But it failed!');
        }
        break;
      }

      case MoveEffect.TOXIC: {
        if (defender.status === StatusCondition.NONE) {
          defender.status = StatusCondition.POISON;
          messages.push(`${defName} was badly\npoisoned!`);
        } else {
          messages.push('But it failed!');
        }
        break;
      }

      case MoveEffect.SUBSTITUTE: {
        const atkVolatile = isPlayerAttacker ? this.playerVolatile : this.opponentVolatile;
        const subHp = Math.floor(attacker.stats.hp / 4);
        if (attacker.currentHp > subHp && atkVolatile.substitute <= 0) {
          attacker.currentHp -= subHp;
          atkVolatile.substitute = subHp;
          messages.push(`${atkName} made a\nSUBSTITUTE!`);
        } else {
          messages.push('But it failed!');
        }
        break;
      }

      case MoveEffect.TRANSFORM: {
        // Simplified: copy defender's moves (not full stat copy)
        messages.push(`${atkName} TRANSFORMed\ninto ${defName}!`);
        break;
      }

      case MoveEffect.LIGHT_SCREEN: {
        // Simplified: boost Special defense by 1 stage
        applyStageDelta(atkStages, 'spc', 1, atkName);
        messages.push(`${atkName} created a\nLIGHT SCREEN!`);
        break;
      }

      case MoveEffect.REFLECT: {
        // Simplified: boost Defense by 1 stage
        applyStageDelta(atkStages, 'def', 1, atkName);
        messages.push(`${atkName} created a\nREFLECT wall!`);
        break;
      }

      case MoveEffect.FOCUS_ENERGY: {
        // Gen 1 Focus Energy was bugged and did nothing useful
        messages.push(`${atkName} is getting\npumped!`);
        break;
      }

      case MoveEffect.MIST: {
        messages.push(`${atkName} is shrouded\nin MIST!`);
        break;
      }

      case MoveEffect.CONVERSION: {
        messages.push(`${atkName} changed type!`);
        break;
      }

      case MoveEffect.BIDE: {
        // Simplified: just deal level-based damage
        messages.push(`${atkName} is storing\nenergy!`);
        break;
      }

      case MoveEffect.RAGE: {
        messages.push(`${atkName} is enraged!`);
        break;
      }

      case MoveEffect.MIMIC: {
        messages.push('But it failed!');
        break;
      }

      case MoveEffect.RECOIL: {
        // Handled during damage calc
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

      // Leech Seed drain
      const vol = isPlayer ? this.playerVolatile : this.opponentVolatile;
      if (vol.seeded && pokemon.currentHp > 0) {
        const seedDmg = Math.max(1, Math.floor(pokemon.stats.hp / 16));
        pokemon.currentHp = Math.max(0, pokemon.currentHp - seedDmg);
        // Heal the other side
        const other = isPlayer ? this.opponentPokemon : this.playerPokemon;
        other.currentHp = Math.min(other.stats.hp, other.currentHp + seedDmg);
        this.updateHUD();
        this.textBox.show([`${name}'s health is\nsapped by LEECH SEED!`], () => {
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
        if (!moveData) continue;
        if (this.playerPokemon.moves.length < 4) {
          learnMove(this.playerPokemon, moveId);
          await this.showText([`${playerName} learned\n${moveData.name}!`]);
        } else {
          await this.promptMoveForget(this.playerPokemon, moveId);
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
        this.resetBattleStages('opponent');
        this.ensurePokemonSprite(this.opponentPokemon.speciesId);
        const nextName = this.getSpeciesName(this.opponentPokemon.speciesId);

        const spriteKey = `pokemon_${this.opponentPokemon.speciesId}`;
        this.tweens.killTweensOf(this.opponentSprite);
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
      this.tweens.killTweensOf(this.playerSprite);
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
      soundSystem.stopMusic();
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

  private switchPlayerPokemon(newIndex: number): void {
    // Save current Pokemon state back to party
    this.playerState.party[this.currentPlayerPokemonIndex] = this.playerPokemon;

    // Reset player stat stages on switch
    this.resetBattleStages('player');

    // Switch to new Pokemon
    this.currentPlayerPokemonIndex = newIndex;
    this.playerPokemon = this.playerState.party[newIndex];

    // Update sprite
    this.ensurePokemonSprite(this.playerPokemon.speciesId);
    const spriteKey = `pokemon_${this.playerPokemon.speciesId}`;
    this.playerSprite.setTexture(spriteKey, 1);
    this.playerSprite.setAlpha(1);
    this.playerSprite.setY(76);

    // Update HUD
    this.hud.updatePlayer(this.playerPokemon);

    const name = this.getSpeciesName(this.playerPokemon.speciesId);
    this.textBox.show([`Go! ${name}!`], () => {
      // Opponent gets a free attack turn after switching
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

  private endBattle(): void {
    soundSystem.stopMusic();

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

  private async promptMoveForget(pokemon: PokemonInstance, moveId: number): Promise<void> {
    const moveName = MOVES_DATA[moveId]?.name || '???';
    const pokeName = this.getSpeciesName(pokemon.speciesId);

    await this.showText([
      `${pokeName} wants to learn\n${moveName}!`,
      `But ${pokeName} already\nknows 4 moves.`,
      `Forget a move to make\nroom for ${moveName}?`,
    ]);

    const replaceIndex = await new Promise<number | null>(resolve => {
      this.moveForgetUI.show(pokemon, moveId, resolve);
    });

    if (replaceIndex !== null) {
      const oldMoveName = MOVES_DATA[pokemon.moves[replaceIndex].moveId]?.name || '???';
      learnMove(pokemon, moveId, replaceIndex);
      await this.showText([
        `1, 2, and... Poof!`,
        `${pokeName} forgot\n${oldMoveName}.`,
        `And...\n${pokeName} learned\n${moveName}!`,
      ]);
    } else {
      await this.showText([`${pokeName} did not\nlearn ${moveName}.`]);
    }
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
