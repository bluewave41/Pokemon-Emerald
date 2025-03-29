import { Position } from '$lib/classes/Position';
import type { Direction } from '@prisma/client';

export const adjustPositionForDirection = (position: Position, direction: Direction) => {
	switch (direction) {
		case 'UP':
			return new Position(position.x, position.y - 1);
		case 'LEFT':
			return new Position(position.x - 1, position.y);
		case 'RIGHT':
			return new Position(position.x + 1, position.y);
		case 'DOWN':
			return new Position(position.x, position.y + 1);
	}
};
