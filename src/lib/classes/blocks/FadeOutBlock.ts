import type { Game } from '../Game';
import { Rect } from '../ui/Rect';
import { Block } from './Block';

export class FadeOutBlock extends Block {
	constructor() {
		super();
	}
	async run(game: Game) {
		game.canvas.addElement(new Rect());
		//await GameEvent.waitForOnce('fadedOut');
		return 1;
	}
}
