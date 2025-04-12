import type { Game } from '../Game';

export type BlockEvents =
	| 'fadedIn'
	| 'fadedOut'
	| 'movementFinished'
	| 'animationComplete'
	| 'continue'
	| 'signComplete';

export class Block {
	id: string = '';
	constructor(id: string) {
		this.id = id;
	}
	async run(game: Game): Promise<number> {
		void game;
		throw new Error('Run must be supplied by block type.');
	}
}
