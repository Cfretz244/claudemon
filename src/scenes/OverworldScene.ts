import Phaser from 'phaser';
import { TILE_SIZE, GAME_WIDTH, GAME_HEIGHT, MOVE_DURATION, Direction, DIR_VECTORS, MAX_PARTY_SIZE } from '../utils/constants';
import { ALL_MAPS, SOLID_TILES } from '../data/maps';
import { MapData, TileType, NPCData } from '../types/map.types';
import { TextBox } from '../components/TextBox';
import { generateNPCSprite } from '../utils/spriteGenerator';
import { SaveSystem, SaveData } from '../systems/SaveSystem';
import { soundSystem } from '../systems/SoundSystem';
import { PokemonInstance, StatusCondition } from '../types/pokemon.types';
import { createPokemon } from '../entities/Pokemon';
import { PlayerState } from '../entities/Player';
import { ELITE_FOUR, CHAMPION } from '../data/eliteFour';
import { POKEMON_DATA } from '../data/pokemon';

interface SceneData {
  mapId: string;
  playerX: number;
  playerY: number;
  newGame?: boolean;
  playerName?: string;
  rivalName?: string;
  saveData?: SaveData;
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

  // UI
  private textBox!: TextBox;
  private menuOpen = false;
  private menuContainer!: Phaser.GameObjects.Container;
  private menuCursor!: Phaser.GameObjects.Text;
  private menuSelectedIndex = 0;
  private menuItems = ['POKeDEX', 'POKeMON', 'BAG', 'SAVE', 'EXIT'];
  private mapNameText!: Phaser.GameObjects.Text;
  private mapNameTimer: Phaser.Time.TimerEvent | null = null;

  // Game state
  private playerState!: PlayerState;
  private stepCounter = 0;

  constructor() {
    super({ key: 'OverworldScene' });
  }

  init(data: SceneData): void {
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
      // Give starter Pikachu
      const pikachu = createPokemon(25, 5); // Pikachu level 5
      this.playerState.addToParty(pikachu);
      this.playerState.storyFlags['has_pikachu'] = true;
    } else {
      this.playerState = new PlayerState();
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

    // Pikachu follower
    this.pikachuVisible = this.playerState.party.length > 0 && this.playerState.party[0].speciesId === 25;
    this.pikachuGridX = this.playerGridX;
    this.pikachuGridY = this.playerGridY + 1;
    this.pikachu = this.add.sprite(
      this.pikachuGridX * TILE_SIZE + TILE_SIZE / 2,
      this.pikachuGridY * TILE_SIZE + TILE_SIZE / 2,
      'pikachu_follower',
      0
    );
    this.pikachu.setDepth(9);
    this.pikachu.setVisible(this.pikachuVisible);
    this.playerMoveHistory = [];

    // Create NPCs
    this.createNPCs();

    // Camera
    this.cameras.main.startFollow(this.player, true);
    this.cameras.main.setBounds(
      0, 0,
      this.currentMap.width * TILE_SIZE,
      this.currentMap.height * TILE_SIZE
    );
    this.cameras.main.setDeadzone(0, 0);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.actionKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.startKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.cancelKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    // UI
    this.textBox = new TextBox(this);
    this.createMenu();

    // Show map name
    this.showMapName(this.currentMap.name);

    // Action key handler
    this.actionKey.on('down', () => this.handleAction());
    this.startKey.on('down', () => this.toggleMenu());
    this.cancelKey.on('down', () => {
      if (this.menuOpen) this.closeMenu();
      else if (this.textBox.getIsVisible()) this.textBox.advance();
    });
  }

  private drawMap(): void {
    // Clear existing tiles
    for (const row of this.tileSprites) {
      for (const sprite of row) {
        sprite.destroy();
      }
    }
    this.tileSprites = [];

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
  }

