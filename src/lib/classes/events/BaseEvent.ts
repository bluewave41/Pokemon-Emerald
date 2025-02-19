import type { BufferHelper } from '$lib/BufferHelper';
import type { Events } from '$lib/interfaces/Events';
import { Position } from '../Position';

export interface EventShape {
	id: number;
	x: number;
	y: number;
}

export class BaseEvent {
	id: number = 0;
	position: Position;
	type: Events = 'none';

	constructor(x: number, y: number, ...args: any[]) {
		this.position = new Position(x, y);
	}
	getEditorUI(): { component: any; props: Record<string, any> } {
		return {
			component: null,
			props: {}
		};
	}
	update(value: any) {
		void value;
	}
	toJSON() {}
	static read(buffer: BufferHelper) {}
	static write(buffer: BufferHelper, data: EventShape) {}
}
