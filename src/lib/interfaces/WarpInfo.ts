import type { Direction, WarpType } from '@prisma/client';

export interface WarpInfo {
	x: number;
	y: number;
	warpId: number;
	warpType: WarpType;
	targetMapId: number;
	targetWarpId: number;
	activateDirection: Direction;
}
