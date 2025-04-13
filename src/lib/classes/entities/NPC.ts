import type { Direction } from '@prisma/client';
import { Entity } from './Entity';
import SpriteBank from '../SpriteBank';
import type { Canvas } from '../Canvas';
import type { BankNames } from '$lib/interfaces/BankNames';
import { Game } from '../Game';
import { getRandomDirection } from '$lib/utils/getRandomDirection';
import { Position } from '../Position';
import type { GameMap } from '../maps/GameMap';
import GameEvent from '../GameEvent';

export class NPC extends Entity {
	home: Position;
	id: BankNames;
	moving: boolean = false;
	counter: number = 0;
	direction: Direction = 'DOWN';
	walkFrame: number = 1;
	speed: number = Game.getAdjustedTileSize() * 3;
	scripted: boolean;
	shouldDraw: boolean = true;

	constructor(id: BankNames, x: number, y: number, map: GameMap, scripted?: boolean) {
		super(x, y, map);
		const current = this.coords.getCurrent();
		this.home = new Position(current.x, current.y);
		this.id = id;
		this.scripted = scripted ?? false;
	}
	setVisible(visible: boolean) {
		this.shouldDraw = visible;
	}
	tick(currentFrameTime: number, lastFrameTime: number, canvas: Canvas) {
		const current = this.coords.getCurrent();
		const sub = this.coords.getSub();
		const target = this.coords.getTarget();
		const direction = this.direction.toLocaleLowerCase();
		const walkSprite = this.moving && this.counter < 10 ? direction + this.walkFrame : direction;

		const sprite = SpriteBank.getSprite(this.id, walkSprite);

		if (this.shouldDraw) {
			canvas.drawCharacter(
				sprite,
				Math.round(sub.x) + 1 + this.map.absoluteX * Game.getAdjustedTileSize(),
				Math.round(sub.y + (this.counter < 10 ? 1 : 0)) -
					10 +
					this.map.absoluteY * Game.getAdjustedTileSize()
			);
		}

		this.move(currentFrameTime, lastFrameTime);

		if (this.moving) {
			return;
		}
		if (!this.scripted && currentFrameTime - lastFrameTime >= 3000) {
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
		}
	}
	async walk(direction: Direction) {
		const sub = this.coords.getSub();
		switch (direction) {
			case 'UP':
				this.coords.setTarget(sub.x, sub.y - Game.getAdjustedTileSize());
				break;
			case 'LEFT':
				this.coords.setTarget(sub.x - Game.getAdjustedTileSize(), sub.y);
				break;
			case 'RIGHT':
				this.coords.setTarget(sub.x + Game.getAdjustedTileSize(), sub.y);
				break;
			case 'DOWN':
				this.coords.setTarget(sub.x, sub.y + Game.getAdjustedTileSize());
				break;
		}
		this.direction = direction;
		this.moving = true;
		this.counter = 0;

		await GameEvent.waitForOnce('npcMovementFinished');
	}
	move(currentFrameTime: number, lastFrameTime: number) {
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
			GameEvent.dispatchEvent(new CustomEvent('npcMovementFinished'));
		}
	}
}
