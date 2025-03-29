import { Block } from './Block';
import type { Game } from '../Game';
import type { AnimationDirection } from '$lib/interfaces/AnimationDirection';
import type { Tile } from '../tiles/Tile';
import GameEvent from '../GameEvent';

export class AnimateTilesBlock extends Block {
	tiles: Tile[];
	direction: AnimationDirection;

	constructor(tiles: Tile[], direction: AnimationDirection) {
		super();
		this.tiles = tiles;
		this.direction = direction;
	}
	async run(game: Game) {
		void game;
		if (this.direction === 'forwards') {
			this.tiles.forEach((tile) => tile.playForward());
		} else {
			this.tiles.forEach((tile) => tile.playReversed());
		}
		await GameEvent.waitForOnce('animationComplete');
	}
}
