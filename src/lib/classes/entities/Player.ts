import { adjustPositionForDirection } from '$lib/utils/adjustPositionForDirection';
import { Game } from '../Game';
import GameEvent from '../GameEvent';
import KeyHandler, { type MovementKeys } from '../KeyHandler';
import { Position } from '../Position';
import SpriteBank from '../SpriteBank';
import type { Tile } from '../tiles/Tile';
import type { Warp } from '../tiles/Warp';
import type { Direction } from '@prisma/client';
import { getOppositeDirection } from '$lib/utils/getOppositeDirection';
import type { SignRect } from '../ui/SignRect';
import { Coords } from '../Coords';
import { Entity } from './Entity';
import { AdjustedRect } from '../AdjustedRect';
import { sleep } from '$lib/utils/sleep';
import { FadeOutRect } from '../ui/FadeOutRect';
import { FadeInRect } from '../ui/FadeInRect';

export class Player extends Entity {
	coords: Coords;
	game: Game;
	direction: Direction;
	moving: boolean = false;
	jumping: boolean = false;
	speed: number = Game.getAdjustedTileSize() * 3;
	walkFrame: number = 1;
	counter: number = 0;
	shouldDraw: boolean = true;
	offsetX: number = 0;
	offsetY: number = 0;

	constructor(x: number, y: number, game: Game, direction: Direction) {
		super(x, y, game.mapHandler.active);
		this.coords = new Coords(x, y);
		this.game = game;
		this.coords = new Coords(x, y);
		this.direction = direction;
	}
	tick(currentFrameTime: number) {
		const direction = this.direction.toLowerCase();
		// we should always draw the Player
		const walkSprite =
			(this.moving || this.jumping) && (this.counter < 10 || this.counter > 23)
				? direction + this.walkFrame
				: direction;

		const sprite = SpriteBank.getSprite('player', walkSprite);
		if (this.shouldDraw) {
			this.game.canvas.drawAbsoluteImage(
				sprite,
				Math.round(this.coords.sub.x) + 1 + this.game.viewport.pos.xOffset,
				Math.round(this.coords.sub.y + (this.counter < 10 ? 1 : 0)) -
					10 +
					this.game.viewport.pos.yOffset,
				this.offsetX,
				this.offsetY
			);
			if (this.jumping) {
				const rect = new AdjustedRect(
					this.game.mapHandler.active.absoluteX,
					this.game.mapHandler.active.absoluteY
				);
				this.game.canvas.drawShadow(rect.x + this.coords.sub.x, rect.y + this.coords.sub.y);
			}
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

		if (!this.moving && !this.jumping) {
			this.updateDirection();
		} else if (!this.coords.target.equals(this.coords.sub)) {
			this.move(currentFrameTime, this.game.lastFrameTime);
		}
	}
	updateDirection() {
		if (!this.game.canPlayerMove) {
			return;
		}
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
				x: this.coords.current.x,
				y: this.coords.current.y - 1,
				targetX: this.coords.target.x,
				targetY: this.coords.target.y - Game.getAdjustedTileSize(),
				direction: 'UP'
			},
			ArrowDown: {
				x: this.coords.current.x,
				y: this.coords.current.y + 1,
				targetX: this.coords.target.x,
				targetY: this.coords.target.y + Game.getAdjustedTileSize(),
				direction: 'DOWN'
			},
			ArrowLeft: {
				x: this.coords.current.x - 1,
				y: this.coords.current.y,
				targetX: this.coords.target.x - Game.getAdjustedTileSize(),
				targetY: this.coords.target.y,
				direction: 'LEFT'
			},
			ArrowRight: {
				x: this.coords.current.x + 1,
				y: this.coords.current.y,
				targetX: this.coords.target.x + Game.getAdjustedTileSize(),
				targetY: this.coords.target.y,
				direction: 'RIGHT'
			}
		};

