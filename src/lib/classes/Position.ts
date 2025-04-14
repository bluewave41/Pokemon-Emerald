import { Game } from './Game';

export class Position<T extends Position<T>> {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
	equals(position: T) {
		return this.x === position.x && this.y === position.y;
	}
}

export class GridPosition extends Position<GridPosition> {
	constructor(x: number, y: number) {
		super(x, y);
	}
	up() {
		return new GridPosition(this.x, this.y - 1);
	}
	left() {
		return new GridPosition(this.x - 1, this.y);
	}
	right() {
		return new GridPosition(this.x + 1, this.y);
	}
	down() {
		return new GridPosition(this.x, this.y + 1);
	}
	toScreen() {
		return new ScreenPosition(
			this.x * Game.getAdjustedTileSize(),
			this.y * Game.getAdjustedTileSize()
		);
	}
}

export class ScreenPosition extends Position<ScreenPosition> {
	constructor(x: number, y: number) {
		super(x, y);
	}
	up() {
		return new ScreenPosition(this.x, this.y - Game.getAdjustedTileSize());
	}
	left() {
		return new ScreenPosition(this.x - Game.getAdjustedTileSize(), this.y);
	}
	right() {
		return new ScreenPosition(this.x + Game.getAdjustedTileSize(), this.y);
	}
	down() {
		return new ScreenPosition(this.x, this.y + Game.getAdjustedTileSize());
	}
	toGrid() {
		return new GridPosition(
			this.x / Game.getAdjustedTileSize(),
			this.y / Game.getAdjustedTileSize()
		);
	}
}
