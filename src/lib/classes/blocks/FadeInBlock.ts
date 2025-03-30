import type { Game } from '../Game';
import GameEvent from '../GameEvent';
import { Block } from './Block';

export class FadeInBlock extends Block {
	constructor() {
		super();
	}
	async run(game: Game) {
		game.canvas.fadeIn();
		await GameEvent.waitForOnce('fadedIn');
		return 1;
	}
}
