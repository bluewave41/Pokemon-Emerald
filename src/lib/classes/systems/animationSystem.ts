import type { Game } from '../Game';

export function animationSystem(game: Game, deltaTime: number) {
	const ms = deltaTime * 1000;
	const entities = game.entitiesWith(['TileSprite', 'Animated', 'Timer']);

	for (const entity of entities) {
		const animationOptions = entity.components.Animated;
		if (animationOptions.repeating && entity.components.Timer + ms >= animationOptions.delay) {
			game.setComponent(
				entity.id,
				'TileSprite',
				animationOptions.frames[animationOptions.sequence[animationOptions.index++]]
			);
			if (animationOptions.index > animationOptions.frames.length) {
				animationOptions.index = 0;
			}
			game.setComponent(entity.id, 'Timer', 0);
		} else {
			game.setComponent(entity.id, 'Timer', entity.components.Timer + ms);
		}
	}
}
