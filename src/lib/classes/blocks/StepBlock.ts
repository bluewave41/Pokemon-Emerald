import type { Direction } from '@prisma/client';
import { Block } from './Block';
import { Game } from '../Game';

export class StepBlock extends Block {
	direction: Direction;
	count: number;

	constructor(direction: Direction, count?: number) {
		super('step');
		this.direction = direction;
		this.count = count ?? 1;
	}
	async run(game: Game) {
		const directionTable = {
			UP: {
				x: game.player.coords.sub.x,
				y: game.player.coords.sub.y - Game.getAdjustedTileSize()
			},
			LEFT: {
				x: game.player.coords.sub.x - Game.getAdjustedTileSize(),
				y: game.player.coords.sub.y
			},
			RIGHT: {
				x: game.player.coords.sub.x + Game.getAdjustedTileSize(),
				y: game.player.coords.sub.y
			},
			DOWN: {
				x: game.player.coords.sub.x,
				y: game.player.coords.sub.y + Game.getAdjustedTileSize()
			}
		};

		const { x, y } = directionTable[this.direction];
		game.player.coords.target = {
			x,
			y
		};

		game.player.moving = true;
		game.player.counter = 0;
		await game.player.scriptedMovement();
		return 1;
	}
}
