import type { Canvas } from '../Canvas';
import { Coords } from '../Coords';
import type { Game } from '../Game';

export class Entity {
	id: string;
	game: Game;
	coords: Coords;
	priority: number = 0;
	visible: boolean = true;

	constructor(id: string, x: number, y: number, game: Game) {
		this.id = id;
		this.coords = new Coords(x, y);
		this.game = game;
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

export type EntityType = typeof Entity;
export type EditorEntityType = Partial<EntityType>;
