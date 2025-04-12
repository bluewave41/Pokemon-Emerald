import type { Direction } from '@prisma/client';
import { Entity } from './Entity';
import SpriteBank from '../SpriteBank';
import type { Canvas } from '../Canvas';
import type { BankNames } from '$lib/interfaces/BankNames';
import { Game } from '../Game';
import { getRandomDirection } from '$lib/utils/getRandomDirection';
import { Position } from '../Position';
import type { GameMap } from '../maps/GameMap';

export class NPC extends Entity {
	home: Position;
	id: BankNames;
	moving: boolean = false;
	counter: number = 0;
	direction: Direction = 'DOWN';
	walkFrame: number = 1;
	lastFrameTime: number = 0;
	speed: number = Game.getAdjustedTileSize() * 3;

	constructor(id: BankNames, x: number, y: number, map: GameMap) {
		super(x, y, map);
		const current = this.coords.getCurrent();
		this.home = new Position(current.x, current.y);
		this.id = id;
	}
	tick(currentFrameTime: number, canvas: Canvas) {
		const current = this.coords.getCurrent();
		const sub = this.coords.getSub();
		const target = this.coords.getTarget();
		const direction = this.direction.toLocaleLowerCase();
		const walkSprite = this.moving && this.counter < 10 ? direction + this.walkFrame : direction;

		const sprite = SpriteBank.getSprite(this.id, walkSprite);

		canvas.drawAbsoluteImage(
			sprite,
			Math.round(sub.x) + 1 + this.map.absoluteX * Game.getAdjustedTileSize(),
			Math.round(sub.y + (this.counter < 10 ? 1 : 0)) -
				10 +
				this.map.absoluteY * Game.getAdjustedTileSize()
		);

		this.move(this.lastFrameTime, currentFrameTime);

		if (this.moving) {
			this.lastFrameTime = currentFrameTime;
			return;
		}
		if (currentFrameTime - this.lastFrameTime >= 3000) {
			const newDirection = getRandomDirection();
			const shouldMove = Math.random() <= 0.5;
			if (shouldMove) {
				const moveTable: Record<
					Direction,
					{ x: number; y: number; targetX: number; targetY: number }
				> = {
					UP: {
						x: current.x,
						y: current.y - 1,
						targetX: target.x,
						targetY: target.y - Game.getAdjustedTileSize()
					},
					LEFT: {
						x: current.x - 1,
						y: current.y,
						targetX: target.x - Game.getAdjustedTileSize(),
						targetY: target.y
					},
					RIGHT: {
						x: current.x + 1,
						y: current.y,
						targetX: target.x + Game.getAdjustedTileSize(),
						targetY: target.y
					},
					DOWN: {
						x: current.x,
						y: current.y + 1,
						targetX: target.x,
						targetY: target.y + Game.getAdjustedTileSize()
					}
				};
				const moveTarget = moveTable[newDirection];
				// keep contained within home area
				if (
					!this.map.isTileOccupied(moveTarget.x, moveTarget.y) &&
					moveTarget.x >= this.home.x - 2 &&
					moveTarget.x <= this.home.x + 2 &&
					moveTarget.y >= this.home.y - 2 &&
					moveTarget.y <= this.home.y + 2
				) {
					this.moving = true;
					this.coords.setTarget(moveTarget.targetX, moveTarget.targetY);
				}
			}
			this.direction = newDirection;

			// pick a random direction
			// should I move or just turn
			// set the target position
			// tick the movement
			this.lastFrameTime = currentFrameTime;
		}
	}
	move(lastFrameTime: number, currentFrameTime: number) {
		if (!this.moving) {
			return;
		}

		const sub = this.coords.getSub();
		const target = this.coords.getTarget();

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

		if (sub.x === target.x && sub.y === target.y) {
			this.counter = 0;
			this.moving = false;
			this.walkFrame = this.walkFrame === 1 ? 2 : 1;
			this.coords.setCurrent(
				target.x / Game.getAdjustedTileSize(),
				target.y / Game.getAdjustedTileSize()
			);
		}
	}
}
