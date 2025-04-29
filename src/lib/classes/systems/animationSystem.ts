import type { Game } from '../Game';

export function animationSystem(game: Game, deltaTime: number) {
	const ms = deltaTime * 1000;
	const entities = game.entitiesWith(['TileSprite', 'Animated', 'Timer']);

	for (const entity of entities) {
		const animationOptions = entity.components.Animated;
		if ((animationOptions.activated && animationOptions.animating) || animationOptions.repeating) {
			if (entity.components.Timer + ms >= animationOptions.delay) {
				if (animationOptions.direction === 'forward') {
					if (animationOptions.index >= animationOptions.sequence.length) {
						if (!animationOptions.repeating) {
							animationOptions.index--;
							animationOptions.animating = false;
						} else {
							animationOptions.index = 0;
						}
					}

					game.setComponent(
						entity.id,
						'TileSprite',
						animationOptions.frames[animationOptions.sequence[animationOptions.index++]]
					);
				} else {
					if (animationOptions.index == 0) {
						if (!animationOptions.repeating) {
							animationOptions.animating = false;
						}
					}
					game.setComponent(
						entity.id,
						'TileSprite',
						animationOptions.frames[animationOptions.sequence[animationOptions.index--]]
					);

					if (animationOptions.index < 0) {
						animationOptions.index = 0;
					}
				}

				game.setComponent(entity.id, 'Timer', 0);
			} else {
				game.setComponent(entity.id, 'Timer', entity.components.Timer + ms);
			}
		}
	}
}
