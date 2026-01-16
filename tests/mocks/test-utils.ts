/**
 * テスト用ユーティリティ
 * KeystoneCore のテストで使用する共通ヘルパー関数
 */

import {
  Player as MockPlayer,
  Entity as MockEntity,
  system,
  world,
  resetMocks,
  Vector3,
  ItemStack,
  Block,
  Dimension,
  GameMode,
  Direction,
  EntityDamageCause,
  BlockPermutation,
  type PlayerJoinAfterEvent,
  type PlayerLeaveAfterEvent,
  type PlayerSpawnAfterEvent,
  type ItemUseAfterEvent,
  type EntityHurtAfterEvent,
  type ChatSendAfterEvent,
  type BlockBreakAfterEvent,
  type BlockPlaceAfterEvent,
  type EntityDieAfterEvent,
  type PlayerBreakBlockBeforeEvent,
  type PlayerPlaceBlockBeforeEvent,
  type ChatSendBeforeEvent,
  type ItemUseBeforeEvent,
} from './minecraft-server';
import type { Player, Entity } from '@minecraft/server';
import { vi } from 'vitest';

// ============================
// プレイヤー関連
// ============================

/**
 * テストプレイヤーを作成
 */
export function createTestPlayer(name = 'TestPlayer', id = 'test-player-id'): Player {
  return new MockPlayer(name, id) as unknown as Player;
}

/**
 * 複数のテストプレイヤーを作成
 */
export function createTestPlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, i) => new MockPlayer(`Player${i + 1}`, `player-${i + 1}`) as unknown as Player);
}

/**
 * ワールドにプレイヤーを追加
 */
export function addPlayerToWorld(player: Player): void {
  world.__addPlayer(player as unknown as MockPlayer);
}

/**
 * ワールドからプレイヤーを削除
 */
export function removePlayerFromWorld(player: Player): void {
  world.__removePlayer(player as unknown as MockPlayer);
}

/**
 * プレイヤーを特定の位置に配置
 */
export function setPlayerPosition(player: Player, location: Vector3): void {
  (player as unknown as MockPlayer).__setLocation(location);
}

/**
 * プレイヤーのゲームモードを設定
 */
export function setPlayerGameMode(player: Player, gameMode: GameMode): void {
  (player as unknown as MockPlayer).__setGameMode(gameMode);
}

// ============================
// エンティティ関連
// ============================

/**
 * テストエンティティを作成
 */
export function createTestEntity(typeId = 'minecraft:zombie', id?: string): Entity {
  return new MockEntity(typeId, id) as unknown as Entity;
}

/**
 * エンティティを特定の位置に配置
 */
export function setEntityPosition(entity: Entity, location: Vector3): void {
  (entity as unknown as MockEntity).__setLocation(location);
}

/**
 * ディメンションにエンティティを追加
 */
export function addEntityToDimension(entity: Entity, dimension?: Dimension): void {
  const dim = dimension ?? world.getDimension('minecraft:overworld');
  dim.__addEntity(entity as unknown as MockEntity);
}

// ============================
// アイテム関連
// ============================

/**
 * テストアイテムスタックを作成
 */
export function createTestItemStack(typeId = 'minecraft:diamond', amount = 1): ItemStack {
  return new ItemStack(typeId, amount);
}

/**
 * 名前付きアイテムスタックを作成
 */
export function createNamedItemStack(typeId: string, name: string, lore?: string[]): ItemStack {
  const item = new ItemStack(typeId);
  item.nameTag = name;
  if (lore) {
    item.setLore(lore);
  }
  return item;
}

// ============================
// ブロック関連
// ============================

/**
 * テストブロックを作成
 */
export function createTestBlock(
  location: Vector3,
  typeId = 'minecraft:stone',
  dimension?: Dimension
): Block {
  const dim = dimension ?? world.getDimension('minecraft:overworld');
  return dim.__setBlock(location, typeId);
}

