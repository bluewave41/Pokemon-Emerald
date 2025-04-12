import type { Direction } from '@prisma/client';
import { Game } from './Game';

export class Position {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
	equals(position: Position) {
		return this.x === position.x && this.y === position.y;
	}
	up() {
		return {
			x: this.x,
			y: this.y - 1,
			targetX: this.x,
			targetY: (this.y - 1) * Game.getAdjustedTileSize(),
			direction: 'UP' as Direction
		};
	}
	left() {
		return {
			x: this.x - 1,
			y: this.y,
			targetX: (this.x - 1) * Game.getAdjustedTileSize(),
			targetY: this.y,
			direction: 'LEFT' as Direction
		};
	}
	right() {
		return {
			x: this.x + 1,
			y: this.y,
			targetX: (this.x + 1) * Game.getAdjustedTileSize(),
			targetY: this.y,
			direction: 'RIGHT' as Direction
		};
	}
	down() {
		return {
			x: this.x,
			y: this.y + 1,
			targetX: this.x,
			targetY: (this.y + 1) * Game.getAdjustedTileSize(),
			direction: 'DOWN' as Direction
		};
	}
	toPixels() {
		return new Position(this.x * Game.getAdjustedTileSize(), this.y * Game.getAdjustedTileSize());
	}
	toGrid() {
		return new Position(this.x / Game.getAdjustedTileSize(), this.y / Game.getAdjustedTileSize());
	}
}
