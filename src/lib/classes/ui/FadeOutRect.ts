import type { Game } from '../Game';
import GameEvent from '../GameEvent';
import { UIElement } from './UIElement';

export class FadeOutRect extends UIElement {
	#progress: number = 0;

	constructor() {
		super('fadeIn');
	}
	draw(x: number, y: number, game: Game) {
		this.#progress += 0.05;
		game.canvas.context.fillStyle = `rgba(0, 0, 0, ${this.#progress})`;
		game.canvas.context.fillRect(
			x,
			y,
			game.canvas.context.canvas.width,
			game.canvas.context.canvas.height
		);

		if (this.#progress >= 1) {
			GameEvent.dispatchEvent(new CustomEvent('fadedOut'));
			// fade out should be removed by fade in
		}
		return 0;
	}
}
