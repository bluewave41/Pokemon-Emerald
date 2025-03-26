import { z } from 'zod';
import { Tile, tileSchema, type BaseTileProps } from './Tile';
import { Direction } from '@prisma/client';

type WarpType = 'door' | 'cave';

export const warpSchema = tileSchema.extend({
	activateDirection: z.nativeEnum(Direction),
	targetMapId: z.number().nullable(),
	targetWarpId: z.number().nullable()
});

export interface WarpProps extends BaseTileProps {
	warpId: number;
	kind: 'warp';
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
