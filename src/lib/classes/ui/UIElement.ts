import type { Game } from '../Game';

export class UIElement {
	id: string = '';
	constructor(id: string) {
		this.id = id;
	}
	draw(x: number, y: number, game: Game): number {
		void x;
		void y;
		void game;
		return 0;
	}
}
