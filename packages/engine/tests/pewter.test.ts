import { describe, it, expect } from 'vitest';
import { createSession, type Command, type GameSession } from '../src/index';
import { ALL_MAPS, GYM_LEADERS } from '../src/content';
import { createPokemon, newGameState } from '../src/testing';
import { Direction } from '../src/types';
const CAMPAIGN_MAPS = ['pallet_town','player_house','oaks_lab','route1','viridian_city','route2','viridian_forest','pewter_city','pewter_gym','pokemon_center_pewter','pokemart_pewter','pewter_house','pewter_museum_1f','pewter_museum_2f'];
import { decodeSave } from '../src/persistence/codec';

const data = (map:string,x:number,y:number) => ({...newGameState('RED','BLUE').toSave(),currentMap:map,playerX:x,playerY:y,
  party:[createPokemon(3,50,'RED',()=>.5)],storyFlags:{has_pikachu:true,has_pokedex:true,delivered_parcel:true,rival_battle_lab:true}});
const input=(s:GameSession,c:Record<string,unknown>)=>s.dispatch({...c,inputId:s.getSnapshot().inputId} as Command);
const drain=(s:GameSession)=>{const effects=[];for(let i=0;i<500;i++){const p=s.getSnapshot().pending;if(!p)return effects;effects.push(p.effect);s.dispatch(p.effect.kind==='learn'?{type:'learn',id:p.id,index:-1}:{type:'ack',id:p.id});}throw Error('Pending flow did not finish')};
describe('Pewter campaign coverage',()=>{
  it.each(CAMPAIGN_MAPS)('can reload saves in %s',id=>{
    const m=ALL_MAPS[id];let x=0,y=0;
    find:for(y=2;y<m.height;y++)for(x=1;x<m.width;x++)if(!m.collision[y][x]&&!m.npcs.some(n=>n.x===x&&n.y===y))break find;
    const d=data(id,x,y);expect(decodeSave(JSON.stringify({version:1,data:d}), new Set(CAMPAIGN_MAPS))).not.toBeNull();
    expect(createSession({seed:42,supportedMaps:CAMPAIGN_MAPS,save:d}).getSnapshot().map.id).toBe(id);
  });
  it('reaches Route2, forest, Pewter, and its gym through shared warps',()=>{
    for(const [from,x,y,direction,to] of [
      ['viridian_city',9,2,Direction.UP,'route2'],['route2',9,1,Direction.UP,'viridian_forest'],
      ['viridian_forest',5,1,Direction.UP,'pewter_city'],['pewter_city',7,9,Direction.UP,'pewter_gym'],
      ['pewter_city',16,8,Direction.UP,'pokemon_center_pewter'],['pewter_city',16,20,Direction.UP,'pokemart_pewter'],
      ['pewter_city',17,13,Direction.UP,'pewter_museum_1f'],['pewter_city',5,20,Direction.UP,'pewter_house'],
    ] as const){const s=createSession({seed:42,supportedMaps:CAMPAIGN_MAPS,save:data(from,x,y),rng:()=>.5});input(s,{type:'move',direction});drain(s);expect(s.getSnapshot().map.id,from).toBe(to);}
  });
  it('keeps the parcel gate and unsupported Route3 boundary authoritative',()=>{
    const d=data('viridian_city',9,2);d.storyFlags.has_pokedex=false;
    const s=createSession({seed:42,supportedMaps:CAMPAIGN_MAPS,save:d});input(s,{type:'move',direction:Direction.UP});drain(s);expect(s.getSnapshot().map.id).toBe('viridian_city');
    const p=createSession({seed:42,supportedMaps:CAMPAIGN_MAPS,save:data('pewter_city',22,13)});input(p,{type:'move',direction:Direction.RIGHT});drain(p);expect(p.getSnapshot().map.id).toBe('pewter_city');
  });
  it('wins Brock’s canonical team and receives his badge and TM once',()=>{
    const d=data('pewter_gym',4,4),s=createSession({seed:42,supportedMaps:CAMPAIGN_MAPS,save:d,rng:()=>.5});
    input(s,{type:'move',direction:Direction.UP});drain(s);input(s,{type:'interact'});drain(s);
    expect(s.getSnapshot().battle?.trainer).toBe(true);
    for(let i=0;i<60&&s.getSnapshot().battle;i++){input(s,{type:'battleMove',index:2});drain(s);}
    expect(s.getSnapshot().battle).toBeNull();expect(s.getSnapshot().player.badges).toContain(GYM_LEADERS.brock.badge);
    expect(s.getSnapshot().player.bag[GYM_LEADERS.brock.tmReward!]).toBe(1);
    input(s,{type:'interact'});drain(s);expect(s.getSnapshot().battle).toBeNull();expect(s.getSnapshot().player.bag[GYM_LEADERS.brock.tmReward!]).toBe(1);
  });
});
describe('Museum admission and signs',()=>{
  it('reads the canonical plaque text',()=>{
    const s=createSession({seed:42,supportedMaps:CAMPAIGN_MAPS,save:data('pewter_museum_1f',2,4)});
    input(s,{type:'move',direction:Direction.UP});drain(s);
    expect(s.getSnapshot().interaction).toBe('Read');input(s,{type:'interact'});
    expect(s.getSnapshot().pending?.effect).toMatchObject({kind:'dialogue',lines:expect.arrayContaining(['KABUTOPS FOSSIL'])});
  });
  it('blocks upstairs until the ticket is paid and charges only once',()=>{
    const s=createSession({seed:42,supportedMaps:CAMPAIGN_MAPS,save:data('pewter_museum_1f',16,8)});
    input(s,{type:'move',direction:Direction.UP});drain(s);expect(s.getSnapshot().map.id).toBe('pewter_museum_1f');
    const d=data('pewter_museum_1f',14,9),t=createSession({seed:42,supportedMaps:CAMPAIGN_MAPS,save:d});
    input(t,{type:'move',direction:Direction.UP});drain(t);input(t,{type:'interact'});drain(t);
    expect(t.getSnapshot().player.money).toBe(d.money-50);expect(t.getSnapshot().player.storyFlags.museum_2f_ticket).toBe(true);
    input(t,{type:'interact'});drain(t);expect(t.getSnapshot().player.money).toBe(d.money-50);
    const next=t.exportSave();next.playerX=16;next.playerY=8;
    const u=createSession({seed:42,supportedMaps:CAMPAIGN_MAPS,save:next});input(u,{type:'move',direction:Direction.UP});drain(u);expect(u.getSnapshot().map.id).toBe('pewter_museum_2f');
  });
});
describe('Trainer sight approach',()=>{
  it('walks to the adjacent cell, fights once, and preserves the defeated flag',()=>{
    const s=createSession({seed:42,supportedMaps:CAMPAIGN_MAPS,save:data('viridian_forest',23,37),rng:()=>.5});
    input(s,{type:'move',direction:Direction.UP});
    const effects=drain(s);
    expect(effects).toContainEqual(expect.objectContaining({kind:'cutscene',script:expect.objectContaining({id:'trainer-approach:forest_trainer1'})}));
    expect(s.getSnapshot().npcs.find(n=>n.id==='forest_trainer1')).toMatchObject({x:22,y:36});
    expect(s.getSnapshot().battle?.trainer).toBe(true);
    for(let i=0;i<30&&s.getSnapshot().battle;i++){input(s,{type:'battleMove',index:2});drain(s)}
    expect(s.getSnapshot().player.defeatedTrainers).toContain('forest_trainer1');
    input(s,{type:'move',direction:Direction.LEFT});drain(s);input(s,{type:'interact'});drain(s);expect(s.getSnapshot().battle).toBeNull();
    const resumed=createSession({seed:42,supportedMaps:CAMPAIGN_MAPS,save:s.exportSave()});expect(resumed.getSnapshot().player.defeatedTrainers).toContain('forest_trainer1');
  });
});
