import { Tile } from './Tile';

export class WarpTile extends Tile {
	constructor(tile: Tile) {
		super(tile.x, tile.y, tile.id, tile.overlay, tile.permissions);
		this.kind = 'warp';
	}
}
