import { Game } from '../Game';
import type { GameMap } from '../maps/GameMap';
import KeyHandler, { type MovementKeys } from '../KeyHandler';
import { Position } from '../Position';
import SpriteBank from '../SpriteBank';
import { Entity } from './Entity';
import type { Direction } from '@prisma/client';

export class Player extends Entity {
	targetPosition: Position;
	subPosition: Position;
	direction: Direction;
	moving: boolean = false;
	speed: number = Game.getAdjustedTileSize() * 3;
	walkFrame: number = 1;
	counter: number = 0;

	constructor(x: number, y: number, game: Game, direction: Direction) {
		super(x, y, game);
		this.targetPosition = new Position(
			x * Game.getAdjustedTileSize(),
			y * Game.getAdjustedTileSize()
		);
		this.subPosition = new Position(x * Game.getAdjustedTileSize(), y * Game.getAdjustedTileSize());
		this.direction = direction;
	}
	tick(currentFrameTime: number) {
		const direction = this.direction.toLowerCase();
		// we should always draw the Player
		const walkSprite = this.moving && this.counter < 10 ? direction + this.walkFrame : direction;
		const sprite = SpriteBank.getSprite('player', walkSprite);
		this.game.canvas.drawAbsoluteImage(
			sprite,
			Math.round(this.subPosition.x) + 1 + this.game.viewport.pos.xOffset,
			Math.round(this.subPosition.y + (this.counter < 10 ? 1 : 0)) -
				10 +
				this.game.viewport.pos.yOffset
		);

		const activeKey = KeyHandler.getActiveKeyState('z');

		if (activeKey.down && activeKey.initial) {
			if (this.game.activeTextBox) {
				this.game.activeTextBox = null;
			} else {
				const tile = this.getFacingTile(this.game.mapHandler.active);
				tile.activate(this.game);
			}
		}

		// but don't let them move if a textbox or something is active...
		if (!this.game.canPlayerMove) {
			return;
		}

		if (!this.moving) {
			this.updateDirection();
		}

		this.move(this.game.lastFrameTime, currentFrameTime);
	}
	updateDirection() {
		const moveTable: Record<
			MovementKeys,
			{
				x: number;
				y: number;
				targetX: number;
				targetY: number;
				direction: Direction;
			}
		> = {
			ArrowUp: {
				x: this.position.x,
				y: this.position.y - 1,
				targetX: this.targetPosition.x,
				targetY: this.targetPosition.y - Game.getAdjustedTileSize(),
				direction: 'UP'
			},
			ArrowDown: {
				x: this.position.x,
				y: this.position.y + 1,
				targetX: this.targetPosition.x,
				targetY: this.targetPosition.y + Game.getAdjustedTileSize(),
				direction: 'DOWN'
			},
			ArrowLeft: {
				x: this.position.x - 1,
				y: this.position.y,
				targetX: this.targetPosition.x - Game.getAdjustedTileSize(),
				targetY: this.targetPosition.y,
				direction: 'LEFT'
			},
			ArrowRight: {
				x: this.position.x + 1,
				y: this.position.y,
				targetX: this.targetPosition.x + Game.getAdjustedTileSize(),
				targetY: this.targetPosition.y,
				direction: 'RIGHT'
			}
		};

		const direction = KeyHandler.getPrioritizedKey();
		if (direction !== null) {
			const tableEntry = moveTable[direction];
			const keyState = KeyHandler.getKeyState(direction);
			if (keyState.holdCount > 8) {
				if (this.isNewTileOutsideMap(tableEntry.x, tableEntry.y)) {
					this.game.changeMap(this.getOutsideMapDirection(tableEntry.x, tableEntry.y));
					this.moving = true;
					this.counter = 0;
				} else {
					const newTile = this.game.mapHandler.active.getTile(tableEntry.x, tableEntry.y);
					if (keyState.holdCount > 8 && newTile.isPassable()) {
						const currentTile = this.game.mapHandler.active.getTile(
							this.position.x,
							this.position.y
						);
						if (currentTile.isWarp() && currentTile.activateDirection === this.direction) {
							// get upper tile
							// get linking tile
							// set both door tiles
							// do door animation
							// walk
							// fade to back
							// change maps
							// do backwards without delay
							// walk out
						}
						this.moving = true;
						this.position = { x: tableEntry.x, y: tableEntry.y };
						this.targetPosition = { x: tableEntry.targetX, y: tableEntry.targetY };
						this.counter = 0;
					}
				}
			}
			// we should always turn to face the direction
			this.direction = tableEntry.direction as Direction;
		}
	}
	isNewTileOutsideMap(x: number, y: number) {
		return (
			x < 0 ||
			y < 0 ||
			x >= this.game.mapHandler.active.width ||
			y >= this.game.mapHandler.active.height
		);
	}
	getOutsideMapDirection(x: number, y: number): Direction {
		if (x < 0) {
			return 'LEFT';
		} else if (y < 0) {
			return 'UP';
		} else if (x >= this.game.mapHandler.active.width) {
			return 'RIGHT';
		} else if (y >= this.game.mapHandler.active.height) {
			return 'DOWN';
		} else {
			throw new Error('Exited map in invalid direction.');
		}
	}
	getFacingTile(map: GameMap) {
		const pos = this.position;
		if (this.direction === 'LEFT') {
			return map.getTile(pos.x - 1, pos.y);
		} else if (this.direction === 'RIGHT') {
			return map.getTile(pos.x + 1, pos.y);
		} else if (this.direction === 'UP') {
			return map.getTile(pos.x, pos.y - 1);
		} else if (this.direction === 'DOWN') {
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

		if (this.direction === 'RIGHT') {
			this.subPosition.x = Math.round(Math.min(this.subPosition.x + moveX, this.targetPosition.x));
		} else if (this.direction === 'LEFT') {
			this.subPosition.x = Math.round(Math.max(this.subPosition.x - moveX, this.targetPosition.x));
		} else if (this.direction === 'DOWN') {
			this.subPosition.y = Math.round(Math.min(this.subPosition.y + moveY, this.targetPosition.y));
		} else if (this.direction === 'UP') {
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
