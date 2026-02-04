import { vi } from 'vitest';

/**
 * @minecraft/server のモック
 * KeystoneCore のテスト用モック実装
 */

// ============================
// 型定義・列挙型
// ============================

// Vector3 モック（@minecraft/server の Vector3 型互換）
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Direction 列挙型
export enum Direction {
  Down = 'Down',
  Up = 'Up',
  North = 'North',
  South = 'South',
  West = 'West',
  East = 'East',
}

// GameMode 列挙型
export enum GameMode {
  survival = 'survival',
  creative = 'creative',
  adventure = 'adventure',
  spectator = 'spectator',
}

// EntityDamageCause 列挙型
export enum EntityDamageCause {
  none = 'none',
  anvil = 'anvil',
  blockExplosion = 'blockExplosion',
  charging = 'charging',
  contact = 'contact',
  drowning = 'drowning',
  entityAttack = 'entityAttack',
  entityExplosion = 'entityExplosion',
  fall = 'fall',
  fallingBlock = 'fallingBlock',
  fire = 'fire',
  fireTick = 'fireTick',
  fireworks = 'fireworks',
  flyIntoWall = 'flyIntoWall',
  freezing = 'freezing',
  lava = 'lava',
  lightning = 'lightning',
  magic = 'magic',
  magma = 'magma',
  override = 'override',
  piston = 'piston',
  projectile = 'projectile',
  selfDestruct = 'selfDestruct',
  stalactite = 'stalactite',
  stalagmite = 'stalagmite',
  starve = 'starve',
  suffocation = 'suffocation',
  suicide = 'suicide',
  temperature = 'temperature',
  thorns = 'thorns',
  void = 'void',
  wither = 'wither',
}

// EquipmentSlot 列挙型
export enum EquipmentSlot {
  Head = 'Head',
  Chest = 'Chest',
  Legs = 'Legs',
  Feet = 'Feet',
  Mainhand = 'Mainhand',
  Offhand = 'Offhand',
}

// ItemLockMode 列挙型
export enum ItemLockMode {
  none = 'none',
  inventory = 'inventory',
  slot = 'slot',
}

// EntityDamageSource インターフェース
export interface EntityDamageSource {
  cause: EntityDamageCause;
  damagingEntity?: Entity;
  damagingProjectile?: Entity;
}

// ScoreboardObjectiveDisplayOptions インターフェース
export interface ScoreboardObjectiveDisplayOptions {
  objective: ScoreboardObjective;
  sortOrder?: ObjectiveSortOrder;
}

// ObjectiveSortOrder 列挙型
export enum ObjectiveSortOrder {
  ascending = 0,
  descending = 1,
}

// DisplaySlotId 列挙型
export enum DisplaySlotId {
  BelowName = 'BelowName',
  List = 'List',
  Sidebar = 'Sidebar',
}

// ScriptEventMessageAfterEvent インターフェース
export interface ScriptEventMessageAfterEvent {
  id: string;
  message: string;
  sourceBlock?: Block;
  sourceEntity?: Entity;
  sourceType: ScriptEventSource;
}

// ScriptEventSource 列挙型
export enum ScriptEventSource {
  Block = 'Block',
  Entity = 'Entity',
  NPCDialogue = 'NPCDialogue',
  Server = 'Server',
}

// RawMessage インターフェース
export interface RawMessage {
  rawtext?: RawMessage[];
  score?: RawMessageScore;
  text?: string;
  translate?: string;
  with?: string[] | RawMessage;
}

export interface RawMessageScore {
  name?: string;
  objective?: string;
}

// RawText インターフェース（RawMessage のエイリアス）
export type RawText = RawMessage;

// CommandResult インターフェース
export interface CommandResult {
  successCount: number;
}

// ============================
// Component クラス
// ============================

export class Component {
  readonly typeId: string;

  constructor(typeId: string) {
    this.typeId = typeId;
  }

  isValid(): boolean {
    return true;
  }
}

// EntityComponent
export class EntityComponent extends Component {
  readonly entity?: Entity;

  constructor(typeId: string, entity?: Entity) {
    super(typeId);
    this.entity = entity;
  }
}

// EntityHealthComponent
export class EntityHealthComponent extends EntityComponent {
  private _currentValue = 20;
  private _defaultValue = 20;
  private _effectiveMax = 20;
  private _effectiveMin = 0;

  constructor(entity?: Entity) {
    super('minecraft:health', entity);
  }

  get currentValue(): number {
    return this._currentValue;
  }

  get defaultValue(): number {
    return this._defaultValue;
  }

  get effectiveMax(): number {
    return this._effectiveMax;
  }

  get effectiveMin(): number {
    return this._effectiveMin;
  }

  setCurrentValue = vi.fn((value: number): boolean => {
    this._currentValue = Math.max(this._effectiveMin, Math.min(value, this._effectiveMax));
    return true;
  });

  resetToDefaultValue = vi.fn((): void => {
    this._currentValue = this._defaultValue;
  });

  resetToMaxValue = vi.fn((): void => {
    this._currentValue = this._effectiveMax;
  });

  resetToMinValue = vi.fn((): void => {
    this._currentValue = this._effectiveMin;
  });

  // テスト用ヘルパー
  __setMaxValue(value: number): void {
    this._effectiveMax = value;
  }
}

// EntityInventoryComponent
export class EntityInventoryComponent extends EntityComponent {
  readonly container: Container;
  readonly containerType = 'inventory';
  readonly inventorySize = 36;

  constructor(entity?: Entity) {
    super('minecraft:inventory', entity);
    this.container = new Container(this.inventorySize);
  }
}

// EntityEquippableComponent
export class EntityEquippableComponent extends EntityComponent {
  private equipment = new Map<EquipmentSlot, ItemStack | undefined>();

  constructor(entity?: Entity) {
    super('minecraft:equippable', entity);
  }

  getEquipment = vi.fn((slot: EquipmentSlot): ItemStack | undefined => {
    return this.equipment.get(slot);
  });

