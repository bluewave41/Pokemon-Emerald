import type { Position } from '$lib/interfaces/components/Position';
import type { MapNames } from '$lib/interfaces/MapNames';
import { Game, type EntityWith } from '../Game';

function setPosition(
	game: Game,
	player: EntityWith<'Player' | 'Position' | 'SubPosition' | 'TargetPosition'>,
	position: Position
) {
	game.setComponent(player.id, 'Position', position);
	game.setComponent(player.id, 'SubPosition', {
		x: position.x * Game.getAdjustedTileSize(),
		y: position.y * Game.getAdjustedTileSize() - Game.getAdjustedTileSize()
	});
	game.setComponent(player.id, 'TargetPosition', {
		x: position.x * Game.getAdjustedTileSize(),
		y: position.y * Game.getAdjustedTileSize()
	});
}

export function mapTransitionSystem(game: Game) {
	const activeMap = game.getComponent(game.activeMapId, 'MapInfo');
	const players = game.entitiesWith(['Player', 'Position', 'SubPosition', 'TargetPosition']);
	const connections = game.getComponent(game.activeMapId, 'Connections');
	if (!connections || !activeMap) {
		return;
	}

	for (const player of players) {
		const position = player.components.Position;

		const targetPos = player.components.TargetPosition;

		if (targetPos && targetPos.y < 0 && connections.UP) {
			const info = game.getMapInfoByName(connections.UP);
			setPosition(game, player, { x: position.x, y: info?.height });
			game.removeComponent(game.activeMapId, 'Direction');
			game.activeMapId = game.getMapIdByName(connections.UP);
			game.addComponent(game.activeMapId, 'Direction', 'DOWN');
			game.transitionInProgress = true;
		} else if (
			targetPos &&
			targetPos.y > (activeMap.height - 1) * Game.getAdjustedTileSize() &&
			connections.DOWN
		) {
			setPosition(game, player, { x: position.x, y: 0 });
			game.removeComponent(game.activeMapId, 'Direction');
			game.activeMapId = game.getMapIdByName(connections.DOWN);
			game.addComponent(game.activeMapId, 'Direction', 'UP');
			game.transitionInProgress = true;
		}
	}
}
