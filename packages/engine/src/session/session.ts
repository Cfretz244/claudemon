import { PlayerState } from '../entities/Player';
import { createPokemon, gainHappiness } from '../entities/Pokemon';
import { ALL_MAPS } from '../data/maps';
import { MOVES_DATA } from '../data/moves';
import { ITEMS } from '../data/items';
import { TRAINERS } from '../data/trainers';
import { GYM_LEADERS } from '../data/gymLeaders';
import { SIGNS } from '../data/signs';
import { GIFT_NPCS } from '../data/giftNpcs';
import { Direction, DIR_VECTORS } from '../utils/constants';
import { MapData, NPCData, TileType, WarpPoint } from '../types/map.types';
import { PokemonInstance, StatusCondition } from '../types/pokemon.types';
import { SaveData } from '../systems/SaveSystem';
import { newGameState } from '../logic/newGame';
import {
  oakStage,
  applyOakStage,
  OAK_DIALOGUE,
  shouldTriggerLabRivalBattle,
  consumeLabRivalEncounter,
  labRivalTalkOutcome,
  LAB_RIVAL_TALK_DIALOGUE,
} from '../logic/oakLab';
import { shouldGiveOaksParcel, OAKS_PARCEL_DIALOGUE, grantOaksParcel } from '../logic/oaksParcel';
import { itemBallPickup } from '../logic/itemBalls';
import { syncDerivedStoryFlags } from '../logic/storyFlagSync';
import { shouldSkipNPC } from '../logic/npcVisibility';
import { restoreParty, healVisitFlag } from '../logic/healing';
import { pickWildEncounter } from '../logic/encounters';
import { resolveStep } from '../overworld/navigation';
import { SeededRandom } from '../random/seed';
import { Combatant, MoveEvent, combatant, executeBattleMove, speciesName } from '../battle/move';
import { trainerPrizeMoney } from '../battle/rewards';
import { selectAIMove } from '../systems/AISystem';
import {
  resolveTurnOrder,
  applyEndTurnStatus,
  applyLeechSeed,
  calculateRunChance,
  splitExp,
} from '../systems/BattleEngine';
import { attemptCatch } from '../systems/CatchSystem';
import { addExperience, calculateExpGain, learnMove } from '../systems/ExperienceSystem';
import { checkEvolution, evolvePokemon } from '../systems/EvolutionSystem';
import { decodeSave } from '../persistence/codec';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
export const OPENING_MAPS = [
  'pallet_town',
  'player_house',
  'rival_house',
  'oaks_lab',
  'route1',
  'viridian_city',
  'pokemon_center',
  'pokemart',
] as const;
export type PlayerView = Omit<
  PlayerState,
  | 'toSave'
  | 'addToParty'
  | 'markSeen'
  | 'hasItem'
  | 'useItem'
  | 'addItem'
  | 'getFirstAlivePokemon'
  | 'hasAllBadges'
  | 'addCoins'
  | 'spendCoins'
  | 'hasCoinCase'
>;
export interface BattleView {
  player: PokemonInstance;
  opponent: PokemonInstance;
  trainer: boolean;
  forcedSwitch: boolean;
}
export interface Objective {
  stage: string;
  title: string;
  body: string;
}
export function currentObjective(p: Pick<PlayerState, 'storyFlags' | 'bag'>): Objective {
  const f = p.storyFlags;
  const [stage, title, body] = !f.has_pikachu
    ? ['01', 'A friend for the journey', 'Find Professor Oak in his laboratory.']
    : !f.rival_battle_lab
      ? ['02', 'Your first challenge', 'Your rival is waiting. Leave the laboratory.']
      : !f.delivered_parcel && !(p.bag.oaks_parcel > 0)
        ? ['03', 'A delivery for the professor', 'Visit the Poké Mart in Viridian City.']
        : !f.delivered_parcel
          ? ['04', 'Back to where it began', 'Deliver Oak’s Parcel to his laboratory.']
          : ['✓', 'A world of discoveries', 'Explore Route 1 and catch your first Pokémon.'];
  return { stage, title, body };
}
export type Effect =
  | { kind: 'dialogue'; lines: string[]; speaker?: string }
  | { kind: 'move'; x: number; y: number; direction: Direction; hop: boolean }
  | { kind: 'map' }
  | { kind: 'battleStart' }
  | { kind: 'battleEnd'; outcome: string }
  | { kind: 'attack'; side: 0 | 1; event: MoveEvent }
  | { kind: 'learn'; partyIndex: number; moveId: number }
  | { kind: 'menu'; menu: 'shop' | 'storage' };