  setEquipment = vi.fn((slot: EquipmentSlot, itemStack?: ItemStack): boolean => {
    this.equipment.set(slot, itemStack);
    return true;
  });

  getEquipmentSlot = vi.fn((slot: EquipmentSlot): ContainerSlot => {
    return new ContainerSlot();
  });
}

// ============================
// Container クラス
// ============================

export class Container {
  private items: (ItemStack | undefined)[];
  readonly size: number;

  constructor(size = 27) {
    this.size = size;
    this.items = new Array(size).fill(undefined);
  }

  getItem = vi.fn((slot: number): ItemStack | undefined => {
    if (slot < 0 || slot >= this.size) return undefined;
    return this.items[slot];
  });

  setItem = vi.fn((slot: number, itemStack?: ItemStack): void => {
    if (slot >= 0 && slot < this.size) {
      this.items[slot] = itemStack;
    }
  });

  addItem = vi.fn((itemStack: ItemStack): ItemStack | undefined => {
    for (let i = 0; i < this.size; i++) {
      if (!this.items[i]) {
        this.items[i] = itemStack;
        return undefined;
      }
    }
    return itemStack;
  });

  transferItem = vi.fn((slot: number, toContainer: Container): ItemStack | undefined => {
    const item = this.items[slot];
    if (item) {
      this.items[slot] = undefined;
      return toContainer.addItem(item);
    }
    return undefined;
  });

  swapItems = vi.fn((slot: number, otherSlot: number, otherContainer: Container): void => {
    const temp = this.items[slot];
    this.items[slot] = otherContainer.getItem(otherSlot);
    otherContainer.setItem(otherSlot, temp);
  });

  moveItem = vi.fn((fromSlot: number, toSlot: number, toContainer: Container): void => {
    const item = this.items[fromSlot];
    this.items[fromSlot] = undefined;
    toContainer.setItem(toSlot, item);
  });

  clearAll = vi.fn((): void => {
    this.items.fill(undefined);
  });

  get emptySlotsCount(): number {
    return this.items.filter((item) => !item).length;
  }

  isValid(): boolean {
    return true;
  }

  // テスト用ヘルパー
  __getItems(): (ItemStack | undefined)[] {
    return [...this.items];
  }

  __setItems(items: (ItemStack | undefined)[]): void {
    this.items = items.slice(0, this.size);
  }
}

// ContainerSlot クラス
export class ContainerSlot {
  private _item?: ItemStack;

  getItem = vi.fn((): ItemStack | undefined => this._item);

  setItem = vi.fn((itemStack?: ItemStack): void => {
    this._item = itemStack;
  });

  get hasItem(): boolean {
    return this._item !== undefined;
  }

  get amount(): number {
    return this._item?.amount ?? 0;
  }

  get typeId(): string | undefined {
    return this._item?.typeId;
  }

  isValid(): boolean {
    return true;
  }
}

// ============================
// ItemStack クラス
// ============================

export class ItemStack {
  typeId: string;
  amount: number;
  nameTag?: string;
  private lore: string[] = [];
  private _lockMode: ItemLockMode = ItemLockMode.none;
  private _keepOnDeath = false;
  private components = new Map<string, any>();

  constructor(itemType: string, amount = 1) {
    this.typeId = itemType;
    this.amount = Math.max(1, Math.min(amount, 64));
  }

  get maxAmount(): number {
    return 64;
  }

  get isStackable(): boolean {
    return this.maxAmount > 1;
  }

  get lockMode(): ItemLockMode {
    return this._lockMode;
  }

  set lockMode(mode: ItemLockMode) {
    this._lockMode = mode;
  }

  get keepOnDeath(): boolean {
    return this._keepOnDeath;
  }

  set keepOnDeath(value: boolean) {
    this._keepOnDeath = value;
  }

  getLore = vi.fn((): string[] => [...this.lore]);

  setLore = vi.fn((loreList?: string[]): void => {
    this.lore = loreList ? [...loreList] : [];
  });

  clone = vi.fn((): ItemStack => {
    const cloned = new ItemStack(this.typeId, this.amount);
    cloned.nameTag = this.nameTag;
    cloned.setLore(this.lore);
    cloned.lockMode = this._lockMode;
    cloned.keepOnDeath = this._keepOnDeath;
    return cloned;
  });

  getComponent = vi.fn((componentId: string): any => {
    return this.components.get(componentId);
  });

  hasComponent = vi.fn((componentId: string): boolean => {
    return this.components.has(componentId);
  });

  getComponents = vi.fn((): any[] => {
    return Array.from(this.components.values());
  });

  setCanDestroy = vi.fn((blockIdentifiers?: string[]): void => {});

  setCanPlaceOn = vi.fn((blockIdentifiers?: string[]): void => {});

  isStackableWith = vi.fn((itemStack: ItemStack): boolean => {
    return this.typeId === itemStack.typeId && this.isStackable;
  });

  matches = vi.fn((itemType: string, properties?: Record<string, boolean | number | string>): boolean => {
    return this.typeId === itemType;
  });

  // テスト用ヘルパー
  __setComponent(componentId: string, component: any): void {
    this.components.set(componentId, component);
  }
}

// ============================
// Block クラス
// ============================

export class BlockPermutation {
  private _typeId: string;
  private states: Record<string, boolean | number | string>;

  constructor(typeId: string, states: Record<string, boolean | number | string> = {}) {
    this._typeId = typeId;
    this.states = states;
  }

  get type(): { id: string } {
    return { id: this._typeId };
  }

  getState = vi.fn((stateName: string): boolean | number | string | undefined => {
    return this.states[stateName];
  });

  getAllStates = vi.fn((): Record<string, boolean | number | string> => {
    return { ...this.states };
  });

  withState = vi.fn((name: string, value: boolean | number | string): BlockPermutation => {
    const newStates = { ...this.states, [name]: value };
    return new BlockPermutation(this._typeId, newStates);
  });

