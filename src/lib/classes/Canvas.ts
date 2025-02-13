import { Game } from './Game';

export class Canvas {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Canvas context is null!');
		}
		this.context = context;
	}
	drawImage(image: HTMLImageElement, x: number, y: number) {
		this.context.drawImage(
			image,
			x * Game.getAdjustedTileSize(),
			y * Game.getAdjustedTileSize(),
			Game.getAdjustedTileSize(),
			Game.getAdjustedTileSize()
		);
	}
	get width() {
		return this.canvas.width;
	}
	get height() {
		return this.canvas.height;
	}
}
