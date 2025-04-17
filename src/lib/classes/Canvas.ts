import { AdjustedRect } from './AdjustedRect';
import { ElementQueue } from './ElementQueue';
import { Game } from './Game';
import GameEvent from './GameEvent';
import SpriteBank from './SpriteBank';

interface DrawOptions {
	color?: string;
}

export class Canvas {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	elements: ElementQueue = new ElementQueue();

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
	drawImage(
		image: HTMLImageElement,
		x: number,
		y: number,
		xOffset: number = 0,
		yOffset: number = 0
	) {
		const mult = Game.getAdjustedTileSize() / 16;
		const rect = new AdjustedRect(x, y);
		this.context.drawImage(
			image,
			rect.x - xOffset,
			rect.y - yOffset,
			image.width * mult,
			image.height * mult
		);
	}
	/**
	 * Draws an image to the canvas
	 * @param image Image to draw
	 * @param x literal X coordinates
	 * @param y  literal Y coordinates
	 * @param offsetX X amount to offset drawing by
	 * @param offsetY Y amount to offset drawing by
	 */
	drawSprite(
		image: HTMLImageElement,
		x: number,
		y: number,
		xOffset: number = 0,
		yOffset: number = 0
	) {
		const mult = Game.getAdjustedTileSize() / 16;
		this.context.drawImage(
			image,
			x - xOffset,
			y - yOffset - 12,
			image.width * mult,
			image.height * mult
		);
	}
	drawAbsoluteImage(image: HTMLImageElement, x: number, y: number) {
		this.context.drawImage(image, x, y);
	}
	drawLine(x: number, y: number, toX: number, toY: number) {
		this.context.fillStyle = 'black';
		this.context.lineWidth = 3;
		this.context.beginPath();
		this.context.moveTo(x, y);
		this.context.lineTo(toX, toY);
		this.context.stroke();
	}
	drawShadow(x: number, y: number) {
		const mult = Game.getAdjustedTileSize() / 16;
		this.drawLine(
			x + 2 * mult,
			y + Game.getAdjustedTileSize(),
			x + Game.getAdjustedTileSize() - 2 * mult,
			y + Game.getAdjustedTileSize()
		);
		this.drawLine(
			x + 1 * mult,
			y - 1 + Game.getAdjustedTileSize(),
			x + Game.getAdjustedTileSize() - 1 * mult,
			y - 1 + Game.getAdjustedTileSize()
		);
		this.drawLine(
			x + 0 * mult,
			y - 2 + Game.getAdjustedTileSize(),
			x + Game.getAdjustedTileSize() - 0 * mult,
			y - 2 + Game.getAdjustedTileSize()
		);
		this.drawLine(
			x + 1 * mult,
			y - 3 + Game.getAdjustedTileSize(),
			x + Game.getAdjustedTileSize() - 1 * mult,
			y - 3 + Game.getAdjustedTileSize()
		);
		this.drawLine(
			x + 2 * mult,
			y - 4 + Game.getAdjustedTileSize(),
			x + Game.getAdjustedTileSize() - 2 * mult,
			y - 4 + Game.getAdjustedTileSize()
		);
	}
	translate(x: number, y: number) {
		const rect = new AdjustedRect(x, y);
		this.context.translate(rect.x, rect.y);
	}
	showMessageBox(text: string, startFrameTime: number, currentFrameTime: number) {
		text = text.replaceAll('{player}', 'A'); //replace placeholder with player name
		this.context.font = '24pt "pokemon"';
		//const delay = 50;
		const delay = 10;
		const elapsedTime = currentFrameTime - startFrameTime;
		const lengthToShow = Math.floor(elapsedTime / delay);
		const textToShow = text.slice(0, lengthToShow);

		if (lengthToShow >= text.length) {
			// this runs way too many times
			GameEvent.dispatchEvent(new CustomEvent('signComplete'));
		}

		const pieces = textToShow.split('/');

		const metrics = this.context.measureText(pieces[pieces.length - 1]);

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
			this.drawText(piece, x + gap + textOffset, y + textOffset / 3);
			y += 32;
		}

		if (lengthToShow >= text.length) {
			this.drawAbsoluteImage(
				SpriteBank.getSprite('utility', 'pointer'),
				x + gap + textOffset + metrics.width,
				y - 11
			);
		}
	}
	get width() {
		return this.canvas.width;
	}
	get height() {
		return this.canvas.height;
	}
}
