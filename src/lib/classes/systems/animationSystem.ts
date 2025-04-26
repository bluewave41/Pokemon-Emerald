import type { Canvas } from '../Canvas';
import type { Game } from '../Game';

export function animationSystem(game: Game, canvas: Canvas) {
	const entities = game.entitiesWith(['TileSprites', 'Animated']);
}
