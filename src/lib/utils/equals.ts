import type { Position } from '$lib/interfaces/components/Position';

export function equals(position1: Position, position2: Position) {
	return position1.x === position2.x && position1.y === position2.y;
}