  matches = vi.fn((blockType: string, states?: Record<string, boolean | number | string>): boolean => {
    if (this._typeId !== blockType) return false;
    if (states) {
      for (const [key, value] of Object.entries(states)) {
        if (this.states[key] !== value) return false;
      }
    }
    return true;
  });

  static resolve = vi.fn((blockType: string, states?: Record<string, boolean | number | string>): BlockPermutation => {
    return new BlockPermutation(blockType, states);
  });
}

export class Block {
  readonly location: Vector3;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly dimension: Dimension;
  private _permutation: BlockPermutation;
  private _typeId: string;

  constructor(
    dimension: Dimension,
    location: Vector3,
    typeId = 'minecraft:air',
    permutation?: BlockPermutation
  ) {
    this.dimension = dimension;
    this.location = { ...location };
    this.x = location.x;
    this.y = location.y;
    this.z = location.z;
    this._typeId = typeId;
    this._permutation = permutation ?? new BlockPermutation(typeId);
  }

  get typeId(): string {
    return this._typeId;
  }

  get permutation(): BlockPermutation {
    return this._permutation;
  }

  get isAir(): boolean {
    return this._typeId === 'minecraft:air';
  }

  get isLiquid(): boolean {
    return this._typeId === 'minecraft:water' || this._typeId === 'minecraft:lava';
  }

  get isSolid(): boolean {
    return !this.isAir && !this.isLiquid;
  }

  get isValid(): boolean {
    return true;
  }

  setType = vi.fn((blockType: string): void => {
    this._typeId = blockType;
    this._permutation = new BlockPermutation(blockType);
  });

  setPermutation = vi.fn((permutation: BlockPermutation): void => {
    this._permutation = permutation;
    this._typeId = permutation.type.id;
  });

  getComponent = vi.fn((componentId: string): any => {
    return undefined;
  });

  hasComponent = vi.fn((componentId: string): boolean => {
    return false;
  });

  getItemStack = vi.fn((amount = 1, withData = false): ItemStack | undefined => {
    if (this.isAir) return undefined;
    return new ItemStack(this._typeId, amount);
  });

  above = vi.fn((steps = 1): Block | undefined => {
    return this.dimension.getBlock({ x: this.x, y: this.y + steps, z: this.z });
  });

  below = vi.fn((steps = 1): Block | undefined => {
    return this.dimension.getBlock({ x: this.x, y: this.y - steps, z: this.z });
  });

  north = vi.fn((steps = 1): Block | undefined => {
    return this.dimension.getBlock({ x: this.x, y: this.y, z: this.z - steps });
  });

  south = vi.fn((steps = 1): Block | undefined => {
    return this.dimension.getBlock({ x: this.x, y: this.y, z: this.z + steps });
  });

  east = vi.fn((steps = 1): Block | undefined => {
    return this.dimension.getBlock({ x: this.x + steps, y: this.y, z: this.z });
  });

  west = vi.fn((steps = 1): Block | undefined => {
    return this.dimension.getBlock({ x: this.x - steps, y: this.y, z: this.z });
  });

  offset = vi.fn((offset: Vector3): Block | undefined => {
    return this.dimension.getBlock({
      x: this.x + offset.x,
      y: this.y + offset.y,
      z: this.z + offset.z,
    });
  });
}

// ============================
// Entity クラス
// ============================

export class Entity {
  readonly id: string;
  readonly typeId: string;
  nameTag: string;
  private _location: Vector3;
  private _rotation: { x: number; y: number };
  private _velocity: Vector3;
  private _dimension: Dimension;
  private components = new Map<string, EntityComponent>();
  private _isValid = true;
  private tags = new Set<string>();
  private dynamicProperties = new Map<string, boolean | number | string | Vector3 | undefined>();

  constructor(
    typeId = 'minecraft:entity',
    id = `entity-${Math.random().toString(36).substr(2, 9)}`,
    dimension?: Dimension
  ) {
    this.typeId = typeId;
    this.id = id;
    this.nameTag = '';
    this._location = { x: 0, y: 0, z: 0 };
    this._rotation = { x: 0, y: 0 };
    this._velocity = { x: 0, y: 0, z: 0 };
    this._dimension = dimension ?? world.getDimension('overworld');

    // デフォルトコンポーネントを追加
    this.components.set('minecraft:health', new EntityHealthComponent(this));
    this.components.set('minecraft:inventory', new EntityInventoryComponent(this));
    this.components.set('minecraft:equippable', new EntityEquippableComponent(this));
  }

  get location(): Vector3 {
    return { ...this._location };
  }

  get rotation(): { x: number; y: number } {
    return { ...this._rotation };
  }

  get velocity(): Vector3 {
    return { ...this._velocity };
  }

  get dimension(): Dimension {
    return this._dimension;
  }

  isValid(): boolean {
    return this._isValid;
  }

  kill = vi.fn((): boolean => {
    this._isValid = false;
    return true;
  });

  remove = vi.fn((): void => {
    this._isValid = false;
  });

  teleport = vi.fn((location: Vector3, options?: { dimension?: Dimension; rotation?: { x: number; y: number } }): void => {
    this._location = { ...location };
    if (options?.dimension) {
      this._dimension = options.dimension;
    }
    if (options?.rotation) {
      this._rotation = { ...options.rotation };
    }
  });

  getHeadLocation = vi.fn((): Vector3 => {
    return { x: this._location.x, y: this._location.y + 1.62, z: this._location.z };
  });

  getViewDirection = vi.fn((): Vector3 => {
    const pitch = (this._rotation.x * Math.PI) / 180;
    const yaw = (this._rotation.y * Math.PI) / 180;
    return {
      x: -Math.sin(yaw) * Math.cos(pitch),
      y: -Math.sin(pitch),
      z: Math.cos(yaw) * Math.cos(pitch),
    };
  });

  applyImpulse = vi.fn((vector: Vector3): void => {
    this._velocity = {
      x: this._velocity.x + vector.x,
      y: this._velocity.y + vector.y,
      z: this._velocity.z + vector.z,
    };
  });

