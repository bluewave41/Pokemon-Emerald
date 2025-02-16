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
	counter: number = 0;

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
			this.updateDirection(game);
		}
		this.move(game.lastFrameTime, currentFrameTime);
		const walkSprite =
			this.moving && this.counter < 20 ? this.direction + this.walkFrame : this.direction;
		const sprite = SpriteBank.getSprite('player', walkSprite);
		game.canvas.drawAbsoluteImage(
			sprite,
			Math.round(this.subPosition.x),
			Math.round(this.subPosition.y + (this.counter < 20 ? 1 : 0))
		);
	}
	updateDirection(game: Game) {
		const moveTable = {
			ArrowUp: {
				x: this.position.x,
				y: this.position.y - 1,
				targetX: this.targetPosition.x,
				targetY: this.targetPosition.y - Game.getAdjustedTileSize(),
				direction: 'up'
			},
			ArrowDown: {
				x: this.position.x,
				y: this.position.y + 1,
				targetX: this.targetPosition.x,
				targetY: this.targetPosition.y + Game.getAdjustedTileSize(),
				direction: 'down'
			},
			ArrowLeft: {
				x: this.position.x - 1,
				y: this.position.y,
				targetX: this.targetPosition.x - Game.getAdjustedTileSize(),
				targetY: this.targetPosition.y,
				direction: 'left'
			},
			ArrowRight: {
				x: this.position.x + 1,
				y: this.position.y,
				targetX: this.targetPosition.x + Game.getAdjustedTileSize(),
				targetY: this.targetPosition.y,
				direction: 'right'
			}
		};

		const direction = KeyHandler.getPrioritizedKey();
		if (direction !== null) {
			const tableEntry = moveTable[direction];
			const newTile = game.map.getTile(tableEntry.x, tableEntry.y);
			const keyState = KeyHandler.getKeyState(direction);
			if (keyState.holdCount > 5 && newTile.isPassable()) {
				this.moving = true;
				this.position = { x: tableEntry.x, y: tableEntry.y };
				this.targetPosition = { x: tableEntry.targetX, y: tableEntry.targetY };
				this.counter = 0;
			}
			// we should always turn to face the direction
			this.direction = tableEntry.direction as Direction;
		}
	}
	move(lastFrameTime: number, currentFrameTime: number) {
		if (!this.moving) {
			return;
		}

		this.counter++;

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
			this.walkFrame = this.walkFrame === 1 ? 2 : 1;
		}
	}
}
