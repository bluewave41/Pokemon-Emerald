import { Canvas } from './Canvas';
import { Player } from './entities/Player';
import { GameMap } from './maps/GameMap';
import KeyHandler from './KeyHandler';
import { MapHandler } from './maps/MapHandler';
import type { Direction } from '$lib/interfaces/Direction';

export interface MessageBox {
	text: string;
	startFrame: number;
}

export class Game {
	mapHandler: MapHandler;
	#canvas: Canvas;
	player: Player;
	viewport = { width: 15, height: 11, pos: { x: 0, y: 0, xOffset: 0, yOffset: 0 } };
	static tileSize: number = 16;
	static zoom: number = 2;
	lastFrameTime: number = 0;
	activeTextBox: MessageBox | null = null;
	canPlayerMove: boolean = true;

	constructor(canvas: HTMLCanvasElement, map: GameMap) {
		this.mapHandler = new MapHandler(map);
		this.#canvas = new Canvas(canvas);
		this.player = new Player(10, 10, 'down');
		this.#canvas.canvas.width = this.viewport.width * Game.getAdjustedTileSize();
		this.#canvas.canvas.height = this.viewport.height * Game.getAdjustedTileSize();
	}
	changeMap(direction: Direction) {
		console.log(direction);
	}
	tick(currentFrameTime: number) {
		this.#canvas.reset();

		this.viewport.pos = {
			x: -(this.player.subPosition.x / Game.getAdjustedTileSize() - this.viewport.width / 2),
			y: -(
				this.player.subPosition.y / Game.getAdjustedTileSize() -
				this.viewport.height / 2 +
				(this.mapHandler.up?.height ?? 0)
			),
			xOffset: (this.mapHandler.left?.width ?? 0) * Game.getAdjustedTileSize(),
			yOffset: (this.mapHandler.up?.height ?? 0) * Game.getAdjustedTileSize()
		};

		this.#canvas.translate(this.viewport.pos.x, this.viewport.pos.y);

		let x = 0;
		let y = 0;

		if (this.mapHandler.up) {
			x = this.mapHandler.left ?? 0;
			this.drawMap(this.mapHandler.up, x, y);
		}
		y = this.mapHandler.up?.height ?? 0;
		this.drawMap(this.mapHandler.active, x, y);
		this.player.tick(this, currentFrameTime);

		KeyHandler.tick();

		this.lastFrameTime = currentFrameTime;

		if (this.activeTextBox !== null) {
			this.#canvas.showMessageBox(this.activeTextBox, currentFrameTime);
		}

		this.canPlayerMove = this.activeTextBox === null;
	}
	drawMap(map: GameMap, x: number, y: number) {
		//this.#canvas.translate(x * Game.getAdjustedTileSize(), y * Game.getAdjustedTileSize());
		map.drawBaseLayer(this.#canvas, x, y);
		map.tick(this, this.#canvas, x, y);
		map.drawTopLayer(this.#canvas, x, y);
	}
	static getAdjustedTileSize() {
		return Game.tileSize * Game.zoom;
	}
	get canvas() {
		if (!this.#canvas) {
			throw new Error('Game has no canvas.');
		}
		return this.#canvas;
	}
}
