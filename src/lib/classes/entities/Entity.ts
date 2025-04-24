import { z } from 'zod';
import type { Canvas } from '../Canvas';
import { Coords } from '../Coords';

export class Entity {
	id: string;
	coords: Coords;
	priority: number = 0;
	visible: boolean = true;
	script: string | null;

	constructor(id: string, x: number, y: number, script: string | null) {
		this.id = id;
		this.coords = new Coords(x, y);
		this.script = script;
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
	toJSON() {}
}

export const entitySchema = z.object({
	entityId: z.string(),
	position: z.object({
		x: z.number(),
		y: z.number()
	}),
	bank: z.string(),
	script: z.string()
});
