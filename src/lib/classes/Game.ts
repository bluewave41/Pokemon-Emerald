import { Canvas } from './Canvas';
import { Player } from './entities/Player';
import { GameMap } from './maps/GameMap';
import KeyHandler from './KeyHandler';
import { MapHandler } from './maps/MapHandler';
import type { Direction } from '@prisma/client';

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
		this.player = new Player(10, 10, this, 'DOWN');
		this.#canvas.canvas.width = this.viewport.width * Game.getAdjustedTileSize();
		this.#canvas.canvas.height = this.viewport.height * Game.getAdjustedTileSize();
	}
	changeMap(direction: Direction) {
		const curr = this.mapHandler.active;
		if (direction === 'UP' && this.mapHandler.up) {
			this.mapHandler.setActive(this.mapHandler.up);
			this.mapHandler.setDown(curr);
			this.mapHandler.up = null;
			this.player.setPosition(this.player.position.x, this.mapHandler.active.height - 1);
			this.player.targetPosition = {
				x: this.player.subPosition.x,
				y: this.player.subPosition.y + Game.getAdjustedTileSize()
			};
			this.player.subPosition = {
				x: this.player.subPosition.x,
				y: this.player.subPosition.y + Game.getAdjustedTileSize()
			};
		}
		if (direction === 'LEFT' && this.mapHandler.left) {
			this.mapHandler.setActive(this.mapHandler.left);
			this.mapHandler.setRight(curr);
			this.mapHandler.left = null;
			this.player.position = { x: this.mapHandler.active.width, y: this.player.position.y };
			this.player.targetPosition = {
				x: this.mapHandler.active.width * Game.getAdjustedTileSize(),
				y: this.player.subPosition.y
			};
		}
		if (direction === 'RIGHT' && this.mapHandler.right) {
			this.mapHandler.setActive(this.mapHandler.right);
			this.mapHandler.setLeft(curr);
			this.mapHandler.right = null;
			this.player.position = { x: -1, y: this.player.position.y };
			this.player.targetPosition = {
				x: -1 * Game.getAdjustedTileSize(),
				y: this.player.subPosition.y
			};
		}
		if (direction === 'DOWN' && this.mapHandler.down) {
			this.mapHandler.setActive(this.mapHandler.down);
			this.mapHandler.setUp(curr);
			this.mapHandler.down = null;
			this.player.setPosition(this.player.position.x, 0);
			this.player.targetPosition = {
				x: this.player.subPosition.x,
				y: this.player.subPosition.y - Game.getAdjustedTileSize()
			};
			this.player.subPosition = {
				x: this.player.subPosition.x,
				y: this.player.subPosition.y - Game.getAdjustedTileSize()
			};
		}

		this.mapHandler.connect();
	}
	tick(currentFrameTime: number) {
		this.#canvas.reset();
		this.viewport.pos = {
			x: -(
				this.player.subPosition.x / Game.getAdjustedTileSize() -
				this.viewport.width / 2 +
				(this.mapHandler?.left?.width ?? 0)
			),
			y: -(
				this.player.subPosition.y / Game.getAdjustedTileSize() -
				this.viewport.height / 2 +
				(this.mapHandler.up?.height ?? 0)
			),
			xOffset: (this.mapHandler.left?.width ?? 0) * Game.getAdjustedTileSize(),
			yOffset: (this.mapHandler.up?.height ?? 0) * Game.getAdjustedTileSize()
		};

		this.#canvas.translate(this.viewport.pos.x, this.viewport.pos.y);

		if (this.mapHandler.up) {
			this.drawMap(this.mapHandler.up, this.mapHandler.left?.width ?? 0, 0);
		}

		if (this.mapHandler.left) {
			this.drawMap(this.mapHandler.left, 0, this.mapHandler.up?.height ?? 0);
		}

		this.drawMap(
			this.mapHandler.active,
			this.mapHandler.left?.width ?? 0,
			this.mapHandler.up?.height ?? 0
		);

		if (this.mapHandler.right) {
			this.drawMap(
				this.mapHandler.right,
				(this.mapHandler.left?.width ?? 0) + this.mapHandler.active.width,
				this.mapHandler.up?.height ?? 0
			);
		}

		if (this.mapHandler.down) {
			this.drawMap(
				this.mapHandler.down,
				this.mapHandler.left?.width ?? 0,
				(this.mapHandler.up?.height ?? 0) + this.mapHandler.active.height
			);
		}

		this.player.tick(currentFrameTime);

		if (this.mapHandler.up) {
			this.mapHandler.up.drawTopLayer(this.#canvas, this.mapHandler.left?.width ?? 0, 0);
		}
		if (this.mapHandler.left) {
			this.mapHandler.left.drawTopLayer(this.#canvas, 0, this.mapHandler.up?.height ?? 0);
		}
		this.mapHandler.active.drawTopLayer(
			this.#canvas,
			this.mapHandler.left?.width ?? 0,
			this.mapHandler.up?.height ?? 0
		);
		if (this.mapHandler.right) {
			this.mapHandler.right.drawTopLayer(
				this.#canvas,
				(this.mapHandler.left?.width ?? 0) + this.mapHandler.active.width,
				this.mapHandler.up?.height ?? 0
			);
		}
		if (this.mapHandler.down) {
			this.mapHandler.down.drawTopLayer(
				this.#canvas,
				this.mapHandler.left?.width ?? 0,
				(this.mapHandler.up?.height ?? 0) + this.mapHandler.active.height
			);
		}

		KeyHandler.tick();

		this.lastFrameTime = currentFrameTime;

		if (this.activeTextBox !== null) {
			this.#canvas.showMessageBox(this.activeTextBox, currentFrameTime);
		}

		this.#canvas.context.save();

		// draw UI elements
		this.#canvas.context.resetTransform();

		const elements = this.#canvas.elements.getElements();

		for (let i = 0; i < elements.length; i++) {
			const element = elements[i];
			const retVal = element.draw(0, 0, this.#canvas);
			if (retVal === 1) {
				elements.splice(i, 1);
				i--;
			}
		}

		this.#canvas.context.restore();
	}
	drawMap(map: GameMap, x: number, y: number) {
		map.drawBaseLayer(this.#canvas, x, y);
		map.tick(this, this.#canvas, x, y);
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
	getActiveCoordinates() {
		return {
			x: this.mapHandler.left?.width ?? 0,
			y: this.mapHandler.up?.height ?? 0
		};
	}
	blockMovement() {
		this.player.moving = false;
		this.canPlayerMove = false;
	}
	unblockMovement() {
		this.canPlayerMove = true;
	}
}
