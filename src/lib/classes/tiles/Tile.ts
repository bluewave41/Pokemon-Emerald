import { z } from 'zod';
import type { Game } from '../Game';

export const tileSchema = z.object({
	x: z.number(),
	y: z.number(),
	id: z.number(),
	overlay: z.boolean(),
	permissions: z.number()
});

export interface TileType {
	x: number;
	y: number;
	id: number;
	overlay: boolean;
	permissions: number;
}

export class Tile {
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
}
