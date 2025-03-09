import { z } from 'zod';
import type { Game } from '../Game';
import { Tile, tileSchema } from './Tile';

export const signTileSchema = tileSchema.extend({
	text: z.string()
});

export class SignTile extends Tile {
	text: string;

	constructor(tile: Tile, text: string) {
		super(tile.x, tile.y, tile.id, tile.overlay, tile.permissions);
		this.text = text;
		this.kind = 'sign';
	}
	activate(game: Game) {
		game.activeTextBox = this.text;
	}
}
