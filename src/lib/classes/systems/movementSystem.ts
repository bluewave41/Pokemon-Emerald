import { Game } from '../Game';

export function movementSystem(game: Game, deltaTime: number) {
	const entities = game.entitiesWith([
		'Position',
		'SubPosition',
		'TargetPosition',
		'Movement',
		'Direction',
		'Speed',
		'Sprite'
	]);

	for (const id of entities) {
		const position = game.getComponent(id, 'Position')!;
		const sub = game.getComponent(id, 'SubPosition')!;
		const target = game.getComponent(id, 'TargetPosition')!;
		const direction = game.getComponent(id, 'Direction')!;
		const movement = game.getComponent(id, 'Movement')!;
		const speed = game.getComponent(id, 'Speed')!;

		if (!movement.moving) {
			continue;
		}

		movement.counter++;

		const moveDist = deltaTime * speed;
		switch (direction) {
			case 'UP':
				sub.y = Math.round(Math.max(sub.y - moveDist, target.y));
				break;
			case 'LEFT':
				sub.x = Math.round(Math.max(sub.x - moveDist, target.x));
				break;
			case 'RIGHT':
				sub.x = Math.round(Math.min(sub.x + moveDist, target.x));
				break;
			case 'DOWN':
				sub.y = Math.round(Math.min(sub.y + moveDist, target.y));
				break;
		}

		if (sub.x === target.x && sub.y === target.y) {
			movement.moving = false;
			movement.jumping = false;
			movement.counter = 0;
			movement.walkFrame = movement.walkFrame === 1 ? 2 : 1;
			// set last?
			position.x = target.x / Game.getAdjustedTileSize();
			position.y = target.y / Game.getAdjustedTileSize();
			// dispatch event?
		}
	}
}
