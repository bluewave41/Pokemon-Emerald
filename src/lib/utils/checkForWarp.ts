import type { Game } from '$lib/classes/Game';
import type { Direction } from '@prisma/client';

export const checkForWarp = (game: Game, direction: Direction) => {
	const warps = game.entitiesWith(['Warp', 'Position']);
	const [player] = game.entitiesWith(['Player', 'Position', 'Movement']);

	const playerPosition = player.components.Position;

	for (const warp of warps) {
		const warpPosition = warp.components.Position;
		if (
			!player.components.Movement.moving &&
			playerPosition.x === warpPosition.x &&
			playerPosition.y === warpPosition.y &&
			direction == warp.components.Warp.activateDirection
		) {
			game.setComponent(player.id, 'Direction', direction);
			game.createWarpScript(warp);
			return true;
		}
	}
};
