import axios from 'axios';
import { Canvas } from './Canvas';
import { Player } from './entities/Player';
import { GameMap } from './GameMap';
import SpriteBank from './SpriteBank';
import { Buffer } from 'buffer';

export class Game {
	map: GameMap;
	canvas: Canvas;
	topCanvas: Canvas;
	player: Player;
	viewport = { width: 15, height: 11 };
	static tileSize: number = 16;
	static zoom: number = 2;

	constructor(mapBuffer: string, canvas: HTMLCanvasElement, topCanvas: HTMLCanvasElement) {
		this.map = GameMap.readMap(Buffer.from(mapBuffer, 'base64'));
		this.canvas = new Canvas(canvas);
		this.topCanvas = new Canvas(topCanvas);
		this.player = new Player(10, 10, 'down');
		this.canvas.canvas.width = this.viewport.width * Game.getAdjustedTileSize();
		this.canvas.canvas.height = this.viewport.height * Game.getAdjustedTileSize();
		this.topCanvas.canvas.width = this.viewport.width * Game.getAdjustedTileSize();
		this.topCanvas.canvas.height = this.viewport.height * Game.getAdjustedTileSize();
	}
	async init() {
		const playerBank = (await axios.get('./sprites?bank=player')).data;
		await SpriteBank.readMap(this.map.name, this.map.area, this.map.images);
		await SpriteBank.readBank('player', playerBank);
	}
	tick() {
		this.canvas.reset();
		this.topCanvas.reset();
		this.canvas.translate(
			-(this.player.x - this.viewport.width / 2),
			-(this.player.y - this.viewport.height / 2)
		);
		this.map.tick(this.canvas);
		this.player.tick(this);
	}
	static getAdjustedTileSize() {
		return Game.tileSize * Game.zoom;
	}
}
