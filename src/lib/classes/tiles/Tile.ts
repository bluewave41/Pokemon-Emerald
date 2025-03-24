import { z } from 'zod';
import type { Game } from '../Game';
import type { TileKind } from '$lib/interfaces/TileKind';
import SpriteBank, { type SpriteInfo } from '../SpriteBank';
import type { Warp } from './Warp';
import type { Sign } from './Sign';
import GameEvent from '../GameEvent';

export const tileSchema = z.object({
	kind: z.union([z.literal('tile'), z.literal('sign'), z.literal('warp')]),
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
	sequenceIndex: number = 0;
	lastFrame: number = 0;
	activatedAnimation: boolean = false;
	isAnimating: boolean = false;

	constructor(
		x: number,
		y: number,
		id: number,
		overlay: boolean,
		permissions: number,
		activatedAnimation: boolean
	) {
		this.x = x;
		this.y = y;
		this.id = id;
		this.newId = id;
		this.overlay = overlay;
		this.permissions = permissions;
		this.tileSprites = SpriteBank.getTile(this.id);
		this.activatedAnimation = activatedAnimation;
		this.isAnimating = this.activatedAnimation ? false : true;
	}
	isPassable() {
		return this.permissions !== 1;
	}
	activate(game: Game) {
		void game;
	}
	isSign(): this is Sign {
		return this.kind === 'sign';
	}
	isWarp(): this is Warp {
		return this.kind === 'warp';
	}
	tick(game: { lastFrameTime: number }) {
		if ((this.tileSprites.delay && !this.activatedAnimation) || this.isAnimating) {
			if (this.lastFrame + this.tileSprites.delay < game.lastFrameTime) {
				this.lastFrame = game.lastFrameTime;
				this.sequenceIndex++;
				if (this.sequenceIndex >= this.tileSprites.sequence.length) {
					if (this.activatedAnimation) {
						this.isAnimating = false;
						this.sequenceIndex--;
					} else {
						this.sequenceIndex = 0;
					}
				}
			}
		}
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
			return this.tileSprites.images[this.tileSprites.sequence[this.sequenceIndex]];
		}
		return this.tileSprites.images[this.sequenceIndex];
	}
}
