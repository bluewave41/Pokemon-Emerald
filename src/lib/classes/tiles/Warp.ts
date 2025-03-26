import { z } from 'zod';
import { Tile, tileSchema, type BaseTileProps } from './Tile';
import { Direction } from '@prisma/client';

type WarpType = 'door' | 'cave';

export const createWarp = (warpId: number, x: number, y: number): EditorWarpProps => ({
	kind: 'warp',
	x,
	y,
	warpId,
	targetMapId: null,
	targetWarpId: null,
	activateDirection: null
});

export const warpSchema = tileSchema.extend({
	targetMapId: z.number().nullable(),
	targetWarpId: z.number().nullable(),
	activateDirection: z.nativeEnum(Direction)
});

export interface EditorWarpProps {
	kind: 'warp';
	x: number;
	y: number;
	warpId: number;
	targetMapId: number | null;
	targetWarpId: number | null;
	activateDirection: Direction | null;
}

export interface WarpProps extends BaseTileProps {
	kind: 'warp';
	warpId: number;
	targetMapId: number;
	targetWarpId: number;
	activateDirection: Direction;
}

export class Warp extends Tile {
	warpId: number;
	targetMapId: number | null;
	targetWarpId: number | null;
	type: WarpType = 'door';
	activateDirection: Direction | null = null;

	constructor(
		warpId: number,
		tile: Tile,
		activateDirection?: Direction,
		targetMapId?: number,
		targetWarpId?: number
	) {
		super(tile.x, tile.y, tile.id, tile.overlay, tile.permissions, tile.activatedAnimation);
		this.warpId = warpId;
		this.kind = 'warp';
		this.activateDirection = activateDirection ?? null;
		this.targetMapId = targetMapId ?? null;
		this.targetWarpId = targetWarpId ?? null;
	}
}
