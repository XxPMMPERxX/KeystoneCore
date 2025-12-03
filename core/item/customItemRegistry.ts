import { ItemStack } from '@minecraft/server';
import { CustomItem } from './customItem';

class CustomItemRegistry {
  private items = new Map<string, CustomItem>();

  register(name: string, item: CustomItem) {
    this.items.set(name, item);
  }

  /** CustomItemを生成 */
  createItem(name: string): ItemStack | undefined {
    const ci = this.items.get(name);
    if (!ci) return;

    const stack = new ItemStack(ci.typeId, 1);
    stack.setLore([`CustomItem:${ci.name}`]);
    return stack;
  }

  /** LoreでCustomItemを特定 */
  getByItemStack(item?: ItemStack): CustomItem | undefined {
    if (!item) return;

    const lore = item.getLore();
    if (!lore.length) return;

    const tag = lore[0];
    if (!tag.startsWith('CustomItem:')) return;

    const name = tag.substring('CustomItem:'.length);

    return this.items.get(name);
  }
}

export const customItemRegistry = new CustomItemRegistry();
