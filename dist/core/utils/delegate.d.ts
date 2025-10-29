/**
 * 委譲
 * @template T ターゲット
 * @template U 委譲先
 * @param {T} target
 *   元のオブジェクト (優先的にアクセスされる)
 * @param {U} delegate
 *   委譲対象となるオブジェクト (プロパティ・メソッドが存在すればそちらに転送される)
 * @returns {T & U}
 *   プロキシオブジェクト
 */
export declare function delegate<T extends object, U extends object>(target: T, delegate: U): T & U;