export type Command =
  | { type: 'ack'; id: string }
  | { type: 'learn'; id: string; index: number }
  | ({ inputId: string } & (
      | { type: 'move'; direction: Direction }
      | { type: 'interact' }
      | { type: 'battleMove'; index: number }
      | { type: 'catch'; itemId?: string }
      | { type: 'run' }
      | { type: 'selectPokemon'; index: number }
      | { type: 'item'; itemId: string; index: number }
      | { type: 'buy'; itemId: string }
      | { type: 'deposit' | 'withdraw'; index: number }
      | { type: 'closeMenu' }
    ));
type Job =
  | { kind: 'effect'; effect: Effect }
  | { kind: 'afterStep'; warp?: WarpPoint }
  | { kind: 'warp'; warp: WarpPoint }
  | { kind: 'enter'; map: string; x: number; y: number }
  | { kind: 'oak'; stage: ReturnType<typeof oakStage> }
  | { kind: 'parcel' }
  | { kind: 'heal'; nurse: boolean }
  | { kind: 'pickup'; npcId: string }
  | { kind: 'gift'; npcId: string }
  | { kind: 'rival' }
  | { kind: 'attack'; side: 0 | 1; index: number }
  | { kind: 'status'; side: 0 | 1 }
  | { kind: 'faint' }
  | { kind: 'roundEnd' }
  | { kind: 'reward'; partyIndex: number; xp: number }
  | { kind: 'learn'; partyIndex: number; moveId: number }
  | { kind: 'evolve'; partyIndex: number }
  | { kind: 'nextOpponent' }
  | { kind: 'finish'; outcome: 'win' | 'loss' | 'caught' | 'run' };
