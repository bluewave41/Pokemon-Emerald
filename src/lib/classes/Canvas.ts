import { AdjustedRect } from './AdjustedRect';
import { Game } from './Game';

interface DrawOptions {
	color?: string;
}

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
	reset() {
		this.context.resetTransform();
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
	drawText(text: string, x: number, y: number) {
		this.context.font = '16pt "pokemon"';
		this.context.fillStyle = 'black';
		const metrics = this.context.measureText(text);
		const fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
		this.context.fillText(text, x, y + fontHeight);
	}
	drawTile(image: HTMLImageElement, x: number, y: number) {
		const rect = new AdjustedRect(x, y);
		this.context.drawImage(image, rect.x, rect.y, rect.width, rect.height);
	}
	drawOverlay(x: number, y: number, options: DrawOptions = {}) {
		if (options.color) {
			this.context.fillStyle = options?.color;
		}
		const rect = new AdjustedRect(x, y);
		this.context.fillRect(rect.x, rect.y, rect.width, rect.height);
	}
	drawImage(image: HTMLImageElement, x: number, y: number) {
		const rect = new AdjustedRect(x, y);
		this.context.drawImage(image, rect.x, rect.y, rect.width, rect.height);
	}
	drawAbsoluteImage(image: HTMLImageElement, x: number, y: number) {
		this.context.drawImage(
			image,
			x,
			y,
			Game.getAdjustedTileSize() - 2,
			Game.getAdjustedTileSize() + 8
		);
	}
	translate(x: number, y: number) {
		const rect = new AdjustedRect(x, y);
		this.context.translate(rect.x, rect.y);
	}
	showMessageBox(text: string) {
		const gap = 5;
		const size = 60;
		const rectOffset = 2;

		const x = gap - rectOffset;
		const y = this.canvas.height - size - gap - rectOffset;
		const length = this.canvas.width - gap * 2 + rectOffset * 2;
		const height = size + rectOffset * 2;

		this.context.fillStyle = 'black';
		this.context.fillRect(x, y, length, height);
		this.context.fillStyle = 'white';
		this.context.fillRect(gap, this.canvas.height - gap - size, this.canvas.width - gap * 2, size);
		this.drawText(text, x + gap, y);
	}
	get width() {
		return this.canvas.width;
	}
	get height() {
		return this.canvas.height;
	}
}
