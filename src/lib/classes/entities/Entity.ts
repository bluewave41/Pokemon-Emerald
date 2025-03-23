import type { Game } from '../Game';
import { Position } from '../Position';

export class Entity {
	position: Position;
	game: Game;

	constructor(x: number, y: number, game: Game) {
		this.position = new Position(x, y);
		this.game = game;
	}
	tick(currentFrameTime: number) {
		void currentFrameTime;
		throw new Error('Method `tick` must be implemented in subclass.');
	}
}
