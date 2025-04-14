import { BufferHelper } from '$lib/BufferHelper';
import { mapNamesSchema, type MapNames } from '$lib/interfaces/MapNames';
import { z } from 'zod';
import type { Canvas } from '../Canvas';
import { Tile, tileSchema } from '../tiles/Tile';
import type { AnyTile } from '$lib/interfaces/AnyTile';
import { editorSignSchema, Sign } from '../tiles/Sign';
import { editorWarpSchema, Warp } from '../tiles/Warp';
import type { Entity } from '../entities/Entity';
import { Game } from '../Game';
import type { GridPosition, Position } from '../Position';

export type Script = {
	mapId: number;
	name: string;
	x: number | null;
	y: number | null;
	script: string;
};

export const scriptSchema = z.object({
	mapId: z.number(),
	name: z.string(),
	script: z.string(),
	x: z.number().nullable(),
	y: z.number().nullable()
});

export const gameMapSchema = z.object({
	name: mapNamesSchema,
	width: z.number(),
	height: z.number(),
	tiles: tileSchema.array().array(),
	backgroundTile: z.number().optional(),
	events: z.union([editorWarpSchema, editorSignSchema]).array(),
	scripts: scriptSchema.array()
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
	scripts: Script[];
	activeScripts: Script[];
}

export class GameMap {
	// literal X position on canvas in pixels
	absoluteX: number = 0;
	// literal Y position on canvas in pixels
	absoluteY: number = 0;
	canvas: Canvas;
	id: number;
	name: MapNames;
	width: number;
	height: number;
	tiles: AnyTile[][];
	backgroundTile: Tile;
	entities: Entity[] = [];
	scripts: Script[];
	activeScripts: Script[] = [];

	constructor(
		canvas: Canvas,
		id: number,
		name: MapNames,
		width: number,
		height: number,
		tiles: AnyTile[][],
		backgroundTile: Tile,
		scripts: Script[]
	) {
		this.canvas = canvas;
		this.id = id;
		this.name = name;
		this.width = width;
		this.height = height;
		this.tiles = tiles;
		this.backgroundTile = backgroundTile;
		this.scripts = scripts;
	}
	drawImage(image: HTMLImageElement, x: number, y: number) {
		const xDiff = image.width - 16; //10
		const yDiff = image.height - 3; //27

		this.canvas.drawImage(image, x + this.absoluteX, y + this.absoluteY, xDiff, yDiff);
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
	}
	tickScripts(game: Game) {
		for (const script of this.activeScripts) {
			game.executeScript(script);
		}
	}
	isTileOccupied(position: Position<GridPosition>) {
		return this.entities.some((entity) => {
			return position.equals(entity.coords.getCurrent());
		});
	}
	setAbsolutePosition(x: number, y: number) {
		this.absoluteX = x;
		this.absoluteY = y;
	}
	static readMap(canvas: Canvas, mapBuffer: Buffer) {
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
					buffer.readDirection(),
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

		const numOfEvents = buffer.readByte();
		for (let i = 0; i < numOfEvents; i++) {
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

		const numOfScripts = buffer.readByte();
		const scripts: Script[] = [];
		for (let i = 0; i < numOfScripts; i++) {
			const hasCoordinates = buffer.readBoolean();
			scripts.push({
				mapId: buffer.readByte(),
				name: buffer.readString(),
				script: buffer.readString(),
				x: hasCoordinates ? buffer.readByte() : null,
				y: hasCoordinates ? buffer.readByte() : null
			});
		}

		return new GameMap(canvas, id, name, width, height, map, backgroundTile, scripts);
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
