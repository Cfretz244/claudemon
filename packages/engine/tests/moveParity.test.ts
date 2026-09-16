import { describe,it,expect,vi,afterEach } from 'vitest';
import { combatant,executeBattleMove,SeededRandom } from '../src/index';
import { createPokemon } from '../src/testing';
import { MOVES_DATA } from '../src/content';
import { LegacyMove } from './fixtures/legacyMove';
afterEach(()=>vi.restoreAllMocks());
describe('move extraction parity against 77b319e',()=>{
 it.each(Object.keys(MOVES_DATA).map(Number))('move %i preserves state and random draws',async id=>{
  const a=combatant(createPokemon(25,40,'RED',()=>.5)),d=combatant(createPokemon(133,50,'BLUE',()=>.5));
  a.pokemon.moves=[{moveId:id,currentPp:20,maxPp:20}];
  const oldA=structuredClone(a),oldD=structuredClone(d);
  const seed1=new SeededRandom(123),seed2=new SeededRandom(123);
  vi.spyOn(Math,'random').mockImplementation(seed1.next);
  const legacy=new LegacyMove(oldA,oldD);
  await legacy.run(0);
  executeBattleMove(a,d,0,seed2.next);
  expect({a,d,random:seed2.state}).toEqual({a:oldA,d:oldD,random:seed1.state});
  if(a.volatile.charging){await legacy.run(0);executeBattleMove(a,d,0,seed2.next);expect({a,d,random:seed2.state}).toEqual({a:oldA,d:oldD,random:seed1.state});}
 });
});
