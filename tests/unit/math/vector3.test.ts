import { describe, it, expect } from 'vitest';
import { Vector3 } from '@/math/vector3';
import { expectVector3Equal } from '../../mocks/test-utils';

describe('Vector3', () => {
  describe('コンストラクタと生成', () => {
    it('new Vector3() でベクトルを生成できる', () => {
      const v = new Vector3(1, 2, 3);
      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
      expect(v.z).toBe(3);
    });

    it('Vector3.zero() でゼロベクトルを生成できる', () => {
      const v = Vector3.zero();
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
      expect(v.z).toBe(0);
    });

    it('Vector3.fromBDS() でオブジェクトから生成できる', () => {
      const v = Vector3.fromBDS({ x: 4, y: 5, z: 6 });
      expect(v.x).toBe(4);
      expect(v.y).toBe(5);
      expect(v.z).toBe(6);
    });
  });

  describe('ゲッター', () => {
    it('getX/Y/Z() で各座標を取得できる', () => {
      const v = new Vector3(1.5, 2.5, 3.5);
      expect(v.getX()).toBe(1.5);
      expect(v.getY()).toBe(2.5);
      expect(v.getZ()).toBe(3.5);
    });

    it('getFloorX/Y/Z() で整数値を取得できる', () => {
      const v = new Vector3(1.7, 2.3, -3.9);
      expect(v.getFloorX()).toBe(1);
      expect(v.getFloorY()).toBe(2);
      expect(v.getFloorZ()).toBe(-4);
    });
  });

  describe('算術演算', () => {
    it('add() で加算できる', () => {
      const v = new Vector3(1, 2, 3);
      const result = v.add(4, 5, 6);
      expect(result.x).toBe(5);
      expect(result.y).toBe(7);
      expect(result.z).toBe(9);
      // 元のベクトルは変更されない
      expect(v.x).toBe(1);
    });

    it('addVector() でベクトル同士を加算できる', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = { x: 4, y: 5, z: 6 };
      const result = v1.addVector(v2);
      expect(result.x).toBe(5);
      expect(result.y).toBe(7);
      expect(result.z).toBe(9);
    });

    it('subtract() で減算できる', () => {
      const v = new Vector3(5, 7, 9);
      const result = v.subtract(1, 2, 3);
      expect(result.x).toBe(4);
      expect(result.y).toBe(5);
      expect(result.z).toBe(6);
    });

    it('subtractVector() でベクトル同士を減算できる', () => {
      const v1 = new Vector3(5, 7, 9);
      const v2 = { x: 1, y: 2, z: 3 };
      const result = v1.subtractVector(v2);
      expect(result.x).toBe(4);
      expect(result.y).toBe(5);
      expect(result.z).toBe(6);
    });

    it('multiply() でスカラー倍できる', () => {
      const v = new Vector3(1, 2, 3);
      const result = v.multiply(2);
      expect(result.x).toBe(2);
      expect(result.y).toBe(4);
      expect(result.z).toBe(6);
    });

    it('divide() で除算できる', () => {
      const v = new Vector3(6, 8, 10);
      const result = v.divide(2);
      expect(result.x).toBe(3);
      expect(result.y).toBe(4);
      expect(result.z).toBe(5);
    });
  });

  describe('数値変換', () => {
    it('ceil() で切り上げできる', () => {
      const v = new Vector3(1.1, 2.5, 3.9);
      const result = v.ceil();
      expect(result.x).toBe(2);
      expect(result.y).toBe(3);
      expect(result.z).toBe(4);
    });

    it('floor() で切り捨てできる', () => {
      const v = new Vector3(1.1, 2.5, 3.9);
      const result = v.floor();
      expect(result.x).toBe(1);
      expect(result.y).toBe(2);
      expect(result.z).toBe(3);
    });

    it('round() で四捨五入できる', () => {
      const v = new Vector3(1.4, 2.5, 3.6);
      const result = v.round();
      expect(result.x).toBe(1);
      expect(result.y).toBe(3);
      expect(result.z).toBe(4);
    });

    it('round(precision) で指定桁数で四捨五入できる', () => {
      const v = new Vector3(1.234, 2.567, 3.891);
      const result = v.round(1);
      expect(result.x).toBe(1.2);
      expect(result.y).toBe(2.6);
      expect(result.z).toBe(3.9);
    });

    it('abs() で絶対値を取得できる', () => {
      const v = new Vector3(-1, -2, 3);
      const result = v.abs();
      expect(result.x).toBe(1);
      expect(result.y).toBe(2);
      expect(result.z).toBe(3);
    });
  });

  describe('距離計算', () => {
    it('distance() でユークリッド距離を計算できる', () => {
      const v1 = new Vector3(0, 0, 0);
      const v2 = { x: 3, y: 4, z: 0 };
      const distance = v1.distance(v2);
      expect(distance).toBe(5);
    });

    it('distanceSquared() で距離の2乗を計算できる', () => {
      const v1 = new Vector3(0, 0, 0);
      const v2 = { x: 3, y: 4, z: 0 };
      const distanceSquared = v1.distanceSquared(v2);
      expect(distanceSquared).toBe(25);
    });

    it('length() でベクトルの長さを計算できる', () => {
      const v = new Vector3(3, 4, 0);
      expect(v.length()).toBe(5);
    });

    it('lengthSquared() でベクトルの長さの2乗を計算できる', () => {
      const v = new Vector3(3, 4, 0);
      expect(v.lengthSquared()).toBe(25);
    });
  });

  describe('ベクトル演算', () => {
    it('dot() で内積を計算できる', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = { x: 4, y: 5, z: 6 };
      const dotProduct = v1.dot(v2);
      expect(dotProduct).toBe(32); // 1*4 + 2*5 + 3*6 = 32
    });

    it('cross() で外積を計算できる', () => {
      const v1 = new Vector3(1, 0, 0);
      const v2 = { x: 0, y: 1, z: 0 };
      const crossProduct = v1.cross(v2);
      expect(crossProduct.x).toBe(0);
      expect(crossProduct.y).toBe(0);
      expect(crossProduct.z).toBe(1);
    });

    it('normalize() で正規化できる', () => {
      const v = new Vector3(3, 4, 0);
      const normalized = v.normalize();
      expectVector3Equal(normalized, { x: 0.6, y: 0.8, z: 0 });
      // 正規化されたベクトルの長さは1
      expect(normalized.length()).toBeCloseTo(1);
    });

    it('normalize() でゼロベクトルを正規化するとゼロベクトルを返す', () => {
      const v = Vector3.zero();
      const normalized = v.normalize();
      expect(normalized.x).toBe(0);
      expect(normalized.y).toBe(0);
      expect(normalized.z).toBe(0);
    });
  });

  describe('比較', () => {
    it('equals() で同じベクトルを比較できる', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = { x: 1, y: 2, z: 3 };
      expect(v1.equals(v2)).toBe(true);
    });

    it('equals() で異なるベクトルを比較できる', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = { x: 4, y: 5, z: 6 };
      expect(v1.equals(v2)).toBe(false);
    });
  });

  describe('ユーティリティ', () => {
    it('withComponents() で一部の座標を変更できる', () => {
      const v = new Vector3(1, 2, 3);
      const result = v.withComponents(10, undefined, 30);
      expect(result.x).toBe(10);
      expect(result.y).toBe(2);
      expect(result.z).toBe(30);
    });

    it('toBDS() でBDS形式に変換できる', () => {
      const v = new Vector3(1, 2, 3);
      const bds = v.toBDS();
      expect(bds).toEqual({ x: 1, y: 2, z: 3 });
    });

    it('toObject() でオブジェクトに変換できる', () => {
      const v = new Vector3(1, 2, 3);
      const obj = v.toObject();
      expect(obj).toEqual({ x: 1, y: 2, z: 3 });
    });

    it('toString() で文字列に変換できる', () => {
      const v = new Vector3(1, 2, 3);
      const str = v.toString();
      expect(str).toBe('_Vector3(x=1, y=2, z=3)');
    });
  });

  describe('線分上の点計算', () => {
    it('getIntermediateWithXValue() でX座標指定で線分上の点を取得できる', () => {
      const start = new Vector3(0, 0, 0);
      const end = new Vector3(10, 10, 10);
      const point = start.getIntermediateWithXValue(end, 5);
      expect(point).toBeDefined();
      expect(point!.x).toBe(5);
      expect(point!.y).toBe(5);
      expect(point!.z).toBe(5);
    });

    it('getIntermediateWithXValue() で範囲外の場合undefinedを返す', () => {
      const start = new Vector3(0, 0, 0);
      const end = new Vector3(10, 10, 10);
      const point = start.getIntermediateWithXValue(end, 15);
      expect(point).toBeUndefined();
    });

    it('getIntermediateWithYValue() でY座標指定で線分上の点を取得できる', () => {
      const start = new Vector3(0, 0, 0);
      const end = new Vector3(10, 10, 10);
      const point = start.getIntermediateWithYValue(end, 7);
      expect(point).toBeDefined();
      expect(point!.x).toBe(7);
      expect(point!.y).toBe(7);
      expect(point!.z).toBe(7);
    });

    it('getIntermediateWithZValue() でZ座標指定で線分上の点を取得できる', () => {
      const start = new Vector3(0, 0, 0);
      const end = new Vector3(10, 10, 10);
      const point = start.getIntermediateWithZValue(end, 3);
      expect(point).toBeDefined();
      expect(point!.x).toBe(3);
      expect(point!.y).toBe(3);
      expect(point!.z).toBe(3);
    });
  });

  describe('静的メソッド', () => {
    it('maxComponents() で各軸の最大値を取得できる', () => {
      const v1 = { x: 1, y: 5, z: 3 };
      const v2 = { x: 4, y: 2, z: 6 };
      const v3 = { x: 2, y: 8, z: 1 };
      const max = Vector3.maxComponents(v1, v2, v3);
      expect(max.x).toBe(4);
      expect(max.y).toBe(8);
      expect(max.z).toBe(6);
    });

    it('minComponents() で各軸の最小値を取得できる', () => {
      const v1 = { x: 1, y: 5, z: 3 };
      const v2 = { x: 4, y: 2, z: 6 };
      const v3 = { x: 2, y: 8, z: 1 };
      const min = Vector3.minComponents(v1, v2, v3);
      expect(min.x).toBe(1);
      expect(min.y).toBe(2);
      expect(min.z).toBe(1);
    });

    it('sum() で複数ベクトルの合計を計算できる', () => {
      const v1 = { x: 1, y: 2, z: 3 };
      const v2 = { x: 4, y: 5, z: 6 };
      const v3 = { x: 7, y: 8, z: 9 };
      const sum = Vector3.sum(v1, v2, v3);
      expect(sum.x).toBe(12);
      expect(sum.y).toBe(15);
      expect(sum.z).toBe(18);
    });
  });
});
