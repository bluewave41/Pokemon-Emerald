import type { EntityWith } from '$lib/classes/Game';
import type { GridPosition } from '$lib/interfaces/components/GridPosition';

export const getFacingPosition = (entity: EntityWith<'Position' | 'Direction'>): GridPosition => {
	const direction = entity.components.Direction;
	const position = entity.components.Position;

	switch (direction) {
		case 'UP':
			return { type: 'grid', x: position.x, y: position.y - 1 };
		case 'LEFT':
			return { type: 'grid', x: position.x - 1, y: position.y };
		case 'RIGHT':
			return { type: 'grid', x: position.x + 1, y: position.y };
		case 'DOWN':
			return { type: 'grid', x: position.x, y: position.y + 1 };
	}
};