		const direction = KeyHandler.getPrioritizedKey();
		if (direction !== null) {
			const move = moveTable[direction];
			this.direction = move.direction as Direction;
			const keyState = KeyHandler.getKeyState(direction);
			const currentTile = this.getCurrentTile();
			if (keyState.holdCount > 8) {
				if (this.isNewTileOutsideMap(move.x, move.y) && !currentTile.isWarp()) {
					const direction = this.getOutsideMapDirection(move.x, move.y);
					if (this.game.mapHandler.hasMap(direction)) {
						this.game.changeMap(direction);
					}
				} else if (currentTile.isWarp() && move.direction === currentTile.activateDirection) {
					this.handleWarp();
				} else {
					const newTile = this.game.mapHandler.active.getTile(move.x, move.y);

					if (newTile.jumpable === this.direction) {
						const doubledMove = {
							x: move.x + (move.x - this.coords.current.x),
							y: move.y + (move.y - this.coords.current.y),
							targetX: move.targetX + (move.targetX - this.coords.target.x),
							targetY: move.targetY + (move.targetY - this.coords.target.y),
							direction: move.direction
						};

						this.jumping = true;
						this.coords.setCurrent(doubledMove.x, doubledMove.y);
						this.coords.setTarget(doubledMove.targetX, doubledMove.targetY);
						this.counter = 0;
					} else if (
						newTile.isPassable() &&
						!this.game.mapHandler.active.isTileOccupied(newTile.x, newTile.y)
					) {
						this.moving = true;
						this.coords.setCurrent(move.x, move.y);
						this.coords.setTarget(move.targetX, move.targetY);
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
		const pos = this.coords.current;
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
		return this.game.mapHandler.active.getTile(this.coords.current.x, this.coords.current.y);
	}
	async handleWarp() {
		this.game.blockMovement();

		const currentTile = this.getCurrentTile() as Warp;

		let tiles: Tile[] = [];
		if (this.doesFacingTileExist()) {
			if (currentTile.type !== 'STAIRS') {
				const tile = this.getFacingTile();
				tiles.push(tile);
				tiles.push(this.game.mapHandler.active.getTile(tile.x, tile.y - 1));
			}
		}

		const isDoorWarp = tiles.length !== 0;
		const isStairsWarp = currentTile.type === 'STAIRS';

		if (isDoorWarp) {
			tiles.forEach((tile) => tile.playForward());
			await GameEvent.waitForOnce('animationComplete');
			this.walk(currentTile.activateDirection);
			await GameEvent.waitForOnce('movementFinished');
			this.shouldDraw = false;
			tiles.forEach((tile) => tile.playReversed());
			await GameEvent.waitForOnce('animationComplete');
			await sleep(300);
		} else if (isStairsWarp) {
			this.walk(currentTile.activateDirection);
			await GameEvent.waitForOnce('movementFinished');
			this.shouldDraw = false;
		}

		this.game.canvas.elements.addElement(new FadeOutRect());
		await GameEvent.waitForOnce('fadedOut');

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
		this.coords.setCoords(targetPosition.x, targetPosition.y);

		// now that we've loaded the new map do we need to animate the exit tiles?
		tiles = [];
		const tileAboveWarp = map.getTile(targetWarp.x, targetWarp.y - 1);
		if (tileAboveWarp.tileSprites.images.length !== 1) {
			tiles = [tileAboveWarp, map.getTile(targetWarp.x, targetWarp.y - 2)];
		}

		this.game.canvas.elements.removeElement('fadedOut');
		this.game.canvas.elements.addElement(new FadeInRect());

		if (tiles.length !== 0) {
			this.shouldDraw = false;
			tiles.forEach((tile) => tile.setReversed());
			await GameEvent.waitForOnce('fadedIn');
			await sleep(150);
			this.shouldDraw = true;
			this.walk(currentTile.activateDirection);
			await GameEvent.waitForOnce('movementFinished');
			tiles.forEach((tile) => tile.playReversed());
			await GameEvent.waitForOnce('animationComplete');
		}

		if (currentTile.type === 'STAIRS') {
			this.direction = getOppositeDirection(this.direction);
		}

		this.shouldDraw = true;

		if (isStairsWarp) {
			this.walk(getOppositeDirection(currentTile.activateDirection));
		}

		this.game.unblockMovement();
	}
	walk(direction: Direction) {
		switch (direction) {
			case 'UP':
				this.coords.setTarget(this.coords.sub.x, this.coords.sub.y - Game.getAdjustedTileSize());
				break;
			case 'LEFT':
				this.coords.setTarget(this.coords.sub.x - Game.getAdjustedTileSize(), this.coords.sub.y);
				break;
			case 'RIGHT':
				this.coords.setTarget(this.coords.sub.x + Game.getAdjustedTileSize(), this.coords.sub.y);
				break;
			case 'DOWN':
				this.coords.setTarget(this.coords.sub.x, this.coords.sub.y + Game.getAdjustedTileSize());
				break;
		}
		this.moving = true;
		this.counter = 0;
	}

	move(currentFrameTime: number, lastFrameTime: number) {
		if (!this.moving && !this.jumping) {
			return;
		}

		this.counter++;

		const deltaTime = (currentFrameTime - lastFrameTime) / 1000; // in seconds

		const moveX = this.speed * deltaTime;
		const moveY = this.speed * deltaTime;

		if (this.direction === 'RIGHT') {
			this.coords.sub.x = Math.round(Math.min(this.coords.sub.x + moveX, this.coords.target.x));
		} else if (this.direction === 'LEFT') {
			this.coords.sub.x = Math.round(Math.max(this.coords.sub.x - moveX, this.coords.target.x));
		} else if (this.direction === 'DOWN') {
			this.coords.sub.y = Math.round(Math.min(this.coords.sub.y + moveY, this.coords.target.y));
		} else if (this.direction === 'UP') {
			this.coords.sub.y = Math.round(Math.max(this.coords.sub.y - moveY, this.coords.target.y));
		}

		if (this.jumping) {
			if (this.counter < 10) {
				this.offsetY += 2;
			} else if (this.counter > 23) {
				this.offsetY -= 2;
			}
		}

		if (this.coords.sub.x === this.coords.target.x && this.coords.sub.y === this.coords.target.y) {
			this.moving = false;
			this.jumping = false;
			this.walkFrame = this.walkFrame === 1 ? 2 : 1;
			this.coords.setCurrent(
				this.coords.target.x / Game.getAdjustedTileSize(),
				this.coords.target.y / Game.getAdjustedTileSize()
			);
			GameEvent.dispatchEvent(new CustomEvent('movementFinished'));
		}
	}
}