  applyKnockback = vi.fn((directionX: number, directionZ: number, horizontalStrength: number, verticalStrength: number): void => {
    this._velocity = {
      x: directionX * horizontalStrength,
      y: verticalStrength,
      z: directionZ * horizontalStrength,
    };
  });

  clearVelocity = vi.fn((): void => {
    this._velocity = { x: 0, y: 0, z: 0 };
  });

  runCommand = vi.fn((command: string): CommandResult => {
    return { successCount: 1 };
  });

  runCommandAsync = vi.fn(async (command: string): Promise<CommandResult> => {
    return { successCount: 1 };
  });

  getComponent = vi.fn((componentId: string): EntityComponent | undefined => {
    return this.components.get(componentId);
  });

  hasComponent = vi.fn((componentId: string): boolean => {
    return this.components.has(componentId);
  });

  getComponents = vi.fn((): EntityComponent[] => {
    return Array.from(this.components.values());
  });

  addTag = vi.fn((tag: string): boolean => {
    if (this.tags.has(tag)) return false;
    this.tags.add(tag);
    return true;
  });

  removeTag = vi.fn((tag: string): boolean => {
    return this.tags.delete(tag);
  });

  hasTag = vi.fn((tag: string): boolean => {
    return this.tags.has(tag);
  });

  getTags = vi.fn((): string[] => {
    return Array.from(this.tags);
  });

  setDynamicProperty = vi.fn((identifier: string, value?: boolean | number | string | Vector3): void => {
    this.dynamicProperties.set(identifier, value);
  });

  getDynamicProperty = vi.fn((identifier: string): boolean | number | string | Vector3 | undefined => {
    return this.dynamicProperties.get(identifier);
  });

  getDynamicPropertyIds = vi.fn((): string[] => {
    return Array.from(this.dynamicProperties.keys());
  });

  getDynamicPropertyTotalByteCount = vi.fn((): number => {
    return 0;
  });

  clearDynamicProperties = vi.fn((): void => {
    this.dynamicProperties.clear();
  });

  getBlockFromViewDirection = vi.fn((options?: { includeLiquidBlocks?: boolean; includePassableBlocks?: boolean; maxDistance?: number }): { block: Block; face: Direction; faceLocation: Vector3 } | undefined => {
    return undefined;
  });

  getEntitiesFromViewDirection = vi.fn((options?: { maxDistance?: number }): { entity: Entity; distance: number }[] => {
    return [];
  });

  // テスト用ヘルパー
  __setLocation(location: Vector3): void {
    this._location = { ...location };
  }

  __setRotation(rotation: { x: number; y: number }): void {
    this._rotation = { ...rotation };
  }

  __setVelocity(velocity: Vector3): void {
    this._velocity = { ...velocity };
  }

  __setDimension(dimension: Dimension): void {
    this._dimension = dimension;
  }

  __setValid(valid: boolean): void {
    this._isValid = valid;
  }

  __addComponent(componentId: string, component: EntityComponent): void {
    this.components.set(componentId, component);
  }
}

// ============================
// Player クラス
// ============================

export class Player extends Entity {
  readonly name: string;
  private _gameMode: GameMode = GameMode.survival;
  private _level = 0;
  private _xpEarnedAtCurrentLevel = 0;
  private _totalXpNeededForNextLevel = 10;
  private _selectedSlot = 0;
  private _isSneaking = false;
  private _isSprinting = false;
  private _isFlying = false;
  private _isJumping = false;
  private _isOnGround = true;
  private _isInWater = false;
  private screenDisplay: ScreenDisplay;

  constructor(name = 'TestPlayer', id = 'test-player-id', dimension?: Dimension) {
    super('minecraft:player', id, dimension);
    this.name = name;
    this.nameTag = name;
    this.screenDisplay = new ScreenDisplay(this);
  }

  get gameMode(): GameMode {
    return this._gameMode;
  }

  get level(): number {
    return this._level;
  }

  get xpEarnedAtCurrentLevel(): number {
    return this._xpEarnedAtCurrentLevel;
  }

  get totalXpNeededForNextLevel(): number {
    return this._totalXpNeededForNextLevel;
  }

  get selectedSlot(): number {
    return this._selectedSlot;
  }

  set selectedSlot(slot: number) {
    this._selectedSlot = Math.max(0, Math.min(slot, 8));
  }

  get isSneaking(): boolean {
    return this._isSneaking;
  }

  get isSprinting(): boolean {
    return this._isSprinting;
  }

  get isFlying(): boolean {
    return this._isFlying;
  }

  get isJumping(): boolean {
    return this._isJumping;
  }

  get isOnGround(): boolean {
    return this._isOnGround;
  }

  get isInWater(): boolean {
    return this._isInWater;
  }

  get isOp(): boolean {
    return false;
  }

  sendMessage = vi.fn((message: string | RawMessage | (string | RawMessage)[]): void => {
    // メッセージ送信のモック
  });

  playSound = vi.fn((soundId: string, options?: { location?: Vector3; pitch?: number; volume?: number }): void => {
    // サウンド再生のモック
  });

  addExperience = vi.fn((amount: number): number => {
    this._xpEarnedAtCurrentLevel += amount;
    while (this._xpEarnedAtCurrentLevel >= this._totalXpNeededForNextLevel) {
      this._xpEarnedAtCurrentLevel -= this._totalXpNeededForNextLevel;
      this._level++;
      this._totalXpNeededForNextLevel = (this._level + 1) * 10;
    }
    return this._xpEarnedAtCurrentLevel;
  });

  addLevels = vi.fn((amount: number): number => {
    this._level = Math.max(0, this._level + amount);
    return this._level;
  });

  resetLevel = vi.fn((): void => {
    this._level = 0;
    this._xpEarnedAtCurrentLevel = 0;
    this._totalXpNeededForNextLevel = 10;
  });

  setGameMode = vi.fn((gameMode: GameMode): void => {
    this._gameMode = gameMode;
  });

  getItemCooldown = vi.fn((cooldownCategory: string): number => {
    return 0;
  });

  startItemCooldown = vi.fn((cooldownCategory: string, tickDuration: number): void => {});

