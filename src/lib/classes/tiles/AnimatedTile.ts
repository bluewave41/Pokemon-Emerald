import type { TileFrame } from '@prisma/client';
import { Tile } from './Tile';
import type { Canvas } from '../Canvas';

export class AnimatedTile extends Tile {
	frames: TileFrame[] = [];
	sequence: number[] = [];
	frame: number = 0;

	constructor(tile: Tile) {
		super(tile.x, tile.y, tile.id, tile.overlay, tile.permissions);
	}
	tick(canvas: Canvas) {}
}
