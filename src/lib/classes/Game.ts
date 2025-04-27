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
import { GameMapResources, type MapNames } from '$lib/interfaces/MapNames';
import type { TileInfo } from '$lib/interfaces/TileInfo';
import { readMap, type MapInfo } from '$lib/utils/readMap';
import { viewportSystem } from './systems/viewportSystem';
import { movementSystem } from './systems/movementSystem';
import { inputSystem } from './systems/inputSystem';
import { mapOverlaySysyem } from './systems/mapOverlaySystem';
import { mapSystem } from './systems/mapSystem';
import axios from 'axios';
import { Buffer } from 'buffer';
import { mapTransitionSystem } from './systems/mapTransitionSystem';
import { animationSystem } from './systems/animationSystem';

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

export type EntityWith<K extends keyof ComponentTypes> = {
	id: number;
	components: { [P in K]: ComponentTypes[P] };
};

export class Game {
	activeMapId: number;
	loadedMaps = new Set<MapNames>();
	canvas: Canvas;
	viewport: Viewport = { width: 15, height: 11, pos: { x: 0, y: 0, xOffset: 0, yOffset: 0 } };
	static tileSize: number = 16;
	static zoom: number = 2;
	lastFrameTime: number = 0;
	frozen: boolean = false;
	private entities: Map<number, Set<keyof ComponentTypes>> = new Map();
	private components: { [K in keyof ComponentTypes]?: Map<number, ComponentTypes[K]> } = {};
	private idCount = 1;
	transitionInProgress: boolean = false;

	constructor(canvas: Canvas, mapInfo: MapInfo) {
		this.canvas = canvas;
		this.canvas.canvas.width = this.viewport.width * Game.getAdjustedTileSize();
		this.canvas.canvas.height = this.viewport.height * Game.getAdjustedTileSize();
		//this.mapHandler.active.entities.addEntity(this.player);
		this.tickScripts();
		this.init(mapInfo);

		this.loadedMaps.add('littleroot');
	}

	init(mapInfo: MapInfo) {
		this.createPlayer();
		this.createMap(mapInfo);
	}
	hasMapLoaded(name: MapNames) {
		return this.loadedMaps.has(name);
	}
	updateMapPositions() {
		const positions = {
			UP: {
				x: getMapFromDirection(mapInfo, 'LEFT')?.width ?? 0,
				y: 0
			},
			DOWN: {
				x: getMapFromDirection(mapInfo, 'LEFT')?.width ?? 0,
				y: getMapFromDirection(mapInfo, 'UP')?.height ?? 0 + activeMap?.height
			},
			ACTIVE: {
				x: getMapFromDirection(mapInfo, 'LEFT')?.width ?? 0,
				y: getMapFromDirection(mapInfo, 'UP')?.height ?? 0
			}
		};
	}
	getMapIdByName(name: MapNames) {
		for (const [id, mapInfo] of this.components['MapInfo']) {
			if ((mapInfo as { name: MapNames }).name === name) {
				return id;
			}
		}
		return null;
	}
	getMapInfoByName(name: MapNames) {
		const mapId = this.getMapIdByName(name);
		if (!mapId) {
			return null;
		}

		return this.getComponent(mapId, 'MapInfo');
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

				const sprites = SpriteBank.getTile(tile.id);

				this.addComponent(tileId, 'Position', { x, y });
				this.addComponent(tileId, 'TileSprite', sprites.frames[0]);
				if ((tile.properties >> 2) & 0b11111) {
					this.addComponent(tileId, 'Solid', {});
				}
				if ((tile.properties >> 7) & 0b1) {
					this.addComponent(tileId, 'Overlay', {});
				}
				if (sprites.frames.length > 1) {
					this.addComponent(tileId, 'Animated', {
						...sprites,
						repeating: tile.repeatingAnimation,
						index: 0
					});
					this.addComponent(tileId, 'Timer', 0);
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
	createMap(mapInfo: MapInfo, direction?: Direction) {
		const tiles = this.createTiles(mapInfo.tiles);

		const mapId = this.createEntity();

		const { connections } = GameMapResources[mapInfo.name];

		this.addComponent(mapId, 'MapInfo', {
			id: mapInfo.id,
			name: mapInfo.name,
			width: mapInfo.width,
			height: mapInfo.height
		});
		this.addComponent(mapId, 'Tiles', tiles);
		this.addComponent(mapId, 'Background', SpriteBank.getTile(mapInfo.backgroundId).frames[0]);
		this.addComponent(mapId, 'Connections', connections);

		if (!direction) {
			this.activeMapId = mapId;
		} else {
			this.addComponent(mapId, 'Direction', direction);
		}

		return mapId;
	}
	createEntity() {
		const id = this.idCount;
		this.idCount++;
		this.entities.set(id, new Set());
		return id;
	}
	async loadMap(name: MapNames, direction: Direction) {
		const response = await axios.get(`/maps/name?name=${name}`);
		if (response.status === 200) {
			const map = readMap(Buffer.from(response.data.map, 'base64'));

			this.loadedMaps.add(name);
			return this.createMap(map, direction);
		} else {
			throw new Error('Failed to load map');
		}
	}
	addComponent<K extends keyof ComponentTypes>(
		entityId: number,
		componentName: K,
		component: ComponentTypes[K]
	) {
		if (!this.entities.has(entityId)) {
			this.entities.set(entityId, new Set<keyof ComponentTypes>());
		}
		this.entities.get(entityId)!.add(componentName);

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
	removeComponent<K extends keyof ComponentTypes>(entityId: number, componentName: K) {
		this.components[componentName]?.delete(entityId);
	}
	entitiesWith<const K extends readonly (keyof ComponentTypes)[]>(
		this: Game,
		keys: K
	): EntityWith<K[number]>[] {
		const result: EntityWith<K[number]>[] = [];

		for (const [id, entityComponentTypes] of this.entities) {
			if (keys.every((key) => entityComponentTypes.has(key))) {
				// Create a temporary untyped object for collecting components
				const componentData: Record<string, unknown> = {};

				// Collect all the component data
				for (const key of keys) {
					componentData[key as string] = this.components[key]!.get(id)!;
				}

				// Push with proper type assertion
				result.push({
					id,
					components: componentData as { [P in K[number]]: ComponentTypes[P] }
				});
			}
		}

		return result;
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
	async tick(currentFrameTime: number) {
		this.canvas.reset();

		await this.updateSystems(currentFrameTime);

		this.lastFrameTime = currentFrameTime;
		/*const sub = this.player.coords.getSub();

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
	async updateSystems(currentFrameTime: number) {
		const deltaTime = (currentFrameTime - this.lastFrameTime) / 1000;

		viewportSystem(this, this.canvas, this.viewport);
		await mapSystem(this);
		mapRenderSystem(this, this.canvas);
		renderSystem(this, this.canvas);
		mapOverlaySysyem(this, this.canvas);
		inputSystem(this);
		mapTransitionSystem(this);
		movementSystem(this, deltaTime);
		animationSystem(this, deltaTime);
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
