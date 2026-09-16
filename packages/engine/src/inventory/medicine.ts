import { ITEMS } from '../data/items';
import { PokemonInstance, StatusCondition } from '../types/pokemon.types';
import { isReviveItem, reviveHp } from '../logic/reviveItems';
/** Returns false without mutation when the medicine cannot affect its target. */
export function applyMedicine(p: PokemonInstance, itemId: string): boolean {
  const item = ITEMS[itemId];
  if (!item || item.category !== 'medicine') return false;
  if (isReviveItem(itemId)) {
    if (p.currentHp > 0) return false;
    p.currentHp = reviveHp(itemId, p.stats.hp)!;
    return true;
  }
  if (p.currentHp <= 0) return false;
  const status = itemId === 'full_restore' ? 'cure_all' : item.effect;
  const cures: Record<string, StatusCondition> = {
    cure_poison: StatusCondition.POISON,
    cure_burn: StatusCondition.BURN,
    cure_freeze: StatusCondition.FREEZE,
    cure_sleep: StatusCondition.SLEEP,
    cure_paralysis: StatusCondition.PARALYSIS,
  };
  const canCure =
    p.status !== StatusCondition.NONE &&
    (status === 'cure_all' || cures[status ?? ''] === p.status);
  const canHeal = !!item.healAmount && p.currentHp < p.stats.hp;
  if (!canCure && !canHeal) return false;
  if (canCure) p.status = StatusCondition.NONE;
  if (canHeal) p.currentHp = Math.min(p.stats.hp, p.currentHp + item.healAmount!);
  return true;
}
