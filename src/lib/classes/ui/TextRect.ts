import type { Game } from '../Game';
import GameEvent from '../GameEvent';
import KeyHandler from '../KeyHandler';
import { UIElement } from './UIElement';

export class TextRect extends UIElement {
	text: string[];
	startFrame: number;
	finished: boolean = false;
	attached: boolean = false;
	scrollOffset: number = 0;
	targetScrollOffset: number = 0;
	index: number = 0;

	constructor(text: string[], startFrame: number) {
		super('textbox');
		this.text = text;
		this.startFrame = startFrame;
	}
	draw(x: number, y: number, game: Game) {
		if (this.scrollOffset > this.targetScrollOffset) {
			this.scrollOffset -= 6;
		}
		if (this.targetScrollOffset !== 0 && this.scrollOffset === this.targetScrollOffset) {
			this.targetScrollOffset = 0;
			this.index++;
			this.finished = false;
			this.startFrame = game.lastFrameTime;
			GameEvent.dispatch('textScrolled', { done: true });
		}
		if (!this.attached) {
			this.attached = true;
			GameEvent.attach('textComplete', () => {
				this.finished = true;
			});
		}

		if (this.finished) {
			const activeKey = KeyHandler.getActiveKeyState('z');
			if (activeKey.down) {
				const scroll = this.text.length > 2;
				if (!scroll) {
					GameEvent.detach('textComplete', () => {
						this.finished = true;
					});
				}
				GameEvent.dispatch('continueText', { scroll: this.text.length > 2 });
			}
		}

		game.canvas.showMessageBox(
			this.text,
			this.startFrame,
			game.lastFrameTime,
			this.scrollOffset,
			this.index
		);
		return 0;
	}
	scroll() {
		this.targetScrollOffset = -36;
	}
}
