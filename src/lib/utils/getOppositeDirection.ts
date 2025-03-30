import type { Direction } from '@prisma/client';

export const getOppositeDirection = (direction: Direction) => {
	switch (direction) {
		case 'UP':
			return 'DOWN';
		case 'LEFT':
			return 'RIGHT';
		case 'RIGHT':
			return 'LEFT';
		case 'DOWN':
			return 'UP';
	}
};