/**
 * ブロックパーミュテーションを作成
 */
export function createBlockPermutation(
  typeId: string,
  states?: Record<string, boolean | number | string>
): BlockPermutation {
  return BlockPermutation.resolve(typeId, states);
}

// ============================
// タイマー関連
// ============================

/**
 * システムタイマーをシミュレート
 * 指定したtick数だけ時間を進める
 */
export function tickSystem(ticks = 1): void {
  system.__tickAll(ticks);
}

/**
 * 1 tick だけ進める
 */
export function tick(): void {
  system.__tick();
}

/**
 * 現在のシステムtickを取得
 */
export function getCurrentTick(): number {
  return system.__getCurrentTick();
}

/**
 * 指定した条件が満たされるまでtickを進める
 */
export function tickUntil(condition: () => boolean, maxTicks = 100): boolean {
  for (let i = 0; i < maxTicks; i++) {
    if (condition()) return true;
    system.__tick();
  }
  return false;
}

/**
 * 非同期でtickを進める（Promise対応のテスト用）
 */
export async function tickAsync(ticks = 1): Promise<void> {
  for (let i = 0; i < ticks; i++) {
    system.__tick();
    await Promise.resolve();
  }
}

// ============================
// イベント関連
// ============================

/**
 * イベントをディスパッチ（汎用）
 */
export function dispatchEvent(eventType: 'after' | 'before', eventName: string, eventData: any = {}): void {
  const events = eventType === 'after' ? world.afterEvents : world.beforeEvents;
  const eventObj = (events as any)[eventName];

  if (eventObj && typeof eventObj.__dispatch === 'function') {
    eventObj.__dispatch(eventData);
  }
}

/**
 * プレイヤー参加イベントをディスパッチ
 */
export function dispatchPlayerJoinEvent(player: Player): void {
  const event: PlayerJoinAfterEvent = {
    player,
    playerId: player.id,
  };
  world.afterEvents.playerJoin.__dispatch(event);
}

/**
 * プレイヤー退出イベントをディスパッチ
 */
export function dispatchPlayerLeaveEvent(player: Player): void {
  const event: PlayerLeaveAfterEvent = {
    playerName: player.name,
    playerId: player.id,
  };
  world.afterEvents.playerLeave.__dispatch(event);
}

/**
 * プレイヤースポーンイベントをディスパッチ
 */
export function dispatchPlayerSpawnEvent(player: Player, initialSpawn = false): void {
  const event: PlayerSpawnAfterEvent = {
    player,
    initialSpawn,
  };
  world.afterEvents.playerSpawn.__dispatch(event);
}

/**
 * アイテム使用イベントをディスパッチ
 */
export function dispatchItemUseEvent(player: Player, itemStack: ItemStack): void {
  const event: ItemUseAfterEvent = {
    itemStack,
    source: player,
  };
  world.afterEvents.itemUse.__dispatch(event);
}

/**
 * アイテム使用前イベントをディスパッチ（キャンセル可能）
 */
export function dispatchItemUseBeforeEvent(
  player: Player,
  itemStack: ItemStack
): ItemUseBeforeEvent {
  const event: ItemUseBeforeEvent = {
    itemStack,
    source: player,
    cancel: false,
  };
  world.beforeEvents.itemUse.__dispatch(event);
  return event;
}

/**
 * チャット送信イベントをディスパッチ
 */
export function dispatchChatSendEvent(player: Player, message: string): void {
  const event: ChatSendAfterEvent = {
    message,
    sender: player,
  };
  world.afterEvents.chatSend.__dispatch(event);
}

/**
 * チャット送信前イベントをディスパッチ（キャンセル可能）
 */
export function dispatchChatSendBeforeEvent(
  player: Player,
  message: string
): ChatSendBeforeEvent {
  const event: ChatSendBeforeEvent = {
    message,
    sender: player,
    cancel: false,
  };
  world.beforeEvents.chatSend.__dispatch(event);
  return event;
}

