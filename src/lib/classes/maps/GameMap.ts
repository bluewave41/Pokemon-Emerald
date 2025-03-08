import { BufferHelper } from '$lib/BufferHelper';
import type { MapEvent } from '$lib/interfaces/Events';
import { mapNamesSchema, type MapNames } from '$lib/interfaces/MapNames';
import type { TileType } from '$lib/interfaces/TileType';
import { z } from 'zod';
import type { Canvas } from '../Canvas';
import SpriteBank from '../SpriteBank';
import { Tile, tileSchema } from '../tiles/Tile';

export const gameMapSchema = z.object({
	name: mapNamesSchema,
	area: z.string(),
	width: z.number(),
	height: z.number(),
	images: z.string().array(),
	tiles: tileSchema.array().array(),
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
	images: string[];
	tiles: TileType[][];
	backgroundTile: number;
}

export class GameMap {
	name: MapNames;
	area: string = 'overworld';
	width: number;
	height: number;
	images: string[];
	tiles: TileType[][];
	backgroundTile: number = -1;
	events: MapEvent[] = [];
	editor: boolean = false;

	constructor(
		name: MapNames,
		width: number,
		height: number,
		images: string[],
		tiles: TileType[][],
		backgroundTile: number,
		events: MapEvent[]
	) {
		this.name = name;
		this.width = width;
		this.height = height;
		this.images = images;
		this.tiles = tiles;
		this.backgroundTile = backgroundTile;
		this.events = events;
	}
	drawBaseLayer(canvas: Canvas) {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				canvas.drawTile(SpriteBank.getTile(this.name, this.area, this.backgroundTile), x, y);
			}
		}
	}
	drawTopLayer(canvas: Canvas) {
		const tiles = this.tiles.flat().filter((tile) => tile.overlay);
		for (const tile of tiles) {
			canvas.drawTile(SpriteBank.getTile(this.name, this.area, tile.id), tile.x, tile.y);
		}
	}
	tick(canvas: Canvas) {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const tile = this.tiles[y][x];
				if (!this.editor && tile.id === this.backgroundTile) {
					continue;
				}
				if (tile.overlay) {
					continue;
				}
				canvas.drawTile(SpriteBank.getTile(this.name, this.area, tile.id), x, y);
			}
		}
	}
	static readMap(mapBuffer: Buffer) {
		const buffer = new BufferHelper(mapBuffer);

		buffer.readByte(); // version
		const name = buffer.readString() as MapNames;
		const width = buffer.readByte();
		const height = buffer.readByte();
		const backgroundTile = buffer.readByte();
		const imageCount = buffer.readShort();
		const images = [];

		for (let i = 0; i < imageCount; i++) {
			images.push(buffer.readString());
		}

		const map: TileType[][] = [];
		for (let y = 0; y < height; y++) {
			const row = [];
			for (let x = 0; x < width; x++) {
				row.push(new Tile(x, y, buffer.readByte(), buffer.readBoolean(), buffer.readByte()));
			}
			map.push(row);
		}

		/*const events: MapEvent[] = [];
		while (buffer.hasMore()) {
			const eventId = buffer.readByte();
			const event = EventMap[eventId];
			if (!event) {
				throw new Error('Unhandled event!');
			}
			events.push(event.read(buffer));
		}

		for (const event of events) {
			const { x, y } = event.position;
			const tile = map[y][x];
			if (event.type === 'sign') {
				map[y][x] = new SignTile(tile, event.text);
			}
		}*/

		return new GameMap(name, width, height, images, map, backgroundTile, []);
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
			images: this.images,
			backgroundTile: this.backgroundTile
		};
	}
	setEditor(editor: boolean) {
		this.editor = editor;
	}
}
