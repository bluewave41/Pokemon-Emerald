import { z } from 'zod';
import type { Game } from '../Game';
import { Tile, tileSchema, type BaseTileProps } from './Tile';

export const signTileSchema = tileSchema.extend({
	text: z.string()
});

export interface SignProps extends BaseTileProps {
	kind: 'sign';
	text: string;
}

export class SignTile extends Tile {
	text: string;

	constructor(tile: Tile, text: string) {
		super(tile.x, tile.y, tile.id, tile.overlay, tile.permissions);
		this.text = text;
		this.kind = 'sign';
	}
	activate(game: Game) {
		game.activeTextBox = {
			text: this.text,
			startFrame: game.lastFrameTime
		};
	}
}
