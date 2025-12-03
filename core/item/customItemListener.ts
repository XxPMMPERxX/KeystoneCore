import { ButtonState, InputButton, ItemUseAfterEvent, PlayerSwingStartAfterEvent, world } from '@minecraft/server';
import { customItemRegistry } from './customItemRegistry';


world.afterEvents.itemUse.subscribe(async (event: ItemUseAfterEvent) => {
  const ci = customItemRegistry.getByItemStack(event.itemStack);
  if (!ci) return;
  await ci.onUse(event.source, event.itemStack);
});

world.afterEvents.playerSwingStart.subscribe(async (event: PlayerSwingStartAfterEvent) => {
  const item = event.player.getComponent('inventory')!.container.getItem(event.player.selectedSlotIndex);
  const ci = customItemRegistry.getByItemStack(item);
  if (!ci) return;
  await ci.onArmSwing(event.player, item);
});

world.afterEvents.playerButtonInput.subscribe(async (event) => {
  if (event.button == InputButton.Sneak && event.newButtonState == ButtonState.Pressed) {
    const item = event.player.getComponent('inventory')!.container.getItem(event.player.selectedSlotIndex);
    const ci = customItemRegistry.getByItemStack(item);
    if (!ci) return;
    await ci.onSneaking(event.player, item);
  }
});
