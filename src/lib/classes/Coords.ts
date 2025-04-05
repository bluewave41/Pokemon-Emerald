import { Game } from './Game';
import { Position } from './Position';

export class Coords {
	current: Position;
	target: Position;
	sub: Position;

	constructor(x: number, y: number) {
		this.current = new Position(x, y);
		this.target = new Position(x * Game.getAdjustedTileSize(), y * Game.getAdjustedTileSize());
		this.sub = new Position(x * Game.getAdjustedTileSize(), y * Game.getAdjustedTileSize());
	}
	setCoords(x: number, y: number) {
		this.current = new Position(x, y);
		this.target = new Position(x * Game.getAdjustedTileSize(), y * Game.getAdjustedTileSize());
		this.sub = new Position(x * Game.getAdjustedTileSize(), y * Game.getAdjustedTileSize());
	}
	setCurrent(x: number, y: number) {
		this.current = new Position(x, y);
	}
	setTarget(x: number, y: number) {
		this.target = new Position(x, y);
	}
	setSub(x: number, y: number) {
		this.sub = new Position(x, y);
	}
}
