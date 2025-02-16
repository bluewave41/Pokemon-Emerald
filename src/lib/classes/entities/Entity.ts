import type { Game } from '../Game';
import { Position } from '../Position';

export class Entity {
	position: Position;

	constructor(x: number, y: number) {
		this.position = new Position(x, y);
	}
	tick(game: Game, currentFrameTime: number) {
		void game;
		void currentFrameTime;
		throw new Error('Method `tick` must be implemented in subclass.');
	}
}
