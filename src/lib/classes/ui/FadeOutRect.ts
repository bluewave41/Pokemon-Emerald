import type { Canvas } from '../Canvas';
import GameEvent from '../GameEvent';
import { UIElement } from './UIElement';

export class FadeOutRect extends UIElement {
	#progress: number = 0;

	constructor() {
		super('fadeIn');
	}
	draw(x: number, y: number, canvas: Canvas) {
		this.#progress += 0.05;
		canvas.context.fillStyle = `rgba(0, 0, 0, ${this.#progress})`;
		canvas.context.fillRect(x, y, canvas.context.canvas.width, canvas.context.canvas.height);

		if (this.#progress >= 1) {
			GameEvent.dispatchEvent(new CustomEvent('fadedOut'));
			// fade out should be removed by fade in
		}
		return 0;
	}
}
