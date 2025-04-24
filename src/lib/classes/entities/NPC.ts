import type { Direction } from '@prisma/client';
import { bankNamesSchema, type BankNames } from '$lib/interfaces/BankNames';
import { Game } from '../Game';
import { getRandomDirection } from '$lib/utils/getRandomDirection';
import { GridPosition, ScreenPosition } from '../Position';
import GameEvent from '../GameEvent';
import { z } from 'zod';
import { Coords } from '../Coords';
import { Character } from './Character';

export const editorNPCSchema = z.object({
	id: z.string(),
	bankId: bankNamesSchema,
	x: z.number(),
	y: z.number()
});

export class NPC extends Character {
	home: GridPosition;
	scripted: boolean;
	path: Direction[] = [];
	pathIndex: number = 0;

	constructor(
		id: string,
		bankId: BankNames,
		x: number,
		y: number,
		script: string | null,
		scripted?: boolean
	) {
		super(id, bankId, x, y, script);
		const current = this.coords.getCurrent();
		this.home = new GridPosition(current.x, current.y);
		this.scripted = scripted ?? false;
	}
	setPath(directions: Direction[]) {
		this.path = directions;
		return this;
	}
	tick(currentFrameTime: number, lastFrameTime: number) {
		const current = this.coords.getCurrent();
		const target = this.coords.getTarget();

		this.move(currentFrameTime, lastFrameTime);

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
					!this.map.isTileOccupied(moveTarget.pos) &&
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
	move(currentFrameTime: number, lastFrameTime: number) {
		const target = this.coords.getTarget();
		if (!this.moving) {
			return;
		}

		const sub = this.coords.getSub();

		this.counter++;

		const targetTile = target.toGrid();
		const tile = this.game.activeMap.getTile(targetTile.x, targetTile.y);
		if (!tile) {
			throw new Error('Null NPC tile.');
		}
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
	toJSON() {
		const { x, y } = this.coords.getCurrent();
		return {
			entityId: this.id,
			position: {
				x,
				y
			},
			bank: this.bankId,
			script: this.script
		};
	}
}

export const createNPC = (position: GridPosition) => {
	const npc = Object.create(NPC.prototype) as NPC;
	npc.coords = new Coords(position.x, position.y);
	return npc;
};

export type NPCType = InstanceType<typeof NPC>;
export type EditorNPCType = Partial<NPCType>;
