import type { Game } from '../Game';
import GameEvent from '../GameEvent';
import { Block } from './Block';

export class FadeOutBlock extends Block {
	constructor() {
		super();
	}
	async run(game: Game) {
		game.canvas.fadeToBlack();
		await GameEvent.waitForOnce('fadedOut');
		return 1;
	}
}
