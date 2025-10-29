import { Player } from '@minecraft/server';
import { _Vector3 } from '../math/vector3';
export type KeystonePlayer = _Player & Player;
export declare class PlayerRegistry {
    /**
     * プレイヤーオブジェクトから取得
     * @param {Player} player
     * @returns {KeystonePlayer}
     */
    static fromPlayer(player: Player): KeystonePlayer;
    /**
     * IDから取得
     * @param {string} playerId
     * @returns {KeystonePlayer}
     */
    static fromId(playerId: string): KeystonePlayer;
}
/**
 * 拡張機能を備えたPlayerオブジェクト
 */
declare class _Player {
    static _players: Map<string, KeystonePlayer>;
    /**
     * 生成
     * @param {Player} player
     */
    static hello(player: Player): void;
    /**
     * 削除
     * @param {string} playerId
     */
    static bye(playerId: string): void;
    origin: Player;
    lastLocation: _Vector3;
    private constructor();
}
export {};
