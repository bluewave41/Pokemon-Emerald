import type { Game } from '../Game';
import GameEvent from '../GameEvent';
import { FadeOutRect } from '../ui/FadeOutRect';
import { Block } from './Block';

export class FadeOutBlock extends Block {
	constructor() {
		super('fadeOut');
	}
	async run(game: Game) {
		game.canvas.elements.addElement(new FadeOutRect());
		await GameEvent.waitForOnce('fadedOut');
		return 1;
	}
}
