import type { Position } from '$lib/interfaces/components/Position';
import { Game } from '../Game';
import KeyHandler from '../KeyHandler';

function isTransitionValid(game: Game, position: Position) {
	const connections = game.getComponent(game.activeMapId, 'Connections')!;
	const mapInfo = game.getComponent(game.activeMapId, 'MapInfo')!;
	if (position.x < 0 && connections.LEFT) {
		return true;
	} else if (position.x >= mapInfo.width && connections.RIGHT) {
		return true;
	} else if (position.y < 0 && connections.UP) {
		return true;
	} else if (position.y >= mapInfo.height && connections.DOWN) {
		return true;
	}
}

function isTileBlocked(game: Game, position: Position) {
	const mapInfo = game.getComponent(game.activeMapId, 'MapInfo')!;

	if (
		position.x < 0 ||
		position.x >= mapInfo.width ||
		position.y < 0 ||
		position.y >= mapInfo.height
	) {
		return true;
	}

	const tiles = game.getComponent(game.activeMapId, 'Tiles')!;

	const tile = tiles[position.y][position.x];
	return game.hasComponent(tile, 'Solid');
}

export function inputSystem(game: Game) {
	const entities = game.entitiesWith([
		'Controllable',
		'Position',
		'SubPosition',
		'Direction',
		'Movement'
	]);
	const key = KeyHandler.getPrioritizedKey();

	if (!key) {
		return;
	}

	for (const entity of entities) {
		const movement = entity.components.Movement;
		if (!movement || movement?.moving) {
			continue;
		}

		movement.moving = true;
		const position = entity.components.Position;
		const sub = entity.components.SubPosition;

		const target = { ...sub };

		switch (key) {
			case 'ArrowUp':
				position.y--;
				target.y -= Game.getAdjustedTileSize();
				break;
			case 'ArrowLeft':
				position.x--;
				target.x -= Game.getAdjustedTileSize();
				break;
			case 'ArrowRight':
				position.x++;
				target.x += Game.getAdjustedTileSize();
				break;
			case 'ArrowDown':
				position.y++;
				target.y += Game.getAdjustedTileSize();
				break;
		}

		game.setComponent(entity.id, 'Direction', KeyHandler.keyToDirection(key));

		if (!isTileBlocked(game, position) || isTransitionValid(game, position)) {
			game.addComponent(entity.id, 'TargetPosition', target);
		}
	}
}
