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
   * @param {_Vector3} pos 
   * @returns 
   */
  static fromBDS(pos: _Vector3): Vector3 {
    return new Vector3(pos.x, pos.y, pos.z);
  }

  // ===== 基本ゲッター =====
  getX(): number { 
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  getZ(): number {
    return this.z;
  }

  getFloorX(): number {
    return Math.floor(this.x);
  }

  getFloorY(): number {
    return Math.floor(this.y);
  }

  getFloorZ(): number {
    return Math.floor(this.z);
  }

  /**
   * 加算
   * @param {number} x 
   * @param {number} y 
   * @param {number} z 
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
   * @param {_Vector3} v 
   * @returns {Vector3}
   */
  addVector(v: _Vector3): Vector3 {
    return this.add(v.x, v.y, v.z);
  }

  /**
   * 減算
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @return {Vector3}
   */
  subtract(x: number, y: number, z: number): Vector3 {
    return this.add(-x, -y, -z);
  }

  /**
   * ベクトル単位での減算
   * @param {_Vector3} v
   * @return {Vector3}
   */
  subtractVector(v: _Vector3): Vector3 {
    return this.add(-v.x, -v.y, -v.z);
  }

  /**
   * 乗算
   * @param {number} value
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
   * @param {number} value
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
   * @param {number} precision
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
   * @param {_Vector3} pos 
   * @return {number}
   */
  distance(pos: _Vector3): number {
    return Math.sqrt(this.distanceSquared(pos));
  }

  /**
   * 指定した2点間のユークリッド距離の2乗
   * @param {_Vector3} pos 
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
   * @param {_Vector3} pos 
   * @return {number}
   */
  dot(pos: _Vector3): number {
    return this.x * pos.x + this.y * pos.y + this.z * pos.z;
  }

  /**
   * 外積
   * @param {_Vector3} pos 
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
   * @param {_Vector3} pos 
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
   * @param {number} x 
   * @param {number} y 
   * @param {number} z 
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
   * BDS ScriptAPIで使える {x, y, z} 形式に変換
   * @returns {_Vector3}
   */
  toBDS(): _Vector3 {
    return { x: this.x, y: this.y, z: this.z };
  }

  /** 通常のオブジェクトに変換 */
  toObject(): {x: number; y: number; z: number} {
    return { x: this.x, y: this.y, z: this.z };
  }

  toString(): string {
    return `_Vector3(x=${this.x}, y=${this.y}, z=${this.z})`;
  }

  /**
   * 最大点
   * @param {_Vector3} vector
   * @param {_Vector3[]} vectors 
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
   * @param {_Vector3} vector
   * @param {_Vector3[]} vectors 
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
   * @param {_Vector3[]} vectors
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
