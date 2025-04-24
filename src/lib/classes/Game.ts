/* eslint-disable @typescript-eslint/no-unused-vars */

import { Canvas } from './Canvas';
import { Player } from './entities/Player';
import { GameMap, type Script } from './maps/GameMap';
import KeyHandler from './KeyHandler';
import { MapHandler } from './maps/MapHandler';
import { Direction, WarpType } from '@prisma/client';
import GameEvent from './GameEvent';
import { TextRect } from './ui/TextRect';
import { adjustPositionForDirection } from '$lib/utils/adjustPositionForDirection';
// these need to be included in the global state so scripts can use them
import { FadeInRect } from './ui/FadeInRect';
import SpriteBank from './SpriteBank';
import { Sprite } from './entities/Sprite';
import { FadeOutRect } from './ui/FadeOutRect';
import { sleep } from '$lib/utils/sleep';
import FlagSet from './FlagSet';
import { NPC } from './entities/NPC';
import type { Warp } from './tiles/Warp';
import type { ComponentTypes } from '$lib/interfaces/components/ComponentTypes';
import { renderSystem } from './systems/renderSystem';
import { mapRenderSystem } from './systems/mapRenderSystem';
import type { MapNames } from '$lib/interfaces/MapNames';
import type { TileInfo } from '$lib/interfaces/TileInfo';
import type { MapInfo } from '$lib/utils/readMap';
import { viewportSystem } from './systems/viewportSystem';
import { movementSystem } from './systems/movementSystem';
import { inputSystem } from './systems/inputSystem';

export interface Viewport {
	width: number;
	height: number;
	pos: {
		x: number;
		y: number;
		xOffset: number;
		yOffset: number;
	};
}

export class Game {
	activeMapId: number;
	canvas: Canvas;
	viewport: Viewport = { width: 15, height: 11, pos: { x: 0, y: 0, xOffset: 0, yOffset: 0 } };
	static tileSize: number = 16;
	static zoom: number = 2;
	lastFrameTime: number = 0;
	frozen: boolean = false;
	private entities: Set<number> = new Set();
	private components: { [key: string]: Map<number, any> } = {};
	private idCount = 1;

	constructor(canvas: Canvas, mapInfo: MapInfo) {
		this.canvas = canvas;
		this.canvas.canvas.width = this.viewport.width * Game.getAdjustedTileSize();
		this.canvas.canvas.height = this.viewport.height * Game.getAdjustedTileSize();
		//this.mapHandler.active.entities.addEntity(this.player);
		this.tickScripts();
		this.init(mapInfo);
	}

