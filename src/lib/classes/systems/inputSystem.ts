import type { Position } from '$lib/interfaces/components/Position';
import { checkForWarp } from '$lib/utils/checkForWarp';
import { Game } from '../Game';
import KeyHandler, { keyToDirection } from '../KeyHandler';

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
	const [player] = game.entitiesWith(['Player', 'Position', 'Movement']);
	const warps = game.entitiesWith(['Warp', 'Position']);
	const entities = game.entitiesWith([
		'Controllable',
		'Position',
		'SubPosition',
		'Direction',
		'Movement'
	]);

	if (game.frozen) {
		return;
	}

	const key = KeyHandler.getPrioritizedKey();

	if (key === null) {
		return;
	}

	if (checkForWarp(game, keyToDirection[key])) {
		return;
	}

	const playerPosition = player.components.Position;

	for (const warp of warps) {
		const warpPosition = warp.components.Position;
		if (
			!player.components.Movement.moving &&
			playerPosition.x === warpPosition.x &&
			playerPosition.y === warpPosition.y &&
			keyToDirection[key] == warp.components.Warp.activateDirection
		) {
			game.setComponent(player.id, 'Direction', KeyHandler.keyToDirection(key));
			game.createWarpScript(warp);
			return;
		}
	}

	if (!key) {
		return;
	}

	for (const entity of entities) {
		const movement = entity.components.Movement;
		if (!movement || movement?.moving) {
			continue;
		}

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

		movement.moving = true;

		game.setComponent(player.id, 'Direction', KeyHandler.keyToDirection(key));

		if (!isTileBlocked(game, position) || isTransitionValid(game, position)) {
			game.addComponent(entity.id, 'TargetPosition', target);
		}
	}
}