interface BattleState {
  sides: [Combatant, Combatant];
  trainerId?: string;
  opponents: PokemonInstance[];
  participants: number[];
  forcedSwitch: boolean;
  rewarded: boolean;
}
export interface SessionOptions {
  name?: string;
  rivalName?: string;
  seed: number;
  save?: SaveData;
  supportedMaps?: readonly string[];
  /** Test-only injection; never replace global Math.random. */ rng?: () => number;
}
export class GameSession {
  private player: PlayerState;
  private map: MapData;
  private x: number;
  private y: number;
  private direction = Direction.DOWN;
  private battle: BattleState | null = null;
  private jobs: Job[] = [];
  private pending: { id: string; effect: Effect } | null = null;
  private serial = 0;
  private revision = 0;
  private readonly epoch: string;
  private steps = 0;
  private lastEncounter = -8;
  private shop: string[] | null = null;
  private storage = false;
  private readonly random: SeededRandom;
  private readonly rng: () => number;
  private readonly supported: Set<string>;
  constructor(options: SessionOptions) {
    this.random = new SeededRandom(options.seed);
    this.rng = options.rng ?? this.random.next;
    this.epoch = `session-${nextEpoch++}`;
    this.supported = new Set(options.supportedMaps ?? OPENING_MAPS);
    const saved = options.save ? decodeSave(JSON.stringify(options.save), this.supported) : null;
    if (options.save && !saved) throw new Error('Invalid or unsupported save');
    this.player = saved
      ? PlayerState.fromSave(clone(saved))
      : newGameState(options.name ?? 'RED', options.rivalName ?? 'BLUE');
    this.map = clone(ALL_MAPS[saved?.currentMap ?? 'player_house']);
    this.x = saved?.playerX ?? 3;
    this.y = saved?.playerY ?? 5;
    if (saved?.engineState) {
      this.random.state = saved.engineState.randomState;
      this.steps = saved.engineState.steps;
      this.lastEncounter = saved.engineState.lastEncounter;
      this.direction = saved.engineState.direction as Direction;
    }
  }
  private get inputId() {
    return `${this.epoch}:input:${this.revision}`;
  }
  private npcs() {
    return this.map.npcs.filter(
      (n) =>
        !shouldSkipNPC(
          n,
          this.player.storyFlags,
          this.player.badges,
          this.player.defeatedTrainers,
          (id) => this.player.hasItem(id),
        ),
    );
  }
  private faced() {
    const v = DIR_VECTORS[this.direction],
      nx = this.x + v.x,
      ny = this.y + v.y;
    let npc = this.npcs().find((n) => n.x === nx && n.y === ny);
    if (!npc && this.map.tiles[ny]?.[nx] === TileType.COUNTER)
      npc = this.npcs().find((n) => n.x === nx + v.x && n.y === ny + v.y);
    return { npc, nx, ny };
  }
  getSnapshot() {
    const f = this.faced(),
      tile = this.map.tiles[f.ny]?.[f.nx];
    const battle: BattleView | null = this.battle
      ? {
          player: this.battle.sides[0].pokemon,
          opponent: this.battle.sides[1].pokemon,
          trainer: !!this.battle.trainerId,
          forcedSwitch: this.battle.forcedSwitch,
        }
      : null;
    return clone({
      player: this.player as PlayerView,
      map: this.map,
      npcs: this.npcs(),
      x: this.x,
      y: this.y,
      direction: this.direction,
      battle,
      pending: this.pending,
      inputId: this.inputId,
      canSave: this.canSave,
      objective: currentObjective(this.player),
      shopStock: this.shop,
      interaction: f.npc
        ? f.npc.isItemBall
          ? 'Pick up'
          : 'Talk'
        : [TileType.PC, TileType.SIGN].includes(tile)
          ? 'Read'
          : null,
    });
  }
  get canSave() {
    return !this.battle && !this.pending && !this.jobs.length;
  }
  exportSave(): SaveData {
    if (!this.canSave) throw new Error('Save requires a stable overworld checkpoint');
    return clone({
      ...this.player.toSave(),
      currentMap: this.map.id,
      playerX: this.x,
      playerY: this.y,
      engineState: {
        randomState: this.random.state,
        steps: this.steps,
        lastEncounter: this.lastEncounter,
        direction: this.direction,
      },
    });
  }
  /** Debug snapshots are detached too; they do not bypass the checkpoint save API. */
  inspectSave(): SaveData {
    return clone({
      ...this.player.toSave(),
      currentMap: this.map.id,
      playerX: this.x,
      playerY: this.y,
      engineState: {
        randomState: this.random.state,
        steps: this.steps,
        lastEncounter: this.lastEncounter,
        direction: this.direction,
      },
    });
  }
  addPlayTime(seconds: number) {
    if (Number.isFinite(seconds) && seconds >= 0) this.player.playTime += Math.min(seconds, 1);
  }
  dispatch(command: Command): { accepted: boolean; reason?: string } {
    if (command.type === 'ack' || command.type === 'learn') {
      if (!this.pending || command.id !== this.pending.id)
        return { accepted: false, reason: 'Stale presentation' };
      if (this.pending.effect.kind === 'learn') {
        if (
          command.type !== 'learn' ||
          !Number.isInteger(command.index) ||
          command.index < -1 ||
          command.index > 3
        )
          return { accepted: false, reason: 'Choose a move' };
        const e = this.pending.effect;
        if (command.index >= 0) learnMove(this.player.party[e.partyIndex], e.moveId, command.index);
      } else if (command.type !== 'ack') return { accepted: false, reason: 'Unexpected choice' };
      this.pending = null;
      this.revision++;
      this.pump();
      return { accepted: true };
    }
    if (command.inputId !== this.inputId || this.pending || this.jobs.length)
      return { accepted: false, reason: 'Stale or busy input' };
    const reject = (reason: string) => ({ accepted: false, reason });
    const b = this.battle;
    if (b?.forcedSwitch && command.type !== 'selectPokemon')
      return reject('Choose a healthy Pokémon first.');
    switch (command.type) {
      case 'move': {
        if (b || this.shop || this.storage || !Object.values(Direction).includes(command.direction))
          return reject('Cannot move now');
        this.direction = command.direction;
        const r = resolveStep(this.map, this.x, this.y, this.direction, this.npcs());
        if (r.kind === 'warp') this.jobs.push({ kind: 'warp', warp: r.warp });
        if (r.kind === 'move') {
          this.x = r.x;
          this.y = r.y;
          this.effect({ kind: 'move', x: r.x, y: r.y, direction: this.direction, hop: r.hop });
          this.jobs.push({ kind: 'afterStep', warp: r.warp });
        }
        break;
      }
      case 'interact':
        if (b || this.shop || this.storage) return reject('Cannot interact now');
        this.interact();
        break;
      case 'closeMenu':
        this.shop = null;
        this.storage = false;
        break;
      case 'battleMove': {
        if (!b) return reject('No battle');
        const a = b.sides[0];
        const index = a.volatile.charging?.moveIndex ?? command.index;
        if (!Number.isInteger(index) || !a.pokemon.moves[index]) return reject('Unknown move');
        if (!a.volatile.charging && a.disable.moveIndex === index)
          return reject('That move is disabled!');
        if (a.pokemon.moves[index].currentPp <= 0 && a.pokemon.moves.some((m) => m.currentPp > 0))
          return reject('There is no PP left for this move.');
        b.sides.forEach((s) => (s.volatile.flinched = false));
        const ai = this.ai();
        const pm = MOVES_DATA[a.pokemon.moves[index].moveId],
          am = MOVES_DATA[b.sides[1].pokemon.moves[ai].moveId];
        const first = resolveTurnOrder(
          a.pokemon,
          b.sides[1].pokemon,
          pm.priority ?? 0,
          am.priority ?? 0,
        );
        this.jobs.push(
          ...((first
            ? [
                { kind: 'attack', side: 0, index },
                { kind: 'attack', side: 1, index: ai },
              ]
            : [
                { kind: 'attack', side: 1, index: ai },
                { kind: 'attack', side: 0, index },
              ]) as Job[]),
        );
        this.endRound();
        break;
      }
      case 'selectPokemon': {
        const index = command.index,
          p = this.player.party[index];
        if (!Number.isInteger(index) || !p) return reject('Unknown Pokémon');
        if (b) {
          if (p.currentHp <= 0 || p === b.sides[0].pokemon)
            return reject('Choose a healthy Pokémon');
          const free = b.forcedSwitch;
          b.forcedSwitch = false;
          b.sides[0] = combatant(p);
          if (!b.participants.includes(index)) b.participants.push(index);
          this.say([`Go, ${speciesName(p)}!`]);
          if (!free) this.freeAttack();
        } else [this.player.party[0], this.player.party[index]] = [p, this.player.party[0]];
        break;
      }
      case 'catch': {
        if (!b || b.trainerId) return reject('You can’t do that in a trainer battle.');
        const item = command.itemId ?? 'poke_ball';
        if (ITEMS[item]?.category !== 'ball' || !this.player.useItem(item))
          return reject('No Poké Balls left.');
        this.say(['You threw a Poké Ball!']);
        const result = attemptCatch(b.sides[1].pokemon, item, this.rng);
        if (result.caught) {
          const p = b.sides[1].pokemon;
          this.player.markSeen(p.speciesId);
          if (!this.player.pokedexCaught.includes(p.speciesId))
            this.player.pokedexCaught.push(p.speciesId);
          const inParty = this.player.addToParty(p);
          this.say([
            `Gotcha! ${speciesName(p)} was caught!`,
            inParty ? 'Your new friend joined the party.' : 'Your new friend was sent to storage.',
          ]);
          this.jobs.push({ kind: 'finish', outcome: 'caught' });
        } else {
          this.say(['Oh no! The Pokémon broke free.']);
          this.freeAttack();
        }
        break;
      }
      case 'run':
        if (!b || b.trainerId) return reject('You can’t do that in a trainer battle.');
        if (
          calculateRunChance(
            b.sides[0].pokemon.stats.speed,
            b.sides[1].pokemon.stats.speed,
            this.rng,
          )
        ) {
          this.say(['Got away safely!']);
          this.jobs.push({ kind: 'finish', outcome: 'run' });
        } else {
          this.say(['Can’t escape!']);
          this.freeAttack();
        }
        break;
      case 'item': {
        const p = this.player.party[command.index];
        if (!Number.isInteger(command.index) || !p || !this.player.hasItem(command.itemId))
          return reject('Item or target unavailable.');
        if (command.itemId === 'potion') {
          if (p.currentHp <= 0 || p.currentHp === p.stats.hp)
            return reject('This Pokémon cannot use that now.');
          p.currentHp = Math.min(p.stats.hp, p.currentHp + 20);
        } else if (
          (command.itemId === 'antidote' && p.status === StatusCondition.POISON) ||
          (command.itemId === 'paralyze_heal' && p.status === StatusCondition.PARALYSIS)
        )
          p.status = StatusCondition.NONE;
        else return reject('This item has no effect.');
        this.player.useItem(command.itemId);
        this.say([`${speciesName(p)} is feeling better.`]);
        if (b) this.freeAttack();
        break;
      }
      case 'buy': {
        const item = ITEMS[command.itemId];
        if (b || !this.shop?.includes(command.itemId) || !item || item.price <= 0)
          return reject('That item is not for sale.');
        if (this.player.money < item.price) return reject('You need a little more money for that.');
        this.player.money -= item.price;
        this.player.addItem(command.itemId);
        break;
      }
      case 'deposit': {
        const i = command.index;
        if (b || !this.storage || !Number.isInteger(i) || !this.player.party[i])
          return reject('Storage is unavailable.');
        if (
          this.player.party.length <= 1 ||
          !this.player.party.some((p, n) => n !== i && p.currentHp > 0)
        )
          return reject('Keep a healthy companion with you.');
        this.player.pc.push(this.player.party.splice(i, 1)[0]);
        break;
      }
      case 'withdraw': {
        const i = command.index;
        if (b || !this.storage || !Number.isInteger(i) || !this.player.pc[i])
          return reject('Storage is unavailable.');
        if (this.player.party.length >= 6) return reject('Your party is full.');
        this.player.party.push(this.player.pc.splice(i, 1)[0]);
        break;
      }
    }
    this.revision++;
    this.pump();
    return { accepted: true };
  }
  private effect(effect: Effect) {
    this.jobs.push({ kind: 'effect', effect });
  }
  private say(lines: readonly string[], speaker?: string) {
    if (lines.length) this.effect({ kind: 'dialogue', lines: [...lines], speaker });
  }
  private interact() {
    const { npc: n, nx, ny } = this.faced();
    if (!n) {
      if (this.map.tiles[ny]?.[nx] === TileType.PC) {
        this.storage = true;
        this.effect({ kind: 'menu', menu: 'storage' });
      } else if (this.map.tiles[ny]?.[nx] === TileType.SIGN)
        this.say(SIGNS[`${this.map.id}:${nx},${ny}`] ?? ['A new adventure awaits.'], 'SIGNPOST');
      return;
    }
    if (n.isItemBall && n.itemId) {
      const pickup = itemBallPickup(n, this.player);
      if (pickup) {
        this.say(pickup.messages);
        this.jobs.push({ kind: 'pickup', npcId: n.id });
      }
      return;
    }
    if (n.id === 'oak') {
      const stage = oakStage(this.player);
      this.say(OAK_DIALOGUE[stage], 'PROFESSOR OAK');
      this.jobs.push({ kind: 'oak', stage });
      return;
    }
    if (n.id === 'rival') {
      const result = labRivalTalkOutcome(this.player);
      this.say(LAB_RIVAL_TALK_DIALOGUE[result], this.player.rivalName);
      if (result === 'battle') this.jobs.push({ kind: 'rival' });
      return;
    }
    if (n.id.startsWith('nurse') || n.id === 'mom') {
      const nurse = n.id.startsWith('nurse');
      this.say(
        nurse
          ? ['Welcome to the Pokémon Center! Let’s give your friends a little rest.']
          : n.dialogue,
        nurse ? 'NURSE JOY' : 'MOM',
      );
      this.jobs.push({ kind: 'heal', nurse });
      return;
    }
    if (n.shopStock || n.id.startsWith('mart_clerk')) {
      if (
        shouldGiveOaksParcel(this.map.id, this.player.storyFlags, (id) => this.player.hasItem(id))
      ) {
        this.say(OAKS_PARCEL_DIALOGUE, 'POKÉ MART');
        this.jobs.push({ kind: 'parcel' });
      } else {
        this.shop = [...(n.shopStock ?? [])];
        this.effect({ kind: 'menu', menu: 'shop' });
      }
      return;
    }
    const gift = GIFT_NPCS[n.id]?.resolve(this.player);
    if (gift) {
      this.say(gift.dialogue);
      this.jobs.push({ kind: 'gift', npcId: n.id });
      return;
    }
    this.say(n.dialogue.length ? n.dialogue : ['What a lovely day to explore.']);
  }
  private ai() {
    const b = this.battle!,
      a = b.sides[1];
    if (a.volatile.charging) return a.volatile.charging.moveIndex;
    let i = selectAIMove(a.pokemon, b.sides[0].pokemon, this.rng);
    if (i === a.disable.moveIndex) {
      const alternatives = a.pokemon.moves
        .map((_, i) => i)
        .filter((i) => i !== a.disable.moveIndex && a.pokemon.moves[i].currentPp > 0);
      if (alternatives.length) i = alternatives[Math.floor(this.rng() * alternatives.length)];
    }
    return i;
  }
  private endRound() {
    this.jobs.push(
      { kind: 'status', side: 0 },
      { kind: 'status', side: 1 },
      { kind: 'roundEnd' },
      { kind: 'faint' },
    );
  }
  private freeAttack() {
    this.jobs.push({ kind: 'attack', side: 1, index: this.ai() }, { kind: 'faint' });
  }
  private beginBattle(opponents: PokemonInstance[], trainerId?: string) {
    const first = this.player.getFirstAlivePokemon();
    if (!first) return;
    this.shop = null;
    this.storage = false;
    this.battle = {
      sides: [combatant(first), combatant(opponents[0])],
      trainerId,
      opponents,
      participants: [this.player.party.indexOf(first)],
      forcedSwitch: false,
      rewarded: false,
    };
    this.player.markSeen(opponents[0].speciesId);
    this.effect({ kind: 'battleStart' });
    this.say([
      trainerId
        ? `${this.player.rivalName} sent out ${speciesName(opponents[0])}!`
        : `A wild ${speciesName(opponents[0])} appeared!`,
    ]);
  }
  private pump() {
    while (!this.pending && this.jobs.length) {
      const job = this.jobs.shift()!;
      const b = this.battle;
      switch (job.kind) {
        case 'effect':
          this.pending = { id: `${this.epoch}:effect:${++this.serial}`, effect: job.effect };
          break;
        case 'afterStep': {
          if (job.warp) {
            this.jobs.push({ kind: 'warp', warp: job.warp });
            break;
          }
          this.steps++;
          if (this.map.tiles[this.y][this.x] !== TileType.TALL_GRASS) break;
          if (!this.player.party.length) {
            this.say(['OAK: The tall grass is full of wild Pokémon! Come to my lab first.']);
            this.jobs.push({ kind: 'enter', map: 'oaks_lab', x: 3, y: 8 });
            break;
          }
          if (
            this.map.wildEncounters &&
            this.steps - this.lastEncounter > 4 &&
            this.rng() < this.map.wildEncounters.grassRate
          ) {
            const pick = pickWildEncounter(this.map.wildEncounters, this.rng);
            if (pick) {
              this.lastEncounter = this.steps;
              this.beginBattle([
                createPokemon(pick.speciesId, pick.level, this.player.name, this.rng),
              ]);
            }
          }
          break;
        }
        case 'warp':
          if (shouldTriggerLabRivalBattle(this.map.id, this.player)) {
            this.say(LAB_RIVAL_TALK_DIALOGUE.battle, this.player.rivalName);
            this.jobs.push({ kind: 'rival' });
          } else if (job.warp.targetMap === 'route1' && !this.player.party.length) {
            this.say([
              'OAK: Hey! Wait! It’s unsafe to go out without a Pokémon!',
              'Come with me to my laboratory. I have a friend for you.',
            ]);
            this.jobs.push({ kind: 'enter', map: 'oaks_lab', x: 3, y: 8 });
          } else if (!this.supported.has(job.warp.targetMap))
            this.say(
              [
                'The next chapter of Kanto is still taking shape.',
                'For now, explore Pallet Town, Route 1, and Viridian City.',
              ],
              'BEYOND THE HORIZON',
            );
          else
            this.jobs.push({
              kind: 'enter',
              map: job.warp.targetMap,
              x: job.warp.targetX,
              y: job.warp.targetY,
            });
          break;
        case 'enter':
          this.map = clone(ALL_MAPS[job.map]);
          this.x = job.x;
          this.y = job.y;
          this.shop = null;
          this.storage = false;
          this.effect({ kind: 'map' });
          break;
        case 'pickup': {
          const npc = this.map.npcs.find((n) => n.id === job.npcId);
          const pickup = npc && itemBallPickup(npc, this.player);
          if (pickup) {
            this.player.addItem(pickup.itemId);
            for (const flag of pickup.flags) this.player.storyFlags[flag] = true;
            syncDerivedStoryFlags(this.player);
            this.effect({ kind: 'map' });
          }
          break;
        }
        case 'oak':
          applyOakStage(job.stage, this.player, this.rng);
          break;
        case 'parcel':
          grantOaksParcel(this.player);
          break;
        case 'heal':
          restoreParty(this.player.party);
          this.player.lastHealMap = this.map.id;
          this.player.lastHealX = this.x;
          this.player.lastHealY = this.y;
          if (job.nurse) {
            const flag = healVisitFlag(this.map);
            if (flag) this.player.storyFlags[flag] = true;
            this.say(
              ['Your Pokémon are feeling wonderful. We hope to see you again!'],
              'NURSE JOY',
            );
          }
          break;
        case 'gift': {
          const gift = GIFT_NPCS[job.npcId]?.resolve(this.player);
          if (gift?.grantsPokemon)
            this.player.addToParty(
              createPokemon(
                gift.grantsPokemon.speciesId,
                gift.grantsPokemon.level,
                this.player.name,
                this.rng,
              ),
            );
          gift?.onComplete?.(this.player);
          break;
        }
        case 'rival':
          consumeLabRivalEncounter(this.player);
          this.beginBattle(
            TRAINERS.rival_lab.team.map((p) =>
              createPokemon(p.speciesId, p.level, this.player.rivalName, this.rng),
            ),
            'rival_lab',
          );
          break;
        case 'attack':
          if (b && b.sides.every((s) => s.pokemon.currentHp > 0)) {
            const a = b.sides[job.side],
              d = b.sides[1 - job.side];
            const event = executeBattleMove(a, d, job.index, this.rng);
            this.jobs.unshift({
              kind: 'effect',
              effect: { kind: 'attack', side: job.side, event },
            });
          }
          break;
        case 'status':
          if (b) {
            const a = b.sides[job.side],
              d = b.sides[1 - job.side];
            const damage = applyEndTurnStatus(a.pokemon);
            let lines: string[] = [];
            if (damage) {
              a.pokemon.currentHp = Math.max(0, a.pokemon.currentHp - damage);
              lines = [
                `${speciesName(a.pokemon)} is hurt by ${a.pokemon.status === StatusCondition.BURN ? 'its burn' : 'poison'}!`,
              ];
            } else if (a.volatile.seeded && a.pokemon.currentHp > 0) {
              applyLeechSeed(a.pokemon, d.pokemon);
              lines = [`${speciesName(a.pokemon)}'s health is sapped by LEECH SEED!`];
            }
            if (lines.length)
              this.jobs.unshift({ kind: 'effect', effect: { kind: 'dialogue', lines } });
          }
          break;
        case 'roundEnd':
          if (b)
            for (const a of b.sides) {
              if (a.disable.turnsLeft > 0 && --a.disable.turnsLeft <= 0) a.disable.moveIndex = -1;
            }
          break;
        case 'faint':
          if (b) {
            if (b.sides[1].pokemon.currentHp <= 0 && !b.rewarded) {
              b.rewarded = true;
              this.say([`${speciesName(b.sides[1].pokemon)} fainted!`]);
              const living = b.participants.filter((i) => this.player.party[i]?.currentHp > 0),
                xp = splitExp(calculateExpGain(b.sides[1].pokemon, !!b.trainerId), living.length);
              for (const i of living) this.jobs.push({ kind: 'reward', partyIndex: i, xp });
              this.jobs.push({ kind: 'nextOpponent' });
            } else if (b.sides[0].pokemon.currentHp <= 0) {
              if (this.player.getFirstAlivePokemon()) b.forcedSwitch = true;
              else {
                this.say(['Your Pokémon need a rest. You hurry back to a safe place.']);
                this.jobs.push({ kind: 'finish', outcome: 'loss' });
              }
            }
          }
          break;
        case 'reward': {
          const p = this.player.party[job.partyIndex];
          const levels = addExperience(p, job.xp);
          const jobs: Job[] = [
            {
              kind: 'effect',
              effect: {
                kind: 'dialogue',
                lines: [`${speciesName(p)} gained ${job.xp} experience.`],
              },
            },
          ];
          for (const level of levels) {
            gainHappiness(p, 5);
            jobs.push({
              kind: 'effect',
              effect: {
                kind: 'dialogue',
                lines: [`${speciesName(p)} grew to level ${level.newLevel}!`],
              },
            });
            for (const moveId of level.newMoves)
              jobs.push({ kind: 'learn', partyIndex: job.partyIndex, moveId });
            jobs.push({ kind: 'evolve', partyIndex: job.partyIndex });
          }
          this.jobs.unshift(...jobs);
          break;
        }
        case 'learn': {
          const p = this.player.party[job.partyIndex];
          if (p.moves.some((m) => m.moveId === job.moveId)) break;
          if (learnMove(p, job.moveId))
            this.jobs.unshift({
              kind: 'effect',
              effect: {
                kind: 'dialogue',
                lines: [`${speciesName(p)} learned ${MOVES_DATA[job.moveId].name}!`],
              },
            });
          else
            this.jobs.unshift({
              kind: 'effect',
              effect: { kind: 'learn', partyIndex: job.partyIndex, moveId: job.moveId },
            });
          break;
        }
        case 'evolve': {
          const p = this.player.party[job.partyIndex],
            evo = checkEvolution(p);
          if (evo) {
            evolvePokemon(p, evo.toSpecies);
            this.jobs.unshift({
              kind: 'effect',
              effect: { kind: 'dialogue', lines: [`${evo.fromName} evolved into ${evo.toName}!`] },
            });
          }
          break;
        }
        case 'nextOpponent':
          if (b) {
            const next = b.opponents.find((p) => p !== b.sides[1].pokemon && p.currentHp > 0);
            if (next) {
              b.sides[1] = combatant(next);
              b.participants = [this.player.party.indexOf(b.sides[0].pokemon)];
              b.rewarded = false;
              this.player.markSeen(next.speciesId);
              this.say([`The trainer sent out ${speciesName(next)}!`]);
              this.jobs.push({ kind: 'faint' });
            } else this.jobs.push({ kind: 'finish', outcome: 'win' });
          }
          break;
        case 'finish':
          if (b) {
            if (job.outcome === 'win' && b.trainerId) {
              if (!this.player.defeatedTrainers.includes(b.trainerId))
                this.player.defeatedTrainers.push(b.trainerId);
              const prize = trainerPrizeMoney(b.sides[1].pokemon);
              this.player.money += prize;
              const gym = GYM_LEADERS[b.trainerId];
              if (gym && !this.player.badges.includes(gym.badge)) {
                this.player.badges.push(gym.badge);
                if (gym.tmReward) this.player.addItem(gym.tmReward);
              }
              this.say([`You received ₽${prize}.`]);
            }
            if (job.outcome === 'loss') {
              restoreParty(this.player.party);
              this.player.money = Math.floor(this.player.money / 2);
            }
            this.battle = null;
            this.lastEncounter = this.steps;
            this.effect({ kind: 'battleEnd', outcome: job.outcome });
            if (job.outcome === 'loss')
              this.jobs.push({
                kind: 'enter',
                map: this.player.lastHealMap,
                x: this.player.lastHealX,
                y: this.player.lastHealY,
              });
          }
          break;
      }
    }
  }
}
let nextEpoch = 1;
export const createSession = (options: SessionOptions) => new GameSession(options);
export type SessionSnapshot = ReturnType<GameSession['getSnapshot']>;
