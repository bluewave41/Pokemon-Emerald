import { z } from 'zod';
import { Tile, tileSchema, type BaseTileProps } from './Tile';
import GameEvent from '../GameEvent';

type WarpType = 'door' | 'cave';

export const warpSchema = tileSchema.extend({
	target: z.number()
});

export interface WarpProps extends BaseTileProps {
	kind: 'warp';
	target: number;
}

export class Warp extends Tile {
	target: number | null = null;
	type: WarpType = 'door';

	constructor(tile: Tile, target?: number) {
		super(tile.x, tile.y, tile.id, tile.overlay, tile.permissions, tile.activatedAnimation);
		this.kind = 'warp';
		this.target = target ?? null;
	}
	tick(game: { lastFrameTime: number }) {
		if (this.isAnimating) {
			if (this.lastFrame + this.tileSprites.delay < game.lastFrameTime) {
				this.lastFrame = game.lastFrameTime;
				this.sequenceIndex++;
				if (this.sequenceIndex >= this.tileSprites.sequence.length) {
					this.isAnimating = false;
					this.sequenceIndex--;
					GameEvent.dispatchEvent(new CustomEvent('warpAnimationComplete'));
				}
			}
		}
	}
}
