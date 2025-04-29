import type { Canvas } from '../Canvas';
import { Game } from '../Game';

export function renderSystem(game: Game, canvas: Canvas) {
	const map = game.getComponent(game.activeMapId, 'Position')!;

	const characters = game.entitiesWith([
		'Position',
		'SubPosition',
		'Sprite',
		'Direction',
		'Offset',
		'Movement'
	]);

	for (const character of characters) {
		const hidden = game.getComponent(character.id, 'Hidden');
		if (hidden) {
			continue;
		}
		const pos = character.components.SubPosition;
		const sprite = character.components.Sprite;
		const offset = character.components.Offset;
		const direction = character.components.Direction;
		const movement = character.components.Movement;

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
			Math.round(pos.x) + map.x * Game.getAdjustedTileSize(),
			Math.round(pos.y) + map.y * Game.getAdjustedTileSize(),
			offset?.x,
			offset.y
		);
	}
}
