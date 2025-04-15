import { Game } from '../Game';
import GameEvent from '../GameEvent';
import KeyHandler, { type MovementKeys } from '../KeyHandler';
import SpriteBank from '../SpriteBank';
import type { Tile } from '../tiles/Tile';
import type { Warp } from '../tiles/Warp';
import { WarpType, type Direction } from '@prisma/client';
import { getOppositeDirection } from '$lib/utils/getOppositeDirection';
import type { TextRect } from '../ui/TextRect';
import { Coords } from '../Coords';
import { Entity } from './Entity';
import { AdjustedRect } from '../AdjustedRect';
import { sleep } from '$lib/utils/sleep';
import { FadeOutRect } from '../ui/FadeOutRect';
import { FadeInRect } from '../ui/FadeInRect';
import { GridPosition, ScreenPosition } from '../Position';

export class Player extends Entity {
	coords: Coords;
	game: Game;
	direction: Direction;
	moving: boolean = false;
	jumping: boolean = false;
	speed: number = Game.getAdjustedTileSize() * 3;
	walkFrame: number = 1;
	counter: number = 0;
	offsetX: number = 0;
	offsetY: number = 0;

	constructor(x: number, y: number, game: Game, direction: Direction) {
		super('player', x, y, game.mapHandler.active);
		this.coords = new Coords(x, y);
		this.game = game;
		this.coords = new Coords(x, y);
		this.direction = direction;
	}
	tick(currentFrameTime: number, lastFrameTime: number) {
		const sub = this.coords.getSub();
		const target = this.coords.getTarget();
		const direction = this.direction.toLowerCase();
		// we should always draw the Player

		const walkSprite =
			((this.moving || this.jumping) && this.counter < 10) ||
			this.counter > 22 ||
			(!this.moving && this.counter !== 0)
				? direction + this.walkFrame
				: direction;

		const sprite = SpriteBank.getSprite('player', walkSprite);
		if (this.visible) {
			this.game.canvas.drawSprite(
				sprite,
				Math.round(sub.x) + this.game.viewport.pos.xOffset,
				Math.round(sub.y) + this.game.viewport.pos.yOffset,
				this.offsetX,
				this.offsetY
			);
			if (this.jumping) {
				const rect = new AdjustedRect(
					this.game.mapHandler.active.absoluteX,
					this.game.mapHandler.active.absoluteY
				);
				this.game.canvas.drawShadow(rect.x + sub.x, rect.y + sub.y);
			}
		}

		const activeKey = KeyHandler.getActiveKeyState('z');

		if (activeKey.down && activeKey.initial) {
			const tile = this.getFacingTile();
			if (tile) {
				if (tile.kind === 'sign') {
					const sign = this.game.canvas.elements.getElement('sign') as TextRect;
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
		}

		if (!this.moving && !this.jumping) {
			this.updateDirection();
		} else if (!target.equals(sub)) {
			this.move(currentFrameTime, lastFrameTime);
		}

		if (!this.moving && !this.jumping && this.counter !== 0) {
			this.counter++;
			if (this.counter > 5) {
				this.counter = 0;
				this.walkFrame = this.walkFrame === 1 ? 2 : 1;
			}
		}
	}
	updateDirection() {
		if (!this.game.canPlayerMove) {
			return;
		}
		const current = this.coords.getCurrent();
		const target = this.coords.getTarget();
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
				x: current.x,
				y: current.y - 1,
				targetX: target.x,
				targetY: target.y - Game.getAdjustedTileSize(),
				direction: 'UP'
			},
			ArrowLeft: {
				x: current.x - 1,
				y: current.y,
				targetX: target.x - Game.getAdjustedTileSize(),
				targetY: target.y,
				direction: 'LEFT'
			},
			ArrowRight: {
				x: current.x + 1,
				y: current.y,
				targetX: target.x + Game.getAdjustedTileSize(),
				targetY: target.y,
				direction: 'RIGHT'
			},
			ArrowDown: {
				x: current.x,
				y: current.y + 1,
				targetX: target.x,
				targetY: target.y + Game.getAdjustedTileSize(),
				direction: 'DOWN'
			}
		};

		const direction = KeyHandler.getPrioritizedKey();
		if (direction !== null) {
			const move = moveTable[direction];
			this.direction = move.direction as Direction;
			const keyState = KeyHandler.getKeyState(direction);
			const currentTile = this.getCurrentTile();
			if (keyState.holdCount > 10) {
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
						const current = this.coords.getCurrent();
						const target = this.coords.getTarget();
						const doubledMove = {
							x: move.x + (move.x - current.x),
							y: move.y + (move.y - current.y),
							targetX: move.targetX + (move.targetX - target.x),
							targetY: move.targetY + (move.targetY - target.y),
							direction: move.direction
						};

						this.jumping = true;
						this.coords.setCurrent(doubledMove.x, doubledMove.y);
						this.coords.setTarget(new ScreenPosition(doubledMove.targetX, doubledMove.targetY));
						this.counter = 0;
					} else if (
						newTile.isPassable() &&
						!this.game.mapHandler.active.isTileOccupied(new GridPosition(newTile.x, newTile.y))
					) {
						this.moving = true;
						this.coords.setCurrent(move.x, move.y);
						this.coords.setTarget(new ScreenPosition(move.targetX, move.targetY));
						this.counter = 0;
					}
				}
			} else {
				if (currentTile.isWarp() && this.direction === currentTile.activateDirection) {
					this.handleWarp();
				} else if (this.counter === 0 && keyState.holdCount < 5) {
					this.counter = 1;
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
		const pos = this.coords.getCurrent();
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
		const current = this.coords.getCurrent();
		return this.game.mapHandler.active.getTile(current.x, current.y);
	}
	async handleWarp(warpId?: number) {
		this.game.blockMovement();

		const currentTile = warpId
			? (this.game.activeMap.tiles
					.flat()
					.find((tile) => tile.isWarp() && tile.targetWarpId === warpId) as Warp)
			: (this.getCurrentTile() as Warp);

		let tiles: Tile[] = [];
		if (this.doesFacingTileExist()) {
			if (currentTile.type !== 'STAIRS') {
				const tile = this.getFacingTile();
				if (tile) {
					tiles.push(tile);
					tiles.push(this.game.mapHandler.active.getTile(tile.x, tile.y - 1));
				}
			}
		}

		const isDoorWarp = tiles.length !== 0;
		const isStairsWarp = currentTile.type === 'STAIRS';

		if (isDoorWarp) {
			tiles.forEach((tile) => tile.playForward());
			await GameEvent.waitForOnce('animationComplete');
			await this.walk(currentTile.activateDirection);
			this.setVisible(false);
			tiles.forEach((tile) => tile.playReversed());
			await GameEvent.waitForOnce('animationComplete');
			await sleep(300);
		} else if (isStairsWarp) {
			await this.walk(currentTile.activateDirection);
		}

		this.game.canvas.elements.addElement(new FadeOutRect());
		await GameEvent.waitForOnce('fadedOut');

		const targetWarp = await this.game.loadMapById(
			currentTile.targetMapId,
			currentTile.targetWarpId,
			isDoorWarp ? WarpType.DOOR : WarpType.STAIRS
		);

		// now that we've loaded the new map do we need to animate the exit tiles?
		tiles = [];
		const tileAboveWarp = this.game.mapHandler.active.getTile(targetWarp.x, targetWarp.y - 1);
		if (tileAboveWarp.tileSprites.images.length !== 1) {
			tiles = [tileAboveWarp, this.game.mapHandler.active.getTile(targetWarp.x, targetWarp.y - 2)];
		}

		this.setVisible(true);

		this.game.canvas.elements.removeElement('fadedOut');
		this.game.canvas.elements.addElement(new FadeInRect());
		await GameEvent.waitForOnce('fadedIn');

		if (tiles.length !== 0) {
			this.setVisible(false);
			tiles.forEach((tile) => tile.setReversed());
			await GameEvent.waitForOnce('fadedIn');
			await sleep(150);
			this.setVisible(true);
			await this.walk(currentTile.activateDirection);
			tiles.forEach((tile) => tile.playReversed());
			await GameEvent.waitForOnce('animationComplete');
		}

		if (currentTile.type === 'STAIRS') {
			this.direction = getOppositeDirection(this.direction);
		}

		if (isStairsWarp) {
			await this.walk(getOppositeDirection(currentTile.activateDirection));
		}

		// map has been changed lets try all the scripts that aren't attached to a tile...
		const scripts = this.game.mapHandler.active.scripts.filter((script) => !script.x && !script.y);
		for (const script of scripts) {
			this.game.executeScript(script, 'script');
		}

		this.game.unblockMovement();
	}
	async walk(direction: Direction) {
		const sub = this.coords.getSub();
		switch (direction) {
			case 'UP':
				this.coords.setTarget(new ScreenPosition(sub.x, sub.y - Game.getAdjustedTileSize()));
				break;
			case 'LEFT':
				this.coords.setTarget(new ScreenPosition(sub.x - Game.getAdjustedTileSize(), sub.y));
				break;
			case 'RIGHT':
				this.coords.setTarget(new ScreenPosition(sub.x + Game.getAdjustedTileSize(), sub.y));
				break;
			case 'DOWN':
				this.coords.setTarget(new ScreenPosition(sub.x, sub.y + Game.getAdjustedTileSize()));
				break;
		}
		this.direction = direction;
		this.moving = true;
		this.counter = 0;

		await GameEvent.waitForOnce('movementFinished');
	}
	jump(direction: Direction) {
		const sub = this.coords.getSub();
		switch (direction) {
			case 'UP':
				this.coords.setTarget(new ScreenPosition(sub.x, sub.y - Game.getAdjustedTileSize()));
				break;
			case 'LEFT':
				this.coords.setTarget(new ScreenPosition(sub.x - Game.getAdjustedTileSize(), sub.y));
				break;
			case 'RIGHT':
				this.coords.setTarget(new ScreenPosition(sub.x + Game.getAdjustedTileSize(), sub.y));
				break;
			case 'DOWN':
				this.coords.setTarget(new ScreenPosition(sub.x, sub.y + Game.getAdjustedTileSize()));
				break;
		}
		this.direction = direction;
		this.jumping = true;
		this.counter = 0;
	}

	move(currentFrameTime: number, lastFrameTime: number) {
		const last = this.coords.getLast().toScreen();
		const sub = this.coords.getSub();
		const target = this.coords.getTarget();

		if (!this.moving && !this.jumping) {
			return;
		}

		const numberOfPixelsToMove = (Math.abs(last.x - target.x) + Math.abs(last.y - target.y)) / 2;
		const start = Math.floor(numberOfPixelsToMove * 0.3);
		const end = Math.floor(numberOfPixelsToMove * 0.7);

		this.counter++;

		const deltaTime = (currentFrameTime - lastFrameTime) / 1000; // in seconds

		const moveX = this.speed * deltaTime;
		const moveY = this.speed * deltaTime;

		if (this.direction === 'RIGHT') {
			sub.x = Math.round(Math.min(sub.x + moveX, target.x));
		} else if (this.direction === 'LEFT') {
			sub.x = Math.round(Math.max(sub.x - moveX, target.x));
		} else if (this.direction === 'DOWN') {
			sub.y = Math.round(Math.min(sub.y + moveY, target.y));
		} else if (this.direction === 'UP') {
			sub.y = Math.round(Math.max(sub.y - moveY, target.y));
		}

		if (this.jumping) {
			if (this.counter <= start + 1) {
				this.offsetY += 2;
			} else if (this.counter > end) {
				this.offsetY -= 2;
			}
		}

		if (sub.equals(target)) {
			this.moving = false;
			this.jumping = false;
			this.walkFrame = this.walkFrame === 1 ? 2 : 1;
			this.counter = 0;
			this.coords.setLast(
				target.x / Game.getAdjustedTileSize(),
				target.y / Game.getAdjustedTileSize()
			);
			this.coords.setCurrent(
				target.x / Game.getAdjustedTileSize(),
				target.y / Game.getAdjustedTileSize()
			);

			this.checkForScripts();
			GameEvent.dispatchEvent(new CustomEvent('movementFinished'));
		}
	}
	checkForScripts() {
		const current = this.coords.getCurrent();
		const script = this.game.mapHandler.active.scripts.find(
			(script) => script.x === current.x && script.y === current.y
		);
		if (script) {
			this.game.executeScript(script, 'script');
		}
	}
}
