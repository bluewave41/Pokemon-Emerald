import { z } from 'zod';
import type { Game } from '../Game';
import type { TileKind } from '$lib/interfaces/TileKind';
import SpriteBank, { type SpriteInfo } from '../SpriteBank';
import type { Warp } from './Warp';
import type { Sign } from './Sign';
import GameEvent from '../GameEvent';
import type { Direction } from '@prisma/client';

export const tileSchema = z.object({
	x: z.number(),
	y: z.number(),
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
	x: number;
	y: number;
	id: number;
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
	} = {
		isAnimating: false,
		direction: 'forwards',
		sequenceIndex: 0
	};

	constructor(
		x: number,
		y: number,
		id: number,
		overlay: boolean,
		permissions: number,
		jumpable: Direction | null,
		script: string | null,
		activatedAnimation?: boolean
	) {
		this.x = x;
		this.y = y;
		this.id = id;
		this.newId = id;
		this.overlay = overlay;
		this.permissions = permissions;
		this.tileSprites = SpriteBank.getTile(this.id);
		this.jumpable = jumpable;
		this.script = script;
		this.activatedAnimation = activatedAnimation ?? false;
		this.animationOptions.isAnimating = this.activatedAnimation ? false : true;
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
			sequenceIndex: 0
		};
	}
	playReversed() {
		this.animationOptions = {
			isAnimating: true,
			direction: 'backwards',
			sequenceIndex: this.tileSprites.images.length - 1
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
						if (this.activatedAnimation) {
							this.animationOptions.isAnimating = false;
							this.animationOptions.sequenceIndex--;
							GameEvent.dispatchEvent(new CustomEvent('animationComplete'));
						} else {
							this.animationOptions.sequenceIndex = 0;
						}
					}
				} else {
					if (this.animationOptions.sequenceIndex === 0) {
						this.animationOptions.isAnimating = false;
						GameEvent.dispatchEvent(new CustomEvent('animationComplete'));
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
		if (this.tileSprites.sequence) {
			return this.tileSprites.images[
				this.tileSprites.sequence[this.animationOptions.sequenceIndex]
			];
		}
		return this.tileSprites.images[this.animationOptions.sequenceIndex];
	}
	activate(game: Game) {
		if (this.script) {
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
