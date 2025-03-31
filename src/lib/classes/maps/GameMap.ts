import { BufferHelper } from '$lib/BufferHelper';
import { mapNamesSchema, type MapNames } from '$lib/interfaces/MapNames';
import { z } from 'zod';
import type { Canvas } from '../Canvas';
import { Tile, tileSchema } from '../tiles/Tile';
import type { AnyTile } from '$lib/interfaces/AnyTile';
import { Sign } from '../tiles/Sign';
import { editorWarpSchema, Warp } from '../tiles/Warp';

export const gameMapSchema = z.object({
	name: mapNamesSchema,
	width: z.number(),
	height: z.number(),
	tiles: tileSchema.array().array(),
	backgroundTile: z.number().optional(),
	events: editorWarpSchema.array()
});

export const gameEditorMapSchema = gameMapSchema.extend({
	overlayTiles: z.number().array()
});

export interface GameMapType {
	id: number;
	name: MapNames;
	width: number;
	height: number;
	tiles: AnyTile[][];
	backgroundTile: number;
}

export class GameMap {
	id: number;
	name: MapNames;
	width: number;
	height: number;
	tiles: AnyTile[][];
	backgroundTile: Tile;

	constructor(
		id: number,
		name: MapNames,
		width: number,
		height: number,
		tiles: AnyTile[][],
		backgroundTile: Tile
	) {
		this.id = id;
		this.name = name;
		this.width = width;
		this.height = height;
		this.tiles = tiles;
		this.backgroundTile = backgroundTile;
	}
	drawBaseLayer(canvas: Canvas, x: number, y: number) {
		if (!this.backgroundTile) {
			return;
		}
		for (let loopY = 0; loopY < this.height; loopY++) {
			for (let loopX = 0; loopX < this.width; loopX++) {
				canvas.drawTile(this.backgroundTile.getActiveSprite(), loopX + x, loopY + y);
			}
		}
	}
	drawTopLayer(canvas: Canvas, x: number, y: number) {
		const tiles = this.tiles.flat().filter((tile) => tile.overlay);
		for (const tile of tiles) {
			canvas.drawTile(tile.getActiveSprite(), tile.x + x, tile.y + y);
		}
	}
	tick(game: { lastFrameTime: number }, canvas: Canvas, x: number, y: number) {
		for (let loopY = 0; loopY < this.height; loopY++) {
			for (let loopX = 0; loopX < this.width; loopX++) {
				const tile = this.tiles[loopY][loopX];
				tile.tick(game);

				if (tile.id === this.backgroundTile?.id) {
					continue;
				}
				if (tile.overlay) {
					continue;
				}
				canvas.drawTile(tile.getActiveSprite(), loopX + x, loopY + y);
			}
		}
	}
	static readMap(mapBuffer: Buffer) {
		const buffer = new BufferHelper(mapBuffer);

		buffer.readByte(); // version
		const id = buffer.readByte();
		const name = buffer.readString() as MapNames;
		const width = buffer.readByte();
		const height = buffer.readByte();
		const backgroundId = buffer.readByte();

		let backgroundTile: Tile | null = null;

		const map: AnyTile[][] = [];
		for (let y = 0; y < height; y++) {
			const row = [];
			for (let x = 0; x < width; x++) {
				const tile = new Tile(
					x,
					y,
					buffer.readByte(),
					buffer.readBoolean(),
					buffer.readByte(),
					buffer.readBoolean()
				);
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
					map[y][x] = new Sign(map[y][x], buffer.readString());
					break;
				case 'warp':
					map[y][x] = new Warp(
						map[y][x],
						buffer.readByte(),
						buffer.readDirection(),
						buffer.readShort(),
						buffer.readByte(),
						buffer.readWarpType()
					);
					break;
			}
		}

		return new GameMap(id, name, width, height, map, backgroundTile);
	}
	getTile(x: number, y: number) {
		return this.tiles[y][x];
	}
	toJSON() {
		return {
			name: this.name,
			width: this.width,
			height: this.height,
			tiles: this.tiles,
			backgroundTile: this.backgroundTile?.id
		};
	}
}
