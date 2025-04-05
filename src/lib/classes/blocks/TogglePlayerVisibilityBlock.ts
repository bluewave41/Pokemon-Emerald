import type { Game } from '../Game';
import { Block } from './Block';

export class TogglePlayerVisibilityBlock extends Block {
	constructor() {
		super('visibility');
	}
	async run(game: Game) {
		game.player.shouldDraw = !game.player.shouldDraw;
		return 1;
	}
}
