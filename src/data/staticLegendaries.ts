/**
 * Static legendary encounters: a legendary standing on the map as an NPC that,
 * when talked to, launches a one-off wild battle.
 *
 * Keyed by the NPC `id` in the map data. One entry drives all four moving
 * parts, so adding a legendary is a single line here plus the map NPC:
 *  - the overworld sprite (`OverworldScene.createNPCs` -> `generateLegendaryNPCSprite`)
 *  - the interaction handler (`OverworldScene.handleStaticLegendary`)
 *  - its `<id>_cleared` story flag, set when the battle LAUNCHES (catching,
 *    knocking it out and running all consume the encounter, as in Gen 1)
 *  - the visibility rule that removes it afterwards (`logic/npcVisibility.ts`)
 */
export interface StaticLegendary {
  /** Pokedex number of the species to spawn. */
  speciesId: number;
  /** Level of the encounter. */
  level: number;
}

export const STATIC_LEGENDARIES: Record<string, StaticLegendary> = {
  articuno_seafoam: { speciesId: 144, level: 50 },
  zapdos_power_plant: { speciesId: 145, level: 50 },
  moltres_victory_road: { speciesId: 146, level: 50 },
  mewtwo: { speciesId: 150, level: 70 },
};

/**
 * Safe lookup by NPC id. A plain `STATIC_LEGENDARIES[id]` would resolve ids
 * like `constructor` or `toString` to an Object.prototype member, so every
 * caller goes through here.
 */
export function getStaticLegendary(id: string): StaticLegendary | undefined {
  return Object.prototype.hasOwnProperty.call(STATIC_LEGENDARIES, id)
    ? STATIC_LEGENDARIES[id]
    : undefined;
}

/** Story flag set once a legendary's encounter has been used up. */
export function legendaryClearedFlag(id: string): string {
  return `${id}_cleared`;
}
