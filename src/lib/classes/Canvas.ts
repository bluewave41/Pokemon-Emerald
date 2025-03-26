import { AdjustedRect } from './AdjustedRect';
import { Game, type MessageBox } from './Game';
import GameEvent from './GameEvent';
import KeyHandler from './KeyHandler';

interface DrawOptions {
	color?: string;
}

export class Canvas {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	#alpha: number = 1;

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
		this.context.font = '22pt "pokemon"';
		this.context.fillStyle = '#303030';
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
	showMessageBox(message: MessageBox, currentFrameTime: number) {
		const delay = KeyHandler.getActiveKeyState('z').down ? 25 : 50; // Adjust delay to control the speed of the scrolling text (in milliseconds).
		const elapsedTime = currentFrameTime - message.startFrame; // Time elapsed since the message started
		const lengthToShow = Math.floor(elapsedTime / delay); // Determine how many characters to show based on elapsed time
		const textToShow = message.text.slice(0, lengthToShow); // Slice the message up to the calculated length

		const pieces = textToShow.split('\\n');
		const gap = 5;
		const size = 80;
		const rectOffset = 2;
		const textOffset = 20;

		const x = gap - rectOffset;
		let y = this.canvas.height - size - gap - rectOffset;
		const length = this.canvas.width - gap * 2 + rectOffset * 2;
		const height = size + rectOffset * 2;

		this.context.fillStyle = 'green';
		this.context.fillRect(x, y, length, height);
		this.context.fillStyle = 'white';
		this.context.fillRect(gap, this.canvas.height - gap - size, this.canvas.width - gap * 2, size);

		for (const piece of pieces) {
			this.drawText(piece.replaceAll('\\', ''), x + gap + textOffset, y + textOffset / 3);
			y += 32;
		}
	}
	fadeToBlack() {
		this.#alpha -= 0.05;
		this.context.globalAlpha = this.#alpha;

		if (this.#alpha > 0) {
			requestAnimationFrame(() => this.fadeToBlack());
		} else {
			this.context.globalAlpha = 0;
			GameEvent.dispatchEvent(new CustomEvent('fadedOut'));
		}
	}
	fadeIn() {
		this.#alpha += 0.05;
		this.context.globalAlpha = this.#alpha;

		if (this.#alpha < 1) {
			requestAnimationFrame(() => this.fadeIn());
		} else {
			this.context.globalAlpha = 1;
			GameEvent.dispatchEvent(new CustomEvent('fadedIn'));
		}
	}

	get width() {
		return this.canvas.width;
	}
	get height() {
		return this.canvas.height;
	}
}
