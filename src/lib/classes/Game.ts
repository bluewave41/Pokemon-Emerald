import axios from 'axios';
import { Canvas } from './Canvas';
import { Player } from './entities/Player';
import { GameMap } from './GameMap';
import SpriteBank from './SpriteBank';
import { Buffer } from 'buffer';
import KeyHandler from './KeyHandler';

export class Game {
	map: GameMap;
	canvas: Canvas;
	player: Player;
	viewport = { width: 15, height: 11 };
	static tileSize: number = 16;
	static zoom: number = 2;
	lastFrameTime: number = 0;

	constructor(mapBuffer: string, canvas: HTMLCanvasElement) {
		this.map = GameMap.readMap(Buffer.from(mapBuffer, 'base64'));
		this.canvas = new Canvas(canvas);
		this.player = new Player(10, 10, 'down');
		this.canvas.canvas.width = this.viewport.width * Game.getAdjustedTileSize();
		this.canvas.canvas.height = this.viewport.height * Game.getAdjustedTileSize();
	}
	async init() {
		await SpriteBank.readMap(this.map.name, this.map.area, this.map.images);
		const playerBank = (await axios.get('sprites?bank=player')).data;
		await SpriteBank.readBank('player', playerBank);
	}
	tick(currentFrameTime: number) {
		this.canvas.reset();
		this.canvas.translate(
			-(this.player.subPosition.x / Game.getAdjustedTileSize() - this.viewport.width / 2),
			-(this.player.subPosition.y / Game.getAdjustedTileSize() - this.viewport.height / 2)
		);

		// draw base layer
		this.map.drawBaseLayer(this.canvas);
		// draw player on top
		this.player.tick(this, currentFrameTime);
		// draw map elements so the player hides behind the,
		this.map.tick(this.canvas);
		KeyHandler.tick();

		this.lastFrameTime = currentFrameTime;
	}
	static getAdjustedTileSize() {
		return Game.tileSize * Game.zoom;
	}
}
