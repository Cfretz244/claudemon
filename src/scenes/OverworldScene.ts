import Phaser from 'phaser';
import { TILE_SIZE, GAME_WIDTH, GAME_HEIGHT, MOVE_DURATION, Direction, DIR_VECTORS } from '../utils/constants';
import { ALL_MAPS } from '../data/maps';
import { MapData, TileType, NPCData } from '../types/map.types';
import { TextBox } from '../components/TextBox';
import { PokedexScreen } from '../components/PokedexScreen';
import { PartyScreen } from '../components/PartyScreen';
import { BagScreen } from '../components/BagScreen';
import { ShopScreen } from '../components/ShopScreen';
import { PCScreen } from '../components/PCScreen';
import { TrainerCard } from '../components/TrainerCard';
import { generateNPCSprite, generateItemBallSprite } from '../utils/spriteGenerator';
import { ITEMS } from '../data/items';
import { SaveSystem, SaveData } from '../systems/SaveSystem';
import { soundSystem } from '../systems/SoundSystem';
import { getMusicForMap } from '../data/musicTracks';
import { StatusCondition } from '../types/pokemon.types';
import { createPokemon } from '../entities/Pokemon';
import { PlayerState } from '../entities/Player';
import { ELITE_FOUR, CHAMPION } from '../data/eliteFour';
import { GYM_LEADERS } from '../data/gymLeaders';
import { TRAINERS } from '../data/trainers';
import { playBattleTransition, playTrainerBattleTransition } from '../utils/battleTransition';

interface SceneData {
  mapId: string;
  playerX: number;
  playerY: number;
  newGame?: boolean;
  playerName?: string;
  rivalName?: string;
  saveData?: SaveData;
  introTransition?: boolean;
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
  private playerMoveHistory: Array<{ x: number; y: number; dir: Direction }> = [];

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

  // HM field states
  private isSurfing = false;
  private darkOverlay: Phaser.GameObjects.Graphics | null = null;
  private flashUsed = false;

  constructor() {
    super({ key: 'OverworldScene' });
  }

  init(data: SceneData): void {
    this.isWarping = false;
    this.isMoving = false;
    this.introTransition = data.introTransition || false;
    const mapId = data.mapId || 'pallet_town';
    this.currentMap = ALL_MAPS[mapId];
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

    // Sync story flags from defeated trainers
    if (this.playerState.defeatedTrainers.includes('rival_lab')) {
      this.playerState.storyFlags['rival_battle_lab'] = true;
    }

    // Giovanni at Game Corner -> give Silph Scope
    if (this.playerState.defeatedTrainers.includes('giovanni_game_corner') &&
        !this.playerState.hasItem('silph_scope') && !this.playerState.storyFlags['got_silph_scope']) {
      this.playerState.addItem('silph_scope');
      this.playerState.storyFlags['got_silph_scope'] = true;
    }

    // Giovanni at Silph Co -> mark Silph Co complete
    if (this.playerState.defeatedTrainers.includes('giovanni_silph')) {
      this.playerState.storyFlags['giovanni_silph'] = true;
      this.playerState.storyFlags['silph_co_complete'] = true;
    }

    // Tower rockets cleared -> enable Mr. Fuji
    if (this.playerState.defeatedTrainers.includes('tower_rocket1') &&
        this.playerState.defeatedTrainers.includes('tower_rocket2')) {
      this.playerState.storyFlags['tower_rockets_cleared'] = true;
    }

    // Saffron gate opens with Tea
    if (this.playerState.hasItem('tea')) {
      this.playerState.storyFlags['saffron_open'] = true;
    }
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

    // Pikachu follower - starts hidden on player tile, appears after first step
    this.pikachuVisible = this.playerState.party.some(p => p.speciesId === 25);
    this.pikachuGridX = this.playerGridX;
    this.pikachuGridY = this.playerGridY;
    this.pikachu = this.add.sprite(
      this.pikachuGridX * TILE_SIZE + TILE_SIZE / 2,
      this.pikachuGridY * TILE_SIZE + TILE_SIZE / 2,
      'pikachu_follower',
      0
    );
    this.pikachu.setDepth(9);
    this.pikachu.setVisible(false); // Hidden until player takes first step
    this.playerMoveHistory = [];

    // Create NPCs
    this.createNPCs();

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

    // Action key handler
    this.actionKey.on('down', () => this.handleAction());
    this.startKey.on('down', () => this.toggleMenu());
    this.cancelKey.on('down', () => {
      if (this.screenOpen) return; // Screens handle their own X input
      if (this.menuOpen) this.closeMenu();
      else if (this.textBox.getIsVisible()) this.textBox.advance();
    });
  }

