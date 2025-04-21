import { Canvas } from './Canvas';
import { Buffer } from 'buffer';
import { EditorGameMap } from './maps/EditorGameMap.svelte';
import { Game } from './Game';
import type { Tile } from './tiles/Tile';

export type Tabs = 'Tiles' | 'Permissions' | 'Events' | 'Entities';

interface Options {
	activeTab: Tabs;
	activeTile: Tile | null;
	activeColor: number;
	backgroundTile: Tile | null;
	selectedTile: Tile | null;
	selectedEventIndex: number;
}

interface Mouse {
	down: boolean;
}

export class GameEditor {
	map: EditorGameMap;
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
		selectedTile: null,
		selectedEventIndex: 0
	});
	mouse: Mouse = $state({
		down: false
	});

	constructor(mapBuffer: string, overlayTiles: number[]) {
		this.map = EditorGameMap.readMap(Buffer.from(mapBuffer, 'base64'));
		this.overlayTiles = overlayTiles;
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
		this.map.tick(this.#canvas, 0, 0);
		this.map.drawTopLayer(this.#canvas, 0, 0);

		const position = this.options.selectedTile?.position;
		if (!position) {
			return;
		}

		const { x, y } = position;

		if (
			(this.options.activeTab === 'Events' || this.options.activeTab === 'Entities') &&
			this.options.selectedTile
		) {
			this.#canvas.drawBorder(x, y, {
				color: 'blue'
			});
		}

		if (this.options.activeTab === 'Events') {
			for (const event of this.map.events) {
				const measurement = this.#canvas.context.measureText('W');
				if (event.kind === 'warp') {
					this.#canvas.drawOverlay(event.x, event.y, { color: 'purple', opacity: 0.6 });
					this.#canvas.drawText(
						'W',
						event.x * Game.getAdjustedTileSize() + measurement.width / 2,
						event.y * Game.getAdjustedTileSize() - 12,
						{ size: 30 }
					);
				}
			}
		}
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
