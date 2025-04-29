import { Game } from '$lib/classes/Game';
import type { GridPosition } from '$lib/interfaces/components/GridPosition';
import type { PixelPosition } from '$lib/interfaces/components/PixelPosition';
import type { Direction } from '@prisma/client';

export function updateNewPosition(position: GridPosition | PixelPosition, direction: Direction) {
	if (position.type === 'grid') {
		switch (direction) {
			case 'UP':
				position.y -= 1;
				break;
			case 'LEFT':
				position.x -= 1;
				break;
			case 'RIGHT':
				position.x += 1;
				break;
			case 'DOWN':
				position.y += 1;
				break;
		}
	} else {
		switch (direction) {
			case 'UP':
				position.y -= Game.getAdjustedTileSize();
				break;
			case 'LEFT':
				position.x -= Game.getAdjustedTileSize();
				break;
			case 'RIGHT':
				position.x += Game.getAdjustedTileSize();
				break;
			case 'DOWN':
				position.y += Game.getAdjustedTileSize();
				break;
		}
	}
}
