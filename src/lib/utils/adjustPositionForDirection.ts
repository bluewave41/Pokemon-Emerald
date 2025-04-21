import { GridPosition } from '$lib/classes/Position';
import type { Direction } from '@prisma/client';

export const adjustPositionForDirection = (position: GridPosition, direction: Direction) => {
	switch (direction) {
		case 'UP':
			return new GridPosition(position.x, position.y - 1);
		case 'LEFT':
			return new GridPosition(position.x - 1, position.y);
		case 'RIGHT':
			return new GridPosition(position.x + 1, position.y);
		case 'DOWN':
			return new GridPosition(position.x, position.y + 1);
	}
};
