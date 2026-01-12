import { Vector3 } from '@minecraft/server';

interface AABB {
  center: Vector3;
  extent: Vector3;
}

export class AxisAlignedBB implements AABB {
  center: Vector3;
  extent: Vector3;

  constructor(center: Vector3, extent: Vector3) {
    this.center = center;
    this.extent = extent;
  }
  
  /**
   * 最小点最大点からオブジェクト化
   * @param min 
   * @param max 
   * @returns {AxisAlignedBB}
   */
  static fromMinMax(min: Vector3, max: Vector3): AxisAlignedBB {
    return new AxisAlignedBB(
      {
        x: (min.x + max.x) / 2,
        y: (min.y + max.y) / 2,
        z: (min.z + max.z) / 2,
      },
      {
        x: (max.x - min.x) / 2,
        y: (max.y - min.y) / 2,
        z: (max.z - min.z) / 2,
      }
    );
  }

  /**
   * 大きさ1のAABB生成
   * @returns {AxisAlignedBB}
   */
  static one(): AxisAlignedBB {
    return AxisAlignedBB.fromMinMax(
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 1, z: 1 }
    );
  }

  /**
   * {center, extent} オブジェクトから生成
   * @param aabb 
   * @returns {AxisAlignedBB}
   */
  static fromBDS(aabb: AABB): AxisAlignedBB {
    return new AxisAlignedBB(aabb.center, aabb.extent);
  }

  /**
   * 最小点
   * @returns {Vector3}
   */
  get min(): Vector3 {
    return {
      x: this.center.x - this.extent.x,
      y: this.center.y - this.extent.y,
      z: this.center.z - this.extent.z,
    };
  }


  /**
   * 最大点
   * @returns {Vector3}
   */
  get max(): Vector3 {
    return {
      x: this.center.x + this.extent.x,
      y: this.center.y + this.extent.y,
      z: this.center.z + this.extent.z,
    };
  }

  /**
   * オフセット
   * @param dx 
   * @param dy 
   * @param dz 
   * @returns {AxisAlignedBB}
   */
  offset(dx: number, dy: number, dz: number): AxisAlignedBB {
    return new AxisAlignedBB(
      { x: this.center.x + dx, y: this.center.y + dy, z: this.center.z + dz },
      this.extent
    );
  }

  /**
   * 拡大
   * @param dx 
   * @param dy 
   * @param dz 
   * @returns {AxisAlignedBB} 
   */
  expand(dx: number, dy: number, dz: number): AxisAlignedBB {
    return new AxisAlignedBB(
      this.center,
      {
        x: this.extent.x + dx,
        y: this.extent.y + dy,
        z: this.extent.z + dz,
      }
    );
  }

  /**
   * 縮小
   * @param dx 
   * @param dy 
   * @param dz 
   * @returns {AxisAlignedBB}
   */
  contract(dx: number, dy: number, dz: number): AxisAlignedBB {
    return this.expand(-dx, -dy, -dz);
  }

  /**
   * 接触判定
   * @param other 
   * @param epsilon 
   * @returns {boolean}
   */
  intersects(other: AxisAlignedBB, epsilon = 1e-6): boolean {
    const aMin = this.min;
    const aMax = this.max;
    const bMin = other.min;
    const bMax = other.max;

    return (
      bMax.x - aMin.x > epsilon &&
      aMax.x - bMin.x > epsilon &&
      bMax.y - aMin.y > epsilon &&
      aMax.y - bMin.y > epsilon &&
      bMax.z - aMin.z > epsilon &&
      aMax.z - bMin.z > epsilon
    );
  }

  /**
   * 対象座標が内包されているか
   * @param v 
   * @returns {boolean}
   */
  contains(v: Vector3): boolean {
    const min = this.min;
    const max = this.max;

    return (
      v.x > min.x && v.x < max.x &&
      v.y > min.y && v.y < max.y &&
      v.z > min.z && v.z < max.z
    );
  }

  /**
   * Xの長さ
   * @returns {number} 
   */
  getXLength(): number {
    return this.extent.x * 2;
  }

  /**
   * Yの長さ
   * @returns {number} 
   */
  getYLength(): number {
    return this.extent.y * 2;
  }

  /**
   * Zの長さ
   * @returns {number} 
   */
  getZLength(): number {
    return this.extent.z * 2;
  }

  /**
   * 体積
   * @returns {number} 
   */
  getVolume(): number {
    return this.getXLength() * this.getYLength() * this.getZLength();
  }

  /**
   * キューブ判定
   * @param epsilon 
   * @returns {boolean}
   */
  isCube(epsilon = 1e-6): boolean {
    const x = this.getXLength();
    const y = this.getYLength();
    const z = this.getZLength();
    return (
      Math.abs(x - y) < epsilon &&
      Math.abs(y - z) < epsilon
    );
  }

  /**
   * BDS ScriptAPIで使える {center, extent} 形式に変換
   * @returns {AABB}
   */
  toBDS(): AABB {
    return { center: this.center, extent: this.extent };
  }

  /** 
   * オブジェクトに変換
   */
  toObject(): {center: Vector3; extent: Vector3} {
    return { center: this.center, extent: this.extent };
  }

  /**
   * toString
   * @returns {string}
   */
  toString(): string {
    return `AxisAlignedBB{center=(${this.center.x}, ${this.center.y}, ${this.center.z}), extent=(${this.center.x}, ${this.center.y}, ${this.center.z})}`;
  }
}
