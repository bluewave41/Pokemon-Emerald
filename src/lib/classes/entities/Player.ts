import { adjustPositionForDirection } from '$lib/utils/adjustPositionForDirection';
import { BlockQueue } from '../BlockQueue';
import { AnimateTilesBlock } from '../blocks/AnimateTilesBlock';
import { FadeInBlock } from '../blocks/FadeInBlock';
import { FadeOutBlock } from '../blocks/FadeOutBlock';
import { ReverseAnimationsBlock } from '../blocks/ReverseAnimationsBlock';
import { SleepBlock } from '../blocks/SleepBlock';
import { StepBlock } from '../blocks/StepBlock';
import { TogglePlayerVisibilityBlock } from '../blocks/TogglePlayerVisibilityBlock';
import { HaltBlock } from '../blocks/HaltBlock';
import { Game } from '../Game';
import GameEvent from '../GameEvent';
import KeyHandler, { type MovementKeys } from '../KeyHandler';
import { Position } from '../Position';
import SpriteBank from '../SpriteBank';
import type { Tile } from '../tiles/Tile';
import type { Warp } from '../tiles/Warp';
import { Entity } from './Entity';
import type { Direction } from '@prisma/client';
import { getOppositeDirection } from '$lib/utils/getOppositeDirection';
import type { SignRect } from '../ui/SignRect';

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
			const tile = this.getFacingTile();
			if (tile.kind === 'sign') {
				const sign = this.game.canvas.elements.getElement('sign') as SignRect;
				if (sign) {
					if (sign.finished) {
						this.game.canvas.elements.removeElement('sign');
						this.game.unblockMovement();
					}
				} else {
					tile.activate(this.game);
				}
			} else {
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
			this.direction = tableEntry.direction as Direction;
			const keyState = KeyHandler.getKeyState(direction);
			const currentTile = this.getCurrentTile();
			if (keyState.holdCount > 8) {
				if (this.isNewTileOutsideMap(tableEntry.x, tableEntry.y) && !currentTile.isWarp()) {
					const direction = this.getOutsideMapDirection(tableEntry.x, tableEntry.y);
					if (this.game.mapHandler.hasMap(direction)) {
						this.game.changeMap(direction);
					}
				} else if (currentTile.isWarp() && tableEntry.direction === currentTile.activateDirection) {
					this.handleWarp();
				} else {
					const newTile = this.game.mapHandler.active.getTile(tableEntry.x, tableEntry.y);

					if (newTile.isPassable()) {
						this.moving = true;
						this.position = { x: tableEntry.x, y: tableEntry.y };
						this.targetPosition = { x: tableEntry.targetX, y: tableEntry.targetY };
						this.counter = 0;
					}
				}
			} else {
				if (currentTile.isWarp() && this.direction === currentTile.activateDirection) {
					this.handleWarp();
				}
			}
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
	doesFacingTileExist() {
		try {
			this.getFacingTile();
			return true;
		} catch (e) {
			void e;
			return false;
		}
	}
	getCurrentTile() {
		return this.game.mapHandler.active.getTile(this.position.x, this.position.y);
	}
	async handleWarp() {
		this.game.blockMovement();

		const currentTile = this.getCurrentTile() as Warp;

		let tiles: Tile[] = [];
		if (this.doesFacingTileExist()) {
			if (currentTile.type !== 'STAIRS') {
				tiles.push(this.getFacingTile());
			}
		}

		const isDoorWarp = tiles.length !== 0;
		const isStairsWarp = currentTile.type === 'STAIRS';

		const blockQueue = new BlockQueue(this.game);
		blockQueue.addIf(new AnimateTilesBlock(tiles, 'forwards'), isDoorWarp);
		blockQueue.addIf(new StepBlock(currentTile.activateDirection), isDoorWarp || isStairsWarp);
		blockQueue.addIf(new TogglePlayerVisibilityBlock(), isDoorWarp);
		blockQueue.addIf(new AnimateTilesBlock(tiles, 'backwards'), isDoorWarp);
		blockQueue.addIf(new SleepBlock(300), isDoorWarp);
		blockQueue.addMultiple([new FadeOutBlock(), new HaltBlock()]);
		blockQueue.addIf(new TogglePlayerVisibilityBlock(), isDoorWarp || isStairsWarp);
		blockQueue.add(new FadeInBlock());
		blockQueue.addIf(new TogglePlayerVisibilityBlock(), isStairsWarp);
		blockQueue.addIf(
			new StepBlock(getOppositeDirection(currentTile.activateDirection)),
			isStairsWarp
		);

		await blockQueue.handleBlocks();

		// stop event execution to load map

		const map = await this.game.mapHandler.fetchMapById(currentTile.targetMapId);
		const targetWarp: Warp = map.tiles
			.flat()
			.find((tile) => tile.isWarp() && tile.targetWarpId === currentTile.targetWarpId);

		if (!targetWarp) {
			throw new Error(`Couldn't find target warp.`);
		}

		const targetPosition = tiles.length
			? targetWarp
			: adjustPositionForDirection(
					new Position(targetWarp.x, targetWarp.y),
					targetWarp.activateDirection
				);
		this.game.mapHandler.handleWarpTo(map);
		this.setPosition(targetPosition.x, targetPosition.y);

		// now that we've loaded the new map do we need to animate the exit tiles?
		tiles = [];
		const tileAboveWarp = map.getTile(targetWarp.x, targetWarp.y - 1);
		if (tileAboveWarp.tileSprites.images.length !== 1) {
			tiles = [tileAboveWarp];
		}

		blockQueue.addIf(new ReverseAnimationsBlock(tiles), tiles.length !== 0);
		blockQueue.addIf(new StepBlock(currentTile.activateDirection), tiles.length !== 0);
		blockQueue.addIf(new AnimateTilesBlock(tiles, 'backwards'), tiles.length !== 0);

		if (currentTile.type === 'STAIRS') {
			this.direction = getOppositeDirection(this.direction);
		}

		// restart event execution
		await blockQueue.handleBlocks();
		this.position = { x: targetWarp.x, y: targetWarp.y };
		this.game.unblockMovement();
	}
	async scriptedMovement() {
		let lastFrame = this.game.lastFrameTime;

		return new Promise<void>((resolve) => {
			const step = (time: number) => {
				if (!this.moving) {
					return resolve();
				}
				if (
					this.subPosition.x === this.targetPosition.x &&
					this.subPosition.y === this.targetPosition.y
				) {
					return resolve();
				}
				this.tick(time);
				this.move(lastFrame, time);
				lastFrame = time;
				requestAnimationFrame(step);
			};

			requestAnimationFrame(step);
		});
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
			this.position = new Position(
				this.targetPosition.x / Game.getAdjustedTileSize(),
				this.targetPosition.y / Game.getAdjustedTileSize()
			);
			GameEvent.dispatchEvent(new CustomEvent('movementFinished'));
		}
	}
}
