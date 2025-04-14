import { Canvas } from './Canvas';
import { Player } from './entities/Player';
import { GameMap, type Script } from './maps/GameMap';
import KeyHandler from './KeyHandler';
import { MapHandler } from './maps/MapHandler';
import { WarpType, type Direction } from '@prisma/client';
import { NPC } from './entities/NPC';
import GameEvent from './GameEvent';
import { TextRect } from './ui/TextRect';
import type { Warp } from './tiles/Warp';
import { adjustPositionForDirection } from '$lib/utils/adjustPositionForDirection';
import { Position, ScreenPosition } from './Position';
// these need to be included in the global state so scripts can use them
import { FadeInRect } from './ui/FadeInRect';
import SpriteBank from './SpriteBank';
import { Sprite } from './entities/Sprite';
import { FadeOutRect } from './ui/FadeOutRect';
import { sleep } from '$lib/utils/sleep';

export class Game {
	mapHandler: MapHandler;
	canvas: Canvas;
	player: Player;
	viewport = { width: 15, height: 11, pos: { x: 0, y: 0, xOffset: 0, yOffset: 0 } };
	static tileSize: number = 16;
	static zoom: number = 2;
	lastFrameTime: number = 0;
	canPlayerMove: boolean = true;

	constructor(canvas: Canvas, map: GameMap) {
		this.mapHandler = new MapHandler(map);
		this.canvas = canvas;
		this.player = new Player(10, 10, this, 'DOWN');
		this.canvas.canvas.width = this.viewport.width * Game.getAdjustedTileSize();
		this.canvas.canvas.height = this.viewport.height * Game.getAdjustedTileSize();
		this.mapHandler.active.entities.push(this.player);
		this.mapHandler.active.entities.push(
			new NPC('npc-fat', 14, 11, 'DOWN', this.mapHandler.active)
		);
	}
	async loadMapById(mapId: number, warpId: number, warpType: WarpType) {
		const map = await this.mapHandler.fetchMapById(mapId);

		const targetWarp: Warp = map.tiles
			.flat()
			.find((tile) => tile.isWarp() && tile.targetWarpId === warpId);

		if (!targetWarp) {
			throw new Error(`Couldn't find target warp.`);
		}

		const targetPosition =
			warpType === 'DOOR'
				? targetWarp
				: adjustPositionForDirection(
						new Position(targetWarp.x, targetWarp.y),
						targetWarp.activateDirection
					);
		this.mapHandler.handleWarpTo(map);
		this.player.coords.setCoords(targetPosition.x, targetPosition.y);

		GameEvent.dispatchEvent(new CustomEvent('rerender'));
		return targetWarp;
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
				new ScreenPosition(sub.x, this.mapHandler.active.height * Game.getAdjustedTileSize())
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
				new ScreenPosition(this.mapHandler.active.width * Game.getAdjustedTileSize(), sub.y)
			);
		}
		if (direction === 'RIGHT' && this.mapHandler.right) {
			this.mapHandler.setActive(this.mapHandler.right);
			this.mapHandler.setLeft(curr);
			this.mapHandler.right = null;
			this.mapHandler.reorient();
			this.player.coords.setCurrent(-1, current.y);
			this.player.coords.setTarget(new ScreenPosition(-1 * Game.getAdjustedTileSize(), sub.y));
		}
		if (direction === 'DOWN' && this.mapHandler.down) {
			this.mapHandler.setActive(this.mapHandler.down);
			this.mapHandler.setUp(curr);
			this.mapHandler.down = null;
			this.mapHandler.reorient();
			this.player.coords.setCurrent(current.x, 0);
			this.player.coords.setTarget(new ScreenPosition(sub.x, -1 * Game.getAdjustedTileSize()));
			this.player.coords.setSub(sub.x, -1 * Game.getAdjustedTileSize());
		}

		this.mapHandler.connect();
	}
	tick(currentFrameTime: number) {
		const sub = this.player.coords.getSub();

		this.canvas.reset();
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

		this.canvas.translate(this.viewport.pos.x, this.viewport.pos.y);

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

		const entities = this.mapHandler.active.entities.sort((a, b) =>
			a.priority !== b.priority
				? a.priority - b.priority
				: a.coords.getCurrent().y - b.coords.getCurrent().y
		);

		for (const entity of entities) {
			entity.tick(currentFrameTime, this.lastFrameTime, this.canvas);
		}

		if (this.mapHandler.up) {
			this.mapHandler.up.drawTopLayer(this.canvas);
		}
		if (this.mapHandler.left) {
			this.mapHandler.left.drawTopLayer(this.canvas);
		}
		this.mapHandler.active.drawTopLayer(this.canvas);
		if (this.mapHandler.right) {
			this.mapHandler.right.drawTopLayer(this.canvas);
		}
		if (this.mapHandler.down) {
			this.mapHandler.down.drawTopLayer(this.canvas);
		}

		KeyHandler.tick();

		this.lastFrameTime = currentFrameTime;

		this.canvas.context.save();

		// draw UI elements
		this.canvas.context.resetTransform();

		const elements = this.canvas.elements.getElements();

		for (let i = 0; i < elements.length; i++) {
			const element = elements[i];
			element.draw(0, 0, this);
		}

		this.canvas.context.restore();
	}
	drawMap(currentFrameTime: number, map: GameMap, runScripts?: boolean) {
		map.drawBaseLayer(this.canvas);
		map.tick(currentFrameTime, this.canvas);

		//if (runScripts) {
		//	map.tickScripts(this);
		//}
	}
	static getAdjustedTileSize() {
		return Game.tileSize * Game.zoom;
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
	async executeScript(script: Script) {
		if (script.name === 'test') {
			const active = this.activeMap;
			const mom = new NPC('mom', 9, 8, 'UP', active, true);
			this.player.coords.setCoords(8, 8);
			active.entities.push(mom);
			active.entities.push(new NPC('vigoroth', 4, 5, 'UP', active, true).setPath(['UP']));
			active.entities.push(
				new NPC('vigoroth', 1, 3, 'RIGHT', active, true).setPath([
					'RIGHT',
					'RIGHT',
					'RIGHT',
					'LEFT',
					'LEFT',
					'LEFT'
				])
			);
			active.entities.push(new Sprite(5, 4, 'misc', 'box-open', active));
			active.entities.push(new Sprite(5, 2, 'misc', 'box-closed', active));

			await this.showMessageBox("MOM: See, A?/Isn't it nice in here, too?");
			mom.direction = 'LEFT';
			this.player.direction = 'RIGHT';
			await this.showMessageBox(
				"The mover's POKéMON do all the work/of moving us in and cleaning up after."
			);
			await this.showMessageBox('This is so conveinient!');
			await this.showMessageBox('A, your room is upstairs./Go check it out dear!');
			await this.showMessageBox('DAD bought you a new clock to mark/our move here.');
			await this.showMessageBox("Don't forget to set it!");
			this.player.walk('UP');
			mom.direction = 'UP';
		} else {
			eval(`(async () => { ${script.script} })()`);
		}
	}
	async showMessageBox(text: string) {
		this.canvas.elements.addElement(new TextRect(text, this.lastFrameTime));
		await GameEvent.waitForOnce('continueText');
	}
	get activeMap() {
		return this.mapHandler.active;
	}
}
