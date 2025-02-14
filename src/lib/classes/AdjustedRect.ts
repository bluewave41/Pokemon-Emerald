import { Game } from './Game';

export class AdjustedRect {
	x: number;
	y: number;
	width: number;
	height: number;

	constructor(x: number, y: number, w: number = 1, h: number = 1) {
		this.x = x * Game.getAdjustedTileSize();
		this.y = y * Game.getAdjustedTileSize();
		this.width = w * Game.getAdjustedTileSize();
		this.height = h * Game.getAdjustedTileSize();
	}
}
