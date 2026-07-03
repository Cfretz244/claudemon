import Phaser from 'phaser';
import { TILE_SIZE, GAME_WIDTH, GAME_HEIGHT, MOVE_DURATION, Direction, DIR_VECTORS, OPPOSITE_DIR } from '../utils/constants';
import { ALL_MAPS } from '../data/maps';
import { MapData, TileType, NPCData } from '../types/map.types';
import { TextBox } from '../components/TextBox';
import { PokedexScreen } from '../components/PokedexScreen';
import { PartyScreen } from '../components/PartyScreen';
import { BagScreen } from '../components/BagScreen';
import { ShopScreen } from '../components/ShopScreen';
import { PCScreen } from '../components/PCScreen';
import { TrainerCard } from '../components/TrainerCard';
import { SlotMachineScreen } from '../components/SlotMachineScreen';
import { PrizeExchangeScreen } from '../components/PrizeExchangeScreen';
import { generateNPCSprite, generateItemBallSprite, generateJessieSprite, generateJamesSprite, generateSnorlaxNPCSprite, generateArticunoNPCSprite, generateZapdosNPCSprite, generateMoltresNPCSprite } from '../utils/spriteGenerator';
import { ITEMS } from '../data/items';
import { SaveSystem, SaveData } from '../systems/SaveSystem';
import { soundSystem } from '../systems/SoundSystem';
import { getMusicForMap } from '../data/musicTracks';
import { MAP_THEMES } from '../data/townThemes';
import { StatusCondition, PokemonInstance } from '../types/pokemon.types';
import { createPokemon, gainHappiness, getHappiness } from '../entities/Pokemon';
import { PlayerState } from '../entities/Player';
import { ELITE_FOUR, CHAMPION } from '../data/eliteFour';
import { GYM_LEADERS } from '../data/gymLeaders';
import { TRAINERS } from '../data/trainers';
import { playBattleTransition, playTrainerBattleTransition } from '../utils/battleTransition';
import { OLD_ROD_ENCOUNTER, GOOD_ROD_ENCOUNTERS, SUPER_ROD_ENCOUNTERS, DEFAULT_SUPER_ROD } from '../data/fishingEncounters';
import { rollFishingEncounter } from '../systems/EncounterSystem';
import { resyncMobileInput } from '../utils/mobileControls';
import { shouldSkipNPC as shouldSkipNPCLogic } from '../logic/npcVisibility';
import { computeTrainerSight } from '../logic/trainerSight';
import { pickWildEncounter, getEncounterTheme } from '../logic/encounters';
import { SurgePuzzle } from '../logic/surgePuzzle';
import { syncDerivedStoryFlags } from '../logic/storyFlagSync';
import { migrateLegacyLocation } from '../logic/saveMigration';
import { getCutTiles } from '../logic/cutTrees';
import { getAvailableFlyDestinations } from '../data/flyDestinations';
import { GIFT_NPCS, GiftNpcResult } from '../data/giftNpcs';
import { SIGNS } from '../data/signs';

interface SceneData {
  mapId: string;
  playerX: number;
  playerY: number;
  newGame?: boolean;
  playerName?: string;
  rivalName?: string;
  saveData?: SaveData;
  introTransition?: boolean;
  teleportLanding?: boolean;
  isSurfing?: boolean;
  isRidingBike?: boolean;
  flashUsed?: boolean;
}

export class OverworldScene extends Phaser.Scene {
  // Map
  private currentMap!: MapData;
  private tileSprites: Phaser.GameObjects.Image[][] = [];

  // Player
  private player!: Phaser.GameObjects.Sprite;
  private playerGridX = 0;
  private playerGridY = 0;
  private playerDirection: Direction = Direction.DOWN;
  private isMoving = false;

  // Pikachu follower
  private pikachu!: Phaser.GameObjects.Sprite;
  private pikachuGridX = 0;
  private pikachuGridY = 0;
  private pikachuDirection: Direction = Direction.DOWN;
  private pikachuVisible = false;
  private walkStepCounter = 0; // Counts steps for happiness gain

  // NPCs
  private npcSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();

  // Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private actionKey!: Phaser.Input.Keyboard.Key;
  private startKey!: Phaser.Input.Keyboard.Key;
  private cancelKey!: Phaser.Input.Keyboard.Key;
  private lastDir: Direction | null = null;
  private dirHeldFrames = 0;

  // UI
  private textBox!: TextBox;
  private menuOpen = false;
  private screenOpen = false;
  private menuContainer!: Phaser.GameObjects.Container;
  private menuCursor!: Phaser.GameObjects.Text;
  private menuSelectedIndex = 0;
  private menuItems: string[] = [];
  private mapNameText!: Phaser.GameObjects.Text;
  private mapNameTimer: Phaser.Time.TimerEvent | null = null;

  // Screens
  private pokedexScreen!: PokedexScreen;
  private partyScreen!: PartyScreen;
  private bagScreen!: BagScreen;
  private shopScreen!: ShopScreen;
  private pcScreen!: PCScreen;
  private trainerCard!: TrainerCard;
  private slotMachineScreen!: SlotMachineScreen;
  private prizeExchangeScreen!: PrizeExchangeScreen;

  // Healing machine (permanent in Pokemon Centers)
  private healMachineGfx: Phaser.GameObjects.Graphics | null = null;
  private healMachineLightGfx: Phaser.GameObjects.Graphics | null = null;
  private healMachinePos: { tileX: number; tileY: number; px: number; py: number } | null = null;

  // Game state
  private playerState!: PlayerState;
  private stepCounter = 0;
  private lastEncounterStep = 0;
  private isWarping = false;

  // Intro transition
  private introTransition = false;
  private teleportLanding = false;

  // HM field states
  private isSurfing = false;
  private isRidingBike = false;
  private darkOverlay: Phaser.GameObjects.Graphics | null = null;
  private flashUsed = false;

  // Vermilion Gym trash can puzzle
  private surgePuzzle = new SurgePuzzle();

  constructor() {
    super({ key: 'OverworldScene' });
  }

  init(data: SceneData): void {
    this.isWarping = false;
    this.isMoving = false;
    this.introTransition = data.introTransition || false;
    this.teleportLanding = data.teleportLanding || false;
    this.isSurfing = data.isSurfing || false;
    this.isRidingBike = data.isRidingBike || false;
    this.flashUsed = data.flashUsed || false;
    // Remap locations from saves that predate map reworks
    const spawn = migrateLegacyLocation({
      mapId: data.mapId || 'pallet_town',
      x: data.playerX,
      y: data.playerY,
    });
    if (spawn.x !== undefined) data.playerX = spawn.x;
    if (spawn.y !== undefined) data.playerY = spawn.y;
    this.currentMap = ALL_MAPS[spawn.mapId];
    // Reset flash when entering a non-dark map so re-entry into dark caves requires Flash again
    if (!this.currentMap.isDark) {
      this.flashUsed = false;
    }
    this.playerGridX = data.playerX ?? 9;
    this.playerGridY = data.playerY ?? 8;

    if (data.saveData) {
      this.playerState = PlayerState.fromSave(data.saveData);
    } else if (data.newGame) {
      this.playerState = new PlayerState();
      if (data.playerName) this.playerState.name = data.playerName;
      if (data.rivalName) this.playerState.rivalName = data.rivalName;
      this.playerState.storyFlags['intro_complete'] = true;
    } else {
      this.playerState = new PlayerState();
    }

    // Sync story flags derived from defeated trainers / inventory
    syncDerivedStoryFlags(this.playerState);
  }

  create(): void {
    // Clean up from any previous scene instance
    this.tileSprites = [];
    this.npcSprites.clear();

    // Draw map
    this.drawMap();

    // Create player sprite
    this.player = this.add.sprite(
      this.playerGridX * TILE_SIZE + TILE_SIZE / 2,
      this.playerGridY * TILE_SIZE + TILE_SIZE / 2,
      'player',
      0
    );
    this.player.setDepth(10);

    if (this.isSurfing) {
      this.player.setTexture('player_surf', 0);
      this.player.play(`surf_${this.playerDirection}`, true);
      soundSystem.startMusic('surf');
    } else if (this.isRidingBike) {
      this.player.setTexture('player_bike', 0);
      this.player.play(`bike_idle_${this.playerDirection}`, true);
      soundSystem.startMusic('bicycle');
    }

    // Pikachu follower - starts hidden on player tile, appears after first step
    this.pikachuVisible = this.playerState.party.some(p => p.speciesId === 25);
    this.pikachuGridX = this.playerGridX;
    this.pikachuGridY = this.playerGridY;
    this.pikachu = this.add.sprite(
      this.pikachuGridX * TILE_SIZE + TILE_SIZE / 2,
      this.pikachuGridY * TILE_SIZE + TILE_SIZE / 2,
      this.isSurfing ? 'pikachu_surf' : this.isRidingBike ? 'pikachu_bike' : 'pikachu_follower',
      0
    );
    this.pikachu.setDepth(9);
    this.pikachu.setVisible(false); // Hidden until player takes first step

    // Create NPCs
    this.createNPCs();

    // Initialize Vermilion Gym trash can puzzle
    this.initSurgeTrashPuzzle();

    // Draw healing machine if this map has a nurse
    this.drawHealingMachine();

    // Camera - always keep player centered (no bounds, like original Game Boy)
    this.cameras.main.startFollow(this.player, true);
    this.cameras.main.setDeadzone(0, 0);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.actionKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.startKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.cancelKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    // Re-sync mobile input so held d-pad buttons carry over after scene transitions
    resyncMobileInput();

    // UI
    this.textBox = new TextBox(this);
    this.createMenu();

    // Screens
    this.pokedexScreen = new PokedexScreen(this);
    this.partyScreen = new PartyScreen(this);
    this.bagScreen = new BagScreen(this);
    this.shopScreen = new ShopScreen(this);
    this.pcScreen = new PCScreen(this);
    this.trainerCard = new TrainerCard(this);
    this.slotMachineScreen = new SlotMachineScreen(this);
    this.prizeExchangeScreen = new PrizeExchangeScreen(this);

    // Start map music
    const musicId = getMusicForMap(this.currentMap);
    if (musicId) soundSystem.startMusic(musicId);

    // Setup dark overlay for caves
    this.setupDarkOverlay();

    // Restore cut trees from story flags
    this.restoreCutTrees();

    // Show map name (skip during intro transition)
    if (!this.introTransition) {
      this.showMapName(this.currentMap.name.replace('{RIVAL}', this.playerState.rivalName));
    }

    // Teleport/Escape Rope landing animation — stop camera follow until landed
    if (this.teleportLanding) {
      this.cameras.main.stopFollow();
      // Center camera on the landing position (not the off-screen player)
      const landX = this.playerGridX * TILE_SIZE + TILE_SIZE / 2;
      const landY = this.playerGridY * TILE_SIZE + TILE_SIZE / 2;
      this.cameras.main.centerOn(landX, landY);
      this.playLandingAnimation();
    }

    // Action key handler
    this.actionKey.on('down', () => this.handleAction());
    this.startKey.on('down', () => this.toggleMenu());
    this.cancelKey.on('down', () => {
      if (this.screenOpen) return; // Screens handle their own X input
      if (this.menuOpen) this.closeMenu();
      else if (this.textBox.getIsVisible()) this.textBox.advance();
    });

    // Menu navigation listeners (added once, gated by menuOpen flag)
    this.cursors.up.on('down', () => {
      if (!this.menuOpen) return;
      this.menuSelectedIndex = Math.max(0, this.menuSelectedIndex - 1);
      this.menuCursor.setY(4 + this.menuSelectedIndex * 14);
      soundSystem.menuMove();
    });
    this.cursors.down.on('down', () => {
      if (!this.menuOpen) return;
      this.menuSelectedIndex = Math.min(this.menuItems.length - 1, this.menuSelectedIndex + 1);
      this.menuCursor.setY(4 + this.menuSelectedIndex * 14);
      soundSystem.menuMove();
    });
  }

  private static readonly OUTDOOR_TILES = new Set([
    TileType.TREE, TileType.GRASS, TileType.TALL_GRASS,
    TileType.WATER, TileType.SAND, TileType.FLOWER,
    TileType.BUILDING, TileType.FENCE, TileType.ROOF,
  ]);

  private isMapOutdoor(map: { width: number; height: number; tiles: number[][] }): boolean {
    // Check top and bottom edges for outdoor tile types
    for (const y of [0, map.height - 1]) {
      for (let x = 0; x < map.width; x++) {
        if (OverworldScene.OUTDOOR_TILES.has(map.tiles[y][x])) return true;
      }
    }
    return false;
  }

  private isOutdoorMap(): boolean {
    return this.isMapOutdoor(this.currentMap);
  }

