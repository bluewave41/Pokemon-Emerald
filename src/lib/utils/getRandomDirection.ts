import type { Direction } from '@prisma/client';

export const getRandomDirection = (): Direction => {
	const directions: Direction[] = ['UP', 'LEFT', 'RIGHT', 'DOWN'];
	return directions[Math.floor(Math.random() * directions.length)];
};
