import { BufferHelper } from '$lib/BufferHelper';
import { mapNamesSchema, type MapNames } from '$lib/interfaces/MapNames';
import { z } from 'zod';
import type { Canvas } from '../Canvas';
import { Tile, tileSchema } from '../tiles/Tile';
import { signSchema, type EditorSignProps } from '../tiles/Sign';
import { warpSchema, type EditorWarpProps } from '../tiles/Warp';
import type { MapEvents } from '$lib/interfaces/Events';
import type { Script } from './GameMap';
import type { Entity } from '../entities/Entity';

export const gameMapSchema = z.object({
	name: mapNamesSchema,
	area: z.string(),
	width: z.number(),
	height: z.number(),
	tiles: z.union([warpSchema, signSchema, tileSchema]).array().array(),
	backgroundTile: z.number().optional()
});

export const gameEditorMapSchema = gameMapSchema.extend({
	overlayTiles: z.number().array()
});

export interface EditorGameMapType {
	id: number;
	name: MapNames;
	width: number;
	height: number;
	tiles: Tile[][];
	backgroundTile: Tile | null;
	events: MapEvents[];
	entities: Entity[];
}

export class EditorGameMap {
	id: number;
	name: MapNames;
	width: number;
	height: number;
	tiles: Tile[][];
	backgroundTile: Tile | null = null;
	events: MapEvents[] = $state([]);
	scripts: Script[] = $state([]);
	entities: Entity[] = $state([]);

	constructor(
		id: number,
		name: MapNames,
		width: number,
		height: number,
		tiles: Tile[][],
		backgroundTile: Tile | null,
		events: MapEvents[],
		scripts: Script[]
	) {
		this.id = id;
		this.name = name;
		this.width = width;
		this.height = height;
		this.tiles = tiles;
		this.backgroundTile = backgroundTile;
		this.events = events;
		this.scripts = scripts;
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
	tick(canvas: Canvas, x: number, y: number) {
		for (let loopY = 0; loopY < this.height; loopY++) {
			for (let loopX = 0; loopX < this.width; loopX++) {
				const tile = this.tiles[loopY][loopX];

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

		const map: Tile[][] = [];
		for (let y = 0; y < height; y++) {
			const row = [];
			for (let x = 0; x < width; x++) {
				const tile = new Tile(
					x,
					y,
					buffer.readByte(),
					buffer.readBoolean(),
					buffer.readByte(),
					buffer.readBoolean(),
					null,
					false,
					false
				);
				if (buffer.readBoolean()) {
					// unused script
					buffer.readString();
				}
				buffer.readBoolean(); // unused animation byte
				buffer.readBoolean(); // unused animation byte

				if (!backgroundTile && tile.id === backgroundId) {
					backgroundTile = tile;
				}
				row.push(tile);
			}
			map.push(row);
		}

		const warps: EditorWarpProps[] = [];
		const signs: EditorSignProps[] = [];

		const numOfEvents = buffer.readByte();
		for (let i = 0; i < numOfEvents; i++) {
			const eventId = buffer.readEventId();
			const x = buffer.readByte();
			const y = buffer.readByte();
			switch (eventId) {
				case 'sign':
					signs.push({
						kind: 'sign',
						x,
						y,
						text: buffer.readString()
					});
					break;
				case 'warp':
					warps.push({
						kind: 'warp',
						x,
						y,
						warpId: buffer.readByte(),
						activateDirection: buffer.readDirection(),
						targetMapId: buffer.readShort(),
						targetWarpId: buffer.readByte(),
						type: buffer.readWarpType()
					});
					break;
			}
		}

		const numOfScripts = buffer.readByte();
		const scripts: Script[] = [];
		for (let i = 0; i < numOfScripts; i++) {
			const hasCoordinates = buffer.readBoolean();
			scripts.push({
				mapId: buffer.readByte(),
				name: buffer.readString(),
				condition: buffer.readString(),
				setup: buffer.readString(),
				script: buffer.readString(),
				x: hasCoordinates ? buffer.readByte() : null,
				y: hasCoordinates ? buffer.readByte() : null
			});
		}

		return new EditorGameMap(
			id,
			name,
			width,
			height,
			map,
			backgroundTile,
			[...warps, ...signs],
			scripts
		);
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
			backgroundTile: this.backgroundTile?.id,
			events: this.events,
			scripts: this.scripts
		};
	}
}