/**
 * エンティティダメージイベントをディスパッチ
 */
export function dispatchEntityHurtEvent(
  entity: Entity,
  damage: number,
  cause: EntityDamageCause = EntityDamageCause.entityAttack,
  attacker?: Entity
): void {
  const event: EntityHurtAfterEvent = {
    hurtEntity: entity,
    damage,
    damageSource: {
      cause,
      damagingEntity: attacker,
    },
  };
  world.afterEvents.entityHurt.__dispatch(event);
}

/**
 * エンティティ死亡イベントをディスパッチ
 */
export function dispatchEntityDieEvent(
  entity: Entity,
  cause: EntityDamageCause = EntityDamageCause.entityAttack,
  killer?: Entity
): void {
  const event: EntityDieAfterEvent = {
    deadEntity: entity,
    damageSource: {
      cause,
      damagingEntity: killer,
    },
  };
  world.afterEvents.entityDie.__dispatch(event);
}

/**
 * ブロック破壊イベントをディスパッチ
 */
export function dispatchBlockBreakEvent(
  block: Block,
  player?: Player,
  permutation?: BlockPermutation
): void {
  const event: BlockBreakAfterEvent = {
    block,
    brokenBlockPermutation: permutation ?? new BlockPermutation(block.typeId),
    dimension: block.dimension,
    player,
  };
  world.afterEvents.blockBreak.__dispatch(event);
}

/**
 * ブロック破壊前イベントをディスパッチ（キャンセル可能）
 */
export function dispatchPlayerBreakBlockBeforeEvent(
  player: Player,
  block: Block,
  itemStack?: ItemStack
): PlayerBreakBlockBeforeEvent {
  const event: PlayerBreakBlockBeforeEvent = {
    player,
    block,
    dimension: block.dimension,
    itemStack,
    cancel: false,
  };
  world.beforeEvents.playerBreakBlock.__dispatch(event);
  return event;
}

/**
 * ブロック設置イベントをディスパッチ
 */
export function dispatchBlockPlaceEvent(block: Block, player?: Player): void {
  const event: BlockPlaceAfterEvent = {
    block,
    dimension: block.dimension,
    player,
  };
  world.afterEvents.blockPlace.__dispatch(event);
}

/**
 * ブロック設置前イベントをディスパッチ（キャンセル可能）
 */
export function dispatchPlayerPlaceBlockBeforeEvent(
  player: Player,
  block: Block,
  face: Direction = Direction.Up,
  faceLocation: Vector3 = { x: 0.5, y: 1, z: 0.5 }
): PlayerPlaceBlockBeforeEvent {
  const event: PlayerPlaceBlockBeforeEvent = {
    player,
    block,
    dimension: block.dimension,
    face,
    faceLocation,
    cancel: false,
  };
  world.beforeEvents.playerPlaceBlock.__dispatch(event);
  return event;
}

// ============================
// モック管理
// ============================

/**
 * すべてのモックをリセット
 */
export function resetAllMocks(): void {
  resetMocks();
}

/**
 * 特定の関数のモック呼び出しをクリア
 */
export function clearMockCalls(...mocks: { mockClear: () => void }[]): void {
  mocks.forEach((mock) => mock.mockClear());
}

// ============================
// アサーション ヘルパー
// ============================

/**
 * Vector3 の値が等しいかチェック
 */
export function expectVector3Equal(
  actual: { x: number; y: number; z: number },
  expected: { x: number; y: number; z: number },
  epsilon = 0.0001
): void {
  expect(Math.abs(actual.x - expected.x)).toBeLessThan(epsilon);
  expect(Math.abs(actual.y - expected.y)).toBeLessThan(epsilon);
  expect(Math.abs(actual.z - expected.z)).toBeLessThan(epsilon);
}

/**
 * Vector3 が近似的に等しいかチェック
 */
