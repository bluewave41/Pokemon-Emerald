import { Canvas } from './Canvas';
import { GameMap } from './GameMap';
import SpriteBank from './SpriteBank';
import { Buffer } from 'buffer';

export class Game {
	map: GameMap;
	canvas: Canvas;
	topCanvas: Canvas;
	static tileSize: number = 16;
	static zoom: number = 2;

	constructor(mapBuffer: string, canvas: HTMLCanvasElement, topCanvas: HTMLCanvasElement) {
		this.map = GameMap.readMap(Buffer.from(mapBuffer, 'base64'));
		this.canvas = new Canvas(canvas);
		this.topCanvas = new Canvas(topCanvas);
		this.canvas.canvas.width = this.map.width * Game.getAdjustedTileSize();
		this.canvas.canvas.height = this.map.height * Game.getAdjustedTileSize();
		this.topCanvas.canvas.width = this.map.width * Game.getAdjustedTileSize();
		this.topCanvas.canvas.height = this.map.height * Game.getAdjustedTileSize();
	}
	async init() {
		await SpriteBank.readMap(this.map.name, this.map.area, this.map.images);
	}
	tick() {
		this.canvas.reset();
		this.topCanvas.reset();
		this.map.tick(this.canvas);
	}
	static getAdjustedTileSize() {
		return Game.tileSize * Game.zoom;
	}
}
