import type { Game } from '../Game';

export type BlockEvents =
	| 'fadedIn'
	| 'fadedOut'
	| 'scriptedMovementComplete'
	| 'animationComplete'
	| 'continue';

export class Block {
	constructor() {}
	async run(game: Game): Promise<number> {
		void game;
		throw new Error('Run must be supplied by block type.');
	}
}
