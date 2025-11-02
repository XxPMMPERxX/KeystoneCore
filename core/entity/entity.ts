import { EntitySpawnAfterEvent, PlayerSpawnAfterEvent, world } from "@minecraft/server";
import { Vector3 } from "../math/vector3";

enum KeystoneEntityFlags {
  FREEZE = 'keystone:freeze'
}

enum KeystoneEntityProperties {
  LAST_POSITION = 'keystone:last_position',
}

// 初期化
world.afterEvents.entitySpawn.subscribe((event: EntitySpawnAfterEvent) => {
  const entity = event.entity;
  entity.setDynamicProperty(KeystoneEntityFlags.FREEZE, entity.getDynamicProperty(KeystoneEntityFlags.FREEZE) ?? false);
  entity.setDynamicProperty(KeystoneEntityProperties.LAST_POSITION, entity.getDynamicProperty(KeystoneEntityProperties.LAST_POSITION) ?? Vector3.zero());
});
world.afterEvents.playerSpawn.subscribe((event: PlayerSpawnAfterEvent) => {
  if (!event.initialSpawn) return;
  const player = event.player;
  player.setDynamicProperty(KeystoneEntityFlags.FREEZE, player.getDynamicProperty(KeystoneEntityFlags.FREEZE) ?? false);
  player.setDynamicProperty(KeystoneEntityProperties.LAST_POSITION, player.getDynamicProperty(KeystoneEntityProperties.LAST_POSITION) ?? Vector3.zero());
});
