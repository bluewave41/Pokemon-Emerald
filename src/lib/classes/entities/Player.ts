import { sleep } from '$lib/utils/sleep';
import { Game } from '../Game';
import GameEvent from '../GameEvent';
import KeyHandler, { type MovementKeys } from '../KeyHandler';
import { Position } from '../Position';
import SpriteBank from '../SpriteBank';
import type { Tile } from '../tiles/Tile';
import type { Warp } from '../tiles/Warp';
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
	shouldDraw: boolean = true;

	constructor(x: number, y: number, game: Game, direction: Direction) {
		super(x, y, game);
		this.targetPosition = new Position(
			x * Game.getAdjustedTileSize(),
			y * Game.getAdjustedTileSize()
		);
		this.subPosition = new Position(x * Game.getAdjustedTileSize(), y * Game.getAdjustedTileSize());
		this.direction = direction;
	}
	setPosition(x: number, y: number) {
		this.position = new Position(x, y);
		this.subPosition = new Position(x * Game.getAdjustedTileSize(), y * Game.getAdjustedTileSize());
		this.targetPosition = new Position(
			x * Game.getAdjustedTileSize(),
			y * Game.getAdjustedTileSize()
		);
	}
	tick(currentFrameTime: number) {
		const direction = this.direction.toLowerCase();
		// we should always draw the Player
		const walkSprite = this.moving && this.counter < 10 ? direction + this.walkFrame : direction;
		const sprite = SpriteBank.getSprite('player', walkSprite);
		if (this.shouldDraw) {
			this.game.canvas.drawAbsoluteImage(
				sprite,
				Math.round(this.subPosition.x) + 1 + this.game.viewport.pos.xOffset,
				Math.round(this.subPosition.y + (this.counter < 10 ? 1 : 0)) -
					10 +
					this.game.viewport.pos.yOffset
			);
		}

		const activeKey = KeyHandler.getActiveKeyState('z');

		if (activeKey.down && activeKey.initial) {
			if (this.game.activeTextBox) {
				this.game.activeTextBox = null;
			} else {
				const tile = this.getFacingTile();
				tile.activate(this.game);
			}
		}

		// but don't let them move if a textbox or something is active...
		if (!this.game.canPlayerMove) {
			return;
		}

		if (!this.moving) {
			this.updateDirection();
		} else if (this.game.canPlayerMove) {
			this.move(this.game.lastFrameTime, currentFrameTime);
		}
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
			const currentTile = this.getCurrentTile();
			if (keyState.holdCount > 8) {
				// this is like a houae warp
				if (currentTile.isWarp() && this.isNewTileOutsideMap(tableEntry.x, tableEntry.y)) {
					this.game.blockMovement();
					this.handleWarpOut(false);
					this.game.canvas.fadeToBlack();
				} else if (this.isNewTileOutsideMap(tableEntry.x, tableEntry.y)) {
					const direction = this.getOutsideMapDirection(tableEntry.x, tableEntry.y);
					if (this.game.mapHandler.hasMap(direction)) {
						this.game.changeMap(this.getOutsideMapDirection(tableEntry.x, tableEntry.y));
						this.moving = true;
						this.counter = 0;
					}
				} else {
					const newTile = this.game.mapHandler.active.getTile(tableEntry.x, tableEntry.y);

					if (currentTile.isWarp() && this.direction === currentTile.activateDirection) {
						const tiles: Tile[] = [this.getFacingTile()];
						if (currentTile.type === 'door') {
							tiles.push(this.game.mapHandler.active.getTile(tableEntry.x, tableEntry.y - 1)); //upper door
						}
						this.game.blockMovement();
						tiles.forEach((tile) => (tile.animationOptions.isAnimating = true));
						GameEvent.once('animationComplete', () => {
							this.moving = true;
							this.targetPosition = {
								x: this.targetPosition.x,
								y: this.targetPosition.y - Game.getAdjustedTileSize()
							};
							requestAnimationFrame((time) => {
								this.counter = 0;
								this.scriptedMovement(time);
								this.handleAsyncMovement(tiles);
							});
						});
						// load target
						// change maps
						// do backwards
						// walk out
					} else if (keyState.holdCount > 8 && newTile.isPassable()) {
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
	getFacingTile() {
		const map = this.game.mapHandler.active;
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
	getCurrentTile() {
		return this.game.mapHandler.active.getTile(this.position.x, this.position.y);
	}
	async handleWarpOut(animated: boolean = false) {
		const currentTile = this.getCurrentTile() as Warp;
		this.game.blockMovement();
		this.game.canvas.fadeToBlack();
		await GameEvent.waitForOnce('fadedOut');
		// load original map
		const map = await this.game.mapHandler.fetchMapById(currentTile.targetMapId);
		const targetWarp: Warp = map.tiles
			.flat()
			.find((tile) => tile.isWarp() && tile.targetWarpId === currentTile.targetWarpId);
		if (!targetWarp) {
			throw new Error(`Couldn't find target warp.`);
		}
		this.game.mapHandler.setActive(map);
		const { x, y } = targetWarp.getWarpOutSpot();
		const targetTile = this.game.mapHandler.active.getTile(x, y);
		targetTile.playReversed();
		this.setPosition(x, y);
		this.game.canvas.fadeIn();
		await GameEvent.waitForOnce('fadedIn');
		this.game.unblockMovement();
	}
	async handleAsyncMovement(tiles: Tile[]) {
		const currentTile = this.getCurrentTile();
		await GameEvent.waitForOnce('scriptedMovementComplete');
		this.shouldDraw = false;
		await sleep(200);
		tiles.forEach((tile) => tile.playReversed());
		await sleep(500);
		this.game.canvas.fadeToBlack();
		await GameEvent.waitForOnce('fadedOut');

		if (currentTile.isWarp()) {
			const map = await this.game.mapHandler.fetchMapById(currentTile.targetMapId);
			if (!map) {
				throw new Error('Failed to load warp map.');
			}
			this.game.mapHandler.setInterior(map);
			const targetWarp = this.game.mapHandler.active.tiles
				.flat()
				.find((tile) => tile.isWarp() && tile.targetWarpId === currentTile.targetWarpId);
			if (!targetWarp) {
				throw new Error("Couldn't find warp target in loaded map.");
			}
			this.setPosition(targetWarp.x, targetWarp.y);
			this.shouldDraw = true;
			this.game.unblockMovement();
			console.log(this.game.mapHandler);
		}

		// load next map
		await sleep(1000);
		this.game.canvas.fadeIn();
	}
	scriptedMovement(currentFrameTime: number) {
		if (!this.moving) {
			return;
		}
		GameEvent.once('movementFinished', () => {
			this.moving = false;
			GameEvent.dispatchEvent(new CustomEvent('scriptedMovementComplete'));
			return;
		});
		this.tick(currentFrameTime);
		this.move(this.game.lastFrameTime, currentFrameTime);
		requestAnimationFrame((time) => this.scriptedMovement(time));
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
			GameEvent.dispatchEvent(new CustomEvent('movementFinished'));
		}
	}
}
