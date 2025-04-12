import { Canvas } from './Canvas';
import { Player } from './entities/Player';
import { GameMap } from './maps/GameMap';
import KeyHandler from './KeyHandler';
import { MapHandler } from './maps/MapHandler';
import type { Direction } from '@prisma/client';
import { NPC } from './entities/NPC';
import SpriteBank from './SpriteBank';

export class Game {
	mapHandler: MapHandler;
	#canvas: Canvas;
	player: Player;
	viewport = { width: 15, height: 11, pos: { x: 0, y: 0, xOffset: 0, yOffset: 0 } };
	static tileSize: number = 16;
	static zoom: number = 2;
	lastFrameTime: number = 0;
	canPlayerMove: boolean = true;

	constructor(canvas: Canvas, map: GameMap) {
		this.mapHandler = new MapHandler(map);
		this.#canvas = canvas;
		this.player = new Player(10, 10, this, 'DOWN');
		this.#canvas.canvas.width = this.viewport.width * Game.getAdjustedTileSize();
		this.#canvas.canvas.height = this.viewport.height * Game.getAdjustedTileSize();
		this.mapHandler.active.entities.push(this.player);
		this.mapHandler.active.entities.push(new NPC('npc-fat', 14, 11, this.mapHandler.active));
	}
	changeMap(direction: Direction) {
		const current = this.player.coords.getCurrent();
		const sub = this.player.coords.getSub();

		const curr = this.mapHandler.active;
		if (direction === 'UP' && this.mapHandler.up) {
			this.mapHandler.setActive(this.mapHandler.up);
			this.mapHandler.setDown(curr);
			this.mapHandler.up = null;
			this.mapHandler.reorient();
			this.player.coords.setCurrent(current.x, this.mapHandler.active.height - 1);
			this.player.coords.setTarget(
				sub.x,
				this.mapHandler.active.height * Game.getAdjustedTileSize()
			);
			this.player.coords.setSub(sub.x, this.mapHandler.active.height * Game.getAdjustedTileSize());
		}
		if (direction === 'LEFT' && this.mapHandler.left) {
			this.mapHandler.setActive(this.mapHandler.left);
			this.mapHandler.setRight(curr);
			this.mapHandler.left = null;
			this.mapHandler.reorient();
			this.player.coords.setCurrent(this.mapHandler.active.width, current.y);
			this.player.coords.setTarget(
				this.mapHandler.active.width * Game.getAdjustedTileSize(),
				sub.y
			);
		}
		if (direction === 'RIGHT' && this.mapHandler.right) {
			this.mapHandler.setActive(this.mapHandler.right);
			this.mapHandler.setLeft(curr);
			this.mapHandler.right = null;
			this.mapHandler.reorient();
			this.player.coords.setCurrent(-1, current.y);
			this.player.coords.setTarget(-1 * Game.getAdjustedTileSize(), sub.y);
		}
		if (direction === 'DOWN' && this.mapHandler.down) {
			this.mapHandler.setActive(this.mapHandler.down);
			this.mapHandler.setUp(curr);
			this.mapHandler.down = null;
			this.mapHandler.reorient();
			this.player.coords.setCurrent(current.x, 0);
			this.player.coords.setTarget(sub.x, -1 * Game.getAdjustedTileSize());
			this.player.coords.setSub(sub.x, -1 * Game.getAdjustedTileSize());
		}

		this.mapHandler.connect();
	}
	tick(currentFrameTime: number) {
		const sub = this.player.coords.getSub();

		this.#canvas.reset();
		this.viewport.pos = {
			x: -(
				sub.x / Game.getAdjustedTileSize() -
				this.viewport.width / 2 +
				(this.mapHandler?.left?.width ?? 0)
			),
			y: -(
				sub.y / Game.getAdjustedTileSize() -
				this.viewport.height / 2 +
				(this.mapHandler.up?.height ?? 0)
			),
			xOffset: (this.mapHandler.left?.width ?? 0) * Game.getAdjustedTileSize(),
			yOffset: (this.mapHandler.up?.height ?? 0) * Game.getAdjustedTileSize()
		};

		this.#canvas.translate(this.viewport.pos.x, this.viewport.pos.y);

		if (this.mapHandler.up) {
			this.drawMap(currentFrameTime, this.mapHandler.up);
		}

		if (this.mapHandler.left) {
			this.drawMap(currentFrameTime, this.mapHandler.left);
		}

		// don't draw active entities so we can do z sorting
		this.drawMap(currentFrameTime, this.mapHandler.active, true);

		if (this.mapHandler.right) {
			this.drawMap(currentFrameTime, this.mapHandler.right);
		}

		if (this.mapHandler.down) {
			this.drawMap(currentFrameTime, this.mapHandler.down);
		}

		const entities = [...this.mapHandler.active.entities].sort(
			(a, b) => a.coords.getCurrent().y - b.coords.getCurrent().y
		);

		for (const entity of entities) {
			entity.tick(currentFrameTime, this.canvas);
		}

		if (this.mapHandler.up) {
			this.mapHandler.up.drawTopLayer(this.#canvas);
		}
		if (this.mapHandler.left) {
			this.mapHandler.left.drawTopLayer(this.#canvas);
		}
		this.mapHandler.active.drawTopLayer(this.#canvas);
		if (this.mapHandler.right) {
			this.mapHandler.right.drawTopLayer(this.#canvas);
		}
		if (this.mapHandler.down) {
			this.mapHandler.down.drawTopLayer(this.#canvas);
		}

		KeyHandler.tick();

		this.lastFrameTime = currentFrameTime;

		this.#canvas.context.save();

		// draw UI elements
		this.#canvas.context.resetTransform();

		const elements = this.#canvas.elements.getElements();

		for (let i = 0; i < elements.length; i++) {
			const element = elements[i];
			const retVal = element.draw(0, 0, this);
			if (retVal === 1) {
				elements.splice(i, 1);
				i--;
			}
		}

		this.#canvas.context.restore();
	}
	drawMap(currentFrameTime: number, map: GameMap, runScripts?: boolean) {
		map.drawBaseLayer(this.#canvas);
		map.tick(currentFrameTime, this.#canvas);

		if (runScripts) {
			map.tickScripts(this);
		}
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
	executeScript(script: string) {
		return eval(script);
	}
}
