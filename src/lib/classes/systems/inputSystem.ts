import { Game } from '../Game';
import KeyHandler from '../KeyHandler';

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

		game.addComponent(id, 'TargetPosition', target);
		game.setComponent(id, 'Direction', KeyHandler.keyToDirection(key));
	}
}