  getSpawnPoint = vi.fn((): { dimension: Dimension; x: number; y: number; z: number } | undefined => {
    return undefined;
  });

  setSpawnPoint = vi.fn((spawnPoint?: { dimension: Dimension; x: number; y: number; z: number }): void => {});

  clearSpawnPoint = vi.fn((): void => {});

  onScreenDisplay = {
    ...this.screenDisplay,
  };

  // テスト用ヘルパー
  __setSneaking(value: boolean): void {
    this._isSneaking = value;
  }

  __setSprinting(value: boolean): void {
    this._isSprinting = value;
  }

  __setFlying(value: boolean): void {
    this._isFlying = value;
  }

  __setJumping(value: boolean): void {
    this._isJumping = value;
  }

  __setOnGround(value: boolean): void {
    this._isOnGround = value;
  }

  __setInWater(value: boolean): void {
    this._isInWater = value;
  }

  __setGameMode(mode: GameMode): void {
    this._gameMode = mode;
  }

  __setLevel(level: number): void {
    this._level = level;
  }
}

// ============================
// ScreenDisplay クラス
// ============================

export class ScreenDisplay {
  private player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  setTitle = vi.fn((title: string | RawMessage, options?: { fadeInDuration?: number; stayDuration?: number; fadeOutDuration?: number; subtitle?: string | RawMessage }): void => {});

  updateSubtitle = vi.fn((subtitle: string | RawMessage): void => {});

  setActionBar = vi.fn((text: string | RawMessage): void => {});

  isValid = vi.fn((): boolean => true);
}

// ============================
// Dimension クラス
// ============================

export class Dimension {
  readonly id: string;
  private blocks = new Map<string, Block>();
  private entities: Entity[] = [];

  constructor(id = 'minecraft:overworld') {
    this.id = id;
  }

  private getBlockKey(location: Vector3): string {
    return `${Math.floor(location.x)},${Math.floor(location.y)},${Math.floor(location.z)}`;
  }

  getBlock = vi.fn((location: Vector3): Block | undefined => {
    const key = this.getBlockKey(location);
    if (!this.blocks.has(key)) {
      this.blocks.set(key, new Block(this, { x: Math.floor(location.x), y: Math.floor(location.y), z: Math.floor(location.z) }));
    }
    return this.blocks.get(key);
  });

  setBlockType = vi.fn((location: Vector3, blockType: string): void => {
    const block = this.getBlock(location);
    if (block) {
      block.setType(blockType);
    }
  });

  setBlockPermutation = vi.fn((location: Vector3, permutation: BlockPermutation): void => {
    const block = this.getBlock(location);
    if (block) {
      block.setPermutation(permutation);
    }
  });

  fillBlocks = vi.fn((begin: Vector3, end: Vector3, block: string | BlockPermutation): void => {
    const minX = Math.min(begin.x, end.x);
    const maxX = Math.max(begin.x, end.x);
    const minY = Math.min(begin.y, end.y);
    const maxY = Math.max(begin.y, end.y);
    const minZ = Math.min(begin.z, end.z);
    const maxZ = Math.max(begin.z, end.z);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          if (typeof block === 'string') {
            this.setBlockType({ x, y, z }, block);
          } else {
            this.setBlockPermutation({ x, y, z }, block);
          }
        }
      }
    }
  });

  spawnEntity = vi.fn((identifier: string, location: Vector3): Entity => {
    const entity = new Entity(identifier, undefined, this);
    entity.__setLocation(location);
    this.entities.push(entity);
    return entity;
  });

  spawnItem = vi.fn((itemStack: ItemStack, location: Vector3): Entity => {
    const entity = new Entity('minecraft:item', undefined, this);
    entity.__setLocation(location);
    this.entities.push(entity);
    return entity;
  });

  getEntities = vi.fn((options?: { type?: string; location?: Vector3; maxDistance?: number; closest?: number; tags?: string[]; name?: string }): Entity[] => {
    let filtered = [...this.entities];
    if (options?.type) {
      filtered = filtered.filter((e) => e.typeId === options.type);
    }
    if (options?.name) {
      filtered = filtered.filter((e) => e.nameTag === options.name);
    }
    if (options?.tags) {
      filtered = filtered.filter((e) => options.tags!.every((tag) => e.hasTag(tag)));
    }
    if (options?.location && options.maxDistance !== undefined) {
      filtered = filtered.filter((e) => {
        const dx = e.location.x - options.location!.x;
        const dy = e.location.y - options.location!.y;
        const dz = e.location.z - options.location!.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz) <= options.maxDistance!;
      });
    }
    if (options?.closest !== undefined) {
      filtered = filtered.slice(0, options.closest);
    }
    return filtered;
  });

  getPlayers = vi.fn((options?: { name?: string; tags?: string[]; location?: Vector3; maxDistance?: number }): Player[] => {
    let players = this.entities.filter((e) => e instanceof Player) as Player[];
    if (options?.name) {
      players = players.filter((p) => p.name === options.name);
    }
    if (options?.tags) {
      players = players.filter((p) => options.tags!.every((tag) => p.hasTag(tag)));
    }
    return players;
  });

  runCommand = vi.fn((command: string): CommandResult => {
    return { successCount: 1 };
  });

  runCommandAsync = vi.fn(async (command: string): Promise<CommandResult> => {
    return { successCount: 1 };
  });

  // テスト用ヘルパー
  __setBlock(location: Vector3, typeId: string): Block {
    const block = new Block(this, { x: Math.floor(location.x), y: Math.floor(location.y), z: Math.floor(location.z) }, typeId);
    this.blocks.set(this.getBlockKey(location), block);
    return block;
  }

  __addEntity(entity: Entity): void {
    this.entities.push(entity);
  }

  __clearEntities(): void {
    this.entities = [];
  }

  __clearBlocks(): void {
    this.blocks.clear();
  }
}

// ============================
// Scoreboard クラス
// ============================

export class ScoreboardIdentity {
  readonly displayName: string;
  readonly id: number;
  readonly type: 'Player' | 'Entity' | 'FakePlayer';
  private entity?: Entity;

