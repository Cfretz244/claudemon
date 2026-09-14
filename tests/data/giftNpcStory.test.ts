import { describe, it, expect } from 'vitest';
import { GIFT_NPCS, GiftNpcResult } from '../../src/data/giftNpcs';
import { PlayerState } from '../../src/entities/Player';
import { ALL_MAPS } from '../../src/data/maps';
import { mockPokemon } from '../helpers/pokemon.factory';

/**
 * Pins the story behavior of every declarative gift NPC: which condition
 * unlocks the gift, exactly which flags/items change, and that no gift can be
 * claimed twice. These were validated only by play before this file.
 */

function claim(id: string, state: PlayerState): GiftNpcResult {
  const result = GIFT_NPCS[id].resolve(state);
  expect(result, `${id} returned null`).not.toBeNull();
  return result!;
}
function isGift(r: GiftNpcResult | null): boolean {
  return !!r && (!!r.onComplete || !!r.grantsPokemon);
}

describe('gift NPC story pins', () => {
  it('no gift NPC with an unconditional gift can be claimed twice', () => {
    for (const [id, entry] of Object.entries(GIFT_NPCS)) {
      const state = new PlayerState();
      const first = entry.resolve(state);
      if (!isGift(first)) continue; // conditional gifts covered individually below
      first!.onComplete?.(state);
      const second = entry.resolve(state);
      expect(isGift(second), `${id} can be claimed a second time`).toBe(false);
    }
  });

  it('every "received" line comes with a matching reward on a fresh state', () => {
    for (const [id, entry] of Object.entries(GIFT_NPCS)) {
      const r = entry.resolve(new PlayerState());
      if (!r) continue;
      const announces = r.dialogue.some(d => /received/.test(d));
      if (announces) {
        expect(isGift(r), `${id} says "received" but grants nothing`).toBe(true);
      }
    }
  });

  it('SS Anne captain grants HM01 and marks the ship departed in one interaction', () => {
    const state = new PlayerState();
    const r = claim('ss_anne_captain', state);
    r.onComplete!(state);
    expect(state.hasItem('hm01_cut')).toBe(true);
    expect(state.storyFlags['got_hm01']).toBe(true);
    expect(state.storyFlags['ss_anne_departed']).toBe(true);
    expect(claim('ss_anne_captain', state).onComplete).toBeUndefined();
  });

  it('Silph president: plea before completion, Master Ball once after, thanks thereafter', () => {
    const state = new PlayerState();
    expect(claim('silph_president', state).dialogue[0]).toContain('defeat GIOVANNI');
    expect(isGift(GIFT_NPCS['silph_president'].resolve(state))).toBe(false);

    state.storyFlags['silph_co_complete'] = true;
    const gift = claim('silph_president', state);
    expect(gift.dialogue.join(' ')).toContain('MASTER BALL');
    gift.onComplete!(state);
    expect(state.hasItem('master_ball')).toBe(true);
    expect(state.storyFlags['got_master_ball']).toBe(true);

    const after = claim('silph_president', state);
    expect(after.onComplete).toBeUndefined();
    expect(after.dialogue[0]).toContain('Thank you');
  });

  it('Safari warden needs the Gold Teeth, consumes them, and gives HM04 once', () => {
    const state = new PlayerState();
    expect(isGift(GIFT_NPCS['safari_warden'].resolve(state))).toBe(false);
    state.addItem('gold_teeth');
    const gift = claim('safari_warden', state);
    gift.onComplete!(state);
    expect(state.hasItem('gold_teeth')).toBe(false);
    expect(state.hasItem('hm04_strength')).toBe(true);
    expect(state.storyFlags['got_hm04']).toBe(true);
    expect(isGift(GIFT_NPCS['safari_warden'].resolve(state))).toBe(false);
  });

  it('bike shop owner falls through to map dialogue without a voucher, trades voucher for bicycle', () => {
    const state = new PlayerState();
    expect(GIFT_NPCS['bike_shop_owner'].resolve(state)).toBeNull();
    state.addItem('bike_voucher');
    const gift = claim('bike_shop_owner', state);
    gift.onComplete!(state);
    expect(state.hasItem('bike_voucher')).toBe(false);
    expect(state.hasItem('bicycle')).toBe(true);
    expect(state.storyFlags['got_bicycle']).toBe(true);
    expect(isGift(GIFT_NPCS['bike_shop_owner'].resolve(state))).toBe(false);
  });

  it('tea lady gives Tea only while the player has none and Saffron is closed', () => {
    const state = new PlayerState();
    claim('celadon_tea_lady', state).onComplete!(state);
    expect(state.hasItem('tea')).toBe(true);
    expect(isGift(GIFT_NPCS['celadon_tea_lady'].resolve(state))).toBe(false);

    const opened = new PlayerState();
    opened.storyFlags['saffron_open'] = true;
    expect(isGift(GIFT_NPCS['celadon_tea_lady'].resolve(opened))).toBe(false);
  });

  it.each([
    ['fan_club_chairman', 'bike_voucher', 'got_bike_voucher'],
    ['mr_fuji', 'poke_flute', 'got_poke_flute'],
    ['oaks_aide_route2', 'hm05_flash', 'got_hm05'],
    ['route16_fly_girl', 'hm02_fly', 'got_hm02'],
    ['safari_secret_house', 'hm03_surf', 'got_hm03'],
    ['fishing_guru_vermilion', 'old_rod', 'got_old_rod'],
    ['fishing_guru_route12', 'good_rod', 'got_good_rod'],
    ['fishing_guru_fuchsia', 'super_rod', 'got_super_rod'],
    ['bill', 'ss_ticket', 'bill_helped'],
  ])('%s grants %s and sets %s exactly once', (id, item, flag) => {
    const state = new PlayerState();
    const gift = claim(id, state);
    expect(gift.onComplete).toBeDefined();
    gift.onComplete!(state);
    expect(state.hasItem(item)).toBe(true);
    expect(state.storyFlags[flag]).toBe(true);
    expect(isGift(GIFT_NPCS[id].resolve(state))).toBe(false);

    // The flag alone (e.g. item later tossed/used) is enough to prevent a regrant.
    const flagged = new PlayerState();
    flagged.storyFlags[flag] = true;
    expect(isGift(GIFT_NPCS[id].resolve(flagged))).toBe(false);
  });

  it('Charmander guy gives Charmander Lv10 unconditionally, once', () => {
    const state = new PlayerState();
    const gift = claim('route24_charmander_guy', state);
    expect(gift.grantsPokemon).toEqual({ speciesId: 4, level: 10, cryPitch: 700 });
    gift.onComplete!(state);
    expect(state.storyFlags['got_charmander']).toBe(true);
    expect(isGift(GIFT_NPCS['route24_charmander_guy'].resolve(state))).toBe(false);
  });

  it('Officer Jenny gives Squirtle Lv10 only with the Thunder Badge, once', () => {
    const state = new PlayerState();
    expect(isGift(GIFT_NPCS['vermilion_officer_jenny'].resolve(state))).toBe(false);
    state.badges.push('THUNDER');
    const gift = claim('vermilion_officer_jenny', state);
    expect(gift.grantsPokemon).toEqual({ speciesId: 7, level: 10, cryPitch: 500 });
    gift.onComplete!(state);
    expect(state.storyFlags['got_squirtle']).toBe(true);
    expect(isGift(GIFT_NPCS['vermilion_officer_jenny'].resolve(state))).toBe(false);
  });
  it('museum clerk charges exactly $50, and only with the money in hand', () => {
    const broke = new PlayerState();
    broke.money = 49;
    const refused = claim('museum_ticket_clerk', broke);
    expect(isGift(refused)).toBe(false);
    expect(refused.dialogue.join(' ')).toContain("don't have enough");
    expect(broke.money).toBe(49);

    const state = new PlayerState();
    state.money = 50;
    const gift = claim('museum_ticket_clerk', state);
    gift.onComplete!(state);
    expect(state.money).toBe(0);
    expect(state.storyFlags['museum_2f_ticket']).toBe(true);

    // Paying twice is impossible, and the clerk stops charging.
    const after = claim('museum_ticket_clerk', state);
    expect(isGift(after)).toBe(false);
    expect(after.dialogue.join(' ')).toContain('enjoy');
    expect(state.money).toBe(0);
  });

  it('the flag the clerk sets is the one the museum 2F entry gate reads', () => {
    const gate = ALL_MAPS['pewter_museum_2f'].entryGates![0];
    const state = new PlayerState();
    state.money = 50;
    claim('museum_ticket_clerk', state).onComplete!(state);
    expect(gate.requires.flag).toBeDefined();
    expect(state.storyFlags[gate.requires.flag!]).toBe(true);
  });

  it('Cerulean girl gives Bulbasaur only to a Pikachu at happiness 150+', () => {
    // No Pikachu at all.
    const none = new PlayerState();
    expect(isGift(GIFT_NPCS['cerulean_bulbasaur_girl'].resolve(none))).toBe(false);

    // A default-happiness Pikachu (70) is not enough, nor is one point short.
    const fresh = new PlayerState();
    fresh.addToParty(mockPokemon({ speciesId: 25 }));
    expect(isGift(GIFT_NPCS['cerulean_bulbasaur_girl'].resolve(fresh))).toBe(false);
    const almost = new PlayerState();
    almost.addToParty(mockPokemon({ speciesId: 25, happiness: 149 }));
    const refused = claim('cerulean_bulbasaur_girl', almost);
    expect(isGift(refused)).toBe(false);
    expect(refused.dialogue.join(' ')).toContain('PIKACHU');

    // Happiness on a non-Pikachu does not count.
    const wrongSpecies = new PlayerState();
    wrongSpecies.addToParty(mockPokemon({ speciesId: 133, happiness: 255 }));
    expect(isGift(GIFT_NPCS['cerulean_bulbasaur_girl'].resolve(wrongSpecies))).toBe(false);

    const state = new PlayerState();
    state.addToParty(mockPokemon({ speciesId: 25, happiness: 150 }));
    const gift = claim('cerulean_bulbasaur_girl', state);
    expect(gift.grantsPokemon).toEqual({ speciesId: 1, level: 10, cryPitch: 600 });
    gift.onComplete!(state);
    expect(state.storyFlags['got_bulbasaur']).toBe(true);
    // Still a happy Pikachu, but the gift is spent.
    expect(isGift(GIFT_NPCS['cerulean_bulbasaur_girl'].resolve(state))).toBe(false);
  });

  it('Silph employee stays silent until the rival on 7F is beaten, then gives Lapras once', () => {
    const state = new PlayerState();
    // Falls through to the NPC's own map dialogue before the rival fight.
    expect(GIFT_NPCS['silph_lapras_employee'].resolve(state)).toBeNull();
    // Beating a different rival elsewhere is not enough.
    state.defeatedTrainers.push('rival_ss_anne');
    expect(GIFT_NPCS['silph_lapras_employee'].resolve(state)).toBeNull();

    state.defeatedTrainers.push('rival_silph');
    const gift = claim('silph_lapras_employee', state);
    expect(gift.grantsPokemon).toEqual({ speciesId: 131, level: 15, cryPitch: 400 });
    gift.onComplete!(state);
    expect(state.storyFlags['got_lapras']).toBe(true);
    const after = claim('silph_lapras_employee', state);
    expect(isGift(after)).toBe(false);
    expect(after.dialogue.join(' ')).toContain('LAPRAS');
  });

  it('every gift NPC has an individual pin in this file', () => {
    // Mirrors the cases above; a new GIFT_NPCS entry must be pinned here too.
    const PINNED = [
      'bike_shop_owner', 'bill', 'celadon_tea_lady', 'cerulean_bulbasaur_girl',
      'fan_club_chairman', 'fishing_guru_fuchsia', 'fishing_guru_route12',
      'fishing_guru_vermilion', 'mr_fuji', 'museum_ticket_clerk', 'oaks_aide_route2',
      'route16_fly_girl', 'route24_charmander_guy', 'safari_secret_house',
      'safari_warden', 'silph_lapras_employee', 'silph_president', 'ss_anne_captain',
      'vermilion_officer_jenny',
    ];
    expect(Object.keys(GIFT_NPCS).sort()).toEqual(PINNED);
  });
});
