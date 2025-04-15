import type { Canvas } from '../Canvas';
import { Coords } from '../Coords';
import type { GameMap } from '../maps/GameMap';

export class Entity {
	id: string;
	map: GameMap;
	coords: Coords;
	priority: number = 0;
	visible: boolean = true;

	constructor(id: string, x: number, y: number, map: GameMap) {
		this.id = id;
		this.coords = new Coords(x, y);
		this.map = map;
	}
	setVisible(visible: boolean) {
		this.visible = visible;
	}
	setPriority(priority: number) {
		this.priority = priority;
		return this;
	}
	tick(currentFrameTime: number, lastFrameTime: number, canvas: Canvas) {
		void currentFrameTime;
		void lastFrameTime;
		void canvas;
		throw new Error('Method `tick` must be implemented in subclass.');
	}
}