  private createNPCs(): void {
    // Destroy existing NPC sprites
    for (const [, sprite] of this.npcSprites) {
      sprite.destroy();
    }
    this.npcSprites.clear();

    for (const npc of this.currentMap.npcs) {
      // Generate NPC sprite if not exists
      const spriteKey = `npc_${npc.id}`;
      if (!this.textures.exists(spriteKey)) {
        generateNPCSprite(this, spriteKey, npc.spriteColor);
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
    if (this.isMoving || this.textBox.getIsVisible() || this.menuOpen) return;

    // Movement
    let dir: Direction | null = null;
    if (this.cursors.up.isDown) dir = Direction.UP;
    else if (this.cursors.down.isDown) dir = Direction.DOWN;
    else if (this.cursors.left.isDown) dir = Direction.LEFT;
    else if (this.cursors.right.isDown) dir = Direction.RIGHT;

    if (dir) {
      this.playerDirection = dir;
      this.player.play(`player_idle_${dir}`, true);
      this.tryMove(dir);
    } else {
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

    // Check collision
    if (this.currentMap.collision[newY]?.[newX]) {
      soundSystem.bump();
      return;
    }

    // Check NPC collision
    for (const npc of this.currentMap.npcs) {
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

    this.player.play(`player_walk_${dir}`, true);

    this.tweens.add({
      targets: this.player,
      x: newX * TILE_SIZE + TILE_SIZE / 2,
      y: newY * TILE_SIZE + TILE_SIZE / 2,
      duration: MOVE_DURATION,
      onComplete: () => {
        this.isMoving = false;
        this.player.play(`player_idle_${this.playerDirection}`, true);

        // Move Pikachu follower
        if (this.pikachuVisible) {
          this.playerMoveHistory.push({ x: prevX, y: prevY, dir: this.playerDirection });
          if (this.playerMoveHistory.length > 1) {
            const target = this.playerMoveHistory.shift()!;
            this.movePikachu(target.x, target.y, target.dir);
          }
        }

        // Check for warp
        const warp = this.currentMap.warps.find(w => w.x === newX && w.y === newY);
        if (warp) {
          soundSystem.doorOpen();
          this.warpTo(warp.targetMap, warp.targetX, warp.targetY);
          return;
        }

        // Check for wild encounter
        this.checkWildEncounter(newX, newY);

        this.stepCounter++;
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
    // Special Elite Four trigger
    if (mapId === 'elite_four') {
      if (this.playerState.badges.length < 8) {
        this.textBox.show([
          'You need all 8 BADGES\nto enter the',
          'POKeMON LEAGUE!',
        ]);
        return;
      }
      this.startEliteFour();
      return;
    }

    const map = ALL_MAPS[mapId];
    if (!map) {
      console.warn(`Map not found: ${mapId}`);
      return;
    }

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

    // Build the queue: E4 members 2-4 + Champion
    const queue = [
      ...ELITE_FOUR.slice(1).map(e => ({ trainerId: e.id, trainerName: e.name })),
      { trainerId: CHAMPION.id, trainerName: CHAMPION.name },
    ];

    this.cameras.main.flash(500, 255, 255, 255);
    this.time.delayedCall(600, () => {
      this.scene.start('BattleScene', {
        type: 'trainer',
        trainerId: ELITE_FOUR[0].id,
        trainerName: ELITE_FOUR[0].name,
        playerState: this.playerState.toSave(),
        returnMap: 'indigo_plateau',
        returnX: 7,
        returnY: 6,
        eliteFourQueue: queue,
        hallOfFame: false,
      });
    });
  }

  private checkWildEncounter(x: number, y: number): void {
    const tileType = this.currentMap.tiles[y]?.[x];
    // Encounters happen on tall grass, cave floors, and indoor floors (for Pokemon Tower etc.)
    const encounterTiles = [TileType.TALL_GRASS, TileType.CAVE_FLOOR];
    if (!encounterTiles.includes(tileType)) return;

    const encounters = this.currentMap.wildEncounters;
    if (!encounters) return;

    if (Math.random() > encounters.grassRate) return;

    // Pick a wild Pokemon
    const totalWeight = encounters.encounters.reduce((sum, e) => sum + e.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const enc of encounters.encounters) {
      roll -= enc.weight;
      if (roll <= 0) {
        const level = enc.minLevel + Math.floor(Math.random() * (enc.maxLevel - enc.minLevel + 1));
        const wildPokemon = createPokemon(enc.speciesId, level);

        soundSystem.battleStart();

        // Transition to battle
        this.cameras.main.flash(300, 0, 0, 0);
        this.time.delayedCall(400, () => {
          this.scene.start('BattleScene', {
            type: 'wild',
            wildPokemon,
            playerState: this.playerState.toSave(),
            returnMap: this.currentMap.id,
            returnX: this.playerGridX,
            returnY: this.playerGridY,
          });
        });
        return;
      }
    }
  }

  private handleAction(): void {
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
      if (npc.x === targetX && npc.y === targetY) {
        this.interactWithNPC(npc);
        return;
      }
    }

    // Check for sign
    const tileType = this.currentMap.tiles[targetY]?.[targetX];
    if (tileType === TileType.SIGN) {
      this.readSign(targetX, targetY);
    }

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

    // Special NPC handling - all nurses heal
    if (npc.id.startsWith('nurse')) {
      this.textBox.show(npc.dialogue, () => {
        // Heal all Pokemon
        soundSystem.heal();
        for (const pokemon of this.playerState.party) {
          pokemon.currentHp = pokemon.stats.hp;
          pokemon.status = StatusCondition.NONE;
          for (const move of pokemon.moves) {
            move.currentPp = move.maxPp;
          }
        }
      });
      return;
    }

    if (npc.id === 'mart_clerk') {
      this.showShopMenu();
      return;
    }

    if (npc.id === 'oak' && !this.playerState.storyFlags['received_pokedex']) {
      const dialogue = [...npc.dialogue];
      this.textBox.show(dialogue, () => {
        this.playerState.storyFlags['received_pokedex'] = true;
      });
      return;
    }

    // Trainer battle check
    if (npc.isTrainer && !this.playerState.defeatedTrainers.includes(npc.id)) {
      this.textBox.show(npc.dialogue, () => {
        this.startTrainerBattle(npc);
      });
      return;
    }

    // Regular dialogue
    if (npc.isTrainer && this.playerState.defeatedTrainers.includes(npc.id)) {
      this.textBox.show(["I already lost to\nyou..."]);
    } else {
      // Replace {PLAYER} in dialogue
      const dialogue = npc.dialogue.map(d => d.replace('{PLAYER}', this.playerState.name));
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
    };
    this.textBox.show(signs[signKey] || [this.currentMap.name]);
  }

  private startTrainerBattle(npc: NPCData): void {
    soundSystem.battleStart();

    this.cameras.main.flash(300, 0, 0, 0);
    this.time.delayedCall(400, () => {
      this.scene.start('BattleScene', {
        type: 'trainer',
        trainerId: npc.id,
        trainerName: npc.dialogue[0]?.split(':')[0] || 'TRAINER',
        playerState: this.playerState.toSave(),
        returnMap: this.currentMap.id,
        returnX: this.playerGridX,
        returnY: this.playerGridY,
      });
    });
  }

  // Menu system
  private createMenu(): void {
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
    if (this.textBox.getIsVisible()) return;

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

    const lines = this.playerState.party.map((p, i) => {
      const species = this.getPokemonName(p.speciesId);
      return `${i + 1}. ${p.nickname || species} Lv${p.level}\n   HP: ${p.currentHp}/${p.stats.hp}`;
    });

    this.textBox.show(lines);
  }

  private showBagScreen(): void {
    this.closeMenu();
    const items = Object.entries(this.playerState.bag);
    if (items.length === 0) {
      this.textBox.show(['Your BAG is empty!']);
      return;
    }

    const lines = items.map(([id, count]) => {
      const name = id.replace(/_/g, ' ').toUpperCase();
      return `${name} x${count}`;
    });

    this.textBox.show(['BAG:', ...lines]);
  }

  private showPokedex(): void {
    this.closeMenu();
    const seen = this.playerState.pokedexSeen.length;
    const caught = this.playerState.pokedexCaught.length;
    this.textBox.show([
      'POKeDEX',
      `SEEN:   ${seen}`,
      `CAUGHT: ${caught}`,
      `Completion: ${Math.floor(caught / 151 * 100)}%`,
    ]);
  }

  private showShopMenu(): void {
    const shopItems = [
      { id: 'poke_ball', name: 'POKe BALL', price: 200 },
      { id: 'great_ball', name: 'GREAT BALL', price: 600 },
      { id: 'potion', name: 'POTION', price: 300 },
      { id: 'super_potion', name: 'SUPER POTION', price: 700 },
      { id: 'antidote', name: 'ANTIDOTE', price: 100 },
      { id: 'repel', name: 'REPEL', price: 350 },
    ];

    // Auto-buy 3 of each affordable item (simplified shop)
    const boughtItems: string[] = [];
    for (const item of shopItems) {
      if (this.playerState.money >= item.price) {
        this.playerState.money -= item.price;
        this.playerState.addItem(item.id, 1);
        boughtItems.push(item.name);
      }
    }

    if (boughtItems.length > 0) {
      soundSystem.menuSelect();
      this.textBox.show([
        'Welcome to the\nPOKeMON MART!',
        `Bought: ${boughtItems.join(', ')}`,
        `Remaining: $${this.playerState.money}`,
        'Thank you! Come\nagain!',
      ]);
    } else {
      this.textBox.show([
        'Welcome to the\nPOKeMON MART!',
        "You don't have enough\nmoney!",
        'Come back later!',
      ]);
    }
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

  private getPokemonName(speciesId: number): string {
    return POKEMON_DATA[speciesId]?.name || `POKeMON #${speciesId}`;
  }
}
