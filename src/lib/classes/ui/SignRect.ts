import type { Game } from '../Game';
import GameEvent from '../GameEvent';
import { UIElement } from './UIElement';

export class SignRect extends UIElement {
	text: string;
	startFrame: number;
	finished: boolean = false;
	attached: boolean = false;

	constructor(text: string, startFrame: number) {
		super('sign');
		this.text = text;
		this.startFrame = startFrame;
	}
	draw(x: number, y: number, game: Game) {
		if (!this.attached) {
			this.attached = true;
			GameEvent.once('signComplete', () => {
				this.finished = true;
			});
		}

		game.canvas.showMessageBox(this.text, this.startFrame, game.lastFrameTime);
		return 0;
	}
}
