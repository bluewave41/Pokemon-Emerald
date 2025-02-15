import type { Direction } from '$lib/interfaces/Direction';
import type { Game } from '../Game';
import SpriteBank from '../SpriteBank';
import { Entity } from './Entity';

export class Player extends Entity {
	direction: Direction;

	constructor(x: number, y: number, direction: Direction) {
		super(x, y);
		this.direction = direction;
	}
	tick(game: Game) {
		const sprite = SpriteBank.getSprite('player', this.direction);
		game.canvas.drawImage(sprite, this.x, this.y);
	}
}
