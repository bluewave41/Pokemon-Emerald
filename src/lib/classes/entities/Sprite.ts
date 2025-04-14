import type { BankNames } from '$lib/interfaces/BankNames';
import { Game } from '../Game';
import type { GameMap } from '../maps/GameMap';
import SpriteBank from '../SpriteBank';
import { Entity } from './Entity';

export class Sprite extends Entity {
	bank: BankNames;
	sprite: string;

	constructor(x: number, y: number, bank: BankNames, sprite: string, map: GameMap) {
		super(x, y, map);
		this.bank = bank;
		this.sprite = sprite;
	}
	tick() {
		const sub = this.coords.getSub();
		const image = SpriteBank.getSprite(this.bank, this.sprite);
		const xOffset = image.width - 15;
		const yOffset = image.height - 21 + image.height - 21;

		this.map.canvas.drawSprite(
			SpriteBank.getSprite(this.bank, this.sprite),
			Math.round(sub.x) + this.map.absoluteX * Game.getAdjustedTileSize(),
			Math.round(sub.y) + this.map.absoluteY * Game.getAdjustedTileSize(),
			xOffset,
			yOffset
		);
	}
}
