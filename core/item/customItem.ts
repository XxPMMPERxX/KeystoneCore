import { Player, ItemStack } from '@minecraft/server';

export abstract class CustomItem {
  /** 名前 */
  readonly name: string;

  /** TypeId */
  readonly typeId: string;

  constructor(name: string, typeId: string) {
    this.name = name;
    this.typeId = typeId;
  }
  
  async onUse(player: Player, item?: ItemStack) {}
  async onArmSwing(player: Player, item?: ItemStack) {}
  async onSneaking(player: Player, item?: ItemStack) {}

  getCooldown(): number {
    return 0;
  }
}
