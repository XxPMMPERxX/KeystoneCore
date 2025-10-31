import { ItemUseBeforeEvent, Player, PlayerBreakBlockBeforeEvent, PlayerJoinAfterEvent, PlayerLeaveAfterEvent, PlayerPlaceBlockAfterEvent, PlayerSpawnAfterEvent, system, world } from '@minecraft/server';
import { _Vector3 } from '../math/vector3';
import { delegate } from '../utils/delegate';
import { listen } from '../event/event';

export type KeystonePlayer = _Player & Player;

export class PlayerRegistry {
  /**
   * プレイヤーオブジェクトから取得
   * @param {Player} player
   * @returns {KeystonePlayer}
   */
  static fromPlayer(player: Player): KeystonePlayer {
    if (!_Player._players.has(player.id)) {
      throw new Error(`${player.id}のプレイヤーがレジストリに登録されていません`);
    };
    return _Player._players.get(player.id) as KeystonePlayer;
  }

  /**
   * IDから取得
   * @param {string} playerId
   * @returns {KeystonePlayer}
   */
  static fromId(playerId: string): KeystonePlayer {
    if (!_Player._players.has(playerId)) {
      throw new Error(`${playerId}のプレイヤーがレジストリに登録されていません`);
    };
    return _Player._players.get(playerId) as KeystonePlayer;
  }

  /**
   * プレイヤーオブジェクトから存在確認
   * @param {Player} player
   * @returns {boolean}
   */
  static findByPlayer(player: Player): boolean {
    return _Player._players.has(player.id);
  }

  /**
   * IDから存在確認
   * @param {string} playerId
   * @returns {boolean}
   */
  static findById(playerId: string): boolean {
    return _Player._players.has(playerId);
  }
}

/**
 * 拡張機能を備えたPlayerオブジェクト
 */
class _Player {
  static _players: Map<string, KeystonePlayer> = new Map();

  /**
   * 生成
   * @param {Player} player
   */
  static hello(player: Player): void {
    _Player._players.set(player.id, delegate(new _Player(player), player));
  }

  /**
   * 削除
   * @param {string} playerId
   */
  static bye(playerId: string): void {
    _Player._players.delete(playerId);
  }

  public origin: Player;
  public isFreezing: boolean;

  private constructor(player: Player) {
    this.origin = player;
    this.isFreezing = false;
  }

  public setFreeze(freezing: boolean): void {
    this.isFreezing = freezing;
  }
}

// === KeystonePlayerへの登録とキャッシュ削除 ===
const wrappingQueue: Map<string, boolean> = new Map();
world.afterEvents.playerJoin.subscribe((event: PlayerJoinAfterEvent) => {
  if (!wrappingQueue.has(event.playerId)) {
    wrappingQueue.set(event.playerId, true);
  }
});
world.afterEvents.playerSpawn.subscribe((event: PlayerSpawnAfterEvent) => {
  if (event.initialSpawn && wrappingQueue.has(event.player.id)) {
    _Player.hello(event.player);

    wrappingQueue.delete(event.player.id);
  }
});
world.afterEvents.playerLeave.subscribe((event: PlayerLeaveAfterEvent) => {
  _Player.bye(event.playerId);
});

// === Freeze ===
listen(world.beforeEvents.playerBreakBlock, (event: PlayerBreakBlockBeforeEvent) => {
  const player = event.player as KeystonePlayer;
  if (player.isFreezing) event.cancel = true;
});
listen(world.beforeEvents.itemUse, (event: ItemUseBeforeEvent) => {
  const player = event.source as KeystonePlayer;
  if (player.isFreezing) event.cancel = true;
});
system.runInterval(() => {
  for (const player of world.getPlayers()) {
    if (PlayerRegistry.findByPlayer(player)) {
      if (PlayerRegistry.fromPlayer(player).isFreezing) player.teleport(player.location);
    }
  }
}, 5); // 約0.25秒ごと