import type { EditorWarpProps } from '$lib/classes/tiles/Warp';
import type { Direction } from '@prisma/client';
import { z } from 'zod';

class Event {
	constructor() {}
}

export class StepEvent extends Event {
	direction: Direction;
	count?: number;

	constructor(direction: Direction, count?: number) {
		super();
		this.direction = direction;
		this.count = count ?? 1;
	}
}

export type EventBlocks = 'up' | 'down' | 'left' | 'right';

export type TileEvents = 'none' | 'sign' | 'warp';
export type MapEvents = EditorWarpProps;

export const tileEventKindSchema = z.union([
	z.literal('none'),
	z.literal('sign'),
	z.literal('warp')
]);
