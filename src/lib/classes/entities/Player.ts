import type { Direction } from '$lib/interfaces/Direction';
import { Game } from '../Game';
import KeyHandler from '../KeyHandler';
import { Position } from '../Position';
import SpriteBank from '../SpriteBank';
import { Entity } from './Entity';

export class Player extends Entity {
	targetPosition: Position;
	subPosition: Position;
	direction: Direction;
	moving: boolean = false;
	speed: number = Game.getAdjustedTileSize() * 2;
	walkFrame: number = 1;

	constructor(x: number, y: number, direction: Direction) {
		super(x, y);
		this.targetPosition = new Position(
			x * Game.getAdjustedTileSize(),
			y * Game.getAdjustedTileSize()
		);
		this.subPosition = new Position(x * Game.getAdjustedTileSize(), y * Game.getAdjustedTileSize());
		this.direction = direction;
	}
	tick(game: Game, currentFrameTime: number) {
		if (!this.moving) {
			this.updateDirection();
		}
		this.move(game.lastFrameTime, currentFrameTime);
		const walkSprite = this.moving ? this.direction + this.walkFrame : this.direction;
		const sprite = SpriteBank.getSprite('player', walkSprite);
		game.canvas.drawAbsoluteImage(
			sprite,
			Math.round(this.subPosition.x),
			Math.round(this.subPosition.y)
		);
	}
	updateDirection() {
		if (KeyHandler.getKeyState('ArrowUp').down) {
			this.moving = true;
			this.direction = 'up';
			this.position.y--;
			this.targetPosition.y -= Game.getAdjustedTileSize();
		} else if (KeyHandler.getKeyState('ArrowDown').down) {
			this.moving = true;
			this.direction = 'down';
			this.position.y++;
			this.targetPosition.y += Game.getAdjustedTileSize();
		} else if (KeyHandler.getKeyState('ArrowLeft').down) {
			this.moving = true;
			this.direction = 'left';
			this.position.x--;
			this.targetPosition.x -= Game.getAdjustedTileSize();
		} else if (KeyHandler.getKeyState('ArrowRight').down) {
			this.moving = true;
			this.direction = 'right';
			this.position.x++;
			this.targetPosition.x += Game.getAdjustedTileSize();
		}
	}
	move(lastFrameTime: number, currentFrameTime: number) {
		if (!this.moving) {
			return;
		}

		const deltaTime = (currentFrameTime - lastFrameTime) / 1000; // in seconds

		const moveX = this.speed * deltaTime;
		const moveY = this.speed * deltaTime;

		if (this.direction === 'right') {
			this.subPosition.x = Math.round(Math.min(this.subPosition.x + moveX, this.targetPosition.x));
		} else if (this.direction === 'left') {
			this.subPosition.x = Math.round(Math.max(this.subPosition.x - moveX, this.targetPosition.x));
		}

		if (this.direction === 'down') {
			this.subPosition.y = Math.round(Math.min(this.subPosition.y + moveY, this.targetPosition.y));
		} else if (this.direction === 'up') {
			this.subPosition.y = Math.round(Math.max(this.subPosition.y - moveY, this.targetPosition.y));
		}

		if (
			this.subPosition.x === this.targetPosition.x &&
			this.subPosition.y === this.targetPosition.y
		) {
			this.moving = false;
		}
	}
}
