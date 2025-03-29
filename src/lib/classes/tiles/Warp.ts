import { z } from 'zod';
import { Tile, tileSchema } from './Tile';
import { Direction } from '@prisma/client';
import { tileEventKindSchema } from '$lib/interfaces/Events';

type WarpType = 'door' | 'cave';

export const createWarp = (x: number, y: number): EditorWarpProps => ({
	kind: 'warp',
	x,
	y,
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
	targetMapId: z.number().nullable(),
	targetWarpId: z.number().nullable(),
	activateDirection: z.nativeEnum(Direction)
});

export interface EditorWarpProps {
	kind: 'warp';
	x: number;
	y: number;
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
	targetMapId: number;
	targetWarpId: number;
	type: WarpType = 'door';
	activateDirection: Direction;

	constructor(tile: Tile, activateDirection: Direction, targetMapId: number, targetWarpId: number) {
		super(tile.x, tile.y, tile.id, tile.overlay, tile.permissions, tile.activatedAnimation);
		this.kind = 'warp';
		this.activateDirection = activateDirection;
		this.targetMapId = targetMapId;
		this.targetWarpId = targetWarpId;
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
