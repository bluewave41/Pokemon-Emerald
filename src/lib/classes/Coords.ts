import { Game } from './Game';
import { GridPosition, ScreenPosition } from './Position';

export class Coords {
	#last: GridPosition;
	#current: GridPosition;
	#target: ScreenPosition;
	#sub: ScreenPosition;

	constructor(x: number, y: number) {
		this.#current = new GridPosition(x, y);
		this.#last = new GridPosition(x, y);
		this.#target = new ScreenPosition(
			x * Game.getAdjustedTileSize(),
			y * Game.getAdjustedTileSize()
		);
		this.#sub = new ScreenPosition(x * Game.getAdjustedTileSize(), y * Game.getAdjustedTileSize());
	}
	setCoords(x: number, y: number) {
		this.#last = new GridPosition(x, y);
		this.#current = new GridPosition(x, y);
		this.#target = new ScreenPosition(
			x * Game.getAdjustedTileSize(),
			y * Game.getAdjustedTileSize()
		);
		this.#sub = new ScreenPosition(x * Game.getAdjustedTileSize(), y * Game.getAdjustedTileSize());
	}
	setLast(x: number, y: number) {
		this.#last.x = x;
		this.#last.y = y;
	}
	setCurrent(x: number, y: number) {
		this.#current.x = x;
		this.#current.y = y;
	}
	setTarget(pos: ScreenPosition) {
		this.#target = pos;
	}
	setSub(x: number, y: number) {
		this.#sub.x = x;
		this.#sub.y = y;
	}
	getLast() {
		return this.#last;
	}
	getCurrent() {
		return this.#current;
	}
	getTarget() {
		return this.#target;
	}
	getSub() {
		return this.#sub;
	}
}
