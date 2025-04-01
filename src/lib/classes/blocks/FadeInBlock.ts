import type { Game } from '../Game';
import GameEvent from '../GameEvent';
import { FadeInRect } from '../ui/FadeInRect';
import { Block } from './Block';

export class FadeInBlock extends Block {
	constructor() {
		super('fadeIn');
	}
	async run(game: Game) {
		// remove the fade out block
		game.canvas.elements.removeElement('fadedOut');
		game.canvas.elements.addElement(new FadeInRect());
		await GameEvent.waitForOnce('fadedIn');
		return 1;
	}
}
