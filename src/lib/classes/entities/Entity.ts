import type { Canvas } from '../Canvas';
import { Coords } from '../Coords';
import type { GameMap } from '../maps/GameMap';

export class Entity {
	map: GameMap;
	coords: Coords;

	constructor(x: number, y: number, map: GameMap) {
		this.coords = new Coords(x, y);
		this.map = map;
	}
	tick(currentFrameTime: number, canvas: Canvas) {
		void currentFrameTime;
		void canvas;
		throw new Error('Method `tick` must be implemented in subclass.');
	}
}
