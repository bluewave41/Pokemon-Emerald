import type { Canvas } from '../Canvas';

export class UIElement {
	id: string = '';
	constructor(id: string) {
		this.id = id;
	}
	draw(x: number, y: number, canvas: Canvas): number {
		void x;
		void y;
		void canvas;
		return 0;
	}
}
