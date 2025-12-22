import { Vector3 as _Vector3 } from '@minecraft/server';

export class Vector3 {
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * ゼロベクトルで生成
   * @return {Vector3}
   */
  static zero(): Vector3 {
    return new Vector3(0, 0, 0);
  }

  /**
   * {x, y, z} オブジェクトから生成
   * @param pos 
   * @returns {Vector3}
   */
  static fromBDS(pos: _Vector3): Vector3 {
    return new Vector3(pos.x, pos.y, pos.z);
  }

  /**
   * x
   * @returns {number}
   */
  getX(): number { 
    return this.x;
  }

  /**
   * y
   * @returns {number}
   */
  getY(): number {
    return this.y;
  }

  /**
   * z
   * @returns {number}
   */
  getZ(): number {
    return this.z;
  }

  /**
   * x (整数値)
   * @returns {number}
   */
  getFloorX(): number {
    return Math.floor(this.x);
  }

  /**
   * y (整数値)
   * @returns {number}
   */
  getFloorY(): number {
    return Math.floor(this.y);
  }

  /**
   * z (整数値)
   * @returns {number}
   */
  getFloorZ(): number {
    return Math.floor(this.z);
  }

  /**
   * 加算
   * @param x 
   * @param y 
   * @param z 
   * @return {Vector3}
   */
  add(x: number, y: number, z: number): Vector3 {
    return new Vector3(
      this.x + x,
      this.y + y,
      this.z + z
    );
  }

  /**
   * ベクトル単位での加算
   * @param v 
   * @returns {Vector3}
   */
  addVector(v: _Vector3): Vector3 {
    return this.add(v.x, v.y, v.z);
  }

  /**
   * 減算
   * @param x
   * @param y
   * @param z
   * @return {Vector3}
   */
  subtract(x: number, y: number, z: number): Vector3 {
    return this.add(-x, -y, -z);
  }

  /**
   * ベクトル単位での減算
   * @param v
   * @return {Vector3}
   */
  subtractVector(v: _Vector3): Vector3 {
    return this.add(-v.x, -v.y, -v.z);
  }

  /**
   * 乗算
   * @param value
   * @return {Vector3}
   */
  multiply(value: number): Vector3 {
    return new Vector3(
      this.x * value,
      this.y * value,
      this.z * value
    );
  }

  /**
   * 除算
   * @param value
   * @return {Vector3}
   */
  divide(value: number): Vector3 {
    return new Vector3(
      this.x / value,
      this.y / value,
      this.z / value
    );
  }

  /**
   * ベクトルの内部数値小数点切り上げ
   * @return {Vector3}
   */
  ceil(): Vector3 {
    return new Vector3(
      Math.ceil(this.x),
      Math.ceil(this.y),
      Math.ceil(this.z)
    );
  }

  /**
   * ベクトルの内部数値小数点切り捨て
   * @return {Vector3}
   */
  floor(): Vector3 {
    return new Vector3(
      Math.floor(this.x),
      Math.floor(this.y),
      Math.floor(this.z)
    );
  }

  /**
   * ベクトルの内部数値小数点四捨五入
   * @param precision
   * @return {Vector3}
   */
  round(precision: number = 0): Vector3 {
    const factor = Math.pow(10, precision);
    return new Vector3(
      Math.round(this.x * factor) / factor,
      Math.round(this.y * factor) / factor,
      Math.round(this.z * factor) / factor
    );
  }

  /**
   * ベクトルの内部数値の絶対値
   * @return {Vector3}
   */
  abs(): Vector3 {
    return new Vector3(
      Math.abs(this.x),
      Math.abs(this.y),
      Math.abs(this.z)
    );
  }

  /**
   * 指定した2点間のユークリッド距離
   * @param pos 
   * @return {number}
   */
  distance(pos: _Vector3): number {
    return Math.sqrt(this.distanceSquared(pos));
  }

  /**
   * 指定した2点間のユークリッド距離の2乗
   * @param pos 
   * @return {number}
   */
  distanceSquared(pos: _Vector3): number {
    const dx = this.x - pos.x;
    const dy = this.y - pos.y;
    const dz = this.z - pos.z;
    return dx * dx + dy * dy + dz * dz;
  }

  /**
   * 内積
   * @param pos 
   * @return {number}
   */
  dot(pos: _Vector3): number {
    return this.x * pos.x + this.y * pos.y + this.z * pos.z;
  }

  /**
   * 外積
   * @param pos 
   * @return {Vector3}
   */
  cross(pos: _Vector3): Vector3 {
    return new Vector3(
      this.y * pos.z - this.z * pos.y,
      this.z * pos.x - this.x * pos.z,
      this.x * pos.y - this.y * pos.x
    );
  }

