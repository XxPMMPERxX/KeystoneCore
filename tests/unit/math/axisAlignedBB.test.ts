import { describe, it, expect } from 'vitest';
import { AxisAlignedBB } from '@/math/axisAlignedBB';

describe('AxisAlignedBB', () => {
  describe('コンストラクタと生成', () => {
    it('new AxisAlignedBB() でAABBを生成できる', () => {
      const aabb = new AxisAlignedBB(
        { x: 5, y: 5, z: 5 },
        { x: 2, y: 2, z: 2 }
      );
      expect(aabb.center).toEqual({ x: 5, y: 5, z: 5 });
      expect(aabb.extent).toEqual({ x: 2, y: 2, z: 2 });
    });

    it('AxisAlignedBB.fromMinMax() で最小点と最大点から生成できる', () => {
      const aabb = AxisAlignedBB.fromMinMax(
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 10, z: 10 }
      );
      expect(aabb.center).toEqual({ x: 5, y: 5, z: 5 });
      expect(aabb.extent).toEqual({ x: 5, y: 5, z: 5 });
    });

    it('AxisAlignedBB.one() で単位AABBを生成できる', () => {
      const aabb = AxisAlignedBB.one();
      expect(aabb.center).toEqual({ x: 0.5, y: 0.5, z: 0.5 });
      expect(aabb.extent).toEqual({ x: 0.5, y: 0.5, z: 0.5 });
    });

    it('AxisAlignedBB.fromBDS() でオブジェクトから生成できる', () => {
      const aabb = AxisAlignedBB.fromBDS({
        center: { x: 3, y: 4, z: 5 },
        extent: { x: 1, y: 1, z: 1 }
      });
      expect(aabb.center).toEqual({ x: 3, y: 4, z: 5 });
      expect(aabb.extent).toEqual({ x: 1, y: 1, z: 1 });
    });
  });

  describe('最小点・最大点', () => {
    it('min で最小点を取得できる', () => {
      const aabb = new AxisAlignedBB(
        { x: 5, y: 5, z: 5 },
        { x: 2, y: 2, z: 2 }
      );
      expect(aabb.min).toEqual({ x: 3, y: 3, z: 3 });
    });

    it('max で最大点を取得できる', () => {
      const aabb = new AxisAlignedBB(
        { x: 5, y: 5, z: 5 },
        { x: 2, y: 2, z: 2 }
      );
      expect(aabb.max).toEqual({ x: 7, y: 7, z: 7 });
    });
  });

  describe('変形', () => {
    it('offset() で位置をずらせる', () => {
      const aabb = AxisAlignedBB.fromMinMax(
        { x: 0, y: 0, z: 0 },
        { x: 2, y: 2, z: 2 }
      );
      const offset = aabb.offset(3, 4, 5);

      expect(offset.center).toEqual({ x: 4, y: 5, z: 6 });
      expect(offset.extent).toEqual({ x: 1, y: 1, z: 1 });
      // 元のAABBは変更されない
      expect(aabb.center).toEqual({ x: 1, y: 1, z: 1 });
    });

    it('expand() で拡大できる', () => {
      const aabb = AxisAlignedBB.fromMinMax(
        { x: 0, y: 0, z: 0 },
        { x: 2, y: 2, z: 2 }
      );
      const expanded = aabb.expand(1, 1, 1);

      expect(expanded.center).toEqual({ x: 1, y: 1, z: 1 });
      expect(expanded.extent).toEqual({ x: 2, y: 2, z: 2 });
      expect(expanded.min).toEqual({ x: -1, y: -1, z: -1 });
      expect(expanded.max).toEqual({ x: 3, y: 3, z: 3 });
    });

    it('contract() で縮小できる', () => {
      const aabb = AxisAlignedBB.fromMinMax(
        { x: 0, y: 0, z: 0 },
        { x: 4, y: 4, z: 4 }
      );
      const contracted = aabb.contract(1, 1, 1);

      expect(contracted.center).toEqual({ x: 2, y: 2, z: 2 });
      expect(contracted.extent).toEqual({ x: 1, y: 1, z: 1 });
      expect(contracted.min).toEqual({ x: 1, y: 1, z: 1 });
      expect(contracted.max).toEqual({ x: 3, y: 3, z: 3 });
    });
  });

  describe('衝突判定', () => {
    it('intersects() で重なっているAABBを検出できる', () => {
      const aabb1 = AxisAlignedBB.fromMinMax(
        { x: 0, y: 0, z: 0 },
        { x: 2, y: 2, z: 2 }
      );
      const aabb2 = AxisAlignedBB.fromMinMax(
        { x: 1, y: 1, z: 1 },
        { x: 3, y: 3, z: 3 }
      );

      expect(aabb1.intersects(aabb2)).toBe(true);
      expect(aabb2.intersects(aabb1)).toBe(true);
    });

    it('intersects() で重なっていないAABBを検出できる', () => {
      const aabb1 = AxisAlignedBB.fromMinMax(
        { x: 0, y: 0, z: 0 },
        { x: 2, y: 2, z: 2 }
      );
      const aabb2 = AxisAlignedBB.fromMinMax(
        { x: 5, y: 5, z: 5 },
        { x: 7, y: 7, z: 7 }
      );

      expect(aabb1.intersects(aabb2)).toBe(false);
      expect(aabb2.intersects(aabb1)).toBe(false);
    });

    it('intersects() で接しているAABBを検出できる', () => {
      const aabb1 = AxisAlignedBB.fromMinMax(
        { x: 0, y: 0, z: 0 },
        { x: 2, y: 2, z: 2 }
      );
      const aabb2 = AxisAlignedBB.fromMinMax(
        { x: 2, y: 2, z: 2 },
        { x: 4, y: 4, z: 4 }
      );

      // 接しているだけの場合はfalse（epsilonによる判定）
      expect(aabb1.intersects(aabb2)).toBe(false);
    });

    it('contains() で点が内部にあるかチェックできる', () => {
      const aabb = AxisAlignedBB.fromMinMax(
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 10, z: 10 }
      );

      expect(aabb.contains({ x: 5, y: 5, z: 5 })).toBe(true);
      expect(aabb.contains({ x: 1, y: 1, z: 1 })).toBe(true);
      expect(aabb.contains({ x: 9, y: 9, z: 9 })).toBe(true);
    });

    it('contains() で点が外部にあるかチェックできる', () => {
      const aabb = AxisAlignedBB.fromMinMax(
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 10, z: 10 }
      );

      expect(aabb.contains({ x: -1, y: 5, z: 5 })).toBe(false);
      expect(aabb.contains({ x: 11, y: 5, z: 5 })).toBe(false);
      expect(aabb.contains({ x: 5, y: -1, z: 5 })).toBe(false);
    });

    it('contains() で境界上の点は含まれない', () => {
      const aabb = AxisAlignedBB.fromMinMax(
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 10, z: 10 }
      );

      // 境界上の点は含まれない（不等号が > と < なので）
      expect(aabb.contains({ x: 0, y: 5, z: 5 })).toBe(false);
      expect(aabb.contains({ x: 10, y: 5, z: 5 })).toBe(false);
    });
  });

  describe('サイズ計算', () => {
    it('getXLength() でX方向の長さを取得できる', () => {
      const aabb = AxisAlignedBB.fromMinMax(
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 5, z: 3 }
      );
      expect(aabb.getXLength()).toBe(10);
    });

    it('getYLength() でY方向の長さを取得できる', () => {
      const aabb = AxisAlignedBB.fromMinMax(
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 5, z: 3 }
      );
      expect(aabb.getYLength()).toBe(5);
    });

    it('getZLength() でZ方向の長さを取得できる', () => {
      const aabb = AxisAlignedBB.fromMinMax(
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 5, z: 3 }
      );
      expect(aabb.getZLength()).toBe(3);
    });

    it('getVolume() で体積を取得できる', () => {
      const aabb = AxisAlignedBB.fromMinMax(
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 5, z: 2 }
      );
      expect(aabb.getVolume()).toBe(100); // 10 * 5 * 2
    });
  });

  describe('形状判定', () => {
    it('isCube() で立方体を判定できる', () => {
      const cube = AxisAlignedBB.fromMinMax(
        { x: 0, y: 0, z: 0 },
        { x: 5, y: 5, z: 5 }
      );
      expect(cube.isCube()).toBe(true);
    });

    it('isCube() で立方体でない形状を判定できる', () => {
      const notCube = AxisAlignedBB.fromMinMax(
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 5, z: 3 }
      );
      expect(notCube.isCube()).toBe(false);
    });
  });

  describe('変換', () => {
    it('toBDS() でBDS形式に変換できる', () => {
      const aabb = AxisAlignedBB.fromMinMax(
        { x: 0, y: 0, z: 0 },
        { x: 4, y: 4, z: 4 }
      );
      const bds = aabb.toBDS();
      expect(bds).toEqual({
        center: { x: 2, y: 2, z: 2 },
        extent: { x: 2, y: 2, z: 2 }
      });
    });

    it('toObject() でオブジェクトに変換できる', () => {
      const aabb = AxisAlignedBB.fromMinMax(
        { x: 0, y: 0, z: 0 },
        { x: 4, y: 4, z: 4 }
      );
      const obj = aabb.toObject();
      expect(obj).toEqual({
        center: { x: 2, y: 2, z: 2 },
        extent: { x: 2, y: 2, z: 2 }
      });
    });

    it('toString() で文字列に変換できる', () => {
      const aabb = AxisAlignedBB.fromMinMax(
        { x: 0, y: 0, z: 0 },
        { x: 4, y: 4, z: 4 }
      );
      const str = aabb.toString();
      expect(str).toContain('AxisAlignedBB');
      expect(str).toContain('center');
      expect(str).toContain('extent');
    });
  });
});
