import type { Direction } from '@prisma/client';
import { Entity } from './Entity';
import SpriteBank from '../SpriteBank';
import type { GameMap } from '../maps/GameMap';
import type { Canvas } from '../Canvas';
import type { BankNames } from '$lib/interfaces/BankNames';
import { Game } from '../Game';

export class NPC extends Entity {
	id: BankNames;
	moving: boolean = false;
	counter: number = 0;
	direction: Direction = 'DOWN';
	walkFrame: number = 0;
	lastFrameTime: number = 0;

	constructor(id: BankNames, x: number, y: number, map: GameMap) {
		super(x, y, map);
		this.id = id;
	}
	tick(currentFrameTime: number, canvas: Canvas) {
		const direction = this.direction.toLocaleLowerCase();
		//if(this.lastFrameTime === 0) {
		//    this.lastFrameTime = currentFrameTime;
		//}
		// determine whether we should move
		const walkSprite = this.moving && this.counter < 10 ? direction + this.walkFrame : direction;

		const sprite = SpriteBank.getSprite(this.id, walkSprite);

		canvas.drawAbsoluteImage(
			sprite,
			Math.round(this.coords.sub.x) + 1 + this.map.absoluteX * Game.getAdjustedTileSize(),
			Math.round(this.coords.sub.y + (this.counter < 10 ? 1 : 0)) -
				10 +
				this.map.absoluteY * Game.getAdjustedTileSize()
		);
	}
}
