import type { Direction } from '$lib/interfaces/Direction';
import { Game } from '../Game';
import type { GameMap } from '../maps/GameMap';
import KeyHandler from '../KeyHandler';
import { Position } from '../Position';
import SpriteBank from '../SpriteBank';
import { Entity } from './Entity';

export class Player extends Entity {
	targetPosition: Position;
	subPosition: Position;
	direction: Direction;
	moving: boolean = false;
	speed: number = Game.getAdjustedTileSize() * 3;
	walkFrame: number = 1;
	counter: number = 0;
	signalMapChange: (direction: Direction) => void;

	constructor(
		x: number,
		y: number,
		direction: Direction,
		signalMapChange: (direction: Direction) => void
	) {
		super(x, y);
		this.targetPosition = new Position(
			x * Game.getAdjustedTileSize(),
			y * Game.getAdjustedTileSize()
		);
		this.subPosition = new Position(x * Game.getAdjustedTileSize(), y * Game.getAdjustedTileSize());
		this.direction = direction;
		this.signalMapChange = signalMapChange;
	}
	tick(game: Game, currentFrameTime: number) {
		// we should always draw the Player
		const walkSprite =
			this.moving && this.counter < 10 ? this.direction + this.walkFrame : this.direction;
		const sprite = SpriteBank.getSprite('player', walkSprite);
		game.canvas.drawAbsoluteImage(
			sprite,
			Math.round(this.subPosition.x) + 1,
			Math.round(this.subPosition.y + (this.counter < 10 ? 1 : 0)) - 10
		);

		// but don't let them move if a textbox or something is active...
		if (!game.canPlayerMove) {
			return;
		}

		if (!this.moving) {
			this.updateDirection(game);
		}

		this.move(game.lastFrameTime, currentFrameTime);

		if (KeyHandler.getActiveKeyState('z').down) {
			const tile = this.getFacingTile(game.mapHandler.active);
			tile.activate(game);
		}
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
			if (this.isNewTileOutsideMap(game, tableEntry.x, tableEntry.y)) {
				//this.signalMapChange(this.getOutsideMapDirection(game, tableEntry.x, tableEntry.y));
				this.moving = true;
				this.position = { x: tableEntry.x, y: game.mapHandler.active.height };
				this.targetPosition = { x: tableEntry.targetX, y: tableEntry.targetY };
				console.log('here', this.position, this.targetPosition);
				this.counter = 0;
			} else {
				const newTile = game.mapHandler.active.getTile(tableEntry.x, tableEntry.y);
				const keyState = KeyHandler.getKeyState(direction);
				if (keyState.holdCount > 8 && newTile.isPassable()) {
					this.moving = true;
					this.position = { x: tableEntry.x, y: tableEntry.y };
					this.targetPosition = { x: tableEntry.targetX, y: tableEntry.targetY };
					console.log(this.position, this.targetPosition);
					this.counter = 0;
				}
				// we should always turn to face the direction
				this.direction = tableEntry.direction as Direction;
			}
		}
	}
	isNewTileOutsideMap(game: Game, x: number, y: number) {
		return x < 0 || y < 0 || x > game.mapHandler.active.width || y > game.mapHandler.active.height;
	}
	getOutsideMapDirection(game: Game, x: number, y: number) {
		if (x < 0) {
			return 'left';
		} else if (y < 0) {
			return 'up';
		} else if (x > game.mapHandler.active.width) {
			return 'right';
		} else if (y > game.mapHandler.active.height) {
			return 'down';
		}
	}
	getFacingTile(map: GameMap) {
		const pos = this.position;
		if (this.direction === 'left') {
			return map.getTile(pos.x - 1, pos.y);
		} else if (this.direction === 'right') {
			return map.getTile(pos.x + 1, pos.y);
		} else if (this.direction === 'up') {
			return map.getTile(pos.x, pos.y - 1);
		} else if (this.direction === 'down') {
			return map.getTile(pos.x, pos.y + 1);
		} else {
			throw new Error('Invalid player direction.');
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
		} else if (this.direction === 'down') {
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
