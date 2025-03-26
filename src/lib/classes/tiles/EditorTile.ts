import { z } from 'zod';
import SpriteBank, { type SpriteInfo } from '../SpriteBank';

export const tileSchema = z.object({
	kind: z.union([z.literal('tile'), z.literal('sign'), z.literal('warp')]),
	x: z.number(),
	y: z.number(),
	id: z.number(),
	overlay: z.boolean(),
	permissions: z.number()
});

export interface EditorBaseTileProps {
	x: number;
	y: number;
	id: number;
	overlay: boolean;
	permissions: number;
	tileSprites: HTMLImageElement | HTMLImageElement[];
}

export class EditorTile {
	x: number;
	y: number;
	id: number;
	overlay: boolean;
	permissions: number;
	tileSprites: SpriteInfo;

	constructor(x: number, y: number, id: number, overlay: boolean, permissions: number) {
		this.x = x;
		this.y = y;
		this.id = id;
		this.overlay = overlay;
		this.permissions = permissions;
		this.tileSprites = SpriteBank.getTile(this.id);
	}
	getActiveSprite() {
		return this.tileSprites.images[0];
	}
}
