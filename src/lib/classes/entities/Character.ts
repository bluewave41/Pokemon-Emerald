import type { Direction } from '@prisma/client';
import { Entity } from './Entity';
import SpriteBank from '../SpriteBank';
import type { BankNames } from '$lib/interfaces/BankNames';
import type { Canvas } from '../Canvas';
import { Game } from '../Game';
import type { GameMap } from '../maps/GameMap';
import { ScreenPosition } from '../Position';
import GameEvent from '../GameEvent';

export class Character extends Entity {
	bankId: BankNames;
	direction: Direction;
	moving: boolean = false;
	jumping: boolean = false;
	counter: number = 0;
	walkFrame: number = 1;
	shouldDraw: boolean = true;
	speed: number = Game.getAdjustedTileSize() * 3;

	constructor(id: string, bankId: BankNames, x: number, y: number, script: string | null) {
		super(id, x, y, script);
		this.bankId = bankId;
		this.direction = 'DOWN';
	}
	draw(canvas: Canvas, map: GameMap) {
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
				Math.round(sub.x) + map.absoluteX * Game.getAdjustedTileSize(),
				Math.round(sub.y) + map.absoluteY * Game.getAdjustedTileSize(),
				xOffset,
				yOffset
			);
		}
	}
	setVisible(visible: boolean) {
		this.shouldDraw = visible;
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
}