	init(mapInfo: MapInfo) {
		this.createPlayer();
		this.createMap(mapInfo);
	}
	createPlayer() {
		const playerId = this.createEntity();
		const image = SpriteBank.getSprite('player', 'down1');

		this.addComponent(playerId, 'Position', { x: 10, y: 10 });
		this.addComponent(playerId, 'SubPosition', {
			x: 10 * Game.getAdjustedTileSize(),
			y: 10 * Game.getAdjustedTileSize()
		});
		this.addComponent(playerId, 'Direction', Direction.DOWN);
		this.addComponent(playerId, 'Movement', {
			moving: false,
			jumping: false,
			counter: 0,
			walkFrame: 1
		});
		this.addComponent(playerId, 'Sprite', {
			bankId: 'player',
			sprites: SpriteBank.getSprites('player')
		});
		this.addComponent(playerId, 'Offset', { x: image.width - 15, y: image.height - 21 });
		this.addComponent(playerId, 'Speed', Game.getAdjustedTileSize() * 3);
		this.addComponent(playerId, 'Player', {});
		this.addComponent(playerId, 'Controllable', {});
	}
	createTiles(tiles: TileInfo[][]) {
		const tileEntities: number[][] = [];
		for (let y = 0; y < tiles.length; y++) {
			const row = [];
			for (let x = 0; x < tiles[0].length; x++) {
				const tile = tiles[y][x];
				const tileId = this.createEntity();
				this.addComponent(tileId, 'Position', { x, y });
				this.addComponent(tileId, 'TileSprite', { sprite: SpriteBank.getTile(tile.id) });
				if ((tile.properties >> 2) & 0b11111) {
					this.addComponent(tileId, 'Solid', {});
				}

				/*this.overlay = Boolean((properties >> 7) & 0b1);
				this.permissions = (properties >> 2) & 0b11111;
				this.tileSprites = SpriteBank.getTile(this.id);
				this.jumpable = (properties & 0b11) === 0 ? null : directions[properties & 0b11];*/
				row.push(tileId);
			}
			tileEntities.push(row);
		}
		return tileEntities;
	}
	createMap(mapInfo: MapInfo) {
		const tiles = this.createTiles(mapInfo.tiles);

		const mapId = this.createEntity();

		this.addComponent(mapId, 'MapInfo', {
			id: mapInfo.id,
			name: mapInfo.name,
			width: mapInfo.width,
			height: mapInfo.height
		});
		this.addComponent(mapId, 'Tiles', tiles);
		this.addComponent(mapId, 'Background', SpriteBank.getTile(mapInfo.backgroundId).images[0]);
		this.addComponent(mapId, 'Connections', {});

		this.activeMapId = mapId;
	}
	createEntity() {
		const id = this.idCount;
		this.idCount++;
		this.entities.add(id);
		return id;
	}
	addComponent<K extends keyof ComponentTypes>(
		entityId: number,
		componentName: K,
		component: ComponentTypes[K]
	) {
		if (!this.components[componentName]) {
			this.components[componentName] = new Map();
		}
		(this.components[componentName] as Map<number, ComponentTypes[K]>).set(entityId, component);
	}
	setComponent<K extends keyof ComponentTypes>(
		entityId: number,
		componentName: K,
		component: ComponentTypes[K]
	) {
		this.addComponent(entityId, componentName, component);
	}
	hasComponent<K extends keyof ComponentTypes>(entityId: number, componentName: K): boolean {
		const componentMap = this.components[componentName] as
			| Map<number, ComponentTypes[K]>
			| undefined;
		return componentMap?.has(entityId) ?? false;
	}
	getComponent<K extends keyof ComponentTypes>(
		entityId: number,
		componentName: K
	): ComponentTypes[K] | undefined {
		return (this.components[componentName] as Map<number, ComponentTypes[K]>)?.get(entityId);
	}
	removeComponent(entityId: number, componentName: string) {
		this.components[componentName]?.delete(entityId);
	}
	entitiesWith(componentNames: string[]): number[] {
		return Array.from(this.entities).filter((id) =>
			componentNames.every((componentName) => this.components[componentName]?.has(id))
		);
	}
	async tickScripts() {
		GameEvent.attach('flagSet', () => {
			for (const script of this.activeMap.scripts) {
				this.executeScript(script, 'setup');
				this.executeScript(script, 'script');
			}
		});
	}
	/*async loadMapById(mapId: number, warpId: number, warpType: WarpType) {
		const map = await this.mapHandler.fetchMapById(mapId);

		const targetWarp = map.tiles
			.flat()
			.find((tile) => tile.isWarp() && tile.targetWarpId === warpId) as Warp;

		if (!targetWarp) {
			throw new Error(`Couldn't find target warp.`);
		}

		const targetPosition =
			warpType === 'DOOR'
				? targetWarp.position
				: adjustPositionForDirection(
						new GridPosition(targetWarp.position.x, targetWarp.position.y),
						targetWarp.activateDirection
					);

		this.mapHandler.handleWarpTo(map);
		this.player.coords.setCoords(targetPosition.x, targetPosition.y);

		GameEvent.dispatchEvent(new CustomEvent('rerender'));

		for (const script of this.activeMap.scripts) {
			this.executeScript(script, 'setup');
		}

		return targetWarp;
	}*/
	/*changeMap(direction: Direction) {
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
	}*/
	tick(currentFrameTime: number) {
		this.canvas.reset();

		this.updateSystems(currentFrameTime);

		this.lastFrameTime = currentFrameTime;
		/*const sub = this.player.coords.getSub();

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

		const entities = this.mapHandler.active.entities
			.getEntities()
			.sort((a, b) =>
				a.priority !== b.priority
					? a.priority - b.priority
					: a.coords.getCurrent().y - b.coords.getCurrent().y
			);

		if (!this.frozen) {
			for (const entity of entities) {
				entity.tick(currentFrameTime, this.lastFrameTime, this.canvas);
			}
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

		this.canvas.context.restore();*/
	}
	updateSystems(currentFrameTime: number) {
		const deltaTime = (currentFrameTime - this.lastFrameTime) / 1000;

		viewportSystem(this, this.canvas, this.viewport);
		mapRenderSystem(this, this.canvas);
		renderSystem(this, this.canvas);
		inputSystem(this);
		movementSystem(this, deltaTime);
	}
	drawMap(currentFrameTime: number, map: GameMap, runScripts?: boolean) {
		map.drawBaseLayer(this.canvas);
		map.tick(currentFrameTime, this.canvas);
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
		this.frozen = true;
	}
	unblockMovement() {
		this.frozen = false;
	}
	async executeScript(script: Script, type: 'setup' | 'script') {
		const cond = eval(script.condition);
		if (cond || cond === undefined) {
			if (type === 'setup') {
				this.blockMovement();
				eval(`(async () => { ${script.setup} })()`);
			} else {
				this.blockMovement();
				const val = await eval(`(async () => { ${script.script} })()`);
				this.unblockMovement();
				if (val === 1) {
					GameEvent.dispatchEvent(new CustomEvent('flagSet'));
				}
			}
		}
	}
	async showMessageBox(text: string[]) {
		const rect = new TextRect(text, this.lastFrameTime);
		this.canvas.elements.addElement(rect);
		const res = await GameEvent.waitForOnce('continueText');
		if (res.detail.scroll) {
			while (true) {
				rect.scroll();
				const done = await GameEvent.waitForOnce('textScrolled');
				if (done) {
					break;
				}
			}
			await GameEvent.waitForOnce('continueText');
		}
		this.canvas.elements.removeElement(rect.id);
	}
	get activeMap() {
		return this.mapHandler.active;
	}
}
