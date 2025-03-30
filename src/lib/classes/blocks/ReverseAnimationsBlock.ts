import type { Tile } from '../tiles/Tile';
import { Block } from './Block';

export class ReverseAnimationsBlock extends Block {
	tiles: Tile[];
	constructor(tiles: Tile[]) {
		super();
		this.tiles = tiles;
	}
	async run() {
		this.tiles.forEach((tile) => tile.setReversed());
		return 1;
	}
}
