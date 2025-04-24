import type { Position } from '$lib/interfaces/components/Position';
import { Game } from '../Game';
import KeyHandler from '../KeyHandler';

function isTileBlocked(game: Game, position: Position) {
	console.log(position);
	const tiles = game.getComponent(game.activeMapId, 'Tiles')!;
	const tile = tiles[position.y][position.x];

	return game.hasComponent(tile, 'Solid');
}

export function inputSystem(game: Game) {
	const entities = game.entitiesWith(['Controllable', 'Position', 'SubPosition', 'Direction']);
	const key = KeyHandler.getPrioritizedKey();

	if (!key) {
		return;
	}

	for (const id of entities) {
		const movement = game.getComponent(id, 'Movement');
		if (!movement || movement?.moving) {
			continue;
		}

		movement.moving = true;
		const position = game.getComponent(id, 'Position')!;
		const sub = game.getComponent(id, 'SubPosition')!;

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

		game.setComponent(id, 'Direction', KeyHandler.keyToDirection(key));

		if (!isTileBlocked(game, position)) {
			game.addComponent(id, 'TargetPosition', target);
		}
	}
}
