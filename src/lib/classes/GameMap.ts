import { BufferedReader } from '$lib/BufferedReader';
import type { MapNames } from '$lib/interfaces/MapNames';
import type { Canvas } from './Canvas';
import SpriteBank from './SpriteBank';
import { Tile } from './Tile';

export class GameMap {
	name: MapNames;
	area: string = 'overworld';
	width: number;
	height: number;
	images: string[];
	map: Tile[][];

	constructor(name: MapNames, width: number, height: number, images: string[], map: Tile[][]) {
		this.name = name;
		this.width = width;
		this.height = height;
		this.images = images;
		this.map = map;
	}
	tick(canvas: Canvas) {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const tile = this.map[y][x];
				canvas.drawTile(SpriteBank.getSprite(this.name, this.area, tile.id), x, y);
			}
		}
	}
	static readMap(mapBuffer: Buffer) {
		const buffer = new BufferedReader(mapBuffer);

		buffer.readByte(); // version
		const name = buffer.readString() as MapNames;
		const width = buffer.readByte();
		const height = buffer.readByte();
		const imageCount = buffer.readShort();
		const images = [];
		for (let i = 0; i < imageCount; i++) {
			images.push(buffer.readString());
		}

		const map: Tile[][] = [];
		for (let y = 0; y < height; y++) {
			const row = [];
			for (let x = 0; x < width; x++) {
				row.push(new Tile(buffer.readByte(), buffer.readByte()));
			}
			map.push(row);
		}

		return new GameMap(name, width, height, images, map);
	}
	getTile(x: number, y: number) {
		return this.map[y][x];
	}
	toJSON() {
		return {
			name: this.name,
			width: this.width,
			height: this.height,
			images: this.images,
			map: this.map
		};
	}
}