  constructor(displayName: string, type: 'Player' | 'Entity' | 'FakePlayer' = 'FakePlayer', id?: number, entity?: Entity) {
    this.displayName = displayName;
    this.type = type;
    this.id = id ?? Math.floor(Math.random() * 1000000);
    this.entity = entity;
  }

  getEntity = vi.fn((): Entity | undefined => {
    return this.entity;
  });

  isValid(): boolean {
    return true;
  }
}

export class ScoreboardObjective {
  readonly id: string;
  readonly displayName: string;
  private scores = new Map<string, number>();
  private participants = new Map<string, ScoreboardIdentity>();

  constructor(id: string, displayName = id) {
    this.id = id;
    this.displayName = displayName;
  }

  getScore = vi.fn((participant: Entity | ScoreboardIdentity | string): number | undefined => {
    const key = this.getParticipantKey(participant);
    return this.scores.get(key);
  });

  setScore = vi.fn((participant: Entity | ScoreboardIdentity | string, score: number): void => {
    const key = this.getParticipantKey(participant);
    this.scores.set(key, score);
    if (!this.participants.has(key)) {
      this.participants.set(
        key,
        new ScoreboardIdentity(
          key,
          participant instanceof Player ? 'Player' : participant instanceof Entity ? 'Entity' : 'FakePlayer',
          undefined,
          participant instanceof Entity ? participant : undefined
        )
      );
    }
  });

  addScore = vi.fn((participant: Entity | ScoreboardIdentity | string, scoreToAdd: number): number => {
    const current = this.getScore(participant) ?? 0;
    const newScore = current + scoreToAdd;
    this.setScore(participant, newScore);
    return newScore;
  });

  removeParticipant = vi.fn((participant: Entity | ScoreboardIdentity | string): boolean => {
    const key = this.getParticipantKey(participant);
    const deleted = this.scores.delete(key);
    this.participants.delete(key);
    return deleted;
  });

  getParticipants = vi.fn((): ScoreboardIdentity[] => {
    return Array.from(this.participants.values());
  });

  getScores = vi.fn((): { participant: ScoreboardIdentity; score: number }[] => {
    const result: { participant: ScoreboardIdentity; score: number }[] = [];
    this.participants.forEach((identity, key) => {
      const score = this.scores.get(key);
      if (score !== undefined) {
        result.push({ participant: identity, score });
      }
    });
    return result;
  });

  hasParticipant = vi.fn((participant: Entity | ScoreboardIdentity | string): boolean => {
    const key = this.getParticipantKey(participant);
    return this.scores.has(key);
  });

  isValid(): boolean {
    return true;
  }

  private getParticipantKey(participant: Entity | ScoreboardIdentity | string): string {
    if (typeof participant === 'string') return participant;
    if (participant instanceof ScoreboardIdentity) return participant.displayName;
    return participant.id;
  }

  // テスト用ヘルパー
  __clear(): void {
    this.scores.clear();
    this.participants.clear();
  }
}

export class Scoreboard {
  private objectives = new Map<string, ScoreboardObjective>();

  addObjective = vi.fn((objectiveId: string, displayName?: string): ScoreboardObjective => {
    const objective = new ScoreboardObjective(objectiveId, displayName);
    this.objectives.set(objectiveId, objective);
    return objective;
  });

  removeObjective = vi.fn((objectiveId: string | ScoreboardObjective): boolean => {
    const id = typeof objectiveId === 'string' ? objectiveId : objectiveId.id;
    return this.objectives.delete(id);
  });

  getObjective = vi.fn((objectiveId: string): ScoreboardObjective | undefined => {
    return this.objectives.get(objectiveId);
  });

  getObjectives = vi.fn((): ScoreboardObjective[] => {
    return Array.from(this.objectives.values());
  });

  getObjectiveAtDisplaySlot = vi.fn((displaySlotId: DisplaySlotId): ScoreboardObjectiveDisplayOptions | undefined => {
    return undefined;
  });

  setObjectiveAtDisplaySlot = vi.fn((displaySlotId: DisplaySlotId, objectiveDisplaySetting?: ScoreboardObjectiveDisplayOptions): ScoreboardObjective | undefined => {
    return objectiveDisplaySetting?.objective;
  });

  clearObjectiveAtDisplaySlot = vi.fn((displaySlotId: DisplaySlotId): ScoreboardObjective | undefined => {
    return undefined;
  });

  getParticipants = vi.fn((): ScoreboardIdentity[] => {
    const allParticipants = new Map<string, ScoreboardIdentity>();
    this.objectives.forEach((objective) => {
      objective.getParticipants().forEach((p) => {
        allParticipants.set(p.displayName, p);
      });
    });
    return Array.from(allParticipants.values());
  });

  // テスト用ヘルパー
  __clear(): void {
    this.objectives.clear();
  }
}

// ============================
// イベントシグナル
// ============================

class EventSignal<T = any> {
  private handlers: ((event: T) => void)[] = [];

  subscribe = vi.fn((handler: (event: T) => void) => {
    this.handlers.push(handler);
    return handler;
  });

  unsubscribe = vi.fn((handler: (event: T) => void) => {
    const index = this.handlers.indexOf(handler);
    if (index > -1) {
      this.handlers.splice(index, 1);
    }
  });

  // テスト用: イベントをディスパッチ
  __dispatch(event: T) {
    this.handlers.forEach((handler) => {
      try {
        handler(event);
      } catch (e) {
        // エラーは無視
      }
    });
  }

  // テスト用: ハンドラをクリア
  __clear() {
    this.handlers = [];
    this.subscribe.mockClear();
    this.unsubscribe.mockClear();
  }

  // テスト用: ハンドラの数を取得
  __getHandlerCount(): number {
    return this.handlers.length;
  }
}

// ============================
// イベントインターフェース
// ============================

export interface PlayerJoinAfterEvent {
  player: Player;
  playerId: string;
}

