import type { BankNames } from '$lib/interfaces/BankNames';
import type { Game } from '../Game';
import { Block } from './Block';

export class DrawSpriteBlock extends Block {
	bank: BankNames;
	sprite: string;
	x: number;
	y: number;

	constructor(bank: BankNames, sprite: string, x: number, y: number) {
		super('drawTile');
		this.bank = bank;
		this.sprite = sprite;
		this.x = x;
		this.y = y;
	}
	async run(game: Game) {
		//game.mapHandler.active.scriptEntities.push(new Sprite(this.x, this.y, game.mapHandler.active));
		return 0;
	}
}
