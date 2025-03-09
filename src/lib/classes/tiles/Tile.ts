import { z } from 'zod';
import type { Game } from '../Game';
import type { TileKind } from '$lib/interfaces/TileKind';
import type { SignTile } from './SignTile';

export const tileSchema = z.object({
	kind: z.union([z.literal('tile'), z.literal('sign'), z.literal('warp')]),
	x: z.number(),
	y: z.number(),
	id: z.number(),
	overlay: z.boolean(),
	permissions: z.number()
});

export class Tile {
	kind: TileKind = 'tile';
	x: number;
	y: number;
	id: number;
	overlay: boolean;
	permissions: number;

	constructor(x: number, y: number, id: number, overlay: boolean, permissions: number) {
		this.x = x;
		this.y = y;
		this.id = id;
		this.overlay = overlay;
		this.permissions = permissions;
	}
	isPassable() {
		return this.permissions !== 1;
	}
	activate(game: Game) {
		void game;
	}
	isSign(): this is SignTile {
		return this.kind === 'sign';
	}
}
