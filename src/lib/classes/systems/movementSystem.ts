import { Game } from '../Game';

export function movementSystem(game: Game, deltaTime: number) {
	const entities = game.entitiesWith([
		'Position',
		'SubPosition',
		'TargetPosition',
		'LastPosition',
		'Movement',
		'Direction',
		'Speed',
		'Sprite',
		'Offset'
	]);

	for (const entity of entities) {
		const position = entity.components.Position;
		const sub = entity.components.SubPosition;
		const target = entity.components.TargetPosition;
		const last = entity.components.LastPosition;
		const direction = entity.components.Direction;
		const movement = entity.components.Movement;
		const speed = entity.components.Speed;
		const offset = entity.components.Offset;

		if (!movement.moving && !movement.jumping) {
			continue;
		}

		const numberOfPixelsToMove = (Math.abs(last.x - target.x) + Math.abs(last.y - target.y)) / 2;
		const start = Math.floor(numberOfPixelsToMove * 0.3);
		const end = Math.floor(numberOfPixelsToMove * 0.7);

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

		if (movement.jumping) {
			if (movement.counter < start + 1) {
				offset.y += 2;
			} else if (movement.counter > end) {
				offset.y -= 2;
			}
		}

		if (sub.x === target.x && sub.y === target.y) {
			movement.moving = false;
			movement.jumping = false;
			movement.counter = 0;
			movement.walkFrame = movement.walkFrame === 1 ? 2 : 1;
			last.x = sub.x;
			last.y = sub.y;
			position.x = target.x / Game.getAdjustedTileSize();
			position.y = target.y / Game.getAdjustedTileSize();
		}
	}
}
