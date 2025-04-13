import type { Game } from '../Game';
import GameEvent from '../GameEvent';
import KeyHandler from '../KeyHandler';
import { UIElement } from './UIElement';

export class TextRect extends UIElement {
	text: string;
	startFrame: number;
	finished: boolean = false;
	attached: boolean = false;

	constructor(text: string, startFrame: number) {
		super('textbox');
		this.text = text;
		console.log(text);
		this.startFrame = startFrame;
	}
	draw(x: number, y: number, game: Game) {
		if (!this.attached) {
			this.attached = true;
			GameEvent.once('signComplete', () => {
				this.finished = true;
			});
		}

		if (this.finished) {
			const activeKey = KeyHandler.getActiveKeyState('z');
			if (activeKey.down) {
				game.canvas.elements.continueText();
			}
		}

		game.canvas.showMessageBox(this.text, this.startFrame, game.lastFrameTime);
		return 0;
	}
}