  private isOutdoorMap(): boolean {
    const map = this.currentMap;
    const outdoorTiles = new Set([
      TileType.TREE, TileType.GRASS, TileType.TALL_GRASS,
      TileType.WATER, TileType.SAND, TileType.FLOWER,
      TileType.BUILDING, TileType.FENCE,
    ]);
    // Check top and bottom edges for outdoor tile types
    for (const y of [0, map.height - 1]) {
      for (let x = 0; x < map.width; x++) {
        if (outdoorTiles.has(map.tiles[y][x])) return true;
      }
    }
    return false;
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
        const key = `tile_${tileType}`;
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
            `tile_${tileType}`
          );
          sprite.setDepth(0);
        }
      }
    }
  }

  private shouldSkipNPC(npc: NPCData): boolean {
    // Item balls disappear once picked up
    if (npc.isItemBall && this.playerState.storyFlags[`picked_up_${npc.id}`]) {
      return true;
    }
    // Pewter guide disappears after getting Boulder badge
    if (npc.id === 'pewter_guide' && this.playerState.badges.includes('BOULDER')) {
      return true;
    }
    // Snorlax NPCs disappear after being cleared
    if (npc.id === 'snorlax_route12' && this.playerState.storyFlags['snorlax_route12_cleared']) {
      return true;
    }
    if (npc.id === 'snorlax_route16' && this.playerState.storyFlags['snorlax_route16_cleared']) {
      return true;
    }
    // Mr. Fuji only appears after clearing tower rockets
    if (npc.id === 'mr_fuji' && !this.playerState.storyFlags['tower_rockets_cleared']) {
      return true;
    }
    // Tower rockets only appear with Silph Scope and before being cleared
    if ((npc.id === 'tower_rocket1' || npc.id === 'tower_rocket2') &&
        (!this.playerState.hasItem('silph_scope') || this.playerState.storyFlags['tower_rockets_cleared'])) {
      return true;
    }
    // Silph Co president dialogue changes after clearing
    if (npc.id === 'silph_president' && this.playerState.storyFlags['silph_co_complete']) {
      return false; // Still visible but dialogue changes in interactWithNPC
    }
    // SS Anne rival disappears after battle
    if (npc.id === 'rival_ss_anne' && this.playerState.defeatedTrainers.includes('rival_ss_anne')) {
      return true;
    }
    // Tower rival disappears after battle
    if (npc.id === 'rival_tower' && this.playerState.defeatedTrainers.includes('rival_tower')) {
      return true;
    }
    // Silph rival disappears after battle
    if (npc.id === 'rival_silph' && this.playerState.defeatedTrainers.includes('rival_silph')) {
      return true;
    }
    // Giovanni NPCs disappear after defeat
    if (npc.id === 'giovanni_game_corner' && this.playerState.defeatedTrainers.includes('giovanni_game_corner')) {
      return true;
    }
    if (npc.id === 'giovanni_silph' && this.playerState.defeatedTrainers.includes('giovanni_silph')) {
      return true;
    }
    // Game corner rockets disappear after Giovanni defeated
    if ((npc.id === 'game_corner_rocket1' || npc.id === 'game_corner_rocket2') &&
        this.playerState.defeatedTrainers.includes('giovanni_game_corner')) {
      return true;
    }
    // Silph rockets disappear after Giovanni defeated
    if ((npc.id === 'silph_rocket1' || npc.id === 'silph_rocket2') &&
        this.playerState.defeatedTrainers.includes('giovanni_silph')) {
      return true;
    }
    // Mt. Moon fossils: hidden until fossil nerd defeated, disappear once one is taken
    if ((npc.id === 'mt_moon_helix_fossil' || npc.id === 'mt_moon_dome_fossil')) {
      if (!this.playerState.defeatedTrainers.includes('mt_moon_fossil_nerd')) {
        return true; // Can't see fossils until nerd is beaten
      }
      if (this.playerState.storyFlags['got_fossil']) {
        return true; // Both disappear once one is taken
      }
    }
    // Fossil nerd disappears after defeat
    if (npc.id === 'mt_moon_fossil_nerd' && this.playerState.defeatedTrainers.includes('mt_moon_fossil_nerd')) {
      return true;
    }
    return false;
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
        this.player.play(`player_idle_${dir}`, true);
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
      this.player.play(`player_idle_${this.playerDirection}`, true);
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
          if (npc.x === newX && npc.y === landY) return;
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
          soundSystem.doorOpen();
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
      // Restore map music
      const musicId = getMusicForMap(this.currentMap);
      if (musicId) soundSystem.startMusic(musicId);
    }

    // Check NPC collision
    for (const npc of this.currentMap.npcs) {
      if (this.shouldSkipNPC(npc)) continue;
      if (npc.x === newX && npc.y === newY) {
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
    } else {
      this.player.play(`player_walk_${dir}`, true);
    }

    this.tweens.add({
      targets: this.player,
      x: newX * TILE_SIZE + TILE_SIZE / 2,
      y: newY * TILE_SIZE + TILE_SIZE / 2,
      duration: MOVE_DURATION,
      onComplete: () => {
        this.isMoving = false;
        if (this.isSurfing) {
          this.player.play(`surf_${this.playerDirection}`, true);
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
          soundSystem.doorOpen();
          this.warpTo(warp.targetMap, warp.targetX, warp.targetY);
          return;
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
    this.player.play(`player_walk_${dir}`, true);
    soundSystem.bump();

    const startPixelX = this.player.x;
    const startPixelY = this.player.y;
    const endPixelX = landX * TILE_SIZE + TILE_SIZE / 2;
    const endPixelY = landY * TILE_SIZE + TILE_SIZE / 2;
    const hopData = { progress: 0 };

    this.tweens.add({
      targets: hopData,
      progress: 1,
      duration: MOVE_DURATION * 2,
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
        this.player.play(`player_idle_${this.playerDirection}`, true);

        if (this.pikachuVisible) {
          if (!this.pikachu.visible) this.pikachu.setVisible(true);
          this.movePikachu(prevX, prevY, this.playerDirection);
        }

        const warp = this.currentMap.warps.find(w => w.x === landX && w.y === landY);
        if (warp) {
          soundSystem.doorOpen();
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

    this.pikachu.play(`pikachu_walk_${dir}`, true);

    this.tweens.add({
      targets: this.pikachu,
      x: targetX * TILE_SIZE + TILE_SIZE / 2,
      y: targetY * TILE_SIZE + TILE_SIZE / 2,
      duration: MOVE_DURATION,
      onComplete: () => {
        this.pikachu.play(`pikachu_idle_${this.pikachuDirection}`, true);
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

    // SS Anne: already departed
    if (mapId === 'ss_anne' && this.playerState.storyFlags['ss_anne_departed']) {
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

    // Game Corner Basement: need to find the hidden switch (simplified - just need to enter Game Corner)
    if (mapId === 'game_corner_basement' && this.playerState.defeatedTrainers.includes('giovanni_game_corner')) {
      this.textBox.show([
        "The hideout has been\nabandoned...",
      ]);
      return;
    }

    // Silph Co: locked after completion
    if (mapId === 'silph_co' && this.playerState.storyFlags['silph_co_complete']) {
      this.textBox.show([
        "SILPH CO. has resumed\nnormal operations.",
        "Thank you for saving\nus!",
      ]);
      return;
    }

    // Special Elite Four trigger
    if (mapId === 'elite_four') {
      if (this.playerState.badges.length < 8) {
        this.textBox.show([
          'You need all 8 BADGES\nto enter the',
          'POKeMON LEAGUE!',
        ]);
        return;
      }
      this.isWarping = true;
      this.startEliteFour();
      return;
    }

    const map = ALL_MAPS[mapId];
    if (!map) {
      console.warn(`Map not found: ${mapId}`);
      return;
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
      } as SceneData);
    });
  }

  private startEliteFour(): void {
    soundSystem.battleStart();

    // Build the queue: E4 members 2-4 + Champion (with dynamic rival name)
    const championName = CHAMPION.name.replace('{RIVAL}', this.playerState.rivalName);
    const queue = [
      ...ELITE_FOUR.slice(1).map(e => ({ trainerId: e.id, trainerName: e.name })),
      { trainerId: CHAMPION.id, trainerName: championName },
    ];

    playTrainerBattleTransition(this, () => {
      this.scene.start('BattleScene', {
        type: 'trainer',
        trainerId: ELITE_FOUR[0].id,
        trainerName: ELITE_FOUR[0].name,
        trainerClass: 'Elite Four',
        playerState: this.playerState.toSave(),
        returnMap: 'indigo_plateau',
        returnX: 7,
        returnY: 6,
        eliteFourQueue: queue,
        hallOfFame: false,
      });
    }, () => {
      soundSystem.startMusic('elite_four');
    });
  }

  private checkTrainerSight(): boolean {
    if (this.isWarping) return false;

    for (const npc of this.currentMap.npcs) {
      if (!npc.isTrainer || !npc.sightRange) continue;
      if (this.playerState.defeatedTrainers.includes(npc.id)) continue;
      if (this.shouldSkipNPC(npc)) continue;

      // Check if player is in trainer's line of sight
      const vec = DIR_VECTORS[npc.direction];
      const dx = this.playerGridX - npc.x;
      const dy = this.playerGridY - npc.y;

      // Player must be along the trainer's facing axis
      let inSight = false;
      let distance = 0;
      if (vec.x !== 0 && dy === 0) {
        // Horizontal sight line
        distance = dx * vec.x; // positive if player is in the direction trainer faces
        inSight = distance > 0 && distance <= npc.sightRange;
      } else if (vec.y !== 0 && dx === 0) {
        // Vertical sight line
        distance = dy * vec.y;
        inSight = distance > 0 && distance <= npc.sightRange;
      }

      if (!inSight) continue;

      // Check for obstacles between trainer and player
      let blocked = false;
      for (let i = 1; i < distance; i++) {
        const checkX = npc.x + vec.x * i;
        const checkY = npc.y + vec.y * i;
        if (this.currentMap.collision[checkY]?.[checkX]) {
          blocked = true;
          break;
        }
        // Check for other NPCs blocking line of sight
        for (const otherNpc of this.currentMap.npcs) {
          if (otherNpc.id !== npc.id && otherNpc.x === checkX && otherNpc.y === checkY) {
            blocked = true;
            break;
          }
        }
        if (blocked) break;
      }
      if (blocked) continue;

      // Trainer spotted the player!
      this.isWarping = true; // Block all input
      this.triggerTrainerEncounter(npc, distance);
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

    // After a brief pause showing "!", trainer walks toward player
    this.time.delayedCall(600, () => {
      exclamation.destroy();
      bubble.destroy();

      // Trainer walks toward the player, stopping 1 tile away
      const tilesToWalk = distance - 1;
      if (tilesToWalk <= 0) {
        // Already adjacent - turn player to face trainer, start battle
        const oppositeDir: Record<Direction, Direction> = {
          [Direction.UP]: Direction.DOWN,
          [Direction.DOWN]: Direction.UP,
          [Direction.LEFT]: Direction.RIGHT,
          [Direction.RIGHT]: Direction.LEFT,
        };
        this.playerDirection = oppositeDir[npc.direction];
        this.player.play(`player_idle_${this.playerDirection}`, true);
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
          const oppositeDir: Record<Direction, Direction> = {
            [Direction.UP]: Direction.DOWN,
            [Direction.DOWN]: Direction.UP,
            [Direction.LEFT]: Direction.RIGHT,
            [Direction.RIGHT]: Direction.LEFT,
          };
          this.playerDirection = oppositeDir[npc.direction];
          this.player.play(`player_idle_${this.playerDirection}`, true);
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

    // Minimum steps between encounters to prevent back-to-back fights
    const MIN_STEPS_BETWEEN = 4;
    if (this.stepCounter - this.lastEncounterStep < MIN_STEPS_BETWEEN) return;

    if (Math.random() > encounters.grassRate) return;

    // Pick a wild Pokemon
    const totalWeight = encounters.encounters.reduce((sum, e) => sum + e.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const enc of encounters.encounters) {
      roll -= enc.weight;
      if (roll <= 0) {
        const level = enc.minLevel + Math.floor(Math.random() * (enc.maxLevel - enc.minLevel + 1));
        const wildPokemon = createPokemon(enc.speciesId, level);

        this.lastEncounterStep = this.stepCounter;
        this.isWarping = true; // Block movement during battle transition
        soundSystem.battleStart();

        // Transition to battle
        playBattleTransition(this, () => {
          this.scene.start('BattleScene', {
            type: 'wild',
            wildPokemon,
            playerState: this.playerState.toSave(),
            returnMap: this.currentMap.id,
            returnX: this.playerGridX,
            returnY: this.playerGridY,
          });
        }, () => {
          soundSystem.startMusic('wild_battle');
        });
        return;
      }
    }
  }

  private triggerRivalLabBattle(): void {
    // Rival walks up and initiates battle after player receives Pikachu
    const rivalNpc = this.currentMap.npcs.find(n => n.id === 'rival');
    if (!rivalNpc || this.playerState.defeatedTrainers.includes('rival_lab')) {
      this.playerState.storyFlags['rival_battle_lab'] = true;
      return;
    }

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
        playerState: this.playerState.toSave(),
        returnMap: this.currentMap.id,
        returnX: this.playerGridX,
        returnY: this.playerGridY,
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
      if (npc.x === targetX && npc.y === targetY) {
        this.interactWithNPC(npc);
        return;
      }
    }

    // Check for sign
    const tileType = this.currentMap.tiles[targetY]?.[targetX];
    if (tileType === TileType.SIGN) {
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

    // HM field effects: Cut, Surf, Strength
    if (this.handleCut(targetX, targetY)) return;
    if (this.handleSurf(targetX, targetY)) return;
    if (this.handleStrength(targetX, targetY)) return;

    // Check for Pikachu interaction
    if (this.pikachuVisible && targetX === this.pikachuGridX && targetY === this.pikachuGridY) {
      soundSystem.pokemonCry(800);
      this.textBox.show(['PIKACHU: Pika pika!', 'PIKACHU seems happy!']);
    }
  }

  private interactWithNPC(npc: NPCData): void {
    // Turn NPC to face player
    const sprite = this.npcSprites.get(npc.id);
    if (sprite) {
      const oppositeDir: Record<Direction, Direction> = {
        [Direction.UP]: Direction.DOWN,
        [Direction.DOWN]: Direction.UP,
        [Direction.LEFT]: Direction.RIGHT,
        [Direction.RIGHT]: Direction.LEFT,
      };
      const faceDir = oppositeDir[this.playerDirection];
      const dirIndex = [Direction.DOWN, Direction.UP, Direction.LEFT, Direction.RIGHT].indexOf(faceDir);
      sprite.setFrame(dirIndex);
    }

    // Item ball pickup
    if (npc.isItemBall && npc.itemId) {
      const item = ITEMS[npc.itemId];
      if (item) {
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

    // Oak's story progression chain
    if (npc.id === 'oak') {
      if (this.currentMap.id !== 'oaks_lab') {
        soundSystem.startMusic('oaks_theme');
      }
      if (!this.playerState.storyFlags['has_pikachu']) {
        // Give Pikachu
        this.textBox.show(
          [
            'OAK: Ah, {PLAYER}!\nI\'ve been waiting\nfor you!'.replace('{PLAYER}', this.playerState.name),
            'I have a POKeMON\nhere for you!',
            'This PIKACHU is quite\nenergetic!',
            'Go on! Take it with\nyou on your journey!',
            '{PLAYER} received\nPIKACHU!'.replace('{PLAYER}', this.playerState.name),
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

            // After a brief pause, rival challenges
            this.time.delayedCall(500, () => {
              this.triggerRivalLabBattle();
            });
          }
        );
        return;
      }
      if (this.playerState.hasItem('oaks_parcel') && !this.playerState.storyFlags['delivered_parcel']) {
        // Parcel delivery sequence
        this.textBox.show(
          [
            'OAK: Oh! That\'s the\nparcel I was waiting\nfor!',
            'Thank you, {PLAYER}!'.replace('{PLAYER}', this.playerState.name),
            'OAK: I have something\nfor you in return!',
            '{PLAYER} handed over\nthe OAK\'S PARCEL!'.replace('{PLAYER}', this.playerState.name),
            'OAK: This is a\nPOKeDEX!',
            'It automatically\nrecords data on\nPOKeMON you\'ve seen\nor caught!',
            '{PLAYER} received\nthe POKeDEX!'.replace('{PLAYER}', this.playerState.name),
            "Here, take these\ntoo!",
            '{PLAYER} received\n5 POKe BALLs!'.replace('{PLAYER}', this.playerState.name),
          ],
          () => {
            this.playerState.useItem('oaks_parcel');
            this.playerState.addItem('pokedex');
            this.playerState.addItem('poke_ball', 5);
            this.playerState.storyFlags['delivered_parcel'] = true;
            this.playerState.storyFlags['has_pokedex'] = true;
          }
        );
        return;
      }
      if (this.playerState.storyFlags['delivered_parcel']) {
        this.textBox.show([
          'OAK: Good luck filling\nup that POKeDEX!',
          'The world is full of\namazing POKeMON!',
        ]);
        return;
      }
      // Has Pikachu but no parcel yet
      this.textBox.show([
        'OAK: Go explore the\nworld with PIKACHU!',
        'The VIRIDIAN CITY\nMart might have\nsomething for me...',
      ]);
      return;
    }

    // Rival NPC in lab - context-dependent
    if (npc.id === 'rival') {
      if (!this.playerState.storyFlags['has_pikachu']) {
        this.textBox.show([
          `${this.playerState.rivalName}: What?\nGramps isn't here?`,
          "I want my POKeMON!",
        ]);
        return;
      }
      if (this.playerState.storyFlags['rival_battle_lab']) {
        this.textBox.show([
          `${this.playerState.rivalName}: I'll get\nstronger and beat\nyou next time!`,
        ]);
        return;
      }
      // Rival wants to battle (triggered automatically after getting Pikachu)
      this.textBox.show([
        `${this.playerState.rivalName}: Wait,\n{PLAYER}!`.replace('{PLAYER}', this.playerState.name),
        "Let's check out our\nnew POKeMON!",
      ], () => {
        this.startRivalBattle('rival_lab');
      });
      return;
    }

    // Bill gives SS Ticket
    if (npc.id === 'bill') {
      if (!this.playerState.storyFlags['bill_helped']) {
        this.textBox.show(
          [
            "BILL: Hi! I'm a true\nPOKeMON FANATIC!",
            "I got mixed up in one\nof my experiments...",
            "Thanks for listening!\nHere, take this!",
            `${this.playerState.name} received\nS.S. TICKET!`,
          ],
          () => {
            this.playerState.addItem('ss_ticket');
            this.playerState.storyFlags['bill_helped'] = true;
          }
        );
        return;
      }
      this.textBox.show([
        "BILL: The S.S. ANNE\nis docked at VERMILION!",
        "Use the ticket I gave\nyou to board!",
      ]);
      return;
    }

    // SS Anne Captain gives HM01 Cut
    if (npc.id === 'ss_anne_captain') {
      if (!this.playerState.storyFlags['got_hm01']) {
        this.textBox.show(
          [
            "CAPTAIN: Ugh... I feel\nseasick...",
            "Thank you for\nchecking on me!",
            "Here, take this HM\nas my thanks!",
            `${this.playerState.name} received\nHM01 CUT!`,
          ],
          () => {
            this.playerState.addItem('hm01_cut');
            this.playerState.storyFlags['got_hm01'] = true;
            this.playerState.storyFlags['ss_anne_departed'] = true;
          }
        );
        return;
      }
      this.textBox.show(["CAPTAIN: The ship will\nbe departing soon!"]);
      return;
    }

    // Snorlax NPC interactions (wake with Poke Flute)
    if (npc.id === 'snorlax_route12' || npc.id === 'snorlax_route16') {
      if (this.playerState.hasItem('poke_flute')) {
        this.textBox.show(
          [
            `${this.playerState.name} used the\nPOKe FLUTE!`,
            "SNORLAX woke up!\nIt looks angry!",
          ],
          () => {
            // Start wild Snorlax battle
            const snorlax = createPokemon(143, 30); // Snorlax level 30
            this.isWarping = true;
            soundSystem.battleStart();
            playBattleTransition(this, () => {
              this.scene.start('BattleScene', {
                type: 'wild',
                wildPokemon: snorlax,
                playerState: this.playerState.toSave(),
                returnMap: this.currentMap.id,
                returnX: this.playerGridX,
                returnY: this.playerGridY,
              });
            }, () => {
              soundSystem.startMusic('wild_battle');
            });
            // Set flag to remove Snorlax after battle
            this.playerState.storyFlags[`${npc.id}_cleared`] = true;
          }
        );
        return;
      }
      this.textBox.show([
        "A huge POKeMON is\nblocking the path!",
        "It's sleeping soundly...",
        "Zzz... Zzz...",
        "Maybe a melody could\nwake it up?",
      ]);
      return;
    }

    // Mr. Fuji gives Poke Flute
    if (npc.id === 'mr_fuji') {
      if (!this.playerState.storyFlags['got_poke_flute']) {
        this.textBox.show(
          [
            "MR. FUJI: Thank you\nfor saving me!",
            "Those TEAM ROCKET\nruffians held me\nhostage!",
            "Please, take this\nPOKe FLUTE as thanks!",
            `${this.playerState.name} received\nPOKe FLUTE!`,
          ],
          () => {
            this.playerState.addItem('poke_flute');
            this.playerState.storyFlags['got_poke_flute'] = true;
          }
        );
        return;
      }
      this.textBox.show([
        "MR. FUJI: Rest their\nsouls in peace...",
        "Use the POKe FLUTE\nto wake sleeping\nPOKeMON!",
      ]);
      return;
    }

    // Celadon Tea Lady gives Tea
    if (npc.id === 'celadon_tea_lady') {
      if (!this.playerState.hasItem('tea') && !this.playerState.storyFlags['saffron_open']) {
        this.textBox.show(
          [
            "I work at CELADON\nMANSION.",
            "Here, have some TEA!\nIt's very refreshing!",
            `${this.playerState.name} received\nTEA!`,
          ],
          () => {
            this.playerState.addItem('tea');
          }
        );
        return;
      }
      this.textBox.show([
        "Give the TEA to the\nguard at SAFFRON CITY!",
        "He loves a good cup\nof TEA!",
      ]);
      return;
    }

    // Oak's Aide on Route 2 gives HM05 Flash
    if (npc.id === 'oaks_aide_route2') {
      if (this.playerState.storyFlags['got_hm05']) {
        this.textBox.show(["Use FLASH to light\nup dark caves!"]);
        return;
      }
      this.textBox.show(
        [
          "OAK's AIDE: Prof. OAK\nordered me to give\nthis to you!",
          "It's an HM that\nteaches FLASH!",
          `${this.playerState.name} received\nHM05 FLASH!`,
        ],
        () => {
          this.playerState.addItem('hm05_flash');
          this.playerState.storyFlags['got_hm05'] = true;
        }
      );
      return;
    }

    // Route 16 girl gives HM02 Fly
    if (npc.id === 'route16_fly_girl') {
      if (this.playerState.storyFlags['got_hm02']) {
        this.textBox.show(["Fly is so convenient\nfor travel!"]);
        return;
      }
      this.textBox.show(
        [
          "I love watching my\nPOKeMON fly!",
          "Here, you should have\nthis HM!",
          `${this.playerState.name} received\nHM02 FLY!`,
        ],
        () => {
          this.playerState.addItem('hm02_fly');
          this.playerState.storyFlags['got_hm02'] = true;
        }
      );
      return;
    }

    // Safari Zone secret house gives HM03 Surf
    if (npc.id === 'safari_secret_house') {
      if (this.playerState.storyFlags['got_hm03']) {
        this.textBox.show(["You can SURF across\nwater with that!"]);
        return;
      }
      this.textBox.show(
        [
          "Congratulations on\nmaking it this far!",
          "You reached the\nSECRET HOUSE!",
          "Here, take this HM\nas your prize!",
          `${this.playerState.name} received\nHM03 SURF!`,
        ],
        () => {
          this.playerState.addItem('hm03_surf');
          this.playerState.storyFlags['got_hm03'] = true;
        }
      );
      return;
    }

    // Safari Warden gives HM04 Strength (requires Gold Teeth)
    if (npc.id === 'safari_warden') {
      if (this.playerState.storyFlags['got_hm04']) {
        this.textBox.show(["Those HMs are\nreally something!"]);
        return;
      }
      if (this.playerState.hasItem('gold_teeth')) {
        this.textBox.show(
          [
            "WARDEN: Oh! Those are\nmy teeth!",
            "Thank you so much!\nLet me give you this!",
            `${this.playerState.name} received\nHM04 STRENGTH!`,
          ],
          () => {
            this.playerState.useItem('gold_teeth');
            this.playerState.addItem('hm04_strength');
            this.playerState.storyFlags['got_hm04'] = true;
          }
        );
        return;
      }
      this.textBox.show([
        "I lost my teeth\nsomewhere in the\nSAFARI ZONE...",
        "I can't talk well\nwithout them...",
      ]);
      return;
    }

    // Giovanni at Game Corner gives Silph Scope on defeat
    if (npc.id === 'giovanni_game_corner' && this.playerState.defeatedTrainers.includes('giovanni_game_corner')) {
      this.textBox.show(["The hideout has been\nabandoned..."]);
      return;
    }

    // Giovanni at Silph Co - post-defeat gives Master Ball, sets flags
    if (npc.id === 'giovanni_silph' && this.playerState.defeatedTrainers.includes('giovanni_silph')) {
      this.textBox.show(["GIOVANNI has fled\nthe building!"]);
      return;
    }

    // Silph President thanks you and gives Master Ball
    if (npc.id === 'silph_president') {
      if (this.playerState.storyFlags['silph_co_complete'] && !this.playerState.storyFlags['got_master_ball']) {
        this.textBox.show(
          [
            "PRESIDENT: You saved\nSILPH CO.!",
            "Please take this as\na token of our\ngratitude!",
            `${this.playerState.name} received\nMASTER BALL!`,
          ],
          () => {
            this.playerState.addItem('master_ball');
            this.playerState.storyFlags['got_master_ball'] = true;
          }
        );
        return;
      }
      if (this.playerState.storyFlags['got_master_ball']) {
        this.textBox.show(["PRESIDENT: Thank you\nfor saving our\ncompany!"]);
        return;
      }
      // During Rocket takeover
      this.textBox.show([
        "PRESIDENT: Please,\ndefeat GIOVANNI!",
        "He's taken over\nour company!",
      ]);
      return;
    }

    // Route 23 badge check NPCs
    if (npc.id.startsWith('badge_check')) {
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
      return;
    }

    // Trainer battle check
    if (npc.isTrainer && !this.playerState.defeatedTrainers.includes(npc.id)) {
      if (npc.id.startsWith('rival_')) {
        soundSystem.startMusic('rival_theme');
      }
      const dialogue = npc.dialogue.map(d =>
        d.replace('{PLAYER}', this.playerState.name).replace('{RIVAL}', this.playerState.rivalName)
      );
      this.textBox.show(dialogue, () => {
        this.startTrainerBattle(npc);
      });
      return;
    }

    // Regular dialogue
    if (npc.isTrainer && this.playerState.defeatedTrainers.includes(npc.id)) {
      this.textBox.show(["I already lost to\nyou..."]);
    } else {
      // Replace {PLAYER} and {RIVAL} in dialogue
      const dialogue = npc.dialogue.map(d =>
        d.replace('{PLAYER}', this.playerState.name).replace('{RIVAL}', this.playerState.rivalName)
      );
      this.textBox.show(dialogue);
    }
  }

  private readSign(x: number, y: number): void {
    // Look up sign text from a registry based on map + position
    const signKey = `${this.currentMap.id}:${x},${y}`;
    const signs: Record<string, string[]> = {
      'pallet_town:7,9': ['PALLET TOWN', 'Shades of your journey\nawait!'],
      'pallet_town:11,16': ["PROF. OAK's LAB"],
      'viridian_city:7,13': ['VIRIDIAN CITY', 'The Eternally Green\nParadise!'],
      'viridian_city:12,13': ['TRAINER TIPS', "If your POKeMON's HP\nreaches 0, it faints!"],
      'route1:7,10': ['ROUTE 1', 'PALLET TOWN -\nVIRIDIAN CITY'],
      'pewter_city:3,9': ['PEWTER CITY GYM\nLEADER: BROCK', 'The Rock-Solid\nPOKeMON Trainer!'],
      'route3:41,6': ['ROUTE 3', 'MT. MOON ahead'],
    };
    this.textBox.show(signs[signKey] || [this.currentMap.name]);
  }

  private startTrainerBattle(npc: NPCData): void {
    this.isWarping = true; // Block movement during battle transition
    soundSystem.battleStart();

    // Use rival's custom name for rival trainers
    let trainerName = npc.dialogue[0]?.split(':')[0] || 'TRAINER';
    if (npc.id.startsWith('rival_')) {
      trainerName = this.playerState.rivalName;
    }

    // Look up trainer class for sprite rendering
    const trainerData = TRAINERS[npc.id];
    const trainerClass = trainerData?.class || '';

    playTrainerBattleTransition(this, () => {
      this.scene.start('BattleScene', {
        type: 'trainer',
        trainerId: npc.id,
        trainerName,
        trainerClass,
        playerState: this.playerState.toSave(),
        returnMap: this.currentMap.id,
        returnX: this.playerGridX,
        returnY: this.playerGridY,
      });
    }, () => {
      const track = npc.id in GYM_LEADERS ? 'gym_leader_battle' : 'trainer_battle';
      soundSystem.startMusic(track);
    });
  }

  // Menu system
  private createMenu(): void {
    this.menuItems = ['POKeDEX', 'POKeMON', 'BAG', this.playerState.name, 'SAVE', 'EXIT'];
    const menuWidth = 60;
    const menuX = GAME_WIDTH - menuWidth - 2;
    const menuY = 2;

    const bg = this.add.graphics();
    bg.fillStyle(0xf8f8f8, 1);
    bg.fillRoundedRect(0, 0, menuWidth, this.menuItems.length * 14 + 8, 2);
    bg.lineStyle(2, 0x383838, 1);
    bg.strokeRoundedRect(0, 0, menuWidth, this.menuItems.length * 14 + 8, 2);

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

    this.menuContainer = this.add.container(menuX, menuY, [bg, ...texts, this.menuCursor]);
    this.menuContainer.setDepth(900);
    this.menuContainer.setScrollFactor(0);
    this.menuContainer.setVisible(false);
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
    this.menuOpen = true;
    this.menuSelectedIndex = 0;
    this.menuCursor.setY(4);
    this.menuContainer.setVisible(true);
    soundSystem.menuSelect();

    // Set up menu navigation
    this.cursors.up.removeAllListeners();
    this.cursors.down.removeAllListeners();

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

  private closeMenu(): void {
    this.menuOpen = false;
    this.menuContainer.setVisible(false);

    // Restore movement listeners
    this.cursors.up.removeAllListeners();
    this.cursors.down.removeAllListeners();
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
        const vec = DIR_VECTORS[this.playerDirection];
        const tx = this.playerGridX + vec.x;
        const ty = this.playerGridY + vec.y;
        if (!this.handleSurf(tx, ty)) {
          this.textBox.show(["You can't SURF here!"]);
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
      case 148: // FLASH
        this.useFlash();
        break;
    }
  }

  private showBagScreen(): void {
    this.closeMenu();
    this.screenOpen = true;
    this.bagScreen.show(this.playerState, () => {
      this.screenOpen = false;
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
    SaveSystem.save(saveData);
    soundSystem.save();
    this.textBox.show([`${this.playerState.name} saved\nthe game!`]);
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
        `tile_${TileType.GRASS}`
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
    const prefix = `cut_${this.currentMap.id}_`;
    for (const key of Object.keys(this.playerState.storyFlags)) {
      if (key.startsWith(prefix) && this.playerState.storyFlags[key]) {
        const parts = key.slice(prefix.length).split('_');
        const x = parseInt(parts[0]);
        const y = parseInt(parts[1]);
        if (!isNaN(x) && !isNaN(y) && this.currentMap.tiles[y]?.[x] === TileType.CUT_TREE) {
          this.currentMap.tiles[y][x] = TileType.GRASS;
          this.currentMap.collision[y][x] = false;
        }
      }
    }
  }

  private setupDarkOverlay(): void {
    if (!this.currentMap.isDark) return;
    this.flashUsed = false;

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

  private showFlyMap(): void {
    // Fly destinations: towns with visited Pokemon Centers
    const flyDestinations: Array<{ name: string; mapId: string; x: number; y: number }> = [
      { name: 'PALLET TOWN', mapId: 'pallet_town', x: 9, y: 8 },
      { name: 'VIRIDIAN CITY', mapId: 'viridian_city', x: 9, y: 14 },
      { name: 'PEWTER CITY', mapId: 'pewter_city', x: 16, y: 9 },
      { name: 'CERULEAN CITY', mapId: 'cerulean_city', x: 14, y: 11 },
      { name: 'VERMILION CITY', mapId: 'vermilion_city', x: 11, y: 9 },
      { name: 'LAVENDER TOWN', mapId: 'lavender_town', x: 11, y: 9 },
      { name: 'CELADON CITY', mapId: 'celadon_city', x: 14, y: 11 },
      { name: 'SAFFRON CITY', mapId: 'saffron_city', x: 14, y: 11 },
      { name: 'FUCHSIA CITY', mapId: 'fuchsia_city', x: 14, y: 11 },
      { name: 'CINNABAR ISLAND', mapId: 'cinnabar_island', x: 10, y: 9 },
    ];

    // Filter to visited towns
    const available = flyDestinations.filter(d =>
      this.playerState.storyFlags[`visited_${d.mapId}`] || d.mapId === 'pallet_town'
    );

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
      up.destroy();
      down.destroy();
      confirm.destroy();
      cancel.destroy();
    };

    const up = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const down = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    const confirm = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    const cancel = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    up.on('down', () => {
      selectedIdx = Math.max(0, selectedIdx - 1);
      cursor.setY(18 + selectedIdx * 12);
      soundSystem.menuMove();
    });
    down.on('down', () => {
      selectedIdx = Math.min(available.length - 1, selectedIdx + 1);
      cursor.setY(18 + selectedIdx * 12);
      soundSystem.menuMove();
    });
    confirm.on('down', () => {
      const dest = available[selectedIdx];
      cleanup();
      soundSystem.menuSelect();
      this.textBox.show([`Flew to ${dest.name}!`], () => {
        this.warpTo(dest.mapId, dest.x, dest.y);
      });
    });
    cancel.on('down', () => {
      cleanup();
      soundSystem.menuMove();
    });
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
