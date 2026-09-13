import { describe, it, expect } from 'vitest';
import { GIFT_NPCS, GiftNpcResult } from '../../src/data/giftNpcs';
import { PlayerState } from '../../src/entities/Player';

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
});
