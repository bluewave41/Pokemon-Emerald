import type { BankNames } from '$lib/interfaces/BankNames';
import { Game } from '../Game';
import SpriteBank from '../SpriteBank';
import { Entity } from './Entity';

export class Sprite extends Entity {
	bank: BankNames;
	sprite: string;

	constructor(id: string, x: number, y: number, bank: BankNames, sprite: string, game: Game) {
		super(id, x, y, game);
		this.bank = bank;
		this.sprite = sprite;
	}
	tick() {
		const active = this.game.activeMap;
		const sub = this.coords.getSub();
		const image = SpriteBank.getSprite(this.bank, this.sprite);
		const xOffset = image.width - 15;
		const yOffset = image.height - 21 + image.height - 21;

		active.canvas.drawSprite(
			SpriteBank.getSprite(this.bank, this.sprite),
			Math.round(sub.x) + active.absoluteX * Game.getAdjustedTileSize(),
			Math.round(sub.y) + active.absoluteY * Game.getAdjustedTileSize(),
			xOffset,
			yOffset
		);
	}
}
