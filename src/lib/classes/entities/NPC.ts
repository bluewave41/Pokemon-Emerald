import type { Direction } from '@prisma/client';
import { Entity } from './Entity';
import SpriteBank from '../SpriteBank';
import type { Canvas } from '../Canvas';
import type { BankNames } from '$lib/interfaces/BankNames';
import { Game } from '../Game';
import { getRandomDirection } from '$lib/utils/getRandomDirection';
import { GridPosition, ScreenPosition } from '../Position';
import GameEvent from '../GameEvent';

export class NPC extends Entity {
	home: GridPosition;
	bankId: BankNames;
	moving: boolean = false;
	counter: number = 0;
	direction: Direction = 'DOWN';
	walkFrame: number = 1;
	speed: number = Game.getAdjustedTileSize() * 3;
	scripted: boolean;
	shouldDraw: boolean = true;
	path: Direction[] = [];
	pathIndex: number = 0;

	constructor(
		id: string,
		bankId: BankNames,
		x: number,
		y: number,
		direction: Direction,
		game: Game,
		scripted?: boolean
	) {
		super(id, x, y, game);
		this.direction = direction;
		const current = this.coords.getCurrent();
		this.home = new GridPosition(current.x, current.y);
		this.bankId = bankId;
		this.scripted = scripted ?? false;
	}
	setPath(directions: Direction[]) {
		this.path = directions;
		return this;
	}
	setVisible(visible: boolean) {
		this.shouldDraw = visible;
	}
	tick(currentFrameTime: number, lastFrameTime: number, canvas: Canvas) {
		const active = this.game.activeMap;
		const current = this.coords.getCurrent();
		const target = this.coords.getTarget();

		const direction = this.direction.toLocaleLowerCase();
		const walkSprite = this.moving
			? direction + (this.counter % 20 < 10 ? this.walkFrame : '')
			: direction;

		const sprite = SpriteBank.getSprite(this.bankId, walkSprite);

		if (this.shouldDraw) {
			const sub = this.coords.getSub();
			const xOffset = sprite.width - 15;
			const yOffset = sprite.height - 21 + sprite.height - 21;

			canvas.drawSprite(
				sprite,
				Math.round(sub.x) + active.absoluteX * Game.getAdjustedTileSize(),
				Math.round(sub.y) + active.absoluteY * Game.getAdjustedTileSize(),
				xOffset,
				yOffset
			);
		}

		this.move(currentFrameTime, lastFrameTime);

		if (this.moving) {
			return;
		}

		// random timer to move around
		if (!this.scripted && currentFrameTime - lastFrameTime >= 3000) {
			const newDirection = getRandomDirection();
			const shouldMove = Math.random() <= 0.5;
			if (shouldMove) {
				const moveTable: Record<Direction, { pos: GridPosition; target: ScreenPosition }> = {
					UP: {
						pos: current.up(),
						target: target.up()
					},
					LEFT: {
						pos: current.left(),
						target: target.left()
					},
					RIGHT: {
						pos: current.right(),
						target: target.right()
					},
					DOWN: {
						pos: current.down(),
						target: target.down()
					}
				};
				const moveTarget = moveTable[newDirection];
				// keep contained within home area
				if (
					!this.game.activeMap.isTileOccupied(moveTarget.pos) &&
					moveTarget.pos.x >= this.home.x - 2 &&
					moveTarget.pos.x <= this.home.x + 2 &&
					moveTarget.pos.y >= this.home.y - 2 &&
					moveTarget.pos.y <= this.home.y + 2
				) {
					this.moving = true;
					this.coords.setTarget(moveTarget.target);
				}
			}
			this.direction = newDirection;
		} else {
			if (this.path.length) {
				this.moving = true;
				const step = this.path[this.pathIndex++];
				if (this.pathIndex === this.path.length) {
					this.pathIndex = 0;
				}
				this.direction = step;
				switch (step) {
					case 'UP':
						this.coords.setTarget(this.coords.getCurrent().up().toScreen());
						break;
					case 'LEFT':
						this.coords.setTarget(this.coords.getCurrent().left().toScreen());
						break;
					case 'RIGHT':
						this.coords.setTarget(this.coords.getCurrent().right().toScreen());
						break;
					case 'DOWN':
						this.coords.setTarget(this.coords.getCurrent().down().toScreen());
						break;
				}
			}
		}
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

		await GameEvent.waitForOnce('npcMovementFinished');
	}
	move(currentFrameTime: number, lastFrameTime: number) {
		const target = this.coords.getTarget();
		if (!this.moving || (this.game.frozen && !this.scripted)) {
			return;
		}

		const sub = this.coords.getSub();

		this.counter++;

		const targetTile = target.toGrid();
		const tile = this.game.activeMap.getTile(targetTile.x, targetTile.y);
		if (
			!tile.isPassable() ||
			(!this.scripted && this.game.activeMap.isTileOccupied(target.toGrid()))
		) {
			return;
		}

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

		if (sub.x === target.x && sub.y === target.y) {
			this.counter = 0;
			this.moving = false;
			this.walkFrame = this.walkFrame === 1 ? 2 : 1;
			this.coords.setCurrent(
				target.x / Game.getAdjustedTileSize(),
				target.y / Game.getAdjustedTileSize()
			);
			GameEvent.dispatchEvent(new CustomEvent('npcMovementFinished'));
		}
	}
}
