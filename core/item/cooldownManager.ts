import { Player, ItemStack } from '@minecraft/server';

class CooldownManager {
  private data = new Map<string, number>(); // key = playerId:itemTag → timestamp

  private makeKey(player: Player, item: ItemStack) {
    const tag = item.getLore()[0] ?? '';
    return `${player.id}:${tag}`;
  }

  isCooling(player: Player, item: ItemStack, cd: number): boolean {
    const key = this.makeKey(player, item);
    const now = Date.now();

    if (!this.data.has(key)) return false;

    const last = this.data.get(key)!;
    return (now - last) < cd;
  }

  start(player: Player, item: ItemStack) {
    const key = this.makeKey(player, item);
    this.data.set(key, Date.now());
  }
}

export const cooldowns = new CooldownManager();
