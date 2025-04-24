import type { Canvas } from '../Canvas';
import { Game } from '../Game';

export function renderSystem(game: Game, canvas: Canvas) {
	//const map = game.entitiesWith(['ActiveMap']);

	for (const id of game.entitiesWith(['Position', 'SubPosition', 'Sprite', 'Direction'])) {
		const pos = game.getComponent(id, 'SubPosition')!;
		const sprite = game.getComponent(id, 'Sprite')!;
		const offset = game.getComponent(id, 'Offset')!;
		const direction = game.getComponent(id, 'Direction')!;
		const movement = game.getComponent(id, 'Movement');

		let drawSprite = sprite.sprites[direction.toLowerCase()];
		if (movement && (movement?.moving || movement.jumping)) {
			if (movement.counter < 10 || movement.counter > 22) {
				drawSprite = sprite.sprites[direction.toLowerCase() + movement?.walkFrame];
			}
			/*drawSprite =
				((movement.moving || movement.jumping) && movement.counter < 10) ||
				movement.counter > 22 ||
				(!movement.moving && movement.counter !== 0)
					? direction + movement.walkFrame
					: direction;*/
		}

		canvas.drawSprite(
			drawSprite,
			Math.round(pos.x) /*+ map.absoluteX*/,
			Math.round(pos.y) /*+ map.absoluteY*/,
			offset?.x,
			offset.y
		);
	}
}
