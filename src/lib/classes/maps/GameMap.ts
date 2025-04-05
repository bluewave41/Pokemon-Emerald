import { BufferHelper } from '$lib/BufferHelper';
import { mapNamesSchema, type MapNames } from '$lib/interfaces/MapNames';
import { z } from 'zod';
import type { Canvas } from '../Canvas';
import { Tile, tileSchema } from '../tiles/Tile';
import type { AnyTile } from '$lib/interfaces/AnyTile';
import { editorSignSchema, Sign } from '../tiles/Sign';
import { editorWarpSchema, Warp } from '../tiles/Warp';
import type { Entity } from '../entities/Entity';
import { NPC } from '../entities/NPC';

export const gameMapSchema = z.object({
	name: mapNamesSchema,
	width: z.number(),
	height: z.number(),
	tiles: tileSchema.array().array(),
	backgroundTile: z.number().optional(),
	events: z.union([editorWarpSchema, editorSignSchema]).array()
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
	entities: Entity[];
}

export class GameMap {
	absoluteX: number;
	absoluteY: number;
	id: number;
	name: MapNames;
	width: number;
	height: number;
	tiles: AnyTile[][];
	backgroundTile: Tile;
	entities: Entity[] = [];

	constructor(
		absoluteX: number,
		absoluteY: number,
		id: number,
		name: MapNames,
		width: number,
		height: number,
		tiles: AnyTile[][],
		backgroundTile: Tile
	) {
		this.absoluteX = absoluteX;
		this.absoluteY = absoluteY;
		this.id = id;
		this.name = name;
		this.width = width;
		this.height = height;
		this.tiles = tiles;
		this.backgroundTile = backgroundTile;
		this.entities.push(new NPC('npc-fat', 14, 11, this));
	}
	drawBaseLayer(canvas: Canvas) {
		if (!this.backgroundTile) {
			return;
		}
		for (let loopY = 0; loopY < this.height; loopY++) {
			for (let loopX = 0; loopX < this.width; loopX++) {
				canvas.drawTile(
					this.backgroundTile.getActiveSprite(),
					loopX + this.absoluteX,
					loopY + this.absoluteY
				);
			}
		}
	}
	drawTopLayer(canvas: Canvas) {
		const tiles = this.tiles.flat().filter((tile) => tile.overlay);
		for (const tile of tiles) {
			canvas.drawTile(tile.getActiveSprite(), tile.x + this.absoluteX, tile.y + this.absoluteY);
		}
	}
	tick(currentFrameTime: number, canvas: Canvas) {
		for (let loopY = 0; loopY < this.height; loopY++) {
			for (let loopX = 0; loopX < this.width; loopX++) {
				const tile = this.tiles[loopY][loopX];
				tile.tick(currentFrameTime);

				if (tile.id === this.backgroundTile?.id) {
					continue;
				}
				if (tile.overlay) {
					continue;
				}
				canvas.drawTile(tile.getActiveSprite(), loopX + this.absoluteX, loopY + this.absoluteY);
			}
		}
		for (const entity of this.entities) {
			entity.tick(currentFrameTime, canvas);
		}
	}
	setAbsolutePosition(x: number, y: number) {
		this.absoluteX = x;
		this.absoluteY = y;
	}
	static readMap(absoluteX: number, absoluteY: number, mapBuffer: Buffer) {
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

		return new GameMap(absoluteX, absoluteY, id, name, width, height, map, backgroundTile);
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
