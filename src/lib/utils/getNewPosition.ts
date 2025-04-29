import type { GridPosition } from '$lib/interfaces/components/GridPosition';
import type { Direction } from '@prisma/client';

export function getNewPosition(position: GridPosition, direction: Direction) {
	switch (direction) {
		case 'UP':
			return { x: position.x, y: position.y - 1 };
		case 'LEFT':
			return { x: position.x - 1, y: position.y };
		case 'RIGHT':
			return { x: position.x + 1, y: position.y };
		case 'DOWN':
			return { x: position.x, y: position.y + 1 };
	}
}
