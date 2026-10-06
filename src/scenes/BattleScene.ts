import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../utils/constants';
import { PokemonInstance, StatusCondition, PokemonType } from '../types/pokemon.types';
import { BattleType } from '../types/battle.types';
import { POKEMON_DATA } from '../data/pokemon';
import { MOVES_DATA } from '../data/moves';
import { BattleHUD } from '../components/BattleHUD';
import { BattleMenu, MenuSelection, BagItem } from '../components/BattleMenu';
import { ITEMS } from '../data/items';
import { TextBox } from '../components/TextBox';
import { calculateExpGain, addExperience, learnMove } from '../systems/ExperienceSystem';
import { expGainSegments } from '../logic/expBar';
import { MoveForgetUI } from '../components/MoveForgetUI';
import { checkEvolution, evolvePokemon } from '../systems/EvolutionSystem';
import {
  PendingEvolution, learnsetAtLevel, queueEvolution,
} from '../logic/evolutionSequence';
import { playEvolution } from '../systems/animations/evolution';
import { applyBattleScale } from '../systems/animations/baseScale';
import { attemptCatch } from '../systems/CatchSystem';
import { trainerPrizeMoney } from '@claudemon/engine/battle/rewards';
import {
  executeBattleMove, applyMoveEvent, Combatant, MoveContext, MoveEvent,
} from '@claudemon/engine/battle/move';
import { selectAIMove } from '../systems/AISystem';
import {
  resolveTurnOrder, applyLeechSeed, calculateRunChance,
  splitExp, getFirstAlivePokemon,
} from '../systems/BattleEngine';
import { soundSystem } from '../systems/SoundSystem';
import { generatePokemonSprite, getShapeForSpecies, generateGhostBattleSprite } from '../utils/spriteGenerator';
import { PlayerState } from '../entities/Player';
import { SaveData } from '../systems/SaveSystem';
import { createPokemon, gainHappiness, loseHappiness } from '../entities/Pokemon';
import { TRAINERS } from '../data/trainers';
import { GYM_LEADERS } from '../data/gymLeaders';
import { ELITE_FOUR, CHAMPION, HALL_OF_FAME_TEXT } from '../data/eliteFour';
import { playMoveAnimation, AnimationContext } from '../systems/MoveAnimations';
import { playEntrance, catchSequence } from '../systems/animations/entrances';
import { resolveEntrance, resolveCry, EntranceKind } from '../logic/entranceSpec';
import { reviveHp, isReviveItem } from '../logic/reviveItems';
import { clearsForcedEncounter, WildBattleEnd } from '../logic/forcedEncounters';
import { roundContinues } from '../logic/turnFlow';
import { ChargeState } from '../logic/chargeMoves';
import { hallOfFameResult } from '../logic/hallOfFame';
import { restoreParty } from '../logic/healing';
import '../systems/animations';
import { getTrainerSpriteKey } from '../utils/trainerSpriteGenerator';
import { resyncMobileInput } from '../utils/mobileControls';

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
  isSurfing?: boolean;
  isRidingBike?: boolean;
  flashUsed?: boolean;
  isGhost?: boolean;
  /**
   * A forced encounter's story flag, written only when the player wins or
   * catches (`logic/forcedEncounters.clearsForcedEncounter`). Marowak's ghost
   * uses it: run away and the flag stays down, so it is still there next time.
   */
  clearedFlag?: string;
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
  private isSurfing = false;
  private isRidingBike = false;
  private flashUsed = false;
  private isGhost = false;
  private clearedFlag?: string;

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
  private playerVolatile = { confused: 0, seeded: false, flinched: false, lastDamageTaken: 0, lastDamagePhysical: false, substitute: 0, charging: null as ChargeState | null };
  private opponentVolatile = { confused: 0, seeded: false, flinched: false, lastDamageTaken: 0, lastDamagePhysical: false, substitute: 0, charging: null as ChargeState | null };

  // Recharge tracking (Hyper Beam)
  private playerRecharging = false;
  private opponentRecharging = false;

  // Battle flow
  private battleOver = false;
  private turnInProgress = false;
  private currentPlayerPokemonIndex = 0;
  private participantIndices = new Set<number>();
  /**
   * Evolutions the EXP loop has earned but not played yet.
   *
   * Gen I evolves AFTER the battle, so `checkEvolution` results are queued
   * here and `processPendingEvolutions` plays them in `endBattle`, on the way
   * back to the overworld.
   */
  private pendingEvolutions: PendingEvolution[] = [];

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
    this.isSurfing = data.isSurfing || false;
    this.isRidingBike = data.isRidingBike || false;
    this.flashUsed = data.flashUsed || false;
    this.isGhost = data.isGhost || false;
    this.clearedFlag = data.clearedFlag;

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
    this.currentPlayerPokemonIndex = getFirstAlivePokemon(this.playerState.party);
    if (this.currentPlayerPokemonIndex < 0) this.currentPlayerPokemonIndex = 0;
    this.playerPokemon = this.playerState.party[this.currentPlayerPokemonIndex];

    this.battleOver = false;
    this.turnInProgress = false;
    this.participantIndices = new Set<number>([this.currentPlayerPokemonIndex]);
    this.pendingEvolutions = [];
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
    // A two-turn CHARGE dies with the mon that stored it: switching out and
    // fainting both come through here, exactly as the recharge flag does.
    vol.charging = null;
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
    if (this.isGhost) {
      generateGhostBattleSprite(this);
    } else {
      this.ensurePokemonSprite(this.opponentPokemon.speciesId);
    }

    // Opponent sprite (top-right, front view, frame 0) - hidden initially.
    // `applyBattleScale` sets the species' size class and stands it on the far
    // ledge's ground line; the position here is just the pre-scale default.
    const oppSpriteKey = this.isGhost ? 'pokemon_ghost' : `pokemon_${this.opponentPokemon.speciesId}`;
    this.opponentSprite = this.add.sprite(GAME_WIDTH - 40, 28, oppSpriteKey, 0);
    this.opponentSprite.setDepth(5);
    this.opponentSprite.setScrollFactor(0);
    // The ghost has no species row, so it renders at M like it always has.
    applyBattleScale(this.opponentSprite, 'opponent', this.opponentPokemon.speciesId,
      this.isGhost ? undefined : POKEMON_DATA[this.opponentPokemon.speciesId]);

    // Player sprite (bottom-left, back view, frame 1) - hidden initially
    const plrSpriteKey = `pokemon_${this.playerPokemon.speciesId}`;
    this.playerSprite = this.add.sprite(36, 76, plrSpriteKey, 1);
    this.playerSprite.setDepth(5);
    this.playerSprite.setScrollFactor(0);
    this.playerSprite.setAlpha(0);
    applyBattleScale(this.playerSprite, 'player', this.playerPokemon.speciesId,
      POKEMON_DATA[this.playerPokemon.speciesId]);

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
    } else if (this.isGhost) {
      // Ghost encounter: unchanged - a GHOST appears instantly, it is a ghost.
      this.opponentSprite.setAlpha(1);
    } else {
      // Wild battle: the mon is brought in by playEntrance during the intro,
      // so it starts invisible instead of simply being there on frame 1.
      this.opponentSprite.setAlpha(0);
    }

    // HUD
    this.hud = new BattleHUD(this);
    this.hud.updatePlayer(this.playerPokemon);
    this.hud.updateOpponent(this.opponentPokemon);
    if (this.isGhost) {
      this.hud.setGhostMode();
    }

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
    if (this.trainerId === CHAMPION.id) {
      soundSystem.startMusic('elite_four');
    } else if (
      ELITE_FOUR.some(e => e.id === this.trainerId) ||
      (this.trainerId && this.trainerId in GYM_LEADERS)
    ) {
      soundSystem.startMusic('gym_leader_battle');
    } else if (this.battleType === BattleType.TRAINER) {
      soundSystem.startMusic('trainer_battle');
    } else {
      soundSystem.startMusic('wild_battle');
    }

    // Re-sync mobile input so held buttons carry over after scene transition
    resyncMobileInput();

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

    if (import.meta.env.DEV) {
      // The entrance renderer, reachable from the e2e runner the same way the
      // move animations are (window.__claudemon IS the Phaser.Game).
      (this.game as unknown as Record<string, unknown>).entrances = {
        playEntrance,
        resolveEntrance,
        replayIntro: (speciesId: number, side: 'player' | 'opponent', kind: EntranceKind) =>
          this.replayIntro(speciesId, side, kind),
      };
    }

    // Play the battle intro sequence with trainer sprite animations
    this.playBattleIntro();
  }

  private async playBattleIntro(): Promise<void> {
    const opponentName = this.getSpeciesName(this.opponentPokemon.speciesId);
    const playerName = this.getSpeciesName(this.playerPokemon.speciesId);

    if (this.isGhost) {
      // Ghost encounter: player is too scared to send out Pokemon. Unchanged,
      // except that the cry now lives here rather than in create().
      this.opponentCry();
      await this.showText(['A GHOST appeared!']);
      this.showBattleMenu();
      return;
    } else if (this.battleType === BattleType.WILD) {
      // The one sequencing rule (design 3.2): an entrance is STARTED before
      // its text and AWAITED after it. showText gates on the player, so this
      // is what stops the menu opening over a mon that is still arriving -
      // and stops a player mashing A from outrunning the animation.
      const entrance = this.playOpponentEntrance();
      await this.showText([`Wild ${opponentName}\nappeared!`]);
      await entrance;
      // "Go! Pokemon!" - the trainer slides off and throws the ball under the
      // text, same rule: started before it, awaited after it.
      const sendOut = this.slidePlayerIn();
      await this.showText([`Go! ${playerName}!`]);
      await sendOut;
    } else {
      // Trainer: show both trainer sprites
      await this.showText([`${this.trainerName || 'TRAINER'}\nwants to battle!`]);
      // "Trainer sent out Pokemon!" - the trainer slides off and the ball
      // leaves their hand while the line types.
      const oppSendOut = this.slideOpponentIn();
      await this.showText([`${this.trainerName || 'TRAINER'} sent\nout ${opponentName}!`]);
      await oppSendOut;
      // "Go! Pokemon!" - slide player back sprite out, throw the player's ball
      const sendOut = this.slidePlayerIn();
      await this.showText([`Go! ${playerName}!`]);
      await sendOut;
    }

    this.showBattleMenu();
  }

  /**
   * The opponent's cry. Ghosts keep the old undifferentiated cry (they are not
   * a species); everything else goes through the shape/type contour.
   */
  private opponentCry(): void {
    if (this.isGhost) {
      soundSystem.pokemonCry(300 + this.opponentPokemon.speciesId * 3);
      return;
    }
    this.cryFor(this.opponentPokemon.speciesId);
  }

  /**
   * One species' cry, either side. Both sides cry now (design section 3.1), so
   * this is the single place a cry is made from a species id; the only other
   * `pokemonCry` call left in the scene is the ghost's, above, which is not a
   * species and has no contour.
   */
  private cryFor(speciesId: number): void {
    const species = POKEMON_DATA[speciesId];
    if (!species) return;
    soundSystem.pokemonCryFor(resolveCry(species));
  }

  /** The wild arrival: shape-keyed motion, with the cry on the reveal. */
  private playOpponentEntrance(): Promise<void> {
    const species = POKEMON_DATA[this.opponentPokemon.speciesId];
    if (!species) {
      this.opponentSprite.setAlpha(1);
      this.opponentCry();
      return Promise.resolve();
    }
    return playEntrance(this, this.opponentSprite, resolveEntrance(species, 'wild'), {
      side: 'opponent',
      onMaterialise: () => this.opponentCry(),
    });
  }

  /**
   * DEV/e2e only: play any species' entrance on either side's sprite and put
   * the sprite's own texture back afterwards, so one live battle can be used
   * to review all seven shape rows.
   */
  async replayIntro(
    speciesId: number,
    side: 'player' | 'opponent',
    kind: EntranceKind,
  ): Promise<void> {
    const species = POKEMON_DATA[speciesId];
    if (!species) return;
    const sprite = side === 'player' ? this.playerSprite : this.opponentSprite;
    const prevKey = sprite.texture.key;
    const prevFrame = sprite.frame.name;
    const prevSpecies = side === 'player' ? this.playerPokemon : this.opponentPokemon;
    this.ensurePokemonSprite(speciesId);
    sprite.setTexture(`pokemon_${speciesId}`, side === 'player' ? 1 : 0);
    // Review the borrowed species at ITS size, not the resident's.
    applyBattleScale(sprite, side, speciesId, species);
    try {
      await playEntrance(this, sprite, resolveEntrance(species, kind), {
        side,
        onMaterialise: () => soundSystem.pokemonCryFor(resolveCry(species)),
      });
    } finally {
      sprite.setTexture(prevKey, prevFrame);
      applyBattleScale(sprite, side, prevSpecies.speciesId, POKEMON_DATA[prevSpecies.speciesId]);
    }
  }

  /**
   * Where a send-out's ball is thrown from.
   *
   * During the intro that is the trainer sprite's LIVE position: the slide is
   * only half done when the ball leaves, so the throw reads as the trainer's
   * own motion. For a switch-in the trainer sprites have long since slid off
   * the field, so the ball comes in from the screen edge on that side instead.
   */
  private ballOrigin(side: 'player' | 'opponent'): { x: number; y: number } {
    const sprite = side === 'player' ? this.playerSprite : this.opponentSprite;
    const trainer = side === 'player' ? this.playerTrainerSprite : this.opponentTrainerSprite;
    if (trainer && trainer.active && trainer.x > -8 && trainer.x < GAME_WIDTH + 8) {
      return { x: Math.round(trainer.x), y: Math.round(trainer.y) };
    }
    return { x: side === 'player' ? -8 : GAME_WIDTH + 8, y: Math.round(sprite.y) };
  }

  /**
   * The type palette the catch sequence opens the ball in: the wild mon's
   * primary type, exactly as an entrance resolves it. NORMAL is the fallback
   * for the ghost, which has no species row.
   */
  private catchPalette(): PokemonType {
    return POKEMON_DATA[this.opponentPokemon.speciesId]?.types[0] ?? PokemonType.NORMAL;
  }

  /**
   * THE send-out: a Pokeball arcs in, opens, and the mon materialises out of
   * it with its cry (design section 3.1). Every path that puts a Pokemon on
   * the field other than a wild appearance goes through here - both intro
   * slides and all three switch-ins - so they cannot drift apart again.
   */
  private sendOut(side: 'player' | 'opponent', pokemon: PokemonInstance): Promise<void> {
    const sprite = side === 'player' ? this.playerSprite : this.opponentSprite;
    this.ensurePokemonSprite(pokemon.speciesId);
    // The switch-in paths' existing precedent, now shared by all of them: a
    // faint/damage tween still running would fight the entrance.
    this.tweens.killTweensOf(sprite);
    sprite.setTexture(`pokemon_${pokemon.speciesId}`, side === 'player' ? 1 : 0);
    const species = POKEMON_DATA[pokemon.speciesId];
    // The species just changed, so the size class has too: re-scale and re-home
    // BEFORE the entrance runs, since the entrance reads the sprite's base
    // scale and its home position and animates around both.
    applyBattleScale(sprite, side, pokemon.speciesId, species);
    sprite.setAlpha(0);

    if (!species) {
      sprite.setAlpha(1);
      return Promise.resolve();
    }
    return playEntrance(this, sprite, resolveEntrance(species, 'sendout'), {
      side,
      from: this.ballOrigin(side),
      onMaterialise: () => this.cryFor(pokemon.speciesId),
    });
  }

  private slideOpponentIn(): Promise<void> {
    // Slide opponent trainer sprite off to the right (unchanged, 400 ms)
    if (this.opponentTrainerSprite) {
      this.tweens.add({
        targets: this.opponentTrainerSprite,
        x: GAME_WIDTH + 40,
        duration: 400,
        ease: 'Power2',
      });
    }
    this.opponentSprite.setAlpha(0);
    // The ball leaves the hand at the slide's midpoint (design section 3.2).
    return this.delay(200).then(() => this.sendOut('opponent', this.opponentPokemon));
  }

  private slidePlayerIn(): Promise<void> {
    // Slide player back sprite off to the left (unchanged, 400 ms)
    if (this.playerTrainerSprite) {
      this.tweens.add({
        targets: this.playerTrainerSprite,
        x: -40,
        duration: 400,
        ease: 'Power2',
      });
    }
    this.playerSprite.setAlpha(0);
    return this.delay(200).then(() => this.sendOut('player', this.playerPokemon));
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
    // Turn 2 of a CHARGE move: the player gets no menu at all (no switching,
    // no items, no other move) - the stored move index is dispatched for them.
    const charging = this.playerVolatile.charging;
    if (charging) {
      this.turnInProgress = false;
      void this.executeTurn(charging.moveIndex);
      return;
    }
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
      'revive', 'max_revive',
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

    if (this.isGhost) {
      switch (selection.type) {
        case 'fight':
          this.textBox.show(["Too scared to move!"], () => this.showBattleMenu());
          return;
        case 'bag':
          this.textBox.show(["Too scared to\nuse an item!"], () => this.showBattleMenu());
          return;
        case 'pokemon':
          this.textBox.show(["Too scared to\nswitch POKeMON!"], () => this.showBattleMenu());
          return;
        case 'run':
          this.textBox.show(['Got away safely!'], () => this.endBattle());
          return;
      }
    }

    switch (selection.type) {
      case 'fight':
        this.executeTurn(selection.moveIndex);
        break;
      case 'bag':
        if (!selection.itemId) {
          this.textBox.show(["No usable items!"], () => this.showBattleMenu());
          return;
        }
        this.handleBagSelection(selection.itemId, selection.targetIndex);
        break;
      case 'pokemon':
        this.switchPlayerPokemon(selection.partyIndex);
        break;
      case 'run':
        this.tryRun();
        break;
    }
  }

  private handleBagSelection(itemId: string, targetIndex?: number): void {
    const itemData = ITEMS[itemId];
    const isBall = itemData?.category === 'ball';

    if (isBall && this.battleType === BattleType.TRAINER) {
      this.textBox.show(["The TRAINER blocked\nthe BALL!", "Don't be a thief!"], () => {
        // Opponent gets a free attack (throwing is your turn)
        const aiMoveIndex = this.aiMoveIndex();
        const aiMove = this.opponentPokemon.moves[aiMoveIndex];
        const aiMoveData = MOVES_DATA[aiMove?.moveId];
        if (aiMove && aiMoveData) {
          this.executeMove(false, aiMoveIndex).then(() => {
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
    } else if (isReviveItem(itemId)) {
      this.useRevive(itemId, targetIndex ?? 0);
    } else {
      this.usePotion(itemId, targetIndex);
    }
  }

  /**
   * The opponent's move for this round. A charging opponent is locked into the
   * move it started: `selectAIMove` is bypassed entirely, the same way the
   * player's menu is. Every AI-move call site goes through here so the lock
   * cannot be forgotten on one of them (bag, ball, potion, revive, run, switch).
   */
  private aiMoveIndex(): number {
    const charging = this.opponentVolatile.charging;
    if (charging) return charging.moveIndex;
    return selectAIMove(this.opponentPokemon, this.playerPokemon);
  }

  /**
   * Drop a stored charge and put the user back on the field. Used when the
   * charge is interrupted (sleep/freeze/paralysis/flinch/confusion self-hit)
   * and when the mon leaves the field, so a FLY/DIG user is never left hidden.
   */
  private clearCharge(isPlayer: boolean): void {
    const vol = isPlayer ? this.playerVolatile : this.opponentVolatile;
    vol.charging = null;
    const sprite = isPlayer ? this.playerSprite : this.opponentSprite;
    if (sprite) sprite.setAlpha(1);
  }

  private async executeTurn(playerMoveIndex: number): Promise<void> {
    if (this.turnInProgress) return;

    // Block disabled moves (a charge release is not a fresh selection)
    if (!this.playerVolatile.charging && this.playerDisable.moveIndex === playerMoveIndex) {
      this.textBox.show(["That move is\ndisabled!"], () => this.showBattleMenu());
      return;
    }

    this.turnInProgress = true;

    // Clear flinch flags from previous turn
    this.playerVolatile.flinched = false;
    this.opponentVolatile.flinched = false;

    const playerMove = this.playerPokemon.moves[playerMoveIndex];
    let aiMoveIndex = this.aiMoveIndex();
    // AI: skip disabled move, pick another (a charge release is locked in)
    if (!this.opponentVolatile.charging && this.opponentDisable.moveIndex === aiMoveIndex) {
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

    // Speed/priority check for turn order (paralysis quirks live in the engine)
    const playerFirst = resolveTurnOrder(
      this.playerPokemon, this.opponentPokemon,
      playerMoveData.priority ?? 0, aiMoveData.priority ?? 0,
    );

    if (playerFirst) {
      await this.executeMove(true, playerMoveIndex);
      if (this.battleOver) return;

      if (roundContinues(this.playerPokemon, this.opponentPokemon)) {
        await this.executeMove(false, aiMoveIndex);
        if (this.battleOver) return;
      }
    } else {
      await this.executeMove(false, aiMoveIndex);
      if (this.battleOver) return;

      if (roundContinues(this.opponentPokemon, this.playerPokemon)) {
        await this.executeMove(true, playerMoveIndex);
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

  /**
   * One side of the battle as the engine sees it: the scene's own live objects,
   * so a commit writes straight through to what the HUD reads.
   */
  private combatant(isPlayer: boolean): Combatant {
    return {
      pokemon: isPlayer ? this.playerPokemon : this.opponentPokemon,
      stages: isPlayer ? this.playerStatStages : this.opponentStatStages,
      volatile: isPlayer ? this.playerVolatile : this.opponentVolatile,
      disable: isPlayer ? this.playerDisable : this.opponentDisable,
      recharging: isPlayer ? this.playerRecharging : this.opponentRecharging,
    };
  }

  /** `recharging` is a primitive on the scene, so it is copied back by hand. */
  private syncRecharging(ctx: MoveContext): void {
    const isPlayer = ctx.attackerIsPlayer;
    if (isPlayer) {
      this.playerRecharging = ctx.attacker.recharging;
      this.opponentRecharging = ctx.defender.recharging;
    } else {
      this.opponentRecharging = ctx.attacker.recharging;
      this.playerRecharging = ctx.defender.recharging;
    }
  }

  private animateHpBar(mine: boolean, mon: PokemonInstance): Promise<void> {
    return mine
      ? this.hud.animatePlayerHP(mon.currentHp / mon.stats.hp)
      : this.hud.animateOpponentHP(mon.currentHp / mon.stats.hp);
  }

  /**
   * Run one move. Every rule lives in `@claudemon/engine`'s
   * `executeBattleMove`; this scene only draws the `MoveEvent` it returns.
   *
   * The split is deliberate and is what keeps the #87 invariant honest:
   * `executeBattleMove` resolves accuracy, crit and damage up front (so the
   * animation can show what is about to happen) but STAGES everything they
   * imply; `applyMoveEvent` commits it after the animation, in the same tick
   * the old `doExecuteMove` subtracted HP.
   */
  private executeMove(isPlayer: boolean, moveIndex: number): Promise<void> {
    return new Promise<void>((resolve) => {
      const ctx: MoveContext = {
        attacker: this.combatant(isPlayer),
        defender: this.combatant(!isPlayer),
        moveIndex,
        attackerIsPlayer: isPlayer,
      };
      const event = executeBattleMove(ctx);
      // The pre-action half already mutated the model (wake, thaw, confusion
      // damage, the charge lock, PP): pick up its `recharging` before drawing.
      this.syncRecharging(ctx);
      this.renderMoveEvent(ctx, event, resolve);
    });
  }

  /** Draw a `MoveEvent`: text, animation, then the post-animation commit. */
  private renderMoveEvent(ctx: MoveContext, event: MoveEvent, resolve: () => void): void {
    const isPlayer = event.actorIsPlayer;

    // Asleep / frozen / fully paralysed / flinched / confusion self-hit on the
    // release turn: the engine has already dropped the charge, the scene just
    // has to put a hidden FLY/DIG user back on the field.
    if (event.chargeCancelled) this.clearCharge(isPlayer);
    // #116: the badge a wake/thaw just cleared, and the HP a confusion self-hit
    // just took, are redrawn in the same tick the message goes up.
    if (event.presentation.refreshHudBefore) this.updateHUD();

    // Nothing to animate (a pre-action stop, MIRROR MOVE, DREAM EATER on a
    // waking target, an empty move slot): one run of lines and we are done.
    if (!event.animation) {
      const lines = [...event.before, ...event.messages];
      if (lines.length > 0) this.textBox.show(lines, resolve);
      else resolve();
      return;
    }

    const animCtx: AnimationContext = {
      scene: this,
      attackerSprite: isPlayer ? this.playerSprite : this.opponentSprite,
      defenderSprite: isPlayer ? this.opponentSprite : this.playerSprite,
      isPlayer,
      phase: event.animation.phase,
      // Tier 4: the picture knows how the move turned out before it plays.
      outcome: event.outcome,
    };

    this.textBox.show(event.before, async () => {
      await playMoveAnimation(event.animation!.moveId, animCtx);
      // Belt and braces: the release half of FLY / DIG un-hides the user, but
      // never leave a sprite invisible if an override bailed out early.
      if (event.animation!.phase === 'release') animCtx.attackerSprite.setAlpha(1);
      this.settleMoveEvent(ctx, event, animCtx, resolve);
    });
  }

  /** The post-animation half: commit the staged state, then show the result. */
  private settleMoveEvent(
    ctx: MoveContext,
    event: MoveEvent,
    animCtx: AnimationContext,
    resolve: () => void,
  ): void {
    // #87: HP, status, stages and the recharge flag land HERE, after the
    // picture, exactly where the old `doExecuteMove` subtracted them.
    applyMoveEvent(ctx, event);
    this.syncRecharging(ctx);

    const pres = event.presentation;
    // The engine names what happened; the scene owns every asset string.
    if (pres.effectivenessSfx === 'super') soundSystem.superEffective();
    else if (pres.effectivenessSfx === 'weak') soundSystem.notVeryEffective();
    if (pres.impactSfx) soundSystem.hit();

    const bars: Promise<void>[] = [];
    if (pres.animateAttackerHp) bars.push(this.animateHpBar(event.actorIsPlayer, ctx.attacker.pokemon));
    if (pres.animateDefenderHp) bars.push(this.animateHpBar(!event.actorIsPlayer, ctx.defender.pokemon));

    if (pres.hitFlash) {
      this.tweens.add({
        targets: animCtx.defenderSprite,
        alpha: 0,
        duration: 80,
        yoyo: true,
        repeat: 2,
      });
    }

    const finish = () => {
      if (pres.refreshHudAfter) this.updateHUD();
      if (event.messages.length > 0) this.textBox.show(event.messages, resolve);
      else resolve();
    };
    if (bars.length > 0) void Promise.all(bars).then(finish);
    else finish();
  }


  private applyStatusDamage(pokemon: PokemonInstance, isPlayer: boolean): Promise<void> {
    return new Promise(resolve => {
      const name = this.getSpeciesName(pokemon.speciesId);
      const faintOrResolve = () => {
        if (pokemon.currentHp <= 0) {
          if (isPlayer) this.handlePlayerFaint().then(resolve);
          else this.handleOpponentFaint().then(resolve);
        } else {
          resolve();
        }
      };

      // Burn/poison tick. Note: intentionally NOT gated on currentHp > 0 —
      // the original code ticked (harmlessly) even on an already-0-HP Pokemon
      // and showed the message before the faint handler ran.
      if (pokemon.status === StatusCondition.BURN || pokemon.status === StatusCondition.POISON) {
        const damage = Math.max(1, Math.floor(pokemon.stats.hp / 16));
        pokemon.currentHp = Math.max(0, pokemon.currentHp - damage);
        this.updateHUD();
        const message = pokemon.status === StatusCondition.BURN
          ? `${name} is hurt by\nits burn!`
          : `${name} is hurt by\npoison!`;
        this.textBox.show([message], faintOrResolve);
        return;
      }

      // Leech Seed drain
      const vol = isPlayer ? this.playerVolatile : this.opponentVolatile;
      if (vol.seeded && pokemon.currentHp > 0) {
        applyLeechSeed(pokemon, isPlayer ? this.opponentPokemon : this.playerPokemon);
        this.updateHUD();
        this.textBox.show([`${name}'s health is\nsapped by LEECH SEED!`], faintOrResolve);
        return;
      }

      resolve();
    });
  }

  private async handleOpponentFaint(): Promise<void> {
    this.clearCharge(false);
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

    // Calculate EXP and split among living participants (Gen 1 behavior)
    const isTrainer = this.battleType !== BattleType.WILD;
    const totalExpGain = calculateExpGain(this.opponentPokemon, isTrainer);

    await this.showText([faintMsg]);

    // Collect living participants
    const livingParticipants = [...this.participantIndices].filter(
      idx => this.playerState.party[idx] && this.playerState.party[idx].currentHp > 0
    );
    const expEach = splitExp(totalExpGain, livingParticipants.length);

    // Award EXP to each living participant
    for (const partyIdx of livingParticipants) {
      const pokemon = this.playerState.party[partyIdx];
      const pokeName = this.getSpeciesName(pokemon.speciesId);
      await this.showText([`${pokeName} gained\n${expEach} EXP. Points!`]);

      // Captured before addExperience mutates them, so the bar can run from
      // where the player last saw it through every level the gain crosses.
      const expBefore = pokemon.exp;
      const levelBefore = pokemon.level;

      soundSystem.levelUp();
      const levelUps = addExperience(pokemon, expEach);

      // Only the active mon has an HP box on screen; a bench participant's
      // share is awarded silently, exactly as it was before.
      if (pokemon === this.playerPokemon) {
        await this.hud.animatePlayerExp(expGainSegments(expBefore, levelBefore, pokemon.exp));
      }

      for (const lu of levelUps) {
        await this.showText([`${pokeName} grew to\nLv. ${lu.newLevel}!`]);
        gainHappiness(pokemon, 5);

        // Check for new moves
        for (const moveId of lu.newMoves) {
          const moveData = MOVES_DATA[moveId];
          if (!moveData) continue;
          if (pokemon.moves.length < 4) {
            learnMove(pokemon, moveId);
            await this.showText([`${pokeName} learned\n${moveData.name}!`]);
          } else {
            await this.promptMoveForget(pokemon, moveId);
          }
        }

        // Check evolution. Gen I evolves AFTER the battle, on the way back to
        // the overworld, so this only QUEUES it: `processPendingEvolutions`
        // plays the sequence from `endBattle`.
        const evoResult = checkEvolution(pokemon);
        if (evoResult) {
          this.pendingEvolutions = queueEvolution(
            this.pendingEvolutions, partyIdx, evoResult.toSpecies,
          );
        }
      }
    }

    // Update HUD in case active Pokemon leveled up or evolved
    this.hud.updatePlayer(this.playerPokemon);

    // Check if trainer has more Pokemon
    if (isTrainer) {
      const nextOpponent = this.opponentParty.find(p => p !== this.opponentPokemon && p.currentHp > 0);
      if (nextOpponent) {
        this.opponentPokemon = nextOpponent;
        this.participantIndices = new Set<number>([this.currentPlayerPokemonIndex]);
        this.resetBattleStages('opponent');
        this.ensurePokemonSprite(this.opponentPokemon.speciesId);
        const nextName = this.getSpeciesName(this.opponentPokemon.speciesId);

        this.hud.updateOpponent(this.opponentPokemon);
        this.battleOver = false;
        this.turnInProgress = false;

        // Same send-out as the intro (ball, open, materialise, cry), started
        // before its line and awaited after it.
        const entrance = this.sendOut('opponent', this.opponentPokemon);
        await this.showText([`${this.trainerName} sent\nout ${nextName}!`]);
        await entrance;
        this.showBattleMenu();
        return;
      }

      // Trainer defeated
      if (this.trainerId) {
        this.playerState.defeatedTrainers.push(this.trainerId);
      }

      // Prize money
      const prizeMoney = trainerPrizeMoney(this.opponentPokemon);
      this.playerState.money += prizeMoney;

      // Look up trainer loss dialogue
      const lossDialogue = this.getTrainerLossDialogue();

      // Check if gym leader
      const gymLeader = this.trainerId ? GYM_LEADERS[this.trainerId] : undefined;
      if (gymLeader && !this.playerState.badges.includes(gymLeader.badge)) {
        this.playerState.badges.push(gymLeader.badge);
        soundSystem.victory();
        const messages = [
          `${this.trainerName} was\ndefeated!`,
          ...lossDialogue,
          `Got $${prizeMoney} for winning!`,
          `${this.playerState.name} received\nthe ${gymLeader.badge} BADGE!`,
        ];
        // Give TM reward
        if (gymLeader.tmReward) {
          const tmItem = ITEMS[gymLeader.tmReward];
          if (tmItem) {
            this.playerState.addItem(gymLeader.tmReward);
            messages.push(`${this.playerState.name} received\n${tmItem.name}!`);
          }
        }
        await this.showText(messages);
      } else {
        soundSystem.victory();
        await this.showText([
          `${this.trainerName} was\ndefeated!`,
          ...lossDialogue,
          `Got $${prizeMoney} for winning!`,
        ]);
      }
    }

    if (this.battleType === BattleType.WILD) this.finishForcedEncounter('opponent_fainted');
    this.endBattle();
  }

  private async handlePlayerFaint(): Promise<void> {
    this.clearCharge(true);
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
    loseHappiness(this.playerPokemon, 1);

    // Check for more alive Pokemon
    const nextIndex = this.playerState.party.findIndex(
      (p, i) => i !== this.currentPlayerPokemonIndex && p.currentHp > 0
    );

    if (nextIndex >= 0) {
      // Switch to next Pokemon
      this.currentPlayerPokemonIndex = nextIndex;
      this.playerPokemon = this.playerState.party[nextIndex];
      this.participantIndices.add(nextIndex);
      this.ensurePokemonSprite(this.playerPokemon.speciesId);

      const nextName = this.getSpeciesName(this.playerPokemon.speciesId);
      this.hud.updatePlayer(this.playerPokemon);
      this.turnInProgress = false;

      const entrance = this.sendOut('player', this.playerPokemon);
      await this.showText([`Go! ${nextName}!`]);
      await entrance;
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
      this.finishForcedEncounter('player_fainted');   // leaves a forced encounter standing

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

    if (calculateRunChance(this.playerPokemon.stats.speed, this.opponentPokemon.stats.speed)) {
      this.textBox.show(['Got away safely!'], () => {
        this.finishForcedEncounter('ran');   // leaves a forced encounter standing
        this.endBattle();
      });
    } else {
      this.textBox.show(["Can't escape!"], () => {
        // Opponent gets a free attack
        const aiMoveIndex = this.aiMoveIndex();
        const aiMove = this.opponentPokemon.moves[aiMoveIndex];
        const aiMoveData = MOVES_DATA[aiMove?.moveId];
        if (aiMove && aiMoveData) {
          this.executeMove(false, aiMoveIndex).then(() => {
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

    // The ball: thrown, the mon pulled into it, dropped, shaken once per shake
    // the roll produced, and opened or sparkled on the outcome (design
    // section 8's catch row). This replaces the old 500 + 300 ms dead gaps and
    // the angle wobble of the MON's own sprite - the ball is what wobbles now.
    const catchAnim = await catchSequence(this, {
      sprite: this.opponentSprite,
      palette: this.catchPalette(),
      from: this.ballOrigin('player'),
    }, result);

    if (result.caught) {
      this.battleOver = true;

      // The ball stays on the ground under the line, then goes with it.
      await this.showText([`Gotcha! ${oppName}\nwas caught!`]);
      catchAnim.done();

      // Add to party/PC
      const addedToParty = this.playerState.addToParty(this.opponentPokemon);
      if (!addedToParty) {
        await this.showText([`${oppName} was sent\nto the PC!`]);
      }

      this.finishForcedEncounter('caught');
      this.endBattle();
    } else {
      catchAnim.done();
      await this.showText(["Oh no! The POKeMON\nbroke free!"]);

      // Opponent attacks
      const aiMoveIndex = this.aiMoveIndex();
      const aiMove = this.opponentPokemon.moves[aiMoveIndex];
      const aiMoveData = MOVES_DATA[aiMove?.moveId];
      if (aiMove && aiMoveData) {
        await this.executeMove(false, aiMoveIndex);
        if (this.playerPokemon.currentHp <= 0) {
          await this.handlePlayerFaint();
          return;
        }
      }
      this.turnInProgress = false;
      this.showBattleMenu();
    }
  }

  private usePotion(potionType: string, targetIndex?: number): void {
    // Pre-select AI move before applying item (AI shouldn't react to healing)
    const aiMoveIndex = this.aiMoveIndex();
    const aiMove = this.opponentPokemon.moves[aiMoveIndex];
    const aiMoveData = MOVES_DATA[aiMove?.moveId];

    if (!this.playerState.useItem(potionType)) {
      this.textBox.show(["No potions left!"], () => this.showBattleMenu());
      return;
    }

    let healAmount = 20;
    if (potionType === 'super_potion') healAmount = 50;
    else if (potionType === 'hyper_potion') healAmount = 200;
    else if (potionType === 'max_potion') healAmount = 999;
    else if (potionType === 'full_restore') healAmount = 999;

    const target = targetIndex !== undefined ? this.playerState.party[targetIndex] : this.playerPokemon;
    target.currentHp = Math.min(
      target.stats.hp,
      target.currentHp + healAmount
    );

    if (potionType === 'full_restore') {
      target.status = StatusCondition.NONE;
    }

    // Update HUD if the active Pokemon was healed
    if (target === this.playerPokemon) {
      this.hud.updatePlayer(this.playerPokemon);
    }
    soundSystem.heal();

    const itemName = ITEMS[potionType]?.name || 'POTION';
    const name = this.getSpeciesName(target.speciesId);
    this.textBox.show([`Used ${itemName} on\n${name}!`], () => {
      // Opponent attacks with pre-selected move
      if (aiMove && aiMoveData) {
        this.executeMove(false, aiMoveIndex).then(() => {
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

  private useRevive(itemId: string, targetIndex: number): void {
    // Pre-select AI move before applying item
    const aiMoveIndex = this.aiMoveIndex();
    const aiMove = this.opponentPokemon.moves[aiMoveIndex];
    const aiMoveData = MOVES_DATA[aiMove?.moveId];

    const target = this.playerState.party[targetIndex];
    if (!target || target.currentHp > 0) {
      this.textBox.show(["It won't have any\neffect!"], () => this.showBattleMenu());
      return;
    }

    if (!this.playerState.useItem(itemId)) {
      this.textBox.show([`No ${ITEMS[itemId]?.name || itemId} left!`], () => this.showBattleMenu());
      return;
    }

    // REVIVE -> half HP, MAX REVIVE -> full (logic/reviveItems.ts).
    target.currentHp = reviveHp(itemId, target.stats.hp)!;

    const name = this.getSpeciesName(target.speciesId);
    soundSystem.heal();
    this.textBox.show([`${name} was revived!`], () => {
      // Opponent attacks with pre-selected move
      if (aiMove && aiMoveData) {
        this.executeMove(false, aiMoveIndex).then(() => {
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
    // Pre-select AI move BEFORE switching — AI shouldn't see the incoming Pokemon
    const aiMoveIndex = this.aiMoveIndex();
    const aiMove = this.opponentPokemon.moves[aiMoveIndex];
    const aiMoveData = MOVES_DATA[aiMove?.moveId];

    // Save current Pokemon state back to party
    this.playerState.party[this.currentPlayerPokemonIndex] = this.playerPokemon;

    // Reset player stat stages on switch
    this.resetBattleStages('player');

    // Switch to new Pokemon
    this.currentPlayerPokemonIndex = newIndex;
    this.playerPokemon = this.playerState.party[newIndex];
    this.participantIndices.add(newIndex);

    // Update HUD
    this.hud.updatePlayer(this.playerPokemon);

    const name = this.getSpeciesName(this.playerPokemon.speciesId);
    // Start the ball throw, show the line over it, and let the opponent's free
    // hit wait for the entrance to finish - the same start-before/await-after
    // rule the intro follows, so the AI never swings at a mon still arriving.
    const entrance = this.sendOut('player', this.playerPokemon);
    this.textBox.show([`Go! ${name}!`], () => {
      void entrance.then(() => {
        // Opponent attacks with pre-selected move (chosen before seeing the switch)
        if (aiMove && aiMoveData) {
          this.executeMove(false, aiMoveIndex).then(() => {
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
    });
  }

  /**
   * Record how this wild battle ended for the forced encounter that started it.
   * Only a win or a catch consumes one, so this is a no-op after a run or a
   * blackout — those are called too, so every ending says what it is out loud.
   */
  private finishForcedEncounter(end: WildBattleEnd): void {
    if (!this.clearedFlag) return;
    if (clearsForcedEncounter(end)) this.playerState.storyFlags[this.clearedFlag] = true;
  }

  private endBattle(): void {
    soundSystem.stopMusic();

    // Update party state back
    this.playerState.party[this.currentPlayerPokemonIndex] = this.playerPokemon;

    // Gen I evolves here, between the last line of the battle and the fade out.
    void this.processPendingEvolutions().then(() => this.leaveBattle());
  }

  /**
   * Play every evolution the EXP loop queued, in the order the party earned
   * them, before the scene hands back.
   *
   * Every way out of a battle that reaches the overworld comes through
   * `endBattle` - a win, a successful catch and a successful run all do - so
   * this one call site covers all of them. The exception is the whiteout, which
   * starts `OverworldScene` itself and never gets here: in Gen I a blacked-out
   * party does not evolve, and nothing is lost by dropping the queue because
   * `checkEvolution` re-evaluates at the next level-up.
   *
   * `playEvolution` is presentation only. Applying the evolution and teaching
   * what the NEW species learns at this level belongs here, so the learn/forget
   * prompt is the same one a level-up uses.
   */
  private async processPendingEvolutions(): Promise<void> {
    const queue = this.pendingEvolutions;
    this.pendingEvolutions = [];

    for (const entry of queue) {
      const pokemon = this.playerState.party[entry.partyIndex];
      if (!pokemon) continue;
      const level = pokemon.level;
      const name = pokemon.nickname || this.getSpeciesName(pokemon.speciesId);

      const outcome = await playEvolution(this, {
        fromSpecies: pokemon.speciesId,
        toSpecies: entry.toSpecies,
        name,
      });
      // Cancelled (B): the entry is simply dropped. Gen I offers it again at
      // the next level-up, which falls out of `checkEvolution` re-running.
      if (outcome === 'cancelled') continue;

      evolvePokemon(pokemon, entry.toSpecies, this.playerState);

      // The new species' own level-<level> moves, through the level-up prompt.
      // Under its NEW name: the evolution lines are the only ones that still
      // call it what it was.
      const newName = pokemon.nickname || this.getSpeciesName(pokemon.speciesId);
      for (const moveId of learnsetAtLevel(entry.toSpecies, level)) {
        const moveData = MOVES_DATA[moveId];
        if (!moveData) continue;
        if (pokemon.moves.some(m => m.moveId === moveId)) continue;
        if (pokemon.moves.length < 4) {
          learnMove(pokemon, moveId);
          await this.showText([`${newName} learned\n${moveData.name}!`]);
        } else {
          await this.promptMoveForget(pokemon, moveId);
        }
      }
    }

    this.hud.updatePlayer(this.playerPokemon);
  }

  /** The hand-off itself: the fade out and `scene.start('OverworldScene')`. */
  private leaveBattle(): void {
    // Defeating the Champion triggers Hall of Fame
    if (this.trainerId === CHAMPION.id) {
      this.cameras.main.fadeOut(500, 255, 255, 255);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.showHallOfFame();
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
        isSurfing: this.isSurfing,
        isRidingBike: this.isRidingBike,
        keepMapState: true,
        flashUsed: this.flashUsed,
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

    // What beating the Champion does (flags, the heal, where the player comes
    // back) is src/logic/hallOfFame.ts; this scene only sequences it, in the
    // same order as before: flag now, heal + return once the credits are read
    // through and the screen has faded to black.
    const result = hallOfFameResult();

    soundSystem.victory();
    for (const flag of result.flags) this.playerState.storyFlags[flag] = true;

    textBox.show(HALL_OF_FAME_TEXT, () => {
      // Return to the player's house after credits
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        // Heal party before returning
        if (result.healParty) restoreParty(this.playerState.party);
        this.scene.start('OverworldScene', {
          mapId: result.returnTo.mapId,
          playerX: result.returnTo.x,
          playerY: result.returnTo.y,
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

  private getTrainerLossDialogue(): string[] {
    if (!this.trainerId) return [];
    const e4Member = ELITE_FOUR.find(e => e.id === this.trainerId);
    if (e4Member) return e4Member.dialogue.after;
    if (this.trainerId === CHAMPION.id) return CHAMPION.dialogue.after;
    const gymLeader = GYM_LEADERS[this.trainerId];
    if (gymLeader) return gymLeader.dialogue.after;
    const trainer = TRAINERS[this.trainerId];
    if (trainer) return trainer.dialogue.after;
    return [];
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