  /**
   * ベクトルの比較
   * @param pos 
   * @return {boolean}
   */
  equals(pos: _Vector3): boolean {
    return this.x === pos.x && this.y === pos.y && this.z === pos.z;
  }

  /**
   * ベクトルの長さ
   * @return {number}
   */
  length(): number {
    return Math.sqrt(this.lengthSquared());
  }

  /**
   * ベクトルの長さの2乗
   * @return {number}
   */
  lengthSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  /**
   * 正規化
   * @return {Vector3}
   */
  normalize(): Vector3 {
    const len = this.length();
    if (len > 0) {
      return this.divide(len);
    }
    return new Vector3(0, 0, 0);
  }

  /**
   * オブジェクトの数値指定再生成
   * @param x 
   * @param y 
   * @param z 
   * @return {Vector3}
   */
  withComponents(x?: number, y?: number, z?: number): Vector3 {
    return new Vector3(
      x !== undefined ? x : this.x,
      y !== undefined ? y : this.y,
      z !== undefined ? z : this.z
    );
  }

    /**
   * X座標をxValueにしたとき線分上に存在する点を返す
   * @param end 終点
   * @param xValue 途中点のX値
   * @returns {Vector3|undefined}
   */
  getIntermediateWithXValue(end: Vector3, xValue: number): Vector3 | undefined {
    const dx = end.x - this.x;
    if (dx === 0) return;

    const t = (xValue - this.x) / dx;
    if (t < 0 || t > 1) return;

    return new Vector3(
      this.x + dx * t,
      this.y + (end.y - this.y) * t,
      this.z + (end.z - this.z) * t
    );
  }

  /**
   * Y座標をyValueにしたとき線分上に存在する点を返す
   * @param end 終点
   * @param yValue 途中点のY値
   * @returns {Vector3|undefined}
   */
  getIntermediateWithYValue(end: Vector3, yValue: number): Vector3 | undefined {
    const dy = end.y - this.y;
    if (dy === 0) return;

    const t = (yValue - this.y) / dy;
    if (t < 0 || t > 1) return;

    return new Vector3(
      this.x + (end.x - this.x) * t,
      this.y + dy * t,
      this.z + (end.z - this.z) * t
    );
  }

  /**
   * Z座標をzValueにしたとき線分上に存在する点を返す
   * @param end 終点
   * @param zValue 途中点のZ値
   * @returns {Vector3|undefined}
   */
  getIntermediateWithZValue(end: Vector3, zValue: number): Vector3 | undefined {
    const dz = end.z - this.z;
    if (dz === 0) return;

    const t = (zValue - this.z) / dz;
    if (t < 0 || t > 1) return;

    return new Vector3(
      this.x + (end.x - this.x) * t,
      this.y + (end.y - this.y) * t,
      this.z + dz * t
    );
  }

  /**
   * BDS ScriptAPIで使える {x, y, z} 形式に変換
   * @returns {_Vector3}
   */
  toBDS(): _Vector3 {
    return { x: this.x, y: this.y, z: this.z };
  }

  /** 
   * オブジェクトに変換
   */
  toObject(): {x: number; y: number; z: number} {
    return { x: this.x, y: this.y, z: this.z };
  }

  /**
   * toString
   * @returns {string}
   */
  toString(): string {
    return `_Vector3(x=${this.x}, y=${this.y}, z=${this.z})`;
  }

  /**
   * 最大点
   * @param vector
   * @param vectors 
   * @returns {Vector3}
   */
  static maxComponents(
    vector: _Vector3,
    ...vectors: _Vector3[]
  ): Vector3 {
    let x = vector.x;
    let y = vector.y;
    let z = vector.z;
    for (const pos of vectors) {
      x = Math.max(x, pos.x);
      y = Math.max(y, pos.y);
      z = Math.max(z, pos.z);
    }
    return new Vector3(x, y, z);
  }

  /**
   * 最小点
   * @param vector
   * @param vectors 
   * @returns {Vector3}
   */
  static minComponents(
    vector: _Vector3,
    ...vectors: _Vector3[]
  ): Vector3 {
    let x = vector.x;
    let y = vector.y;
    let z = vector.z;
    for (const pos of vectors) {
      x = Math.min(x, pos.x);
      y = Math.min(y, pos.y);
      z = Math.min(z, pos.z);
    }
    return new Vector3(x, y, z);
  }

  /**
   * 合計
   * @param vectors
   * @returns {Vector3}
   */
  static sum(...vectors: {x: number; y: number; z: number}[]): Vector3 {
    let x = 0, y = 0, z = 0;
    for (const v of vectors) {
      x += v.x;
      y += v.y;
      z += v.z;
    }
    return new Vector3(x, y, z);
  }
}
