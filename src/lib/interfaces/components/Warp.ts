import type { Direction } from '@prisma/client';

type WarpType = 'DOOR' | 'STAIRS' | 'CAVE';

export interface Warp {
	warpId: number;
	activateDirection: Direction;
	targetMapId: number;
	targetWarpId: number;
	type: WarpType;
}