export function isVector3Near(
  a: Vector3,
  b: Vector3,
  epsilon = 0.0001
): boolean {
  return (
    Math.abs(a.x - b.x) < epsilon &&
    Math.abs(a.y - b.y) < epsilon &&
    Math.abs(a.z - b.z) < epsilon
  );
}

/**
 * モック関数が特定の引数で呼ばれたかチェック
 */
export function expectCalledWithMessage(
  mockFn: { mock: { calls: any[][] } },
  expectedMessage: string
): void {
  const calls = mockFn.mock.calls;
  const found = calls.some((call) =>
    call.some((arg) => typeof arg === 'string' && arg.includes(expectedMessage))
  );
  expect(found).toBe(true);
}

/**
 * イベントハンドラが正しく登録されたかチェック
 */
export function expectEventSubscribed(
  eventSignal: { subscribe: { mock: { calls: any[][] } } }
): void {
  expect(eventSignal.subscribe.mock.calls.length).toBeGreaterThan(0);
}

/**
 * プレイヤーにメッセージが送信されたかチェック
 */
export function expectPlayerMessageSent(player: Player, message?: string): void {
  expect(player.sendMessage).toHaveBeenCalled();
  if (message) {
    expect(player.sendMessage).toHaveBeenCalledWith(
      expect.stringContaining(message)
    );
  }
}

/**
 * ワールドにメッセージが送信されたかチェック
 */
export function expectWorldMessageSent(message?: string): void {
  expect(world.sendMessage).toHaveBeenCalled();
  if (message) {
    expect(world.sendMessage).toHaveBeenCalledWith(
      expect.stringContaining(message)
    );
  }
}

// ============================
// ディメンション関連
// ============================

/**
 * オーバーワールドを取得
 */
export function getOverworld(): Dimension {
  return world.getDimension('minecraft:overworld');
}

/**
 * ネザーを取得
 */
export function getNether(): Dimension {
  return world.getDimension('minecraft:nether');
}

/**
 * エンドを取得
 */
export function getTheEnd(): Dimension {
  return world.getDimension('minecraft:the_end');
}

// ============================
// スコアボード関連
// ============================

/**
 * スコアボードオブジェクティブを作成
 */
export function createScoreboardObjective(id: string, displayName?: string) {
  return world.scoreboard.addObjective(id, displayName);
}

/**
 * スコアボードをクリア
 */
export function clearScoreboard(): void {
  world.scoreboard.__clear();
}

// ============================
// コンソール出力キャプチャ
// ============================

/**
 * console.log の出力をキャプチャ
 */
export function captureConsoleLogs(): { logs: string[]; restore: () => void } {
  const logs: string[] = [];
  const originalLog = console.log;

  console.log = (...args: any[]) => {
    logs.push(args.map(String).join(' '));
  };

  return {
    logs,
    restore: () => {
      console.log = originalLog;
    },
  };
}

/**
 * console.warn の出力をキャプチャ
 */
export function captureConsoleWarns(): { warns: string[]; restore: () => void } {
  const warns: string[] = [];
  const originalWarn = console.warn;

  console.warn = (...args: any[]) => {
    warns.push(args.map(String).join(' '));
  };

  return {
    warns,
    restore: () => {
      console.warn = originalWarn;
    },
  };
}

/**
 * console.error の出力をキャプチャ
 */
export function captureConsoleErrors(): { errors: string[]; restore: () => void } {
  const errors: string[] = [];
  const originalError = console.error;

  console.error = (...args: any[]) => {
    errors.push(args.map(String).join(' '));
  };

  return {
    errors,
    restore: () => {
      console.error = originalError;
    },
  };
}

// ============================
// 再エクスポート
// ============================

export {
  MockPlayer,
  MockEntity,
  ItemStack,
  Block,
  Dimension,
  GameMode,
  Direction,
  EntityDamageCause,
  BlockPermutation,
  Vector3,
  world,
  system,
};

export type { Player, Entity };
