import type { Canvas } from '../Canvas';
import GameEvent from '../GameEvent';
import { UIElement } from './UIElement';

export class FadeInRect extends UIElement {
	#progress: number = 1;

	constructor() {
		super('fadeOut');
	}
	draw(x: number, y: number, canvas: Canvas) {
		this.#progress -= 0.05;
		canvas.context.fillStyle = `rgba(0, 0, 0, ${this.#progress})`;
		canvas.context.fillRect(x, y, canvas.context.canvas.width, canvas.context.canvas.height);

		if (this.#progress <= 0) {
			GameEvent.dispatchEvent(new CustomEvent('fadedIn'));
			return 1;
		}
		return 0;
	}
}
