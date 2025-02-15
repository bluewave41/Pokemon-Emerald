import type { Direction } from '$lib/interfaces/Direction';
import type { Game } from '../Game';
import KeyHandler from '../KeyHandler';
import SpriteBank from '../SpriteBank';
import { Entity } from './Entity';

export class Player extends Entity {
	direction: Direction;

	constructor(x: number, y: number, direction: Direction) {
		super(x, y);
		this.direction = direction;
	}
	tick(game: Game) {
		this.updateDirection();
		const sprite = SpriteBank.getSprite('player', this.direction);
		game.canvas.drawImage(sprite, this.x, this.y);
	}
	updateDirection() {
		if (KeyHandler.getKeyState('ArrowUp').down) {
			this.direction = 'up';
		} else if (KeyHandler.getKeyState('ArrowDown').down) {
			this.direction = 'down';
		} else if (KeyHandler.getKeyState('ArrowLeft').down) {
			this.direction = 'left';
		} else if (KeyHandler.getKeyState('ArrowRight').down) {
			this.direction = 'right';
		}
	}
}
