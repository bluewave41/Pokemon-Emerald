import { Canvas } from './Canvas';
import { GameMap } from './maps/GameMap';
import SpriteBank from './SpriteBank';
import { Buffer } from 'buffer';

export class GameEditor {
	map: GameMap;
	#canvas: Canvas | null = null;
	#topCanvas: Canvas | null = null;
	static tileSize: number = 16;
	static zoom: number = 2;
	overlayTiles: number[] = [];

	constructor(mapBuffer: string, overlayTiles: number[]) {
		this.map = GameMap.readMap(Buffer.from(mapBuffer, 'base64'));
		this.overlayTiles = overlayTiles;
		this.map.setEditor(true);
	}
	setRefs(canvas: HTMLCanvasElement, topCanvas: HTMLCanvasElement) {
		this.#canvas = new Canvas(canvas);
		this.#topCanvas = new Canvas(topCanvas);
		this.#canvas.canvas.width = this.map.width * GameEditor.getAdjustedTileSize();
		this.#canvas.canvas.height = this.map.height * GameEditor.getAdjustedTileSize();
		this.#topCanvas.canvas.width = this.map.width * GameEditor.getAdjustedTileSize();
		this.#topCanvas.canvas.height = this.map.height * GameEditor.getAdjustedTileSize();
	}
	async init() {
		await SpriteBank.readMap(this.map.name, this.map.area, this.map.images);
	}
	tick() {
		if (!this.#canvas || !this.#topCanvas) {
			return;
		}
		this.#canvas.reset();
		this.#topCanvas.reset();
		this.map.tick(this.#canvas);
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
