import type { Game } from '../Game';
import GameEvent from '../GameEvent';
import { UIElement } from './UIElement';

export class Rect extends UIElement {
	#progress: number = 0;

	constructor() {
		super();
	}
	draw(game: Game) {
		this.#progress += 0.05;
		const context = game.canvas.context;
		context.fillStyle = `rgba(0, 0, 0, ${0.7})`;
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);

		if (this.#progress >= 1) {
			console.log('done');
			GameEvent.dispatchEvent(new CustomEvent('fadedOut'));
		}
	}
}
