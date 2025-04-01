import { z } from 'zod';
import type { Game } from '../Game';
import { Tile, tileSchema, type BaseTileProps } from './Tile';
import { tileEventKindSchema } from '$lib/interfaces/Events';
import { SignRect } from '../ui/SignRect';

export const createSign = (x: number, y: number, text: string): EditorSignProps => ({
	kind: 'sign',
	x,
	y,
	text
});

export const signSchema = tileSchema.extend({
	text: z.string()
});

export const editorSignSchema = z.object({
	kind: tileEventKindSchema,
	x: z.number(),
	y: z.number(),
	text: z.string()
});

export interface EditorSignProps {
	kind: 'sign';
	x: number;
	y: number;
	text: string | null;
}

export interface SignProps extends BaseTileProps {
	kind: 'sign';
	text: string;
}

export class Sign extends Tile {
	text: string;

	constructor(tile: Tile, text: string) {
		super(tile.x, tile.y, tile.id, tile.overlay, tile.permissions);
		this.text = text;
		this.kind = 'sign';
	}
	activate(game: Game) {
		game.blockMovement();
		game.canvas.elements.addElement(new SignRect(this.text, game.lastFrameTime));
	}
}
