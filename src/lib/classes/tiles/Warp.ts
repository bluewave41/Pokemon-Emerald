import { z } from 'zod';
import { Tile, tileSchema } from './Tile';
import { Direction, WarpType } from '@prisma/client';
import { tileEventKindSchema } from '$lib/interfaces/Events';

export const createWarp = (x: number, y: number, warpId: number): EditorWarpProps => ({
	kind: 'warp',
	x,
	y,
	warpId,
	type: null,
	targetMapId: null,
	targetWarpId: null,
	activateDirection: null
});

export const warpSchema = tileSchema.extend({
	targetMapId: z.number().nullable(),
	targetWarpId: z.number().nullable(),
	activateDirection: z.nativeEnum(Direction)
});

export const editorWarpSchema = z.object({
	kind: tileEventKindSchema,
	x: z.number(),
	y: z.number(),
	type: z.nativeEnum(WarpType),
	targetMapId: z.number().nullable(),
	targetWarpId: z.number().nullable(),
	activateDirection: z.nativeEnum(Direction)
});

export interface EditorWarpProps {
	kind: 'warp';
	x: number;
	y: number;
	warpId: number;
	type: WarpType | null;
	targetMapId: number | null;
	targetWarpId: number | null;
	activateDirection: Direction | null;
}

export interface WarpProps {
	kind: 'warp';
	x: number;
	y: number;
	targetMapId: number;
	targetWarpId: number;
	activateDirection: Direction;
}

export class Warp extends Tile {
	warpId: number;
	targetMapId: number;
	targetWarpId: number;
	type: WarpType;
	activateDirection: Direction;

	constructor(
		tile: Tile,
		warpId: number,
		activateDirection: Direction,
		targetMapId: number,
		targetWarpId: number,
		type: WarpType
	) {
		super(tile.x, tile.y, tile.id, tile.overlay, tile.permissions, tile.activatedAnimation);
		this.kind = 'warp';
		this.warpId = warpId;
		this.activateDirection = activateDirection;
		this.targetMapId = targetMapId;
		this.targetWarpId = targetWarpId;
		this.type = type;
	}
	getWarpOutSpot() {
		switch (this.activateDirection) {
			case 'UP':
				return { x: this.x, y: this.y - 1 };
			case 'LEFT':
				return { x: this.x - 1, y: this.y };
			case 'RIGHT':
				return { x: this.x + 1, y: this.y };
			case 'DOWN':
				return { x: this.x, y: this.y + 1 };
			default:
				return { x: this.x, y: this.y };
		}
	}
}
