import axios from 'axios';
import { Canvas } from './Canvas';
import { Player } from './entities/Player';
import { GameMap } from './maps/GameMap';
import SpriteBank from './SpriteBank';
import { Buffer } from 'buffer';
import KeyHandler from './KeyHandler';
import { MapHandler } from './maps/MapHandler';

export class Game {
	mapHandler: MapHandler;
	canvas: Canvas;
	player: Player;
	viewport = { width: 15, height: 11, pos: { x: 0, y: 0 } };
	static tileSize: number = 16;
	static zoom: number = 2;
	lastFrameTime: number = 0;
	activeTextBox: string | null = null;
	canPlayerMove: boolean = true;

	constructor(mapBuffer: string, canvas: HTMLCanvasElement) {
		this.mapHandler = new MapHandler(GameMap.readMap(Buffer.from(mapBuffer, 'base64')));
		this.canvas = new Canvas(canvas);
		this.player = new Player(10, 10, 'down');
		this.canvas.canvas.width = this.viewport.width * Game.getAdjustedTileSize();
		this.canvas.canvas.height = this.viewport.height * Game.getAdjustedTileSize();
	}
	async init() {
		await SpriteBank.readMap(
			this.mapHandler.active.name,
			this.mapHandler.active.area,
			this.mapHandler.active.images
		);
		const playerBank = (await axios.get('sprites?bank=player')).data;
		await SpriteBank.readBank('player', playerBank);
	}
	tick(currentFrameTime: number) {
		this.canvas.reset();

		this.viewport.pos = {
			x: -(this.player.subPosition.x / Game.getAdjustedTileSize() - this.viewport.width / 2),
			y: -(this.player.subPosition.y / Game.getAdjustedTileSize() - this.viewport.height / 2)
		};

		this.canvas.translate(this.viewport.pos.x, this.viewport.pos.y);

		// draw base layer
		this.mapHandler.active.drawBaseLayer(this.canvas);
		// draw player on top
		this.player.tick(this, currentFrameTime);
		// draw map elements so the player hides behind the,
		this.mapHandler.active.tick(this.canvas);
		KeyHandler.tick();

		this.lastFrameTime = currentFrameTime;

		this.canvas.translate(-this.viewport.pos.x, -this.viewport.pos.y);

		if (this.activeTextBox !== null) {
			this.canvas.showMessageBox(this.activeTextBox);
		}

		this.canPlayerMove = this.activeTextBox === null;
	}
	static getAdjustedTileSize() {
		return Game.tileSize * Game.zoom;
	}
}
