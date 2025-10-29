import { Vector3 } from '@minecraft/server';
export declare class _Vector3 implements Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x: number, y: number, z: number);
    /**
     * ゼロベクトルで生成
     * @return {_Vector3}
     */
    static zero(): _Vector3;
    /**
     * {x, y, z} オブジェクトから生成
     * @param {Vector3} pos
     * @returns
     */
    static fromBDS(pos: Vector3): _Vector3;
    getX(): number;
    getY(): number;
    getZ(): number;
    getFloorX(): number;
    getFloorY(): number;
    getFloorZ(): number;
    /**
     * 加算
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @return {_Vector3}
     */
    add(x: number, y: number, z: number): _Vector3;
    /**
     * ベクトル単位での加算
     * @param {Vector3} v
     * @returns {_Vector3}
     */
    addVector(v: Vector3): _Vector3;
    /**
     * 減算
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @return {_Vector3}
     */
    subtract(x: number, y: number, z: number): _Vector3;
    /**
     * ベクトル単位での減算
     * @param {Vector3} v
     * @return {_Vector3}
     */
    subtractVector(v: Vector3): _Vector3;
    /**
     * 乗算
     * @param {number} value
     * @return {_Vector3}
     */
    multiply(value: number): _Vector3;
    /**
     * 除算
     * @param {number} value
     * @return {_Vector3}
     */
    divide(value: number): _Vector3;
    /**
     * ベクトルの内部数値小数点切り上げ
     * @return {_Vector3}
     */
    ceil(): _Vector3;
    /**
     * ベクトルの内部数値小数点切り捨て
     * @return {_Vector3}
     */
    floor(): _Vector3;
    /**
     * ベクトルの内部数値小数点四捨五入
     * @param {number} precision
     * @return {_Vector3}
     */
    round(precision?: number): _Vector3;
    /**
     * ベクトルの内部数値の絶対値
     * @return {_Vector3}
     */
    abs(): _Vector3;
    /**
     * 指定した2点間のユークリッド距離
     * @param {Vector3} pos
     * @return {number}
     */
    distance(pos: Vector3): number;
    /**
     * 指定した2点間のユークリッド距離の2乗
     * @param {Vector3} pos
     * @return {number}
     */
    distanceSquared(pos: Vector3): number;
    /**
     * 内積
     * @param {Vector3} pos
     * @return {number}
     */
    dot(pos: Vector3): number;
    /**
     * 外積
     * @param {Vector3} pos
     * @return {_Vector3}
     */
    cross(pos: Vector3): _Vector3;
    /**
     * ベクトルの比較
     * @param {Vector3} pos
     * @return {boolean}
     */
    equals(pos: Vector3): boolean;
    /**
     * ベクトルの長さ
     * @return {number}
     */
    length(): number;
    /**
     * ベクトルの長さの2乗
     * @return {number}
     */
    lengthSquared(): number;
    /**
     * 正規化
     * @return {_Vector3}
     */
    normalize(): _Vector3;
    /**
     * オブジェクトの数値指定再生成
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @return {_Vector3}
     */
    withComponents(x?: number, y?: number, z?: number): _Vector3;
    /**
     * BDS ScriptAPIで使える {x, y, z} 形式に変換
     * @returns {Vector3}
     */
    toBDS(): Vector3;
    /** 通常のオブジェクトに変換 */
    toObject(): {
        x: number;
        y: number;
        z: number;
    };
    toString(): string;
    /**
     * 最大点
     * @param {Vector3} vector
     * @param {Vector3[]} vectors
     * @returns {_Vector3}
     */
    static maxComponents(vector: Vector3, ...vectors: Vector3[]): _Vector3;
    /**
     * 最小点
     * @param {Vector3} vector
     * @param {Vector3[]} vectors
     * @returns {_Vector3}
     */
    static minComponents(vector: Vector3, ...vectors: Vector3[]): _Vector3;
    /**
     * 合計
     * @param {Vector3[]} vectors
     * @returns {_Vector3}
     */
    static sum(...vectors: {
        x: number;
        y: number;
        z: number;
    }[]): _Vector3;
}
