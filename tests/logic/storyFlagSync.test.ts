import { describe, it, expect } from 'vitest';
import { syncDerivedStoryFlags } from '../../src/logic/storyFlagSync';
import { PlayerState } from '../../src/entities/Player';

describe('syncDerivedStoryFlags', () => {
  it('does nothing on a fresh state', () => {
    const state = new PlayerState();
    syncDerivedStoryFlags(state);
    expect(state.storyFlags).toEqual({});
  });

  it('sets rival_battle_lab after the lab battle', () => {
    const state = new PlayerState();
    state.defeatedTrainers.push('rival_lab');
    syncDerivedStoryFlags(state);
    expect(state.storyFlags['rival_battle_lab']).toBe(true);
  });

  it('grants the Silph Scope exactly once after beating Giovanni at the Game Corner', () => {
    const state = new PlayerState();
    state.defeatedTrainers.push('giovanni_game_corner');
    syncDerivedStoryFlags(state);
    expect(state.hasItem('silph_scope')).toBe(true);
    expect(state.storyFlags['got_silph_scope']).toBe(true);

    // Re-running (or using the scope) must not grant a second one
    state.useItem('silph_scope');
    syncDerivedStoryFlags(state);
    expect(state.hasItem('silph_scope')).toBe(false);
  });

  it('marks Silph Co complete after beating Giovanni there', () => {
    const state = new PlayerState();
    state.defeatedTrainers.push('giovanni_silph');
    syncDerivedStoryFlags(state);
    expect(state.storyFlags['giovanni_silph']).toBe(true);
    expect(state.storyFlags['silph_co_complete']).toBe(true);
  });

  it('grants TM28 once after the Cerulean rocket', () => {
    const state = new PlayerState();
    state.defeatedTrainers.push('cerulean_rocket');
    syncDerivedStoryFlags(state);
    expect(state.hasItem('tm28_dig')).toBe(true);
    expect(state.storyFlags['got_tm28']).toBe(true);
  });

  it('requires all three tower rockets for tower_rockets_cleared', () => {
    const state = new PlayerState();
    state.defeatedTrainers.push('tower_rocket1', 'tower_rocket2');
    syncDerivedStoryFlags(state);
    expect(state.storyFlags['tower_rockets_cleared']).toBeUndefined();

    state.defeatedTrainers.push('jessie_tower');
    syncDerivedStoryFlags(state);
    expect(state.storyFlags['tower_rockets_cleared']).toBe(true);
  });

  it('opens Saffron when carrying Tea', () => {
    const state = new PlayerState();
    state.addItem('tea');
    syncDerivedStoryFlags(state);
    expect(state.storyFlags['saffron_open']).toBe(true);
  });
});
