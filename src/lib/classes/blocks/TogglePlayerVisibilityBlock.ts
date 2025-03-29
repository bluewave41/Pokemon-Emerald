import type { Game } from '../Game';
import { Block } from './Block';

export class TogglePlayerVisibilityBlock extends Block {
	constructor() {
		super();
	}
	async run(game: Game) {
		game.player.shouldDraw = !game.player.shouldDraw;
	}
}
