import { Game } from './Game';
import { Position } from './Position';

export type CoordType = 'current' | 'target' | 'sub';

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
		this.current.x = x;
		this.current.y = y;
	}
	setTarget(x: number, y: number) {
		this.target.x = x;
		this.target.y = y;
	}
	setSub(x: number, y: number) {
		this.sub.x = x;
		this.sub.y = y;
	}
}
