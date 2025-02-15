import type { Game } from '../Game';

export class Entity {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
	tick(game: Game) {
		void game;
		throw new Error('Method `tick` must be implemented in subclass.');
	}
}
