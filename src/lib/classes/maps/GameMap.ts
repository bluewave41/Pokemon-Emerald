import { BufferHelper } from '$lib/BufferHelper';
import type { MapEvent } from '$lib/interfaces/Events';
import type { MapNames } from '$lib/interfaces/MapNames';
import type { TileType } from '$lib/interfaces/TileType';
import { EventMap } from '$lib/utils/EventMap';
import type { Canvas } from '../Canvas';
import SpriteBank from '../SpriteBank';
import { SignTile } from '../tiles/SignTile';
import { Tile } from '../tiles/Tile';

export class GameMap {
	name: MapNames;
	area: string = 'overworld';
	width: number;
	height: number;
	images: string[];
	tiles: TileType[][];
	backgroundTile: number = -1;
	events: MapEvent[] = [];

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
	tick(canvas: Canvas) {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const tile = this.tiles[y][x];
				if (tile.id === this.backgroundTile) {
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
				row.push(new Tile(x, y, buffer.readByte(), buffer.readByte()));
			}
			map.push(row);
		}

		const events: MapEvent[] = [];
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
		}

		return new GameMap(name, width, height, images, map, backgroundTile, events);
	}
	getTile(x: number, y: number) {
		return this.tiles[y][x];
	}
	toJSON() {
		return {
			name: this.name,
			width: this.width,
			height: this.height,
			images: this.images,
			tiles: this.tiles
		};
	}
}
