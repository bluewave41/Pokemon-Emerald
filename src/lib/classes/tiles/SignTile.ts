import type { SignEvent } from '../events/SignEvent';
import type { Game } from '../Game';
import { Tile } from './Tile';

export class SignTile extends Tile {
	text: string;
	event: SignEvent | null = null;

	constructor(tile: Tile, text: string) {
		super(tile.x, tile.y, tile.id, tile.permissions);
		this.text = text;
	}
	activate(game: Game) {
		game.activeTextBox = this.text;
	}
}
