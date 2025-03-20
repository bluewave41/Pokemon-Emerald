import type { AnyTile } from '$lib/interfaces/AnyTile';
import { Canvas } from './Canvas';
import { GameMap } from './maps/GameMap';
import { Buffer } from 'buffer';
import type { Tile } from './tiles/Tile';

type Tabs = 'Tiles' | 'Permissions' | 'Events';

interface Options {
	activeTab: Tabs;
	activeTile: Tile | null;
	activeColor: number;
	backgroundTile: Tile | null;
	selectedTile: AnyTile | null;
}

interface Mouse {
	down: boolean;
}

export class GameEditor {
	map: GameMap;
	#canvas: Canvas | null = null;
	#topCanvas: Canvas | null = null;
	static tileSize: number = 16;
	static zoom: number = 2;
	overlayTiles: number[] = [];
	options: Options = $state({
		activeTab: 'Tiles',
		activeTile: null,
		activeColor: 0,
		backgroundTile: null,
		selectedTile: null
	});
	mouse: Mouse = $state({
		down: false
	});

	constructor(mapBuffer: string, overlayTiles: number[]) {
		this.map = GameMap.readMap(Buffer.from(mapBuffer, 'base64'));
		this.overlayTiles = overlayTiles;
		this.map.setEditor(true);
		this.options.backgroundTile = this.map.backgroundTile;
	}
	setRefs(canvas: HTMLCanvasElement, topCanvas: HTMLCanvasElement) {
		this.#canvas = new Canvas(canvas);
		this.#topCanvas = new Canvas(topCanvas);
		this.#canvas.canvas.width = this.map.width * GameEditor.getAdjustedTileSize();
		this.#canvas.canvas.height = this.map.height * GameEditor.getAdjustedTileSize();
		this.#topCanvas.canvas.width = this.map.width * GameEditor.getAdjustedTileSize();
		this.#topCanvas.canvas.height = this.map.height * GameEditor.getAdjustedTileSize();
	}
	tick() {
		if (!this.map) {
			throw new Error('Map is undefined.');
		}
		if (!this.#canvas || !this.#topCanvas) {
			return;
		}
		this.#canvas.reset();
		this.#topCanvas.reset();
		this.map.tick({ lastFrameTime: 0 }, this.#canvas, 0, 0);
		this.map.drawTopLayer(this.#canvas, 0, 0);
	}
	static getAdjustedTileSize() {
		return this.tileSize * this.zoom;
	}
	get canvas() {
		if (!this.#canvas) {
			throw new Error('GameEditor has no canvas.');
		}
		return this.#canvas;
	}
	get topCanvas() {
		if (!this.#topCanvas) {
			throw new Error('GameEditor has no top canvas.');
		}
		return this.#topCanvas;
	}
}
