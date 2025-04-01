import type { Game } from '../Game';
import GameEvent from '../GameEvent';
import { UIElement } from './UIElement';

export class FadeInRect extends UIElement {
	#progress: number = 1;

	constructor() {
		super('fadeOut');
	}
	draw(x: number, y: number, game: Game) {
		this.#progress -= 0.05;
		game.canvas.context.fillStyle = `rgba(0, 0, 0, ${this.#progress})`;
		game.canvas.context.fillRect(
			x,
			y,
			game.canvas.context.canvas.width,
			game.canvas.context.canvas.height
		);

		if (this.#progress <= 0) {
			GameEvent.dispatchEvent(new CustomEvent('fadedIn'));
			return 1;
		}
		return 0;
	}
}
