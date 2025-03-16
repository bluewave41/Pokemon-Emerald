import { BufferHelper } from '$lib/BufferHelper';
import type { MapEvent } from '$lib/interfaces/Events';
import { mapNamesSchema, type MapNames } from '$lib/interfaces/MapNames';
import { z } from 'zod';
import type { Canvas } from '../Canvas';
import { Tile, tileSchema } from '../tiles/Tile';
import type { AnyTile } from '$lib/interfaces/AnyTile';
import { SignTile, signTileSchema } from '../tiles/SignTile';
import type { Game } from '../Game';

export const gameMapSchema = z.object({
	name: mapNamesSchema,
	area: z.string(),
	width: z.number(),
	height: z.number(),
	tiles: z.union([signTileSchema, tileSchema]).array().array(),
	backgroundTile: z.number()
});

export const gameEditorMapSchema = gameMapSchema.extend({
	overlayTiles: z.number().array()
});

export interface GameMapType {
	name: MapNames;
	area: string;
	width: number;
	height: number;
	tiles: AnyTile[][];
	backgroundTile: Tile;
}

export class GameMap {
	name: MapNames;
	area: string = 'overworld';
	width: number;
	height: number;
	tiles: AnyTile[][];
	backgroundTile: Tile | null = null;
	events: MapEvent[] = [];
	editor: boolean = false;

	constructor(
		name: MapNames,
		width: number,
		height: number,
		tiles: AnyTile[][],
		backgroundTile: Tile,
		events: MapEvent[]
	) {
		this.name = name;
		this.width = width;
		this.height = height;
		this.tiles = tiles;
		this.backgroundTile = backgroundTile;
		this.events = events;
	}
	drawBaseLayer(canvas: Canvas) {
		if (!this.backgroundTile) {
			return;
		}
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				canvas.drawTile(this.backgroundTile.getActiveSprite(), x, y);
			}
		}
	}
	drawTopLayer(canvas: Canvas) {
		const tiles = this.tiles.flat().filter((tile) => tile.overlay);
		for (const tile of tiles) {
			canvas.drawTile(tile.getActiveSprite(), tile.x, tile.y);
		}
	}
	tick(game: Game, canvas: Canvas) {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const tile = this.tiles[y][x];
				tile.tick(game);
				if (!this.editor && tile.id === this.backgroundTile?.id) {
					continue;
				}
				if (tile.overlay) {
					continue;
				}
				canvas.drawTile(tile.getActiveSprite(), x, y);
			}
		}
	}
	static readMap(mapBuffer: Buffer) {
		const buffer = new BufferHelper(mapBuffer);

		buffer.readByte(); // version
		const name = buffer.readString() as MapNames;
		const width = buffer.readByte();
		const height = buffer.readByte();
		const backgroundId = buffer.readByte();

		let backgroundTile: Tile | null = null;

		const map: AnyTile[][] = [];
		for (let y = 0; y < height; y++) {
			const row = [];
			for (let x = 0; x < width; x++) {
				const tile = new Tile(x, y, buffer.readByte(), buffer.readBoolean(), buffer.readByte());
				if (!backgroundTile && tile.id === backgroundId) {
					backgroundTile = tile;
				}
				row.push(tile);
			}
			map.push(row);
		}

		if (!backgroundTile) {
			throw new Error('Map is missing a background tile.');
		}

		while (buffer.hasMore()) {
			const eventId = buffer.readEventId();
			const x = buffer.readByte();
			const y = buffer.readByte();
			switch (eventId) {
				case 'sign':
					map[y][x] = new SignTile(map[y][x], buffer.readString());
					break;
			}
		}

		return new GameMap(name, width, height, map, backgroundTile, []);
	}
	getTile(x: number, y: number) {
		return this.tiles[y][x];
	}
	toJSON() {
		return {
			name: this.name,
			area: this.area,
			width: this.width,
			height: this.height,
			tiles: this.tiles,
			backgroundTile: this.backgroundTile
		};
	}
	setEditor(editor: boolean) {
		this.editor = editor;
	}
}
