import { z } from 'zod';
import { Tile, tileSchema, type BaseTileProps } from './Tile';
import { Direction } from '@prisma/client';

type WarpType = 'door' | 'cave';

export const warpSchema = tileSchema.extend({
	target: z.number(),
	activateDirection: z.nativeEnum(Direction)
});

export interface WarpProps extends BaseTileProps {
	kind: 'warp';
	target: number;
	activateDirection: Direction;
}

export class Warp extends Tile {
	activateDirection: Direction | null = null;
	target: number | null = null;
	type: WarpType = 'door';

	constructor(tile: Tile, activateDirection: Direction, target?: number) {
		super(tile.x, tile.y, tile.id, tile.overlay, tile.permissions);
		this.kind = 'warp';
		this.activateDirection = activateDirection;
		this.target = target ?? null;
	}
}