  private isCaveMap(): boolean {
    const map = this.currentMap;
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (map.tiles[y][x] === TileType.CAVE_FLOOR || map.tiles[y][x] === TileType.CAVE_WALL) {
          return true;
        }
      }
    }
    return false;
  }

  private getTileKey(tileType: number): string {
    const theme = MAP_THEMES[this.currentMap.id];
    if (theme) {
      const key = `tile_${theme}_${tileType}`;
      if (this.textures.exists(key)) return key;
    }
    return `tile_${tileType}`;
  }

  private drawMap(): void {
    // Clear existing tiles
    for (const row of this.tileSprites) {
      for (const sprite of row) {
        sprite.destroy();
      }
    }
    this.tileSprites = [];

    // Draw main map tiles
    for (let y = 0; y < this.currentMap.height; y++) {
      const row: Phaser.GameObjects.Image[] = [];
      for (let x = 0; x < this.currentMap.width; x++) {
        const tileType = this.currentMap.tiles[y][x];
        let key = this.getTileKey(tileType);
        // Spin tiles use directional textures
        if (tileType === TileType.SPIN_TILE && this.currentMap.spinTiles) {
          const dir = this.currentMap.spinTiles[`${x},${y}`];
          if (dir) key = `spin_tile_${dir}`;
        }
        const sprite = this.add.image(
          x * TILE_SIZE + TILE_SIZE / 2,
          y * TILE_SIZE + TILE_SIZE / 2,
          key
        );
        sprite.setDepth(0);
        row.push(sprite);
      }
      this.tileSprites.push(row);
    }

    // For outdoor maps, extend edge tiles beyond map bounds
    // so the camera never shows black void
    if (this.isOutdoorMap()) {
      const pad = 6; // tiles of padding (covers half-screen in each direction)
      const mw = this.currentMap.width;
      const mh = this.currentMap.height;
      for (let y = -pad; y < mh + pad; y++) {
        for (let x = -pad; x < mw + pad; x++) {
          // Skip tiles that are inside the map (already drawn)
          if (x >= 0 && x < mw && y >= 0 && y < mh) continue;
          // Clamp to nearest edge tile
          const cx = Math.max(0, Math.min(mw - 1, x));
          const cy = Math.max(0, Math.min(mh - 1, y));
          const tileType = this.currentMap.tiles[cy][cx];
          const sprite = this.add.image(
            x * TILE_SIZE + TILE_SIZE / 2,
            y * TILE_SIZE + TILE_SIZE / 2,
            this.getTileKey(tileType)
          );
          sprite.setDepth(0);
        }
      }
    }
  }

  private shouldSkipNPC(npc: NPCData): boolean {
    return shouldSkipNPCLogic(
      npc,
      this.playerState.storyFlags,
      this.playerState.badges,
      this.playerState.defeatedTrainers,
      (id: string) => this.playerState.hasItem(id),
    );
  }

  private createNPCs(): void {
    // Destroy existing NPC sprites
    for (const [, sprite] of this.npcSprites) {
      sprite.destroy();
    }
    this.npcSprites.clear();

    for (const npc of this.currentMap.npcs) {
      if (this.shouldSkipNPC(npc)) continue;
      // Generate NPC sprite if not exists
      const spriteKey = `npc_${npc.id}`;
      if (!this.textures.exists(spriteKey)) {
        if (npc.isItemBall) {
          generateItemBallSprite(this, spriteKey);
        } else if (npc.id.startsWith('snorlax_')) {
          generateSnorlaxNPCSprite(this, spriteKey);
        } else if (npc.id.startsWith('jessie_')) {
          generateJessieSprite(this, spriteKey);
        } else if (npc.id.startsWith('james_')) {
          generateJamesSprite(this, spriteKey);
        } else if (npc.id.startsWith('articuno')) {
          generateArticunoNPCSprite(this, spriteKey);
        } else if (npc.id.startsWith('zapdos')) {
          generateZapdosNPCSprite(this, spriteKey);
        } else if (npc.id.startsWith('moltres')) {
          generateMoltresNPCSprite(this, spriteKey);
        } else {
          generateNPCSprite(this, spriteKey, npc.spriteColor);
        }
      }

      const dirIndex = [Direction.DOWN, Direction.UP, Direction.LEFT, Direction.RIGHT].indexOf(npc.direction);
      const sprite = this.add.sprite(
        npc.x * TILE_SIZE + TILE_SIZE / 2,
        npc.y * TILE_SIZE + TILE_SIZE / 2,
        spriteKey,
        dirIndex
      );
      sprite.setDepth(5);
      sprite.setData('npcData', npc);
      this.npcSprites.set(npc.id, sprite);
    }
  }

  update(): void {
    if (this.isMoving || this.isWarping || this.textBox.getIsVisible() || this.menuOpen || this.screenOpen) return;

    // Movement
    let dir: Direction | null = null;
    if (this.cursors.up.isDown) dir = Direction.UP;
    else if (this.cursors.down.isDown) dir = Direction.DOWN;
    else if (this.cursors.left.isDown) dir = Direction.LEFT;
    else if (this.cursors.right.isDown) dir = Direction.RIGHT;

    if (dir !== null) {
      if (dir !== this.lastDir) {
        // New direction — just turn, delay before walking
        this.lastDir = dir;
        this.dirHeldFrames = 0;
        this.playerDirection = dir;
        this.player.play(this.isSurfing ? `surf_${dir}` : this.isRidingBike ? `bike_idle_${dir}` : `player_idle_${dir}`, true);
      } else if (dir === this.playerDirection) {
        // Already facing this way — walk immediately (no delay on continuation)
        this.tryMove(dir);
      } else {
        // Turned this frame, wait for threshold
        this.dirHeldFrames++;
        if (this.dirHeldFrames >= 2) {
          this.tryMove(dir);
        }
      }
    } else {
      this.lastDir = null;
      this.dirHeldFrames = 0;
      this.player.play(this.isSurfing ? `surf_${this.playerDirection}` : this.isRidingBike ? `bike_idle_${this.playerDirection}` : `player_idle_${this.playerDirection}`, true);
    }
  }

  private tryMove(dir: Direction): void {
    const vec = DIR_VECTORS[dir];
    const newX = this.playerGridX + vec.x;
    const newY = this.playerGridY + vec.y;

    // Check bounds
    if (newX < 0 || newX >= this.currentMap.width || newY < 0 || newY >= this.currentMap.height) {
      // Check for edge warps
      const warp = this.currentMap.warps.find(w => w.x === this.playerGridX && w.y === this.playerGridY);
      if (warp) {
        this.warpTo(warp.targetMap, warp.targetX, warp.targetY);
      }
      return;
    }

    // Check for ledge hop (south only - ledges are one-way drops)
    const targetTile = this.currentMap.tiles[newY]?.[newX];
    if (targetTile === TileType.LEDGE) {
      if (dir === Direction.DOWN) {
        // Hop over the ledge - land on tile below it
        const landY = newY + 1;
        if (landY >= this.currentMap.height) return;
        if (this.currentMap.collision[landY]?.[newX]) return;
        const landTile = this.currentMap.tiles[landY]?.[newX];
        if (landTile === TileType.LEDGE) return; // Can't chain ledges
        // Check NPC at landing spot
        for (const npc of this.currentMap.npcs) {
          if (this.shouldSkipNPC(npc)) continue;
          if (this.npcBlocksTile(npc, newX, landY)) return;
        }
        this.performLedgeHop(newX, landY, dir);
        return;
      } else {
        soundSystem.bump();
        return;
      }
    }

    // Check collision (surfing allows water tiles)
    if (this.currentMap.collision[newY]?.[newX]) {
      // Surfing: water tiles are passable
      if (this.isSurfing && targetTile === TileType.WATER) {
        // Allow - fall through to movement
      } else {
        // If the blocked tile has a warp, trigger it (handles tree-bordered exits)
        const warp = this.currentMap.warps.find(w => w.x === newX && w.y === newY);
        if (warp) {
          if (this.currentMap.tiles[this.playerGridY]?.[this.playerGridX] === TileType.TELEPORT_PAD) {
            soundSystem.teleportWarp();
          } else {
            soundSystem.doorOpen();
          }
          this.warpTo(warp.targetMap, warp.targetX, warp.targetY);
          return;
        }
        soundSystem.bump();
        return;
      }
    }

    // Exit surfing when stepping onto land
    if (this.isSurfing && targetTile !== TileType.WATER) {
      this.isSurfing = false;
      this.player.setTexture('player', 0);
      this.player.play(`player_idle_${this.playerDirection}`, true);
      if (this.pikachuVisible) {
        this.pikachu.setTexture('pikachu_follower', 0);
      }
      // Restore map music
      const musicId = getMusicForMap(this.currentMap);
      if (musicId) soundSystem.startMusic(musicId);
    }

    // Check NPC collision
    for (const npc of this.currentMap.npcs) {
      if (this.shouldSkipNPC(npc)) continue;
      if (this.npcBlocksTile(npc, newX, newY)) {
        return; // Blocked by NPC
      }
    }

    // Move
    this.isMoving = true;
    const prevX = this.playerGridX;
    const prevY = this.playerGridY;

    this.playerGridX = newX;
    this.playerGridY = newY;

    if (this.isSurfing) {
      this.player.play(`surf_${dir}`, true);
    } else if (this.isRidingBike) {
      this.player.play(`bike_walk_${dir}`, true);
    } else {
      this.player.play(`player_walk_${dir}`, true);
    }

    const moveDuration = this.isRidingBike ? Math.floor(MOVE_DURATION * 0.5) : MOVE_DURATION;
    this.tweens.add({
      targets: this.player,
      x: newX * TILE_SIZE + TILE_SIZE / 2,
      y: newY * TILE_SIZE + TILE_SIZE / 2,
      duration: moveDuration,
      onComplete: () => {
        this.isMoving = false;
        this.tickWalkHappiness();
        if (this.isSurfing) {
          this.player.play(`surf_${this.playerDirection}`, true);
        } else if (this.isRidingBike) {
          this.player.play(`bike_idle_${this.playerDirection}`, true);
        } else {
          this.player.play(`player_idle_${this.playerDirection}`, true);
        }

        // Move Pikachu follower - always trail 1 tile behind
        if (this.pikachuVisible) {
          if (!this.pikachu.visible) this.pikachu.setVisible(true);
          this.movePikachu(prevX, prevY, this.playerDirection);
        }

        // Check for warp
        const warp = this.currentMap.warps.find(w => w.x === newX && w.y === newY);
        if (warp) {
          // Rival intercepts when trying to leave Oak's lab after getting Pikachu
          if (this.currentMap.id === 'oaks_lab' && this.playerState.storyFlags['has_pikachu']
              && !this.playerState.storyFlags['rival_battle_lab']) {
            this.triggerRivalLabBattle();
            return;
          }
          if (this.currentMap.tiles[newY]?.[newX] === TileType.TELEPORT_PAD) {
            soundSystem.teleportWarp();
          } else {
            soundSystem.doorOpen();
          }
          this.warpTo(warp.targetMap, warp.targetX, warp.targetY);
          return;
        }

        // Check for spin tile
        if (this.currentMap.spinTiles) {
          const spinDir = this.currentMap.spinTiles[`${newX},${newY}`];
          if (spinDir) {
            this.performSpinSlide(spinDir);
            return;
          }
        }

        this.stepCounter++;

        // Check for trainer line-of-sight
        if (this.checkTrainerSight()) return;

        // Check for wild encounter
        this.checkWildEncounter(newX, newY);
      },
    });
  }

  private performLedgeHop(landX: number, landY: number, dir: Direction): void {
    this.isMoving = true;
    const prevX = this.playerGridX;
    const prevY = this.playerGridY;
    this.playerGridX = landX;
    this.playerGridY = landY;
    this.player.play(this.isRidingBike ? `bike_walk_${dir}` : `player_walk_${dir}`, true);
    soundSystem.bump();

    const startPixelX = this.player.x;
    const startPixelY = this.player.y;
    const endPixelX = landX * TILE_SIZE + TILE_SIZE / 2;
    const endPixelY = landY * TILE_SIZE + TILE_SIZE / 2;
    const hopData = { progress: 0 };

    this.tweens.add({
      targets: hopData,
      progress: 1,
      duration: this.isRidingBike ? MOVE_DURATION : MOVE_DURATION * 2,
      onUpdate: () => {
        const p = hopData.progress;
        this.player.x = startPixelX + (endPixelX - startPixelX) * p;
        const hopOffset = 10 * Math.sin(p * Math.PI);
        this.player.y = startPixelY + (endPixelY - startPixelY) * p - hopOffset;
      },
      onComplete: () => {
        this.isMoving = false;
        this.player.x = endPixelX;
        this.player.y = endPixelY;
        this.player.play(this.isRidingBike ? `bike_idle_${this.playerDirection}` : `player_idle_${this.playerDirection}`, true);

        if (this.pikachuVisible) {
          if (!this.pikachu.visible) this.pikachu.setVisible(true);
          this.movePikachu(prevX, prevY, this.playerDirection);
        }

        const warp = this.currentMap.warps.find(w => w.x === landX && w.y === landY);
        if (warp) {
          if (this.currentMap.tiles[landY]?.[landX] === TileType.TELEPORT_PAD) {
            soundSystem.teleportWarp();
          } else {
            soundSystem.doorOpen();
          }
          this.warpTo(warp.targetMap, warp.targetX, warp.targetY);
          return;
        }

        this.stepCounter++;
        if (this.checkTrainerSight()) return;
        this.checkWildEncounter(landX, landY);
      },
    });
  }

  private movePikachu(targetX: number, targetY: number, dir: Direction): void {
    this.pikachuGridX = targetX;
    this.pikachuGridY = targetY;
    this.pikachuDirection = dir;

    if (this.isSurfing) {
      this.pikachu.play(`pikachu_surf_${dir}`, true);
    } else if (this.isRidingBike) {
      this.pikachu.play(`pikachu_bike_walk_${dir}`, true);
    } else {
      this.pikachu.play(`pikachu_walk_${dir}`, true);
    }

    this.tweens.add({
      targets: this.pikachu,
      x: targetX * TILE_SIZE + TILE_SIZE / 2,
      y: targetY * TILE_SIZE + TILE_SIZE / 2,
      duration: this.isRidingBike ? Math.floor(MOVE_DURATION * 0.5) : MOVE_DURATION,
      onComplete: () => {
        if (this.isSurfing) {
          this.pikachu.play(`pikachu_surf_${this.pikachuDirection}`, true);
        } else if (this.isRidingBike) {
          this.pikachu.play(`pikachu_bike_idle_${this.pikachuDirection}`, true);
        } else {
          this.pikachu.play(`pikachu_idle_${this.pikachuDirection}`, true);
        }
      },
    });
  }

  private npcBlocksTile(npc: NPCData, x: number, y: number): boolean {
    if (npc.id.startsWith('snorlax_')) {
      // Snorlax has extended collision (1 tile above and below)
      return npc.x === x && Math.abs(npc.y - y) <= 1;
    }
    return npc.x === x && npc.y === y;
  }

  private isSpinBlocked(x: number, y: number): boolean {
    // Out of bounds
    if (x < 0 || x >= this.currentMap.width || y < 0 || y >= this.currentMap.height) return true;
    // Solid tile
    if (this.currentMap.collision[y]?.[x]) return true;
    // NPC collision
    for (const npc of this.currentMap.npcs) {
      if (this.shouldSkipNPC(npc)) continue;
      if (this.npcBlocksTile(npc, x, y)) return true;
    }
    return false;
  }

  private performSpinSlide(dir: Direction): void {
    this.isMoving = true;
    const vec = DIR_VECTORS[dir];
    const nextX = this.playerGridX + vec.x;
    const nextY = this.playerGridY + vec.y;

    // If blocked immediately, just stop
    if (this.isSpinBlocked(nextX, nextY)) {
      this.isMoving = false;
      this.player.play(`player_idle_${this.playerDirection}`, true);
      this.stepCounter++;
      if (this.checkTrainerSight()) return;
      return;
    }

    // Cycle sprite through directions for spinning visual
    const spinDirs: Direction[] = [Direction.DOWN, Direction.LEFT, Direction.UP, Direction.RIGHT];
    const curIdx = spinDirs.indexOf(this.playerDirection);
    const nextDirIdx = (curIdx + 1) % 4;
    this.playerDirection = spinDirs[nextDirIdx];
    this.player.play(`player_walk_${this.playerDirection}`, true);

    // Slide to next tile
    const prevX = this.playerGridX;
    const prevY = this.playerGridY;
    this.playerGridX = nextX;
    this.playerGridY = nextY;

    this.tweens.add({
      targets: this.player,
      x: nextX * TILE_SIZE + TILE_SIZE / 2,
      y: nextY * TILE_SIZE + TILE_SIZE / 2,
      duration: Math.floor(MOVE_DURATION * 0.6),
      onComplete: () => {
        // Move pikachu follower
        if (this.pikachuVisible) {
          if (!this.pikachu.visible) this.pikachu.setVisible(true);
          this.movePikachu(prevX, prevY, dir);
        }

        // Check warp on landing
        const warp = this.currentMap.warps.find(w => w.x === nextX && w.y === nextY);
        if (warp) {
          this.isMoving = false;
          this.playerDirection = dir;
          this.player.play(`player_idle_${this.playerDirection}`, true);
          if (this.currentMap.tiles[nextY]?.[nextX] === TileType.TELEPORT_PAD) {
            soundSystem.teleportWarp();
          } else {
            soundSystem.doorOpen();
          }
          this.warpTo(warp.targetMap, warp.targetX, warp.targetY);
          return;
        }

        // Check if landed on another spin tile -> change direction, keep going
        if (this.currentMap.spinTiles) {
          const nextSpin = this.currentMap.spinTiles[`${nextX},${nextY}`];
          if (nextSpin) {
            this.performSpinSlide(nextSpin);
            return;
          }
        }

        // Check if landed on a stop tile -> stop
        const landedTile = this.currentMap.tiles[nextY]?.[nextX];
        if (landedTile === TileType.STOP_TILE) {
          this.isMoving = false;
          this.playerDirection = dir;
          this.player.play(`player_idle_${this.playerDirection}`, true);
          this.stepCounter++;
          if (this.checkTrainerSight()) return;
          return;
        }

        // Otherwise keep sliding in the same direction
        const aheadX = nextX + vec.x;
        const aheadY = nextY + vec.y;
        if (this.isSpinBlocked(aheadX, aheadY)) {
          // Hit a wall — stop here
          this.isMoving = false;
          this.playerDirection = dir;
          this.player.play(`player_idle_${this.playerDirection}`, true);
          this.stepCounter++;
          if (this.checkTrainerSight()) return;
          return;
        }

        // Continue sliding
        this.performSpinSlide(dir);
      },
    });
  }

  private warpTo(mapId: string, targetX: number, targetY: number): void {
    // Prevent double-warps
    if (this.isWarping) return;

    // Oak intercept: can't leave to route1 without Pokemon
    if (mapId === 'route1' && this.playerState.party.length === 0) {
      this.triggerOakIntercept();
      return;
    }

    // Viridian north gate: can't go to Route 2 without Pokedex
    if (mapId === 'route2' && this.currentMap.id === 'viridian_city' && !this.playerState.storyFlags['has_pokedex']) {
      this.textBox.show([
        'An old man is lying\nin the road...',
        "He won't let you\npass!",
        "Go deliver OAK's\nPARCEL first!",
      ]);
      return;
    }

    // Mt. Moon exit: can't exit to Route 4 without getting a fossil
    if (mapId === 'route4' && this.currentMap.id === 'mt_moon' && !this.playerState.storyFlags['got_fossil']) {
      this.textBox.show([
        "Boulders block the\npath ahead...",
        "You'll have to find\nanother way through.",
      ]);
      return;
    }

    // Pewter east exit: guide blocks Route 3 without Boulder badge
    if (mapId === 'route3' && this.currentMap.id === 'pewter_city' && !this.playerState.badges.includes('BOULDER')) {
      this.triggerPewterGuideIntercept();
      return;
    }

    // Saffron City gate: need Tea
    if (mapId === 'saffron_city' && !this.playerState.hasItem('tea') && !this.playerState.storyFlags['saffron_open']) {
      this.textBox.show([
        "The guard is thirsty...",
        "He won't let you\nthrough!",
      ]);
      return;
    }

    // Route 21: water route requires Surf
    if (mapId === 'route21' && !this.isSurfing) {
      if (this.partyHasMove(57) && this.playerState.badges.includes('SOUL')) {
        // Auto-start surfing and proceed with warp
        this.isSurfing = true;
        this.player.setTexture('player_surf', 0);
        this.player.play(`surf_${this.playerDirection}`, true);
        if (this.pikachuVisible) {
          this.pikachu.setTexture('pikachu_surf', 0);
          this.pikachu.play(`pikachu_surf_${this.pikachuDirection}`, true);
        }
        soundSystem.startMusic('surf');
      } else {
        this.textBox.show([
          "The sea stretches out\nbefore you...",
          "You need a POKeMON\nthat knows SURF!",
        ]);
        return;
      }
    }

    // SS Anne: need SS Ticket
    if (mapId === 'ss_anne' && !this.playerState.hasItem('ss_ticket')) {
      this.textBox.show([
        "You need an S.S.\nTICKET to board!",
      ]);
      return;
    }

    // SS Anne: already departed (only block entry from outside the ship)
    const currentMapId = this.currentMap?.id || '';
    const isOnSSAnne = currentMapId.startsWith('ss_anne');
    if (mapId === 'ss_anne' && this.playerState.storyFlags['ss_anne_departed'] && !isOnSSAnne) {
      this.textBox.show([
        "The S.S. ANNE has\nalready departed...",
      ]);
      return;
    }

    // Viridian Gym: locked until Giovanni defeated at Silph Co
    if (mapId === 'viridian_gym' && !this.playerState.storyFlags['giovanni_silph']) {
      this.textBox.show([
        "The door is locked...",
        "The GYM LEADER is\naway.",
      ]);
      return;
    }

    // Pewter Museum 2F: need ticket
    if (mapId === 'pewter_museum_2f' && !this.playerState.storyFlags['museum_2f_ticket']) {
      this.textBox.show([
        "You need a ticket\nto go upstairs!",
        "Please see the clerk\nat the front desk.",
      ]);
      return;
    }

    // Pokemon Tower 5F: ghost Marowak blocks the stairs
    if (mapId === 'pokemon_tower_5f') {
      if (!this.playerState.hasItem('silph_scope')) {
        this.textBox.show([
          "A GHOST appeared!",
          "Get out...\nGet out...",
          "The GHOST won't let\nyou pass!",
        ]);
        return;
      }
      if (!this.playerState.storyFlags['marowak_ghost_defeated']) {
        this.playerState.storyFlags['marowak_ghost_defeated'] = true;
        this.textBox.show([
          "The SILPH SCOPE\nreveals the GHOST's\ntrue identity!",
          "It's the restless\nspirit of MAROWAK!",
        ], () => {
          this.startWildBattle(createPokemon(105, 30));
        });
        return;
      }
    }

    // Rocket Hideout B1F: need poster flag to enter from Game Corner
    if (mapId === 'rocket_hideout_b1f' && this.currentMap.id === 'game_corner') {
      if (!this.playerState.storyFlags['game_corner_poster_found']) {
        // Silent block - player can't find the stairs yet
        return;
      }
      if (this.playerState.defeatedTrainers.includes('giovanni_game_corner')) {
        this.textBox.show([
          "The hideout has been\nabandoned...",
        ]);
        return;
      }
    }

    // Silph Co: locked after completion
    if (mapId.startsWith('silph_co_') && this.playerState.storyFlags['silph_co_complete']) {
      this.textBox.show([
        "SILPH CO. has resumed\nnormal operations.",
        "Thank you for saving\nus!",
      ]);
      return;
    }

    // Cycling Road: need bicycle to enter Route 16/17
    if ((mapId === 'route16' || mapId === 'route17') && !this.playerState.hasItem('bicycle')) {
      this.textBox.show([
        "You can't go onto\nCYCLING ROAD without\na BICYCLE!",
      ]);
      return;
    }

    // Auto-mount bike when entering Cycling Road
    if ((mapId === 'route16' || mapId === 'route17') && this.playerState.hasItem('bicycle') && !this.isRidingBike) {
      this.isRidingBike = true;
    }

    // Champion Hall gate — needs 8 badges, and resets the E4 gauntlet on entry
    if (mapId === 'elite_four_lorelei') {
      if (this.playerState.badges.length < 8) {
        this.textBox.show([
          'You need all 8 BADGES\nto enter the',
          'POKeMON LEAGUE!',
        ]);
        return;
      }
      // Strict-gauntlet reset: re-fight every Elite Four member from the top.
      const e4Ids = new Set(['lorelei', 'bruno', 'agatha', 'lance', 'champion_rival']);
      this.playerState.defeatedTrainers = this.playerState.defeatedTrainers.filter(id => !e4Ids.has(id));
    }

    const map = ALL_MAPS[mapId];
    if (!map) {
      console.warn(`Map not found: ${mapId}`);
      return;
    }

    // Auto-dismount bike when entering indoor maps
    if (this.isRidingBike && !this.isMapOutdoor(map)) {
      this.isRidingBike = false;
    }

    this.isWarping = true;

    // Fade out and in
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Restart scene with new map data
      this.scene.restart({
        mapId,
        playerX: targetX,
        playerY: targetY,
        saveData: this.playerState.toSave(),
        isSurfing: this.isSurfing,
        isRidingBike: this.isRidingBike,
        flashUsed: this.flashUsed,
      } as SceneData);
    });
  }

  private checkTrainerSight(): boolean {
    if (this.isWarping) return false;

    for (const npc of this.currentMap.npcs) {
      if (!npc.isTrainer || !npc.sightRange) continue;
      if (this.playerState.defeatedTrainers.includes(npc.id)) continue;
      if (this.shouldSkipNPC(npc)) continue;

      const sight = computeTrainerSight(
        npc, this.playerGridX, this.playerGridY, this.currentMap, this.isSurfing,
      );
      if (!sight.spotted) continue;

      // Trainer spotted the player!
      this.isWarping = true; // Block all input
      this.triggerTrainerEncounter(npc, sight.distance);
      return true;
    }
    return false;
  }

  private triggerTrainerEncounter(npc: NPCData, distance: number): void {
    const sprite = this.npcSprites.get(npc.id);
    if (!sprite) return;

    // Show "!" alert bubble above trainer (Game Boy style)
    const bubbleX = sprite.x;
    const bubbleY = sprite.y - TILE_SIZE - 2;
    const bubbleW = 12;
    const bubbleH = 14;

    const bubble = this.add.graphics();
    bubble.setDepth(20);
    // White bubble background with black border
    bubble.fillStyle(0xf8f8f8, 1);
    bubble.fillRoundedRect(bubbleX - bubbleW / 2, bubbleY - bubbleH / 2, bubbleW, bubbleH, 2);
    bubble.lineStyle(1, 0x383838, 1);
    bubble.strokeRoundedRect(bubbleX - bubbleW / 2, bubbleY - bubbleH / 2, bubbleW, bubbleH, 2);
    // Small triangle pointer at bottom
    bubble.fillStyle(0xf8f8f8, 1);
    bubble.fillTriangle(bubbleX - 2, bubbleY + bubbleH / 2, bubbleX + 2, bubbleY + bubbleH / 2, bubbleX, bubbleY + bubbleH / 2 + 3);
    bubble.lineStyle(1, 0x383838, 1);
    bubble.lineBetween(bubbleX - 2, bubbleY + bubbleH / 2, bubbleX, bubbleY + bubbleH / 2 + 3);
    bubble.lineBetween(bubbleX + 2, bubbleY + bubbleH / 2, bubbleX, bubbleY + bubbleH / 2 + 3);

    const exclamation = this.add.text(
      bubbleX,
      bubbleY,
      '!',
      {
        fontSize: '10px',
        fontFamily: 'monospace',
        color: '#383838',
        fontStyle: 'bold',
      }
    );
    exclamation.setOrigin(0.5, 0.5);
    exclamation.setDepth(21);

    soundSystem.bump(); // Alert sound

    soundSystem.startMusic(getEncounterTheme(npc.id));

    // After a brief pause showing "!", trainer walks toward player
    this.time.delayedCall(600, () => {
      exclamation.destroy();
      bubble.destroy();

      // Trainer walks toward the player, stopping 1 tile away
      const tilesToWalk = distance - 1;
      if (tilesToWalk <= 0) {
        // Already adjacent - turn player to face trainer, start battle
                this.playerDirection = OPPOSITE_DIR[npc.direction];
        this.player.play(this.isSurfing ? `surf_${this.playerDirection}` : this.isRidingBike ? `bike_idle_${this.playerDirection}` : `player_idle_${this.playerDirection}`, true);
        this.isWarping = false; // Allow dialogue input
        this.interactWithNPC(npc);
        return;
      }

      const vec = DIR_VECTORS[npc.direction];
      let stepsTaken = 0;

      const walkStep = () => {
        if (stepsTaken >= tilesToWalk) {
          // Update NPC's actual position in the data
          npc.x += vec.x * tilesToWalk;
          npc.y += vec.y * tilesToWalk;
          // Turn player to face the approaching trainer
                    this.playerDirection = OPPOSITE_DIR[npc.direction];
          this.player.play(this.isSurfing ? `surf_${this.playerDirection}` : `player_idle_${this.playerDirection}`, true);
          this.isWarping = false; // Allow dialogue input
          this.interactWithNPC(npc);
          return;
        }

        stepsTaken++;
        const targetPixelX = (npc.x + vec.x * stepsTaken) * TILE_SIZE + TILE_SIZE / 2;
        const targetPixelY = (npc.y + vec.y * stepsTaken) * TILE_SIZE + TILE_SIZE / 2;

        this.tweens.add({
          targets: sprite,
          x: targetPixelX,
          y: targetPixelY,
          duration: MOVE_DURATION,
          onComplete: () => {
            walkStep();
          },
        });
      };

      walkStep();
    });
  }

  /** Common state payload passed to BattleScene so it can restore the overworld. */
  private buildBattleReturnData() {
    return {
      playerState: this.playerState.toSave(),
      returnMap: this.currentMap.id,
      returnX: this.playerGridX,
      returnY: this.playerGridY,
      isSurfing: this.isSurfing,
      isRidingBike: this.isRidingBike,
      flashUsed: this.flashUsed,
    };
  }

  /** Blocks input and transitions into a wild battle with the standard payload. */
  private startWildBattle(wildPokemon: PokemonInstance, extra: { isGhost?: boolean } = {}): void {
    this.isWarping = true;
    soundSystem.battleStart();
    playBattleTransition(this, () => {
      this.scene.start('BattleScene', {
        type: 'wild',
        wildPokemon,
        ...this.buildBattleReturnData(),
        ...extra,
      });
    }, () => {
      soundSystem.startMusic('wild_battle');
    });
  }

  private checkWildEncounter(x: number, y: number): void {
    if (this.isWarping) return;
    const tileType = this.currentMap.tiles[y]?.[x];
    // Encounters happen on tall grass, cave floors, and indoor floors (for Pokemon Tower etc.)
    const encounterTiles = [TileType.TALL_GRASS, TileType.CAVE_FLOOR];
    if (!encounterTiles.includes(tileType)) return;

    // Oak intercept: if player has no Pokemon, Oak stops them
    if (this.playerState.party.length === 0) {
      this.triggerOakIntercept();
      return;
    }

    const encounters = this.currentMap.wildEncounters;
    if (!encounters) return;

    // Repel: decrement and block encounters while active
    if (this.playerState.repelSteps > 0) {
      this.playerState.repelSteps--;
      if (this.playerState.repelSteps === 0) {
        this.textBox.show(['REPEL\'s effect wore off!']);
      }
      return;
    }

    // Minimum steps between encounters to prevent back-to-back fights
    const MIN_STEPS_BETWEEN = 4;
    if (this.stepCounter - this.lastEncounterStep < MIN_STEPS_BETWEEN) return;

    if (Math.random() > encounters.grassRate) return;

    // Pokemon Tower ghost encounters (no Silph Scope)
    const towerFloors = ['pokemon_tower_2f', 'pokemon_tower_3f', 'pokemon_tower_4f', 'pokemon_tower_5f'];
    if (towerFloors.includes(this.currentMap.id) && !this.playerState.hasItem('silph_scope')) {
      this.lastEncounterStep = this.stepCounter;
      this.startWildBattle(createPokemon(92, 20), { isGhost: true });
      return;
    }

    // Pick a wild Pokemon
    const pick = pickWildEncounter(encounters);
    if (pick) {
      this.lastEncounterStep = this.stepCounter;
      this.startWildBattle(createPokemon(pick.speciesId, pick.level));
    }
  }

  private triggerRivalLabBattle(): void {
    // Rival walks up and initiates battle after player receives Pikachu
    const rivalNpc = this.currentMap.npcs.find(n => n.id === 'rival');
    if (!rivalNpc || this.playerState.defeatedTrainers.includes('rival_lab')) {
      this.playerState.storyFlags['rival_battle_lab'] = true;
      return;
    }

    soundSystem.startMusic('rival_theme');
    this.textBox.show(
      [
        `${this.playerState.rivalName}: Wait,\n${this.playerState.name}!`,
        "Let's check out our\nnew POKeMON!",
        `${this.playerState.rivalName} wants\nto battle!`,
      ],
      () => {
        this.startRivalBattle('rival_lab');
      }
    );
  }

  private startRivalBattle(trainerId: string): void {
    this.isWarping = true;
    soundSystem.battleStart();

    playTrainerBattleTransition(this, () => {
      this.scene.start('BattleScene', {
        type: 'trainer',
        trainerId,
        trainerName: this.playerState.rivalName,
        trainerClass: 'Rival',
        ...this.buildBattleReturnData(),
      });
    }, () => {
      soundSystem.startMusic('trainer_battle');
    });
  }

  /**
   * Animate an NPC sprite walking tile-by-tile along a path with frame animation.
   * NPC spritesheet layout: down=0, up=1, left=2, right=3, walk frames +4
   */
  private animateWalkPath(
    sprite: Phaser.GameObjects.Sprite,
    path: Array<{x: number, y: number}>,
    msPerTile: number,
    onComplete: () => void
  ): void {
    let stepIndex = 0;
    let walkFrame = 0;

    const walkStep = () => {
      if (stepIndex >= path.length) {
        onComplete();
        return;
      }

      const target = path[stepIndex];
      const currentX = Math.round((sprite.x - TILE_SIZE / 2) / TILE_SIZE);
      const currentY = Math.round((sprite.y - TILE_SIZE / 2) / TILE_SIZE);

      const dx = target.x - currentX;
      const dy = target.y - currentY;

      // Direction frame: down=0, up=1, left=2, right=3
      let dirFrame = 0;
      if (dy < 0) dirFrame = 1;
      else if (dy > 0) dirFrame = 0;
      else if (dx < 0) dirFrame = 2;
      else if (dx > 0) dirFrame = 3;

      sprite.setFrame(dirFrame + walkFrame * 4);
      walkFrame = (walkFrame + 1) % 2;

      this.tweens.add({
        targets: sprite,
        x: target.x * TILE_SIZE + TILE_SIZE / 2,
        y: target.y * TILE_SIZE + TILE_SIZE / 2,
        duration: msPerTile,
        onComplete: () => {
          stepIndex++;
          walkStep();
        }
      });
    };

    walkStep();
  }

  /**
   * Animate the player sprite walking tile-by-tile along a path.
   * Uses registered player walk/idle animations and updates grid position.
   */
  private animatePlayerWalkPath(
    path: Array<{x: number, y: number}>,
    msPerTile: number,
    onComplete: () => void
  ): void {
    let stepIndex = 0;

    const walkStep = () => {
      if (stepIndex >= path.length) {
        this.player.play(`player_idle_${this.playerDirection}`, true);
        onComplete();
        return;
      }

      const target = path[stepIndex];
      const dx = target.x - this.playerGridX;
      const dy = target.y - this.playerGridY;

      let dir: string;
      if (dy > 0) { dir = 'down'; this.playerDirection = Direction.DOWN; }
      else if (dy < 0) { dir = 'up'; this.playerDirection = Direction.UP; }
      else if (dx < 0) { dir = 'left'; this.playerDirection = Direction.LEFT; }
      else { dir = 'right'; this.playerDirection = Direction.RIGHT; }

      this.player.play(`player_walk_${dir}`, true);

      this.playerGridX = target.x;
      this.playerGridY = target.y;

      this.tweens.add({
        targets: this.player,
        x: target.x * TILE_SIZE + TILE_SIZE / 2,
        y: target.y * TILE_SIZE + TILE_SIZE / 2,
        duration: msPerTile,
        onComplete: () => {
          stepIndex++;
          walkStep();
        }
      });
    };

    walkStep();
  }

  /**
   * Build a path from lab door (10, 16) to a target position.
   * Routes around buildings: lab (x=7-12, y=12-15), player house (x=2-6, y=3-6),
   * rival house (x=12-16, y=3-6). Uses x=6 corridor south of houses, then
   * main path (x=8) north of houses.
   */
  private buildPathFromLabTo(targetX: number, targetY: number): Array<{x: number, y: number}> {
    const path: Array<{x: number, y: number}> = [];
    let cx = 10, cy = 16;

    // Go west to x=6 (clear of lab building x=7-12)
    while (cx > 6) { cx--; path.push({x: cx, y: cy}); }

    // Go north on x=6 to y=7 or target row, whichever is further south
    // (x=6 is safe from y=7 to y=16, but player's house occupies x=6 at y=3-6)
    const safeStopY = Math.max(targetY, 7);
    while (cy > safeStopY) { cy--; path.push({x: cx, y: cy}); }

    // If target is above y=7, step east to x=8 (main path) to avoid player's house
    if (targetY < 7) {
      while (cx < 8) { cx++; path.push({x: cx, y: cy}); }
      // Continue north on x=8 (safe: between houses, above lab)
      while (cy > targetY) { cy--; path.push({x: cx, y: cy}); }
    }

    // Go to target column
    while (cx < targetX) { cx++; path.push({x: cx, y: cy}); }
    while (cx > targetX) { cx--; path.push({x: cx, y: cy}); }

    // Go south to target row if needed
    while (cy < targetY) { cy++; path.push({x: cx, y: cy}); }

    return path;
  }

  /**
   * Build a path from a position to the lab door (10, 16).
   * Routes around the lab building (x=7-12, y=12-15).
   */
  private buildPathToLab(startX: number, startY: number): Array<{x: number, y: number}> {
    const path: Array<{x: number, y: number}> = [];
    let cx = startX, cy = startY;

    // Walk south to y=11 if north of building
    while (cy < 11) { cy++; path.push({x: cx, y: cy}); }

    // Route around the building (x=7-12, y=12-15)
    if (cx >= 7 && cx <= 12) {
      // On building's x-range, go west to x=6
      while (cx > 6) { cx--; path.push({x: cx, y: cy}); }
    } else if (cx > 12) {
      // East of building, route to x=13
      while (cx > 13) { cx--; path.push({x: cx, y: cy}); }
      while (cx < 13) { cx++; path.push({x: cx, y: cy}); }
    }
    // If cx <= 6, already west of building

    // Walk south to y=16 (lab door level)
    while (cy < 16) { cy++; path.push({x: cx, y: cy}); }

    // Walk to x=10 (lab door)
    while (cx < 10) { cx++; path.push({x: cx, y: cy}); }
    while (cx > 10) { cx--; path.push({x: cx, y: cy}); }

    return path;
  }

  private triggerPewterGuideIntercept(): void {
    this.isWarping = true;

    // Find the guide NPC data
    const guideNpc = this.currentMap.npcs.find(n => n.id === 'pewter_guide');
    if (!guideNpc) {
      this.isWarping = false;
      return;
    }

    // Use the existing guide sprite or create one
    const guideSprite = this.npcSprites.get('pewter_guide');
    if (!guideSprite) {
      this.isWarping = false;
      return;
    }

    // Build path from guide position to one tile east of player
    const targetX = this.playerGridX + 1;
    const targetY = this.playerGridY;
    const path: Array<{x: number, y: number}> = [];
    let cx = guideNpc.x;
    let cy = guideNpc.y;

    // Walk vertically to player's row first
    while (cy < targetY) { cy++; path.push({x: cx, y: cy}); }
    while (cy > targetY) { cy--; path.push({x: cx, y: cy}); }
    // Walk horizontally to target
    while (cx < targetX) { cx++; path.push({x: cx, y: cy}); }
    while (cx > targetX) { cx--; path.push({x: cx, y: cy}); }

    if (path.length === 0) {
      // Guide already adjacent
      this.isWarping = false;
      this.textBox.show(guideNpc.dialogue);
      return;
    }

    this.animateWalkPath(guideSprite, path, 120, () => {
      // Update guide NPC position
      guideNpc.x = targetX;
      guideNpc.y = targetY;
      this.isWarping = false;

      this.textBox.show(guideNpc.dialogue, () => {
        this.isWarping = true;

        // Walk player back west to the guide's original x
        const returnPath: Array<{x: number, y: number}> = [];
        for (let x = this.playerGridX - 1; x >= 21; x--) {
          returnPath.push({x, y: this.playerGridY});
        }

        // Walk guide back to original position
        const guideReturnPath: Array<{x: number, y: number}> = [];
        let gx = targetX, gy = targetY;
        while (gx > 21) { gx--; guideReturnPath.push({x: gx, y: gy}); }
        while (gy > 12) { gy--; guideReturnPath.push({x: gx, y: gy}); }
        while (gy < 12) { gy++; guideReturnPath.push({x: gx, y: gy}); }

        this.animatePlayerWalkPath(returnPath, 150, () => {
          this.isWarping = false;
        });
        this.animateWalkPath(guideSprite, guideReturnPath, 150, () => {
          guideNpc.x = 21;
          guideNpc.y = 12;
          // Reset guide to face left
          guideSprite.setFrame(2);
        });
      });
    });
  }

  private triggerOakIntercept(): void {
    const oakColor = 0xc0a080;
    const oakKey = 'npc_oak_intercept';
    if (!this.textures.exists(oakKey)) {
      generateNPCSprite(this, oakKey, oakColor);
    }

    // Block input during cutscene
    this.isWarping = true;
    soundSystem.startMusic('oaks_theme');

    // Oak starts at lab door (10, 16) and walks to the player
    const oakSprite = this.add.sprite(
      10 * TILE_SIZE + TILE_SIZE / 2,
      16 * TILE_SIZE + TILE_SIZE / 2,
      oakKey, 1  // facing up
    );
    oakSprite.setDepth(10);

    // Build approach path from lab door to one tile south of player
    const approachPath = this.buildPathFromLabTo(this.playerGridX, this.playerGridY + 1);

    // Oak walks to the player (faster pace - he's hurrying)
    this.animateWalkPath(oakSprite, approachPath, 120, () => {
      // Oak arrived next to player - allow text advancement
      this.isWarping = false;

      this.textBox.show(["OAK: Hey! Wait!\nDon't go out!"], () => {
        this.textBox.show([
          "It's unsafe! Wild\nPOKeMON live in\ntall grass!",
          'You need your own\nPOKeMON for your\nprotection.',
          "Come with me to\nmy lab!",
        ], () => {
          // Block input for walk to lab
          this.isWarping = true;

          // Build Oak's return path from Oak's position (one tile south of player) to lab door
          const oakReturnPath = this.buildPathToLab(this.playerGridX, this.playerGridY + 1);
          // Player's path: first step south to where Oak was, then follow Oak's route (stop 1 before end)
          const playerReturnPath = [
            {x: this.playerGridX, y: this.playerGridY + 1},
            ...oakReturnPath.slice(0, -1)
          ];

          // Both walk simultaneously - Oak leads, player follows one tile behind
          this.animateWalkPath(oakSprite, oakReturnPath, 200, () => {
            oakSprite.destroy();
          });

          this.animatePlayerWalkPath(playerReturnPath, 200, () => {
            this.player.play('player_idle_down', true);

            // Fade out and warp to Oak's lab
            this.cameras.main.fadeOut(200, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
              this.scene.restart({
                mapId: 'oaks_lab',
                playerX: 4,
                playerY: 11,
                saveData: this.playerState.toSave(),
              } as SceneData);
            });
          });
        });
      });
    });
  }

  private handleAction(): void {
    if (this.isWarping || this.screenOpen) return;

    // If textbox is showing, advance it
    if (this.textBox.getIsVisible()) {
      this.textBox.advance();
      return;
    }

    if (this.menuOpen) {
      this.selectMenuItem();
      return;
    }

    // Check for NPC interaction
    const vec = DIR_VECTORS[this.playerDirection];
    const targetX = this.playerGridX + vec.x;
    const targetY = this.playerGridY + vec.y;

    for (const npc of this.currentMap.npcs) {
      if (this.shouldSkipNPC(npc)) continue;
      if (this.npcBlocksTile(npc, targetX, targetY)) {
        this.interactWithNPC(npc);
        return;
      }
    }

    // Check for sign
    const tileType = this.currentMap.tiles[targetY]?.[targetX];
    if (tileType === TileType.SIGN || tileType === TileType.MUSEUM_PLAQUE) {
      this.readSign(targetX, targetY);
      return;
    }

    if (tileType === TileType.PC) {
      this.textBox.show(['Turned on the PC.'], () => {
        this.screenOpen = true;
        this.pcScreen.show(this.playerState, () => {
          this.screenOpen = false;
        });
      });
      return;
    }

    // Vermilion Gym trash can puzzle
    if (this.handleSurgeTrashCan(targetX, targetY)) return;

    // HM field effects: Cut, Surf, Strength
    if (this.handleCut(targetX, targetY)) return;
    if (this.handleSurf(targetX, targetY)) return;
    if (this.handleStrength(targetX, targetY)) return;

    // Check for Pikachu interaction
    if (this.pikachuVisible && targetX === this.pikachuGridX && targetY === this.pikachuGridY) {
      soundSystem.pokemonCry(800);
      const pikachu = this.playerState.party.find(p => p.speciesId === 25);
      const happiness = pikachu ? getHappiness(pikachu) : 70;
      let pikachuMsg: string[];
      let faceFrame: number;
      if (happiness >= 200) {
        pikachuMsg = ['PIKACHU: Pika pika!', 'PIKACHU looks very\nhappy! It loves you!'];
        faceFrame = 0;
      } else if (happiness >= 150) {
        pikachuMsg = ['PIKACHU: Pikachu!', 'PIKACHU seems really\nhappy!'];
        faceFrame = 1;
      } else if (happiness >= 100) {
        pikachuMsg = ['PIKACHU: Pika!', 'PIKACHU seems fairly\nhappy.'];
        faceFrame = 2;
      } else if (happiness >= 50) {
        pikachuMsg = ['PIKACHU: Pika...', 'PIKACHU seems a\nlittle unsure.'];
        faceFrame = 3;
      } else {
        pikachuMsg = ['PIKACHU: ...', 'PIKACHU doesn\'t seem\nto like you yet...'];
        faceFrame = 4;
      }
      this.showPikachuFace(faceFrame, pikachuMsg);
    }
  }

  /** Substitutes {PLAYER}/{RIVAL} placeholders in dialogue text. */
  private fmt(s: string): string {
    return s.replace('{PLAYER}', this.playerState.name).replace('{RIVAL}', this.playerState.rivalName);
  }

  private interactWithNPC(npc: NPCData): void {
    // Turn NPC to face player
    const sprite = this.npcSprites.get(npc.id);
    if (sprite) {
      const faceDir = OPPOSITE_DIR[this.playerDirection];
      const dirIndex = [Direction.DOWN, Direction.UP, Direction.LEFT, Direction.RIGHT].indexOf(faceDir);
      sprite.setFrame(dirIndex);
    }

    // Item ball pickup
    if (npc.isItemBall && npc.itemId) {
      this.pickUpItemBall(npc);
      return;
    }

    // Special NPC handling - all nurses heal
    if (npc.id.startsWith('nurse')) {
      // Show greeting dialogue, then run the animated heal sequence
      const greetDialogue = npc.dialogue.slice(0, -1); // All but the "restored" line
      const restoreMsg = npc.dialogue[npc.dialogue.length - 1] || 'Your POKeMON have been\nfully restored!';
      this.textBox.show(greetDialogue.length > 0 ? greetDialogue : ['Let me heal your\nPOKeMON!'], () => {
        this.runHealAnimation(npc, restoreMsg);
      });
      return;
    }

    // Viridian Mart: give Oak's Parcel before opening shop
    if ((npc.shopStock || npc.id.startsWith('mart_clerk')) &&
        this.playerState.storyFlags['has_pikachu'] &&
        !this.playerState.hasItem('oaks_parcel') &&
        !this.playerState.storyFlags['delivered_parcel']) {
      this.textBox.show(
        [
          "Hey! You came from\nPALLET TOWN?",
          "I have a package\nfor PROF. OAK!",
          `${this.playerState.name} received\nOAK's PARCEL!`,
        ],
        () => {
          this.playerState.addItem('oaks_parcel');
        }
      );
      return;
    }

    if (npc.shopStock || npc.id.startsWith('mart_clerk')) {
      this.showShopMenu(npc);
      return;
    }

    // Declarative gift/conditional-dialogue NPCs (a null resolve falls through)
    const gift = GIFT_NPCS[npc.id];
    if (gift) {
      const result = gift.resolve(this.playerState);
      if (result) {
        this.runGiftNpc(result);
        return;
      }
    }

    // Stateful story NPCs (a false return falls through, e.g. an undefeated
    // Giovanni continues into the trainer-battle branch below)
    const handler = this.getNpcHandler(npc.id);
    if (handler && handler(npc)) {
      return;
    }

    // Trainer battle check
    if (npc.isTrainer && !this.playerState.defeatedTrainers.includes(npc.id)) {
      // Play encounter music for trainers the player walks up to (not spotted by sight)
      if (!this.isWarping) {
        soundSystem.startMusic(getEncounterTheme(npc.id));
      }
      this.textBox.show(npc.dialogue.map(d => this.fmt(d)), () => {
        this.startTrainerBattle(npc);
      });
      return;
    }

    // Regular dialogue
    if (npc.isTrainer && this.playerState.defeatedTrainers.includes(npc.id)) {
      this.textBox.show(["I already lost to\nyou..."]);
    } else {
      this.textBox.show(npc.dialogue.map(d => this.fmt(d)));
    }
  }

  private pickUpItemBall(npc: NPCData): void {
    const item = ITEMS[npc.itemId!];
    if (!item) return;
    this.textBox.show(
      [`${this.playerState.name} found\n${item.name}!`],
      () => {
        this.playerState.addItem(npc.itemId!);
        this.playerState.storyFlags[`picked_up_${npc.id}`] = true;
        // Remove sprite from map
        const ballSprite = this.npcSprites.get(npc.id);
        if (ballSprite) {
          ballSprite.destroy();
          this.npcSprites.delete(npc.id);
        }
        // Mt. Moon fossils: picking one removes the other
        if (npc.id === 'mt_moon_helix_fossil' || npc.id === 'mt_moon_dome_fossil') {
          this.playerState.storyFlags['got_fossil'] = true;
          const otherId = npc.id === 'mt_moon_helix_fossil' ? 'mt_moon_dome_fossil' : 'mt_moon_helix_fossil';
          const otherSprite = this.npcSprites.get(otherId);
          if (otherSprite) {
            otherSprite.destroy();
            this.npcSprites.delete(otherId);
          }
        }
      }
    );
  }

  /** Shows a gift NPC's dialogue, then applies its rewards in order. */
  private runGiftNpc(result: GiftNpcResult): void {
    const dialogue = result.dialogue.map(d => this.fmt(d));
    const { onComplete, grantsPokemon } = result;
    if (!onComplete && !grantsPokemon) {
      this.textBox.show(dialogue);
      return;
    }
    this.textBox.show(dialogue, () => {
      if (grantsPokemon) {
        const gifted = createPokemon(grantsPokemon.speciesId, grantsPokemon.level, this.playerState.name);
        this.playerState.addToParty(gifted);
      }
      onComplete?.(this.playerState);
      if (grantsPokemon) {
        soundSystem.pokemonCry(grantsPokemon.cryPitch);
      }
    });
  }

  /**
   * Registry for story NPCs whose interactions need scene state. Handlers
   * return true when they handled the interaction; false falls through to
   * the trainer/default-dialogue branches.
   */
  private npcHandlers?: Map<string, (npc: NPCData) => boolean>;

  private getNpcHandler(id: string): ((npc: NPCData) => boolean) | undefined {
    if (!this.npcHandlers) {
      const h = new Map<string, (npc: NPCData) => boolean>();
      h.set('oak', (npc) => this.handleOak(npc));
      h.set('rival', () => this.handleRivalInLab());
      h.set('snorlax_route12', (npc) => this.handleSnorlax(npc));
      h.set('snorlax_route16', (npc) => this.handleSnorlax(npc));
      h.set('articuno_seafoam', (npc) => this.handleLegendaryBird(npc));
      h.set('zapdos_power_plant', (npc) => this.handleLegendaryBird(npc));
      h.set('moltres_victory_road', (npc) => this.handleLegendaryBird(npc));
      h.set('game_corner_clerk', () => { this.showPrizeExchange(); return true; });
      h.set('game_corner_coin_vendor', () => { this.buyCoinsFromVendor(); return true; });
      h.set('celadon_mansion_coin_case_giver', () => this.handleCoinCaseGiver());
      h.set('giovanni_game_corner', () => this.handleDefeatedGiovanni('giovanni_game_corner', 'The hideout has been\nabandoned...'));
      h.set('giovanni_silph', () => this.handleDefeatedGiovanni('giovanni_silph', 'GIOVANNI has fled\nthe building!'));
      this.npcHandlers = h;
    }
    const exact = this.npcHandlers.get(id);
    if (exact) return exact;
    if (id.startsWith('slot_machine_')) return () => { this.playSlotMachine(); return true; };
    if (id.startsWith('elevator_')) return () => this.handleElevatorNpc();
    if (id.startsWith('badge_check')) return (npc) => this.handleBadgeCheck(npc);
    return undefined;
  }

  /** Oak's story progression chain. */
  private handleOak(_npc: NPCData): boolean {
    if (this.currentMap.id !== 'oaks_lab') {
      soundSystem.startMusic('oaks_theme');
    }
    if (!this.playerState.storyFlags['has_pikachu']) {
      // Give Pikachu
      this.textBox.show(
        [
          this.fmt('OAK: Ah, {PLAYER}!\nI\'ve been waiting\nfor you!'),
          'I have a POKeMON\nhere for you!',
          'This PIKACHU is quite\nenergetic!',
          'Go on! Take it with\nyou on your journey!',
          this.fmt('{PLAYER} received\nPIKACHU!'),
        ],
        () => {
          const pikachu = createPokemon(25, 5);
          this.playerState.addToParty(pikachu);
          this.playerState.storyFlags['has_pikachu'] = true;
          soundSystem.pokemonCry(800);

          // Update Pikachu follower visibility
          this.pikachuVisible = true;
          this.pikachuGridX = this.playerGridX;
          this.pikachuGridY = this.playerGridY;
          this.pikachu.setPosition(
            this.pikachuGridX * TILE_SIZE + TILE_SIZE / 2,
            this.pikachuGridY * TILE_SIZE + TILE_SIZE / 2
          );
        }
      );
      return true;
    }
    if (this.playerState.hasItem('oaks_parcel') && !this.playerState.storyFlags['delivered_parcel']) {
      // Parcel delivery sequence
      this.textBox.show(
        [
          'OAK: Oh! That\'s the\nparcel I was waiting\nfor!',
          this.fmt('Thank you, {PLAYER}!'),
          'OAK: I have something\nfor you in return!',
          this.fmt('{PLAYER} handed over\nthe OAK\'S PARCEL!'),
          'OAK: This is a\nPOKeDEX!',
          'It automatically\nrecords data on\nPOKeMON you\'ve seen\nor caught!',
          this.fmt('{PLAYER} received\nthe POKeDEX!'),
          "Here, take these\ntoo!",
          this.fmt('{PLAYER} received\n5 POKe BALLs!'),
        ],
        () => {
          this.playerState.useItem('oaks_parcel');
          this.playerState.addItem('pokedex');
          this.playerState.addItem('poke_ball', 5);
          this.playerState.storyFlags['delivered_parcel'] = true;
          this.playerState.storyFlags['has_pokedex'] = true;
        }
      );
      return true;
    }
    if (this.playerState.storyFlags['delivered_parcel']) {
      this.textBox.show([
        'OAK: Good luck filling\nup that POKeDEX!',
        'The world is full of\namazing POKeMON!',
      ]);
      return true;
    }
    // Has Pikachu but no parcel yet
    this.textBox.show([
      'OAK: Go explore the\nworld with PIKACHU!',
      'The VIRIDIAN CITY\nMart might have\nsomething for me...',
    ]);
    return true;
  }

  /** Rival NPC in the lab - context-dependent. */
  private handleRivalInLab(): boolean {
    if (!this.playerState.storyFlags['has_pikachu']) {
      this.textBox.show([
        `${this.playerState.rivalName}: What?\nGramps isn't here?`,
        "I want my POKeMON!",
      ]);
      return true;
    }
    if (this.playerState.storyFlags['rival_battle_lab']) {
      this.textBox.show([
        `${this.playerState.rivalName}: I'll get\nstronger and beat\nyou next time!`,
      ]);
      return true;
    }
    // Rival wants to battle (triggered automatically after getting Pikachu)
    soundSystem.startMusic('rival_theme');
    this.textBox.show([
      this.fmt(`${this.playerState.rivalName}: Wait,\n{PLAYER}!`),
      "Let's check out our\nnew POKeMON!",
    ], () => {
      this.startRivalBattle('rival_lab');
    });
    return true;
  }

  /** Sleeping Snorlax: wake with the Poke Flute for a wild battle. */
  private handleSnorlax(npc: NPCData): boolean {
    if (this.playerState.hasItem('poke_flute')) {
      this.textBox.show(
        [
          `${this.playerState.name} used the\nPOKe FLUTE!`,
          "SNORLAX woke up!\nIt looks angry!",
        ],
        () => {
          // Start wild Snorlax battle (level 30)
          this.startWildBattle(createPokemon(143, 30));
          // Set flag to remove Snorlax after battle
          this.playerState.storyFlags[`${npc.id}_cleared`] = true;
        }
      );
      return true;
    }
    this.textBox.show([
      "A huge POKeMON is\nblocking the path!",
      "It's sleeping soundly...",
      "Zzz... Zzz...",
      "Maybe a melody could\nwake it up?",
    ]);
    return true;
  }

  /** Legendary bird encounters (Articuno, Zapdos, Moltres). */
  private handleLegendaryBird(npc: NPCData): boolean {
    const birdSpecies: Record<string, number> = {
      articuno_seafoam: 144,
      zapdos_power_plant: 145,
      moltres_victory_road: 146,
    };
    const speciesId = birdSpecies[npc.id];
    this.textBox.show(
      npc.dialogue,
      () => {
        this.startWildBattle(createPokemon(speciesId, 50));
        this.playerState.storyFlags[`${npc.id}_cleared`] = true;
      }
    );
    return true;
  }

  /** Celadon Mansion Coin Case giver — gives Coin Case once. */
  private handleCoinCaseGiver(): boolean {
    if (!this.playerState.hasCoinCase()) {
      this.playerState.addItem('coin_case', 1);
      soundSystem.menuSelect();
      this.textBox.show([
        "Here, take this!",
        "It's a COIN CASE.",
        "You can hold up to\n9999 coins in it!",
      ]);
    } else {
      this.textBox.show(["Hope you're enjoying\nthe GAME CORNER!"]);
    }
    return true;
  }

  /** Post-defeat Giovanni dialogue; undefeated falls through to the battle. */
  private handleDefeatedGiovanni(trainerId: string, message: string): boolean {
    if (!this.playerState.defeatedTrainers.includes(trainerId)) return false;
    this.textBox.show([message]);
    return true;
  }

  /** Rocket Hideout elevator: needs the Lift Key. */
  private handleElevatorNpc(): boolean {
    if (!this.playerState.hasItem('lift_key')) {
      this.textBox.show(['It\'s an elevator,\nbut it won\'t move...', 'It needs a special\nkey.']);
    } else {
      this.showElevatorMenu();
    }
    return true;
  }

  /** Route 23 badge check NPCs. */
  private handleBadgeCheck(npc: NPCData): boolean {
    const requiredBadges: Record<string, { badge: string; name: string }> = {
      'badge_check1': { badge: 'BOULDER', name: 'BOULDER BADGE' },
      'badge_check2': { badge: 'CASCADE', name: 'CASCADE BADGE' },
      'badge_check3': { badge: 'THUNDER', name: 'THUNDER BADGE' },
    };
    const req = requiredBadges[npc.id];
    if (req && this.playerState.badges.includes(req.badge)) {
      this.textBox.show([
        `GUARD: ${req.name}?\nVery good!`,
        "You may pass!",
      ]);
    } else if (req) {
      this.textBox.show([
        `GUARD: You need the\n${req.name} to pass!`,
        "Come back when you\nhave it!",
      ]);
    } else {
      if (this.playerState.badges.length >= 8) {
        this.textBox.show(["GUARD: All BADGES\nverified! Go ahead!"]);
      } else {
        this.textBox.show(["GUARD: You need more\nBADGES to pass!"]);
      }
    }
    return true;
  }

  private showPikachuFace(frame: number, messages: string[]): void {
    // White border frame around the portrait
    const border = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 - 24,
      54, 54, 0xf8f8f8
    );
    border.setScrollFactor(0);
    border.setDepth(901);

    // Inner dark border
    const innerBorder = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 - 24,
      50, 50, 0x282828
    );
    innerBorder.setScrollFactor(0);
    innerBorder.setDepth(902);

    // Pikachu face sprite
    const face = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 24, 'pikachu_face', frame);
    face.setScrollFactor(0);
    face.setDepth(903);

    // Pop-in animation
    face.setScale(0);
    border.setScale(0);
    innerBorder.setScale(0);

    this.tweens.add({
      targets: [border, innerBorder, face],
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut',
    });

    // Show text after a short delay, then clean up face on dismiss
    this.time.delayedCall(300, () => {
      this.textBox.show(messages, () => {
        // Pop-out animation then destroy
        this.tweens.add({
          targets: [face, border, innerBorder],
          scale: 0,
          duration: 150,
          ease: 'Quad.easeIn',
          onComplete: () => {
            border.destroy();
            innerBorder.destroy();
            face.destroy();
          },
        });
      });
    });
  }

  private tickWalkHappiness(): void {
    this.walkStepCounter++;
    // Every 128 steps, +1 happiness to all party Pokemon (Gen 1 Yellow rate)
    if (this.walkStepCounter >= 128) {
      this.walkStepCounter = 0;
      for (const pokemon of this.playerState.party) {
        gainHappiness(pokemon, 1);
      }
    }
  }

  private readSign(x: number, y: number): void {
    // Look up sign text from the registry based on map + position
    const signKey = `${this.currentMap.id}:${x},${y}`;

    // Game Corner poster puzzle
    if (signKey === 'game_corner:11,2') {
      if (this.playerState.storyFlags['game_corner_poster_found']) {
        this.textBox.show(['The hidden stairs\nlead underground...']);
      } else if (this.playerState.defeatedTrainers.includes('game_corner_poster_rocket')) {
        this.textBox.show(
          ['There\'s a switch\nbehind the poster!', 'A hidden staircase\nappeared!'],
          () => {
            this.playerState.storyFlags['game_corner_poster_found'] = true;
          }
        );
      } else {
        this.textBox.show(['A poster for a GAME\nCORNER tournament...']);
      }
      return;
    }

    this.textBox.show(SIGNS[signKey] || [this.currentMap.name]);
  }

  private playSlotMachine(): void {
    if (!this.playerState.hasCoinCase()) {
      this.textBox.show(["You'll need a\nCOIN CASE first!"]);
      return;
    }
    if (this.playerState.coins <= 0) {
      this.textBox.show([
        "You don't have any\ncoins to play!",
        "Try the coin vendor\nat the back counter.",
      ]);
      return;
    }
    this.screenOpen = true;
    this.slotMachineScreen.show(this.playerState, () => {
      this.screenOpen = false;
    });
  }

  private showPrizeExchange(): void {
    if (!this.playerState.hasCoinCase()) {
      this.textBox.show(["You'll need a\nCOIN CASE first!"]);
      return;
    }
    this.screenOpen = true;
    this.prizeExchangeScreen.show(this.playerState, () => {
      this.screenOpen = false;
    });
  }

  private buyCoinsFromVendor(): void {
    if (!this.playerState.hasCoinCase()) {
      this.textBox.show(["You'll need a\nCOIN CASE first!"]);
      return;
    }
    const COIN_BUNDLE = 50;
    const COST = 1000;
    if (this.playerState.coins >= 9999) {
      this.textBox.show(['Your COIN CASE is\nalready full!']);
      return;
    }
    if (this.playerState.money < COST) {
      this.textBox.show([`50 coins for $${COST}.`, "But you can't\nafford that!"]);
      return;
    }
    this.playerState.money -= COST;
    this.playerState.addCoins(COIN_BUNDLE);
    soundSystem.menuSelect();
    this.textBox.show([`Here you go!`, `Got 50 coins for\n$${COST}.`]);
  }

  private showElevatorMenu(): void {
    const floors = [
      { label: 'B1F', map: 'rocket_hideout_b1f', x: 2, y: 13 },
      { label: 'B2F', map: 'rocket_hideout_b2f', x: 2, y: 13 },
      { label: 'B4F', map: 'rocket_hideout_b4f', x: 2, y: 9 },
    ];

    this.screenOpen = true;

    let cursorIdx = 0;
    const menuW = 50;
    const menuH = floors.length * 14 + 8;
    const menuX = GAME_WIDTH - menuW - 4;
    const menuY = 4;

    const container = this.add.container(menuX, menuY);
    container.setScrollFactor(0);
    container.setDepth(990);

    const bg = this.add.graphics();
    bg.fillStyle(0xf8f8f8, 1);
    bg.fillRoundedRect(0, 0, menuW, menuH, 2);
    bg.lineStyle(2, 0x383838, 1);
    bg.strokeRoundedRect(0, 0, menuW, menuH, 2);
    container.add(bg);

    floors.forEach((opt, i) => {
      const isCurrent = opt.map === this.currentMap.id;
      const t = this.add.text(14, 4 + i * 14, opt.label, {
        fontSize: '8px',
        color: isCurrent ? '#a0a0a0' : '#383838',
        fontFamily: 'monospace',
      });
      container.add(t);
    });

    const cursor = this.add.text(4, 4, '▶', {
      fontSize: '8px', color: '#383838', fontFamily: 'monospace',
    });
    container.add(cursor);

    const cleanup = () => {
      container.destroy();
      this.screenOpen = false;
      this.input.keyboard!.off('keydown', onKey);
    };

    // Skip the initial Z/Enter that opened this menu
    let ready = false;
    this.time.delayedCall(100, () => { ready = true; });

    const onKey = (event: KeyboardEvent) => {
      if (!ready) return;
      if (event.key === 'ArrowUp') {
        cursorIdx = (cursorIdx - 1 + floors.length) % floors.length;
        cursor.setY(4 + cursorIdx * 14);
        soundSystem.menuSelect();
      } else if (event.key === 'ArrowDown') {
        cursorIdx = (cursorIdx + 1) % floors.length;
        cursor.setY(4 + cursorIdx * 14);
        soundSystem.menuSelect();
      } else if (event.key === 'z' || event.key === 'Enter') {
        const target = floors[cursorIdx];
        if (target.map === this.currentMap.id) return; // Already on this floor
        cleanup();
        soundSystem.doorOpen();
        this.warpTo(target.map, target.x, target.y);
      } else if (event.key === 'x' || event.key === 'Escape') {
        cleanup();
      }
    };

    this.input.keyboard!.on('keydown', onKey);
  }

  private startTrainerBattle(npc: NPCData): void {
    this.isWarping = true; // Block movement during battle transition
    soundSystem.battleStart();

    // Use rival's custom name for rival trainers
    let trainerName = npc.dialogue[0]?.split(':')[0] || 'TRAINER';
    if (npc.id.startsWith('rival_')) {
      trainerName = this.playerState.rivalName;
    }
    // Champion battle uses the rival's name directly
    if (npc.id === CHAMPION.id) {
      trainerName = this.playerState.rivalName;
    }

    // Look up trainer class for sprite rendering
    const trainerData = TRAINERS[npc.id];
    let trainerClass = trainerData?.class || '';
    const isEliteFour = ELITE_FOUR.some(e => e.id === npc.id);
    if (isEliteFour) trainerClass = 'Elite Four';
    else if (npc.id === CHAMPION.id) trainerClass = 'Champion';

    playTrainerBattleTransition(this, () => {
      this.scene.start('BattleScene', {
        type: 'trainer',
        trainerId: npc.id,
        trainerName,
        trainerClass,
        ...this.buildBattleReturnData(),
      });
    }, () => {
      let track: string = 'trainer_battle';
      if (npc.id === CHAMPION.id) track = 'elite_four';
      else if (isEliteFour || npc.id in GYM_LEADERS) track = 'gym_leader_battle';
      soundSystem.startMusic(track);
    });
  }

  // Menu system
  private getMenuItems(): string[] {
    const items: string[] = [];
    if (this.playerState.storyFlags['has_pokedex']) {
      items.push('POKeDEX');
    }
    if (this.playerState.party.length > 0) {
      items.push('POKeMON');
    }
    items.push('BAG', this.playerState.name, 'SAVE', 'EXIT');
    return items;
  }

  private buildMenuContents(): void {
    // Remove old children except the container itself
    this.menuContainer.removeAll(true);

    this.menuItems = this.getMenuItems();
    const menuWidth = 60;
    const menuHeight = this.menuItems.length * 14 + 8;

    const bg = this.add.graphics();
    bg.fillStyle(0xf8f8f8, 1);
    bg.fillRoundedRect(0, 0, menuWidth, menuHeight, 2);
    bg.lineStyle(2, 0x383838, 1);
    bg.strokeRoundedRect(0, 0, menuWidth, menuHeight, 2);

    const texts = this.menuItems.map((item, i) => {
      return this.add.text(14, 4 + i * 14, item, {
        fontSize: '8px',
        color: '#383838',
        fontFamily: 'monospace',
      });
    });

    this.menuCursor = this.add.text(4, 4, '>', {
      fontSize: '8px',
      color: '#383838',
      fontFamily: 'monospace',
    });

    this.menuContainer.add([bg, ...texts, this.menuCursor]);
  }

  private createMenu(): void {
    const menuWidth = 60;
    const menuX = GAME_WIDTH - menuWidth - 2;
    const menuY = 2;

    this.menuContainer = this.add.container(menuX, menuY);
    this.menuContainer.setDepth(900);
    this.menuContainer.setScrollFactor(0);
    this.menuContainer.setVisible(false);
    this.buildMenuContents();
  }

  private toggleMenu(): void {
    if (this.textBox.getIsVisible() || this.screenOpen) return;

    if (this.menuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  private openMenu(): void {
    this.buildMenuContents();
    this.menuOpen = true;
    this.menuSelectedIndex = 0;
    this.menuCursor.setY(4);
    this.menuContainer.setVisible(true);
    soundSystem.menuSelect();
  }

  private closeMenu(): void {
    this.menuOpen = false;
    this.menuContainer.setVisible(false);
  }

  private selectMenuItem(): void {
    const item = this.menuItems[this.menuSelectedIndex];
    soundSystem.menuSelect();

    // Trainer Card (dynamic name entry)
    if (item === this.playerState.name) {
      this.showTrainerCard();
      return;
    }

    switch (item) {
      case 'POKeDEX':
        this.showPokedex();
        break;
      case 'POKeMON':
        this.showPartyScreen();
        break;
      case 'BAG':
        this.showBagScreen();
        break;
      case 'SAVE':
        this.saveGame();
        break;
      case 'EXIT':
        this.closeMenu();
        break;
    }
  }

  private showPartyScreen(): void {
    this.closeMenu();
    if (this.playerState.party.length === 0) {
      this.textBox.show(["You don't have any\nPOKeMON yet!"]);
      return;
    }

    this.screenOpen = true;
    this.partyScreen.show(this.playerState.party, () => {
      this.screenOpen = false;
    }, (moveId: number) => {
      this.handleFieldMove(moveId);
    });
  }

  private handleFieldMove(moveId: number): void {
    switch (moveId) {
      case 15: { // CUT
        const vec = DIR_VECTORS[this.playerDirection];
        const tx = this.playerGridX + vec.x;
        const ty = this.playerGridY + vec.y;
        if (!this.handleCut(tx, ty)) {
          this.textBox.show(["There's nothing to\nCUT here!"]);
        }
        break;
      }
      case 19: // FLY
        if (!this.playerState.badges.includes('THUNDER')) {
          this.textBox.show(["You need the THUNDER\nBADGE to use FLY!"]);
        } else {
          this.showFlyMap();
        }
        break;
      case 57: { // SURF
        if (!this.playerState.badges.includes('SOUL')) {
          this.textBox.show(["You need the SOUL\nBADGE to use SURF!"]);
        } else {
          const vec = DIR_VECTORS[this.playerDirection];
          const tx = this.playerGridX + vec.x;
          const ty = this.playerGridY + vec.y;
          if (!this.handleSurf(tx, ty)) {
            this.textBox.show(["You can't SURF here!"]);
          }
        }
        break;
      }
      case 70: { // STRENGTH
        const vec = DIR_VECTORS[this.playerDirection];
        const tx = this.playerGridX + vec.x;
        const ty = this.playerGridY + vec.y;
        if (!this.handleStrength(tx, ty)) {
          this.textBox.show(["There's nothing to\nuse STRENGTH on!"]);
        }
        break;
      }
      case 100: // TELEPORT
        if (!this.isOutdoorMap()) {
          this.textBox.show(["Can't use TELEPORT\nhere!"]);
        } else {
          this.playTeleportAnimation();
        }
        break;
      case 148: // FLASH
        this.useFlash();
        break;
    }
  }

  private showBagScreen(): void {
    this.closeMenu();
    this.screenOpen = true;
    const escapeRopeCb = this.isCaveMap() ? () => {
      this.screenOpen = false;
      this.playTeleportAnimation();
    } : undefined;
    const bicycleCb = this.canRideBike() || this.isRidingBike ? () => {
      this.screenOpen = false;
      this.toggleBicycle();
    } : undefined;
    const fishingCb = this.isFacingWater() ? (rodId: string) => {
      this.screenOpen = false;
      this.startFishing(rodId);
    } : undefined;
    this.bagScreen.show(this.playerState, () => {
      this.screenOpen = false;
    }, escapeRopeCb, bicycleCb, fishingCb);
  }

  private isFacingWater(): boolean {
    const vec = DIR_VECTORS[this.playerDirection];
    const tx = this.playerGridX + vec.x;
    const ty = this.playerGridY + vec.y;
    return this.currentMap.tiles[ty]?.[tx] === TileType.WATER || this.isSurfing;
  }

  private startFishing(rodId: string): void {
    // Determine encounter table
    let encounters;
    if (rodId === 'old_rod') {
      encounters = OLD_ROD_ENCOUNTER;
    } else if (rodId === 'good_rod') {
      encounters = GOOD_ROD_ENCOUNTERS;
    } else {
      encounters = SUPER_ROD_ENCOUNTERS[this.currentMap.id] || DEFAULT_SUPER_ROD;
    }

    // Show fishing animation text
    this.textBox.show(['......'], () => {
      const wildPokemon = rollFishingEncounter(encounters);
      if (!wildPokemon) {
        this.textBox.show(['Not even a nibble!']);
        return;
      }
      this.textBox.show(['Oh! A bite!'], () => {
        this.startWildBattle(wildPokemon);
      });
    });
  }

  private showTrainerCard(): void {
    this.closeMenu();
    this.screenOpen = true;
    this.trainerCard.show(this.playerState, () => {
      this.screenOpen = false;
    });
  }

  private showPokedex(): void {
    this.closeMenu();
    this.screenOpen = true;
    this.pokedexScreen.show(
      this.playerState.pokedexSeen,
      this.playerState.pokedexCaught,
      () => { this.screenOpen = false; }
    );
  }

  private drawHealingMachine(): void {
    // Clean up from previous map
    this.healMachineGfx?.destroy();
    this.healMachineLightGfx?.destroy();
    this.healMachineGfx = null;
    this.healMachineLightGfx = null;
    this.healMachinePos = null;

    // Find nurse NPC
    const nurse = this.currentMap.npcs.find(n => n.id.startsWith('nurse'));
    if (!nurse) return;

    // Machine sits one tile to nurse's right (west / -x direction from player's perspective: left)
    const machTileX = nurse.x - 1;
    const machTileY = nurse.y;
    const px = machTileX * TILE_SIZE;
    const py = machTileY * TILE_SIZE;

    this.healMachinePos = { tileX: machTileX, tileY: machTileY, px, py };

    // Draw machine on the counter tile
    this.healMachineGfx = this.add.graphics();
    this.healMachineGfx.setDepth(5);

    // Machine body — metallic gray
    this.healMachineGfx.fillStyle(0x607068, 1);
    this.healMachineGfx.fillRoundedRect(px + 1, py + 1, 14, 12, 2);
    this.healMachineGfx.lineStyle(1, 0x404848, 1);
    this.healMachineGfx.strokeRoundedRect(px + 1, py + 1, 14, 12, 2);

    // Tray/platform surface — lighter where pokeballs sit
    this.healMachineGfx.fillStyle(0x8898a0, 1);
    this.healMachineGfx.fillRect(px + 3, py + 7, 10, 3);

    // Status light (off by default)
    this.healMachineGfx.fillStyle(0x505050, 1);
    this.healMachineGfx.fillCircle(px + 12, py + 4, 1.5);

    // Separate graphics for the status light so it can flash independently
    this.healMachineLightGfx = this.add.graphics();
    this.healMachineLightGfx.setDepth(6);
  }

  private runHealAnimation(_npc: NPCData, restoreMsg: string): void {
    this.isWarping = true; // Block all input during animation

    const partyCount = Math.min(this.playerState.party.length, 6);
    const hasPikachu = this.pikachuVisible;

    // Save Pikachu state for return trip
    const pikachuStartX = this.pikachu.x;
    const pikachuStartY = this.pikachu.y;
    const pikachuStartGridX = this.pikachuGridX;
    const pikachuStartGridY = this.pikachuGridY;

    // Machine position (permanent fixture drawn by drawHealingMachine)
    const mach = this.healMachinePos!;
    const machineCenterX = mach.px + TILE_SIZE / 2;
    const trayY = mach.py + 9; // matches the tray surface in drawHealingMachine
    const lightX = mach.px + 12;
    const lightY = mach.py + 4;

    // Pokeball positions on the machine tray
    const trayLeft = mach.px + 3;
    const trayWidth = 10; // matches tray rect width in drawHealingMachine
    const ballScale = 0.5;
    const ballSpacing = trayWidth / (partyCount + 1);
    const ballPositions: { x: number; y: number }[] = [];
    for (let i = 0; i < partyCount; i++) {
      ballPositions.push({
        x: trayLeft + ballSpacing * (i + 1),
        y: trayY,
      });
    }

    let pikaBall: Phaser.GameObjects.Image | null = null;
    const ballSprites: Phaser.GameObjects.Image[] = [];
    let step = 0;

    const nextStep = () => {
      step++;

      if (step === 1 && hasPikachu) {
        // Pikachu hops to the machine, then becomes a pokeball
        soundSystem.pokemonCry(800);
        this.pikachu.setDepth(11);

        this.tweens.add({
          targets: this.pikachu,
          x: machineCenterX,
          duration: 400,
          ease: 'Quad.easeOut',
          onUpdate: (_tween) => {
            const progress = _tween.progress;
            const arc = Math.sin(progress * Math.PI) * -14;
            this.pikachu.y = Phaser.Math.Linear(pikachuStartY, trayY, progress) + arc;
          },
          onComplete: () => {
            this.pikachu.setVisible(false);
            pikaBall = this.add.image(machineCenterX, trayY, 'pokeball_icon');
            pikaBall.setDepth(7);
            pikaBall.setScale(ballScale);
            soundSystem.healBallDing();
            this.time.delayedCall(300, nextStep);
          },
        });
      } else if (step === 1 && !hasPikachu) {
        nextStep();
      } else if (step === 2) {
        // Pokeballs appear one by one on the machine tray
        let ballIndex = 0;
        const placeBall = () => {
          if (ballIndex >= partyCount) {
            this.time.delayedCall(300, nextStep);
            return;
          }
          const pos = ballPositions[ballIndex];
          if (pos) {
            const ball = this.add.image(pos.x, pos.y, 'pokeball_icon');
            ball.setDepth(7);
            ball.setScale(0);
            ballSprites.push(ball);
            soundSystem.healBallDing();
            this.tweens.add({
              targets: ball,
              scale: ballScale,
              duration: 150,
              ease: 'Back.easeOut',
              onComplete: () => {
                ballIndex++;
                this.time.delayedCall(180, placeBall);
              },
            });
          } else {
            ballIndex++;
            placeBall();
          }
        };
        placeBall();
      } else if (step === 3) {
        // Machine processing — status light blinks green, balls pulse
        soundSystem.healMachineHum();
        let flashes = 0;
        const allBalls = pikaBall ? [pikaBall, ...ballSprites] : [...ballSprites];
        const flashBalls = () => {
          if (flashes >= 6) {
            this.healMachineLightGfx?.clear();
            for (const b of allBalls) b.setAlpha(1);
            this.time.delayedCall(150, nextStep);
            return;
          }
          const on = flashes % 2 === 0;
          this.healMachineLightGfx?.clear();
          this.healMachineLightGfx?.fillStyle(on ? 0x40e040 : 0x505050, 1);
          this.healMachineLightGfx?.fillCircle(lightX, lightY, 1.5);
          for (const b of allBalls) b.setAlpha(on ? 1 : 0.4);
          flashes++;
          this.time.delayedCall(180, flashBalls);
        };
        flashBalls();
      } else if (step === 4) {
        // Heal jingle + restore Pokemon — light stays green
        this.healMachineLightGfx?.clear();
        this.healMachineLightGfx?.fillStyle(0x40e040, 1);
        this.healMachineLightGfx?.fillCircle(lightX, lightY, 1.5);
        soundSystem.heal();

        for (const pokemon of this.playerState.party) {
          pokemon.currentHp = pokemon.stats.hp;
          pokemon.status = StatusCondition.NONE;
          for (const move of pokemon.moves) {
            move.currentPp = move.maxPp;
          }
          gainHappiness(pokemon, 3);
        }
        this.playerState.lastHealMap = this.currentMap.id;
        this.playerState.lastHealX = this.playerGridX;
        this.playerState.lastHealY = this.playerGridY;

        // Mark parent town as visited (for Fly)
        const exitWarp = this.currentMap.warps[0];
        if (exitWarp) {
          this.playerState.storyFlags[`visited_${exitWarp.targetMap}`] = true;
        }

        this.time.delayedCall(800, nextStep);
      } else if (step === 5) {
        // Remove pokeballs from machine
        const allBalls = pikaBall ? [...ballSprites, pikaBall] : [...ballSprites];
        for (const ball of allBalls) {
          this.tweens.add({
            targets: ball,
            alpha: 0,
            scale: 0,
            duration: 200,
          });
        }
        this.time.delayedCall(300, () => {
          for (const ball of ballSprites) ball.destroy();
          if (pikaBall) { pikaBall.destroy(); pikaBall = null; }
          nextStep();
        });
      } else if (step === 6 && hasPikachu) {
        // Pikachu reappears on the machine and hops back
        this.pikachu.setVisible(true);
        this.pikachu.x = machineCenterX;
        this.pikachu.y = trayY;

        const startY = trayY;
        this.tweens.add({
          targets: this.pikachu,
          x: pikachuStartX,
          duration: 400,
          ease: 'Quad.easeOut',
          onUpdate: (_tween) => {
            const progress = _tween.progress;
            const arc = Math.sin(progress * Math.PI) * -14;
            this.pikachu.y = Phaser.Math.Linear(startY, pikachuStartY, progress) + arc;
          },
          onComplete: () => {
            this.pikachu.setDepth(9);
            this.pikachu.y = pikachuStartY;
            this.pikachuGridX = pikachuStartGridX;
            this.pikachuGridY = pikachuStartGridY;
            this.pikachu.play(`pikachu_idle_${this.pikachuDirection}`, true);
            soundSystem.pokemonCry(800);
            this.time.delayedCall(300, nextStep);
          },
        });
      } else if ((step === 6 && !hasPikachu) || step === 7) {
        // Turn off status light and show final message
        this.healMachineLightGfx?.clear();
        this.isWarping = false;
        this.textBox.show([restoreMsg]);
      }
    };

    nextStep();
  }

  private showShopMenu(npc: NPCData): void {
    const stock = npc.shopStock || ['poke_ball', 'potion'];
    this.screenOpen = true;
    this.shopScreen.show(this.playerState, stock, () => {
      this.screenOpen = false;
    });
  }

  private saveGame(): void {
    this.closeMenu();
    const saveData = this.playerState.toSave();
    saveData.currentMap = this.currentMap.id;
    saveData.playerX = this.playerGridX;
    saveData.playerY = this.playerGridY;
    saveData.isSurfing = this.isSurfing;
    saveData.isRidingBike = this.isRidingBike;
    SaveSystem.save(saveData);
    soundSystem.save();
    this.textBox.show([`${this.playerState.name} saved\nthe game!`]);
  }

  // Bicycle helpers
  private canRideBike(): boolean {
    return this.isOutdoorMap() && !this.isSurfing && !this.isCaveMap();
  }

  private toggleBicycle(): void {
    if (this.isRidingBike) {
      // Dismount
      this.isRidingBike = false;
      this.player.setTexture('player', 0);
      this.player.play(`player_idle_${this.playerDirection}`, true);
      if (this.pikachuVisible) {
        this.pikachu.setTexture('pikachu_follower', 0);
        this.pikachu.play(`pikachu_idle_${this.pikachuDirection}`, true);
      }
      const musicId = getMusicForMap(this.currentMap);
      if (musicId) soundSystem.startMusic(musicId);
    } else {
      if (!this.canRideBike()) {
        this.textBox.show(["Can't use that here!"]);
        return;
      }
      this.isRidingBike = true;
      this.player.setTexture('player_bike', 0);
      this.player.play(`bike_idle_${this.playerDirection}`, true);
      if (this.pikachuVisible) {
        this.pikachu.setTexture('pikachu_bike', 0);
        this.pikachu.play(`pikachu_bike_idle_${this.pikachuDirection}`, true);
      }
      soundSystem.startMusic('bicycle');
    }
  }

  // HM field helpers
  private partyHasMove(moveId: number): boolean {
    return this.playerState.party.some(p => p.moves.some(m => m.moveId === moveId));
  }

  private handleCut(targetX: number, targetY: number): boolean {
    const tileType = this.currentMap.tiles[targetY]?.[targetX];
    if (tileType !== TileType.CUT_TREE) return false;

    // Need CUT (move 15) and CASCADE badge
    if (!this.partyHasMove(15) || !this.playerState.badges.includes('CASCADE')) {
      this.textBox.show(['This tree looks like\nit can be CUT down!']);
      return true;
    }

    this.textBox.show(['Used CUT!'], () => {
      // Replace tile with grass
      this.currentMap.tiles[targetY][targetX] = TileType.GRASS;
      this.currentMap.collision[targetY][targetX] = false;

      // Update visual
      const oldSprite = this.tileSprites[targetY]?.[targetX];
      if (oldSprite) oldSprite.destroy();

      const newSprite = this.add.image(
        targetX * TILE_SIZE + TILE_SIZE / 2,
        targetY * TILE_SIZE + TILE_SIZE / 2,
        this.getTileKey(TileType.GRASS)
      );
      newSprite.setDepth(0);
      if (this.tileSprites[targetY]) {
        this.tileSprites[targetY][targetX] = newSprite;
      }

      // Track for persistence
      this.playerState.storyFlags[`cut_${this.currentMap.id}_${targetX}_${targetY}`] = true;
      soundSystem.bump();
    });
    return true;
  }

  // ---- Vermilion Gym Trash Can Puzzle ----

  private initSurgeTrashPuzzle(): void {
    if (this.currentMap.id !== 'vermilion_gym') return;

    // If the gate is already open (badge obtained), remove the fence
    if (this.playerState.storyFlags['surge_gate_open']) {
      this.openSurgeGate();
      return;
    }

    this.surgePuzzle.init(this.currentMap);
  }

  private handleSurgeTrashCan(targetX: number, targetY: number): boolean {
    if (this.currentMap.id !== 'vermilion_gym') return false;
    const tileType = this.currentMap.tiles[targetY]?.[targetX];
    if (tileType !== TileType.COUNTER) return false;

    // Gate already open - just show empty trash
    if (this.playerState.storyFlags['surge_gate_open']) {
      this.textBox.show(['There\'s nothing in\nthe trash can.']);
      return true;
    }

    const outcome = this.surgePuzzle.checkCan(targetX, targetY);
    switch (outcome) {
      case 'first-found':
        soundSystem.bump();
        this.textBox.show([
          'Hey! There\'s a\nswitch under the',
          'trash! Turn it on!',
          'The first lock was\nopened!',
        ]);
        break;
      case 'gate-open':
        this.playerState.storyFlags['surge_gate_open'] = true;
        soundSystem.bump();
        this.textBox.show([
          'Hey! There\'s another\nswitch under the',
          'trash! Turn it on!',
          'The second lock was\nopened!',
          'The electric gate\nopened!',
        ], () => {
          this.openSurgeGate();
        });
        break;
      case 'reset':
        soundSystem.bump();
        this.textBox.show([
          'Nope, there\'s only\ntrash here.',
          'Hey! The electric\nlock was reset!',
        ]);
        break;
      case 'empty':
        this.textBox.show(['There\'s nothing in\nthe trash can.']);
        break;
    }

    return true;
  }

  private openSurgeGate(): void {
    // Remove the fence row at y=5 (columns 1-8)
    for (let x = 1; x < this.currentMap.width - 1; x++) {
      if (this.currentMap.tiles[5][x] === TileType.FENCE) {
        this.currentMap.tiles[5][x] = TileType.INDOOR_FLOOR;
        this.currentMap.collision[5][x] = false;

        // Update visual
        const oldSprite = this.tileSprites[5]?.[x];
        if (oldSprite) oldSprite.destroy();

        const newSprite = this.add.image(
          x * TILE_SIZE + TILE_SIZE / 2,
          5 * TILE_SIZE + TILE_SIZE / 2,
          this.getTileKey(TileType.INDOOR_FLOOR)
        );
        newSprite.setDepth(0);
        if (this.tileSprites[5]) {
          this.tileSprites[5][x] = newSprite;
        }
      }
    }
  }

  private handleSurf(targetX: number, targetY: number): boolean {
    if (this.isSurfing) return false;
    const tileType = this.currentMap.tiles[targetY]?.[targetX];
    if (tileType !== TileType.WATER) return false;

    // Need SURF (move 57) and SOUL badge
    if (!this.partyHasMove(57) || !this.playerState.badges.includes('SOUL')) {
      return false;
    }

    this.textBox.show(['The water is a deep\nblue color...', 'Want to SURF?'], () => {
      this.isSurfing = true;
      this.player.setTexture('player_surf', 0);
      this.player.play(`surf_${this.playerDirection}`, true);
      if (this.pikachuVisible) {
        this.pikachu.setTexture('pikachu_surf', 0);
        this.pikachu.play(`pikachu_surf_${this.pikachuDirection}`, true);
      }
      soundSystem.startMusic('surf');
    });
    return true;
  }

  private handleStrength(targetX: number, targetY: number): boolean {
    const tileType = this.currentMap.tiles[targetY]?.[targetX];
    if (tileType !== TileType.BOULDER) return false;

    // Need STRENGTH (move 70) and RAINBOW badge
    if (!this.partyHasMove(70) || !this.playerState.badges.includes('RAINBOW')) {
      this.textBox.show(['This boulder looks\nlike it can be moved!']);
      return true;
    }

    // Check if the tile behind the boulder is clear
    const vec = DIR_VECTORS[this.playerDirection];
    const behindX = targetX + vec.x;
    const behindY = targetY + vec.y;

    // Bounds check
    if (behindX < 0 || behindX >= this.currentMap.width || behindY < 0 || behindY >= this.currentMap.height) {
      this.textBox.show(["It can't be moved\nany further!"]);
      return true;
    }

    // Check collision behind boulder
    if (this.currentMap.collision[behindY]?.[behindX]) {
      this.textBox.show(["It can't be moved\nany further!"]);
      return true;
    }

    // Push boulder
    this.textBox.show(['Used STRENGTH!'], () => {
      // Move boulder tile
      this.currentMap.tiles[targetY][targetX] = TileType.CAVE_FLOOR;
      this.currentMap.collision[targetY][targetX] = false;
      this.currentMap.tiles[behindY][behindX] = TileType.BOULDER;
      this.currentMap.collision[behindY][behindX] = true;

      // Update visuals
      const oldSprite = this.tileSprites[targetY]?.[targetX];
      if (oldSprite) oldSprite.destroy();
      const newFloor = this.add.image(
        targetX * TILE_SIZE + TILE_SIZE / 2,
        targetY * TILE_SIZE + TILE_SIZE / 2,
        `tile_${TileType.CAVE_FLOOR}`
      );
      newFloor.setDepth(0);
      if (this.tileSprites[targetY]) this.tileSprites[targetY][targetX] = newFloor;

      const behindOldSprite = this.tileSprites[behindY]?.[behindX];
      if (behindOldSprite) behindOldSprite.destroy();
      const newBoulder = this.add.image(
        behindX * TILE_SIZE + TILE_SIZE / 2,
        behindY * TILE_SIZE + TILE_SIZE / 2,
        `tile_${TileType.BOULDER}`
      );
      newBoulder.setDepth(0);
      if (this.tileSprites[behindY]) this.tileSprites[behindY][behindX] = newBoulder;

      soundSystem.bump();
    });
    return true;
  }

  private restoreCutTrees(): void {
    // Restore any previously cut trees on this map
    for (const [x, y] of getCutTiles(this.playerState.storyFlags, this.currentMap.id)) {
      if (this.currentMap.tiles[y]?.[x] === TileType.CUT_TREE) {
        this.currentMap.tiles[y][x] = TileType.GRASS;
        this.currentMap.collision[y][x] = false;
      }
    }
  }

  private setupDarkOverlay(): void {
    if (!this.currentMap.isDark) return;
    // flashUsed is preserved from scene data (survives battle round-trips)
    // but resets when entering the cave fresh (no flashUsed in warp data)

    this.darkOverlay = this.add.graphics();
    this.darkOverlay.setDepth(850);
    this.darkOverlay.setScrollFactor(0);
    this.updateDarkOverlay();
  }

  private updateDarkOverlay(): void {
    if (!this.darkOverlay) return;
    this.darkOverlay.clear();

    const radius = this.flashUsed ? 999 : 24; // Small circle if not flashed
    if (radius >= 999) {
      // Flash used - no darkness
      this.darkOverlay.setVisible(false);
      return;
    }

    // Draw dark overlay with a hole around the player
    this.darkOverlay.fillStyle(0x000000, 0.95);
    this.darkOverlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Clear circle around center (player)
    this.darkOverlay.fillStyle(0x000000, 0);
    this.darkOverlay.setBlendMode(Phaser.BlendModes.ERASE);
    this.darkOverlay.fillCircle(GAME_WIDTH / 2, GAME_HEIGHT / 2, radius);
    this.darkOverlay.setBlendMode(Phaser.BlendModes.NORMAL);
  }

  private playTeleportAnimation(): void {
    this.isWarping = true;
    this.closeMenu();

    // Spin the player in place (cycle through directions rapidly)
    const directions: Direction[] = [Direction.DOWN, Direction.LEFT, Direction.UP, Direction.RIGHT];
    let spinIndex = 0;
    let spinCount = 0;
    const totalSpins = 12; // 3 full rotations
    let spinDelay = 150;

    const doSpin = () => {
      this.player.play(`player_idle_${directions[spinIndex % 4]}`, true);
      if (this.pikachuVisible) {
        this.pikachu.play(`pikachu_idle_${directions[spinIndex % 4]}`, true);
      }
      spinIndex++;
      spinCount++;
      // Speed up the spin
      spinDelay = Math.max(40, spinDelay - 10);
      if (spinCount < totalSpins) {
        this.time.delayedCall(spinDelay, doSpin);
      } else {
        // Shoot up into the sky
        this.shootUp();
      }
    };

    doSpin();
  }

  private shootUp(): void {
    // Stop camera from following the player off screen
    this.cameras.main.stopFollow();
    const targetY = -40; // off screen above
    soundSystem.menuSelect(); // quick SFX for launch

    const targets: Phaser.GameObjects.Sprite[] = [this.player];
    if (this.pikachuVisible) targets.push(this.pikachu);

    this.tweens.add({
      targets,
      y: targetY,
      duration: 400,
      ease: 'Quad.easeIn',
      onComplete: () => {
        // Warp to last heal location
        const mapId = this.playerState.lastHealMap || 'pallet_town';
        const px = this.playerState.lastHealX ?? 9;
        const py = this.playerState.lastHealY ?? 8;

        this.scene.restart({
          mapId,
          playerX: px,
          playerY: py,
          saveData: this.playerState.toSave(),
          teleportLanding: true,
        } as SceneData);
      },
    });
  }

  private playLandingAnimation(): void {
    this.isWarping = true;

    // Start the player and pikachu way above
    const landY = this.playerGridY * TILE_SIZE + TILE_SIZE / 2;
    this.player.setY(-40);
    this.player.play(`player_idle_${Direction.DOWN}`, true);

    if (this.pikachuVisible) {
      this.pikachu.setY(-40);
      this.pikachu.play(`pikachu_idle_${Direction.DOWN}`, true);
    }

    const targets: Phaser.GameObjects.Sprite[] = [this.player];
    if (this.pikachuVisible) targets.push(this.pikachu);

    // Fall down
    this.tweens.add({
      targets,
      y: landY,
      duration: 500,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        this.playerDirection = Direction.DOWN;
        this.player.play(`player_idle_${Direction.DOWN}`, true);
        if (this.pikachuVisible) {
          this.pikachuGridX = this.playerGridX;
          this.pikachuGridY = this.playerGridY;
          this.pikachu.setPosition(this.player.x, this.player.y);
          this.pikachu.play(`pikachu_idle_${Direction.DOWN}`, true);
        }
        this.cameras.main.startFollow(this.player, true);
        this.isWarping = false;
      },
    });
  }

  private showFlyMap(): void {
    // Fly destinations: towns with visited Pokemon Centers (+ Pallet Town)
    const available = getAvailableFlyDestinations(this.playerState.storyFlags);

    if (available.length === 0) {
      this.textBox.show(["No towns to fly to!"]);
      return;
    }

    // Build fly selection UI
    this.screenOpen = true;
    const container = this.add.container(0, 0);
    container.setDepth(950);
    container.setScrollFactor(0);

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.9);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    container.add(bg);

    const title = this.add.text(GAME_WIDTH / 2, 6, 'FLY where?', {
      fontSize: '8px', color: '#f8f8f8', fontFamily: 'monospace',
    }).setOrigin(0.5);
    container.add(title);

    let selectedIdx = 0;
    const texts = available.map((d, i) => {
      const t = this.add.text(20, 18 + i * 12, d.name, {
        fontSize: '8px', color: '#f8f8f8', fontFamily: 'monospace',
      });
      container.add(t);
      return t;
    });

    const cursor = this.add.text(10, 18, '>', {
      fontSize: '8px', color: '#f8f8f8', fontFamily: 'monospace',
    });
    container.add(cursor);

    const cleanup = () => {
      container.destroy();
      this.screenOpen = false;
      this.input.keyboard!.off('keydown', onKey);
    };

    // Skip the initial Z/Enter that opened this menu
    let ready = false;
    this.time.delayedCall(100, () => { ready = true; });

    const onKey = (event: KeyboardEvent) => {
      if (!ready) return;
      if (event.key === 'ArrowUp') {
        selectedIdx = Math.max(0, selectedIdx - 1);
        cursor.setY(18 + selectedIdx * 12);
        soundSystem.menuMove();
      } else if (event.key === 'ArrowDown') {
        selectedIdx = Math.min(available.length - 1, selectedIdx + 1);
        cursor.setY(18 + selectedIdx * 12);
        soundSystem.menuMove();
      } else if (event.key === 'z' || event.key === 'Enter') {
        const dest = available[selectedIdx];
        cleanup();
        soundSystem.menuSelect();
        this.textBox.show([`Flew to ${dest.name}!`], () => {
          this.warpTo(dest.mapId, dest.x, dest.y);
        });
      } else if (event.key === 'x' || event.key === 'Escape') {
        cleanup();
        soundSystem.menuMove();
      }
    };

    this.input.keyboard!.on('keydown', onKey);
  }

  private useFlash(): void {
    if (!this.currentMap.isDark || this.flashUsed) return;
    if (!this.partyHasMove(148) || !this.playerState.badges.includes('BOULDER')) return;

    this.textBox.show(['Used FLASH!'], () => {
      this.flashUsed = true;
      if (this.darkOverlay) {
        this.darkOverlay.setVisible(false);
      }
    });
  }

  private showMapName(name: string): void {
    if (this.mapNameText) {
      this.mapNameText.destroy();
    }
    if (this.mapNameTimer) {
      this.mapNameTimer.destroy();
    }

    this.mapNameText = this.add.text(GAME_WIDTH / 2, 8, name, {
      fontSize: '8px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(800);

    this.mapNameTimer = this.time.delayedCall(2000, () => {
      this.mapNameText?.destroy();
    });
  }

}