export interface PlayerLeaveAfterEvent {
  playerName: string;
  playerId: string;
}

export interface PlayerSpawnAfterEvent {
  player: Player;
  initialSpawn: boolean;
}

export interface ItemUseAfterEvent {
  itemStack: ItemStack;
  source: Player;
}

export interface ItemUseBeforeEvent {
  itemStack: ItemStack;
  source: Player;
  cancel: boolean;
}

export interface EntityHurtAfterEvent {
  damage: number;
  damageSource: EntityDamageSource;
  hurtEntity: Entity;
}

export interface ChatSendAfterEvent {
  message: string;
  sender: Player;
}

export interface ChatSendBeforeEvent {
  message: string;
  sender: Player;
  cancel: boolean;
}

export interface PlayerBreakBlockBeforeEvent {
  block: Block;
  dimension: Dimension;
  itemStack?: ItemStack;
  player: Player;
  cancel: boolean;
}

export interface PlayerPlaceBlockBeforeEvent {
  block: Block;
  dimension: Dimension;
  face: Direction;
  faceLocation: Vector3;
  player: Player;
  cancel: boolean;
}

export interface BlockBreakAfterEvent {
  block: Block;
  brokenBlockPermutation: BlockPermutation;
  dimension: Dimension;
  player?: Player;
}

export interface BlockPlaceAfterEvent {
  block: Block;
  dimension: Dimension;
  player?: Player;
}

export interface EntityDieAfterEvent {
  damageSource: EntityDamageSource;
  deadEntity: Entity;
}

export interface EntitySpawnAfterEvent {
  cause: 'Spawned' | 'Born' | 'Event' | 'Loaded' | 'Summoned' | 'Unknown';
  entity: Entity;
}

export interface PlayerInteractWithBlockAfterEvent {
  block: Block;
  blockFace: Direction;
  faceLocation: Vector3;
  itemStack?: ItemStack;
  player: Player;
}

export interface PlayerInteractWithEntityAfterEvent {
  itemStack?: ItemStack;
  player: Player;
  target: Entity;
}

export interface ExplosionAfterEvent {
  dimension: Dimension;
  source?: Entity;
  impactedBlocks: Block[];
}

export interface EffectAddAfterEvent {
  effect: { typeId: string; duration: number; amplifier: number };
  entity: Entity;
}

export interface WeatherChangeAfterEvent {
  dimension: string;
  lightning: boolean;
  raining: boolean;
}

// ============================
// World モック
// ============================

class WorldMock {
  private dimensions = new Map<string, Dimension>();
  private _scoreboard = new Scoreboard();
  private dynamicProperties = new Map<string, boolean | number | string | Vector3 | undefined>();
  private players: Player[] = [];

  constructor() {
    this.dimensions.set('minecraft:overworld', new Dimension('minecraft:overworld'));
    this.dimensions.set('minecraft:nether', new Dimension('minecraft:nether'));
    this.dimensions.set('minecraft:the_end', new Dimension('minecraft:the_end'));
  }

  afterEvents = {
    playerJoin: new EventSignal<PlayerJoinAfterEvent>(),
    playerLeave: new EventSignal<PlayerLeaveAfterEvent>(),
    playerSpawn: new EventSignal<PlayerSpawnAfterEvent>(),
    itemUse: new EventSignal<ItemUseAfterEvent>(),
    entityHurt: new EventSignal<EntityHurtAfterEvent>(),
    chatSend: new EventSignal<ChatSendAfterEvent>(),
    blockBreak: new EventSignal<BlockBreakAfterEvent>(),
    blockPlace: new EventSignal<BlockPlaceAfterEvent>(),
    entityDie: new EventSignal<EntityDieAfterEvent>(),
    entitySpawn: new EventSignal<EntitySpawnAfterEvent>(),
    playerInteractWithBlock: new EventSignal<PlayerInteractWithBlockAfterEvent>(),
    playerInteractWithEntity: new EventSignal<PlayerInteractWithEntityAfterEvent>(),
    explosion: new EventSignal<ExplosionAfterEvent>(),
    effectAdd: new EventSignal<EffectAddAfterEvent>(),
    weatherChange: new EventSignal<WeatherChangeAfterEvent>(),
    scriptEventReceive: new EventSignal<ScriptEventMessageAfterEvent>(),
  };

  beforeEvents = {
    playerBreakBlock: new EventSignal<PlayerBreakBlockBeforeEvent>(),
    playerPlaceBlock: new EventSignal<PlayerPlaceBlockBeforeEvent>(),
    itemUse: new EventSignal<ItemUseBeforeEvent>(),
    chatSend: new EventSignal<ChatSendBeforeEvent>(),
  };

  get scoreboard(): Scoreboard {
    return this._scoreboard;
  }

  getDimension = vi.fn((dimensionId: string): Dimension => {
    const dim = this.dimensions.get(dimensionId) ?? this.dimensions.get('minecraft:overworld')!;
    return dim;
  });

  getAllPlayers = vi.fn((): Player[] => {
    return [...this.players];
  });

  getPlayers = vi.fn((options?: { name?: string; tags?: string[] }): Player[] => {
    let filtered = [...this.players];
    if (options?.name) {
      filtered = filtered.filter((p) => p.name === options.name);
    }
    if (options?.tags) {
      filtered = filtered.filter((p) => options.tags!.every((tag) => p.hasTag(tag)));
    }
    return filtered;
  });

  getEntity = vi.fn((id: string): Entity | undefined => {
    for (const dim of this.dimensions.values()) {
      const entities = dim.getEntities();
      const found = entities.find((e) => e.id === id);
      if (found) return found;
    }
    return this.players.find((p) => p.id === id);
  });

  sendMessage = vi.fn((message: string | RawMessage | (string | RawMessage)[]): void => {
    // ワールドメッセージ送信のモック
  });

  playSound = vi.fn((soundId: string, location: Vector3, options?: { pitch?: number; volume?: number }): void => {});

  setDynamicProperty = vi.fn((identifier: string, value?: boolean | number | string | Vector3): void => {
    this.dynamicProperties.set(identifier, value);
  });

