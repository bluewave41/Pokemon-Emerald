import { Game } from './Game';
import { Position } from './Position';

export class Coords {
	#last: Position;
	// square position of the player
	#current: Position;
	// pixel position of the target square
	#target: Position;
	// sub pixel position of the player
	#sub: Position;

	constructor(x: number, y: number) {
		this.#current = new Position(x, y);
		this.#last = new Position(x, y);
		this.#target = new Position(x * Game.getAdjustedTileSize(), y * Game.getAdjustedTileSize());
		this.#sub = new Position(x * Game.getAdjustedTileSize(), y * Game.getAdjustedTileSize());
	}
	setCoords(x: number, y: number) {
		this.#current = new Position(x, y);
		this.#target = new Position(x * Game.getAdjustedTileSize(), y * Game.getAdjustedTileSize());
		this.#sub = new Position(x * Game.getAdjustedTileSize(), y * Game.getAdjustedTileSize());
	}
	setLast(x: number, y: number) {
		this.#last.x = x;
		this.#last.y = y;
	}
	setCurrent(x: number, y: number) {
		this.#current.x = x;
		this.#current.y = y;
	}
	setTarget(x: number, y: number) {
		this.#target.x = x;
		this.#target.y = y;
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
