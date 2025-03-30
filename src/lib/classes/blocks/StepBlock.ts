import type { Direction } from '@prisma/client';
import { Block } from './Block';
import { Game } from '../Game';

export class StepBlock extends Block {
	direction: Direction;
	count: number;

	constructor(direction: Direction, count?: number) {
		super();
		this.direction = direction;
		this.count = count ?? 1;
	}
	async run(game: Game) {
		const directionTable = {
			UP: {
				x: game.player.subPosition.x,
				y: game.player.subPosition.y - Game.getAdjustedTileSize()
			},
			LEFT: {
				x: game.player.subPosition.x - Game.getAdjustedTileSize(),
				y: game.player.subPosition.y
			},
			RIGHT: {
				x: game.player.subPosition.x + Game.getAdjustedTileSize(),
				y: game.player.subPosition.y
			},
			DOWN: {
				x: game.player.subPosition.x,
				y: game.player.subPosition.y + Game.getAdjustedTileSize()
			}
		};

		const { x, y } = directionTable[this.direction];
		game.player.targetPosition = {
			x,
			y
		};

		game.player.moving = true;
		game.player.counter = 0;
		await game.player.scriptedMovement();
		return 1;
	}
}
