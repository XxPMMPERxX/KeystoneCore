import { world } from '@minecraft/server';
import { _Vector3 } from '../math/vector3';
import { delegate } from '../utils/delegate';
export class PlayerRegistry {
    /**
     * 取得
     * @param {Player} player
     * @returns {WrappedPlayer}
     */
    static get(player) {
        if (!_Player._players.has(player.id))
            _Player.hello(player);
        return _Player._players.get(player.id);
    }
}
class _Player {
    /**
     * 生成
     * @param {Player} player
     */
    static hello(player) {
        _Player._players.set(player.id, delegate(new _Player(player), player));
    }
    /**
     * 削除
     * @param {string} playerId
     */
    static bye(playerId) {
        _Player._players.delete(playerId);
    }
    constructor(player) {
        this.origin = player;
        this.lastLocation = _Vector3.fromBDS(player.location);
    }
}
_Player._players = new Map();
world.afterEvents.playerSpawn.subscribe((event) => {
    if (event.initialSpawn)
        _Player.hello(event.player);
});
world.afterEvents.playerLeave.subscribe((event) => {
    _Player.bye(event.playerId);
});
