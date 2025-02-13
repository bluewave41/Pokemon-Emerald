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
}
