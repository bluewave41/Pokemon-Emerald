import type { BankNames } from '$lib/interfaces/BankNames';
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
		const { x, y } = this.coords.getCurrent();
		this.map.drawImage(SpriteBank.getSprite(this.bank, this.sprite), x, y);
	}
}
