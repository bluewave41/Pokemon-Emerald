import type { Game } from '../Game';

export class Tile {
	x: number;
	y: number;
	id: number;
	permissions: number;

	constructor(x: number, y: number, id: number, permissions: number) {
		this.x = x;
		this.y = y;
		this.id = id;
		this.permissions = permissions;
	}
	isPassable() {
		return this.permissions !== 1;
	}
	activate(game: Game) {
		void game;
	}
}
