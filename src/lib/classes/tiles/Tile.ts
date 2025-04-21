import { z } from 'zod';
import type { Game } from '../Game';
import type { TileKind } from '$lib/interfaces/TileKind';
import SpriteBank, { type SpriteInfo } from '../SpriteBank';
import type { Warp } from './Warp';
import type { Sign } from './Sign';
import GameEvent from '../GameEvent';
import type { Direction } from '@prisma/client';
import { GridPosition } from '../Position';

export const directions: Direction[] = ['UP', 'LEFT', 'RIGHT', 'DOWN'];

export const tileSchema = z.object({
	position: z.object({
		x: z.number(),
		y: z.number()
	}),
	id: z.number(),
	overlay: z.boolean(),
	permissions: z.number()
});

export interface BaseTileProps {
	x: number;
	y: number;
	id: number;
	overlay: boolean;
	permissions: number;
	tileSprites: HTMLImageElement | HTMLImageElement[];
	activeSprite: number;
	script: string;
}

export interface TileProps extends BaseTileProps {
	kind: 'tile';
}

export class Tile {
	kind: TileKind = 'tile';
	id: number;
	position: GridPosition;
	newId: number;
	overlay: boolean;
	permissions: number;
	tileSprites: SpriteInfo;
	lastFrame: number = 0;
	jumpable: Direction | null;
	activatedAnimation: boolean;
	script: string | null;
	animationOptions: {
		isAnimating: boolean;
		direction: 'forwards' | 'backwards';
		sequenceIndex: number;
		repeating: boolean;
	} = {
		isAnimating: false,
		direction: 'forwards',
		sequenceIndex: 0,
		repeating: false
	};

	constructor(
		x: number,
		y: number,
		id: number,
		properties: number,
		script: string | null,
		activatedAnimation: boolean,
		repeatingAnimation: boolean
	) {
		this.id = id;
		this.position = new GridPosition(x, y);
		this.newId = id;
		this.overlay = Boolean((properties >> 7) & 0b1);
		this.permissions = (properties >> 2) & 0b11111;
		this.tileSprites = SpriteBank.getTile(this.id);
		this.jumpable = (properties & 0b11) === 0 ? null : directions[properties & 0b11];
		this.script = script;
		this.activatedAnimation = activatedAnimation;
		this.animationOptions.isAnimating = !this.activatedAnimation;
		this.animationOptions.repeating = repeatingAnimation;
	}
	isPassable() {
		return this.permissions !== 1;
	}
	isSign(): this is Sign {
		return this.kind === 'sign';
	}
	isWarp(): this is Warp {
		return this.kind === 'warp';
	}
	hasAnimated() {
		return (
			(this.animationOptions.direction === 'forwards' &&
				this.animationOptions.sequenceIndex === this.tileSprites.images.length - 1) ||
			(this.animationOptions.direction === 'backwards' && this.animationOptions.sequenceIndex === 0)
		);
	}
	playForward() {
		this.animationOptions = {
			isAnimating: true,
			direction: 'forwards',
			sequenceIndex: 0,
			repeating: this.animationOptions.repeating
		};
	}
	playReversed() {
		this.animationOptions = {
			isAnimating: true,
			direction: 'backwards',
			sequenceIndex: this.tileSprites.images.length - 1,
			repeating: this.animationOptions.repeating
		};
	}
	stopAnimating() {
		this.animationOptions = {
			isAnimating: false,
			direction: 'forwards',
			sequenceIndex: 0,
			repeating: this.animationOptions.repeating
		};
	}
	tick(currentFrameTime: number) {
		if ((this.tileSprites.delay && !this.activatedAnimation) || this.animationOptions.isAnimating) {
			if (this.lastFrame + this.tileSprites.delay < currentFrameTime) {
				this.lastFrame = currentFrameTime;
				this.animationOptions.sequenceIndex +=
					this.animationOptions.direction === 'forwards' ? 1 : -1;

				if (this.animationOptions.direction === 'forwards') {
					if (this.animationOptions.sequenceIndex >= this.tileSprites.sequence.length) {
						if (this.activatedAnimation && !this.animationOptions.repeating) {
							this.animationOptions.isAnimating = false;
							this.animationOptions.sequenceIndex--;
							GameEvent.dispatchEvent(new CustomEvent('animationComplete'));
						} else if (this.animationOptions.repeating) {
							this.animationOptions.sequenceIndex--;
							this.animationOptions.direction = 'backwards';
						} else {
							this.animationOptions.sequenceIndex = 0;
						}
					}
				} else {
					if (this.animationOptions.sequenceIndex === 0) {
						if (this.animationOptions.repeating) {
							this.animationOptions.direction = 'forwards';
						} else {
							this.animationOptions.isAnimating = false;
							GameEvent.dispatchEvent(new CustomEvent('animationComplete'));
						}
					}
				}
			}
		}
	}
	setReversed() {
		this.animationOptions.sequenceIndex = this.tileSprites.images.length - 1;
	}
	handle(game: Game) {
		void game;
	}
	getActiveSprite() {
		if (!this.tileSprites) {
			throw new Error('Tile sprites was null.');
		}
		if (this.newId !== this.id) {
			this.tileSprites = SpriteBank.getTile(this.newId);
			this.id = this.newId;
		}

		if (this.tileSprites.sequence && this.animationOptions.isAnimating) {
			return this.tileSprites.images[
				this.tileSprites.sequence[this.animationOptions.sequenceIndex]
			];
		}
		return this.tileSprites.images[this.animationOptions.sequenceIndex];
	}
	activate(game: Game) {
		if (this.script && !game.frozen) {
			game.executeScript(
				{
					name: '',
					x: null,
					y: null,
					mapId: -1,
					condition: 'true',
					script: this.script,
					setup: ''
				},
				'script'
			);
		}
	}
}
