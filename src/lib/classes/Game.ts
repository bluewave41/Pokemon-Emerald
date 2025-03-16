import { Canvas } from './Canvas';
import { Player } from './entities/Player';
import { GameMap } from './maps/GameMap';
import KeyHandler from './KeyHandler';
import { MapHandler } from './maps/MapHandler';

export interface MessageBox {
	text: string;
	startFrame: number;
}

export class Game {
	mapHandler: MapHandler;
	#canvas: Canvas;
	player: Player;
	viewport = { width: 15, height: 11, pos: { x: 0, y: 0 } };
	static tileSize: number = 16;
	static zoom: number = 2;
	lastFrameTime: number = 0;
	activeTextBox: MessageBox | null = null;
	canPlayerMove: boolean = true;

	constructor(canvas: HTMLCanvasElement, map: GameMap) {
		this.mapHandler = new MapHandler(map);
		this.#canvas = new Canvas(canvas);
		this.player = new Player(10, 10, 'down', () => null);
		this.#canvas.canvas.width = this.viewport.width * Game.getAdjustedTileSize();
		this.#canvas.canvas.height = this.viewport.height * Game.getAdjustedTileSize();
	}
	tick(currentFrameTime: number) {
		this.#canvas.reset();

		this.viewport.pos = {
			x: -(this.player.subPosition.x / Game.getAdjustedTileSize() - this.viewport.width / 2),
			y: -(this.player.subPosition.y / Game.getAdjustedTileSize() - this.viewport.height / 2)
		};

		this.#canvas.translate(this.viewport.pos.x, this.viewport.pos.y);

		// draw base layer
		this.mapHandler.active.drawBaseLayer(this.#canvas);
		// draw map elements so the player hides behind the,
		this.mapHandler.active.tick(this, this.#canvas);
		// draw player
		this.player.tick(this, currentFrameTime);
		// draw the overlaid tles
		this.mapHandler.active.drawTopLayer(this.#canvas);

		KeyHandler.tick();

		this.lastFrameTime = currentFrameTime;

		this.#canvas.translate(-this.viewport.pos.x, -this.viewport.pos.y);

		if (this.activeTextBox !== null) {
			this.#canvas.showMessageBox(this.activeTextBox, currentFrameTime);
		}

		this.canPlayerMove = this.activeTextBox === null;
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