  getDynamicProperty = vi.fn((identifier: string): boolean | number | string | Vector3 | undefined => {
    return this.dynamicProperties.get(identifier);
  });

  getDynamicPropertyIds = vi.fn((): string[] => {
    return Array.from(this.dynamicProperties.keys());
  });

  getDynamicPropertyTotalByteCount = vi.fn((): number => {
    return 0;
  });

  clearDynamicProperties = vi.fn((): void => {
    this.dynamicProperties.clear();
  });

  getAbsoluteTime = vi.fn((): number => 0);

  getTimeOfDay = vi.fn((): number => 6000);

  setTimeOfDay = vi.fn((timeOfDay: number): void => {});

  getDay = vi.fn((): number => 0);

  getDefaultSpawnLocation = vi.fn((): Vector3 => ({ x: 0, y: 64, z: 0 }));

  setDefaultSpawnLocation = vi.fn((spawnLocation: Vector3): void => {});

  // テスト用ヘルパー
  __addPlayer(player: Player): void {
    this.players.push(player);
    this.getDimension('minecraft:overworld').__addEntity(player);
  }

  __removePlayer(player: Player): void {
    const index = this.players.indexOf(player);
    if (index > -1) {
      this.players.splice(index, 1);
    }
  }

  __clearPlayers(): void {
    this.players = [];
  }

  __clearAllEvents() {
    Object.values(this.afterEvents).forEach((signal) => signal.__clear());
    Object.values(this.beforeEvents).forEach((signal) => signal.__clear());
  }

  __clearAll() {
    this.__clearAllEvents();
    this.__clearPlayers();
    this._scoreboard.__clear();
    this.dynamicProperties.clear();
    this.dimensions.forEach((dim) => {
      dim.__clearEntities();
      dim.__clearBlocks();
    });
  }
}

// ============================
// System モック
// ============================

class SystemMock {
  private intervalId = 0;
  private timeoutId = 0;
  private intervals = new Map<number, { callback: () => void; tickInterval: number; lastRun: number }>();
  private timeouts = new Map<number, { callback: () => void; targetTick: number }>();
  private currentTick = 0;

  get currentTickValue(): number {
    return this.currentTick;
  }

  runInterval = vi.fn((callback: () => void, tickInterval?: number) => {
    const id = ++this.intervalId;
    this.intervals.set(id, {
      callback,
      tickInterval: tickInterval ?? 1,
      lastRun: this.currentTick,
    });
    return id;
  });

  clearRun = vi.fn((runId: number) => {
    this.intervals.delete(runId);
    this.timeouts.delete(runId);
  });

  runTimeout = vi.fn((callback: () => void, tickDelay?: number) => {
    const id = ++this.timeoutId;
    this.timeouts.set(id, {
      callback,
      targetTick: this.currentTick + (tickDelay ?? 1),
    });
    return id;
  });

  run = vi.fn((callback: () => void) => {
    const id = ++this.timeoutId;
    this.timeouts.set(id, { callback, targetTick: this.currentTick });
    return id;
  });

  runJob = vi.fn((generator: Generator<void, void, void>): number => {
    const id = ++this.timeoutId;
    // 即座に最初のyieldまで実行
    try {
      generator.next();
    } catch (e) {
      // エラーは無視
    }
    return id;
  });

  clearJob = vi.fn((jobId: number): void => {
    // ジョブをクリア
  });

  waitTicks = vi.fn((ticks: number): Promise<void> => {
    return new Promise((resolve) => {
      this.runTimeout(() => resolve(), ticks);
    });
  });

  // テスト用ヘルパー: 1 tick進める
  __tick() {
    this.currentTick++;

    // Intervals を実行
    this.intervals.forEach((interval, id) => {
      if (this.currentTick - interval.lastRun >= interval.tickInterval) {
        interval.lastRun = this.currentTick;
        try {
          interval.callback();
        } catch (e) {
          // エラーは無視
        }
      }
    });

    // Timeouts を実行
    const toDelete: number[] = [];
    this.timeouts.forEach(({ callback, targetTick }, id) => {
      if (this.currentTick >= targetTick) {
        toDelete.push(id);
        try {
          callback();
        } catch (e) {
          // エラーは無視
        }
      }
    });
    toDelete.forEach((id) => this.timeouts.delete(id));
  }

  // テスト用ヘルパー: 指定tick数進める
  __tickAll(ticks = 1) {
    for (let i = 0; i < ticks; i++) {
      this.__tick();
    }
  }

  // テスト用ヘルパー: 現在のtickを取得
  __getCurrentTick() {
    return this.currentTick;
  }

  // テスト用ヘルパー: すべてのタイマーをクリア
  __clearAll() {
    this.intervals.clear();
    this.timeouts.clear();
    this.currentTick = 0;
    this.intervalId = 0;
    this.timeoutId = 0;
    this.runInterval.mockClear();
    this.clearRun.mockClear();
    this.runTimeout.mockClear();
    this.run.mockClear();
    this.runJob.mockClear();
    this.clearJob.mockClear();
  }

  // テスト用ヘルパー: 登録されているインターバルの数を取得
  __getIntervalCount(): number {
    return this.intervals.size;
  }

  // テスト用ヘルパー: 登録されているタイムアウトの数を取得
  __getTimeoutCount(): number {
    return this.timeouts.size;
  }
}

// ============================
// MinecraftDimensionTypes
// ============================

export const MinecraftDimensionTypes = {
  overworld: 'minecraft:overworld',
  nether: 'minecraft:nether',
  theEnd: 'minecraft:the_end',
} as const;

// ============================
// シングルトンインスタンス
// ============================

export const world = new WorldMock();
export const system = new SystemMock();

// ============================
// ヘルパー関数
// ============================

// テスト用ヘルパー: モックをリセット
export function resetMocks() {
  vi.clearAllMocks();
  system.__clearAll();
  world.__clearAll();
}

// エクスポート (EventSignal クラスもテスト用にエクスポート)
export { EventSignal };
