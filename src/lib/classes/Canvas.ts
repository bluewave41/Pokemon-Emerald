import { AdjustedRect } from './AdjustedRect';
import { ElementQueue } from './ElementQueue';
import { Game } from './Game';
import GameEvent from './GameEvent';
import SpriteBank from './SpriteBank';

interface DrawOptions {
	color?: string;
	opacity?: number;
	size?: number;
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
	drawText(text: string, x: number, y: number, options: DrawOptions = {}) {
		this.handleOptions(options);
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
		this.context.save();
		this.handleOptions(options);
		const rect = new AdjustedRect(x, y);
		this.context.fillRect(rect.x, rect.y, rect.width, rect.height);
		this.context.restore();
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
	drawBorder(x: number, y: number, options: DrawOptions = {}) {
		this.context.save();
		this.handleOptions(options);
		const rect = new AdjustedRect(x, y);

		this.context.strokeRect(rect.x, rect.y, rect.width, rect.height);
		this.context.restore();
	}
	handleOptions(options: DrawOptions) {
		if (options.color) {
			this.context.fillStyle = options.color;
		}
		if (options.opacity) {
			this.context.globalAlpha = options.opacity;
		}
		if (options.size) {
			this.context.font = `${options.size}pt "pokemon"`;
		}
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
	showMessageBox(
		text: string[],
		startFrameTime: number,
		currentFrameTime: number,
		scrollOffset: number,
		currentIndex: number = 0
	) {
		text.forEach((el) => el.replaceAll('{player}', 'A')); //replace placeholder with player name
		this.context.font = '24pt "pokemon"';

		const delay = 50;
		const elapsedTime = currentFrameTime - startFrameTime;
		const lengthToShow = Math.floor(elapsedTime / delay);

		const textForMath = text.slice(currentIndex, currentIndex + 2);

		const relevantText =
			currentIndex > 0
				? [textForMath[1].slice(0, lengthToShow)]
				: textForMath.join('|').slice(0, lengthToShow).split('|');

		const totalLength =
			currentIndex > 0
				? textForMath[1].length
				: textForMath.reduce((sum, str) => sum + str.length, 0) + 5;

		console.log(totalLength);

		if (lengthToShow >= totalLength) {
			// this runs way too many times
			GameEvent.dispatchEvent(new CustomEvent('textComplete'));
		}

		const metrics = this.context.measureText(relevantText[1] ?? relevantText[0]);

		const gap = 10;
		const size = 80;
		const rectOffset = 2;
		const xTextOffset = 15;
		const yTextOffset = 10;

		const x = gap - rectOffset;
		let y = this.canvas.height - size - gap - rectOffset;
		const length = this.canvas.width - gap * 2 + rectOffset * 2;
		const height = size + rectOffset * 2;

		this.context.fillStyle = 'green';
		this.context.fillRect(x, y, length, height);

		this.context.save();
		this.context.beginPath();
		this.context.rect(gap, this.canvas.height - gap - size, this.canvas.width - gap * 2, size);
		this.context.clip();

		this.context.fillStyle = 'white';
		this.context.fillRect(gap, this.canvas.height - gap - size, this.canvas.width - gap * 2, size);

		if (currentIndex > 0) {
			this.drawText(textForMath[0], x + gap + xTextOffset, y + yTextOffset / 3);
			this.drawText(
				relevantText[0],
				x + gap + xTextOffset,
				y + yTextOffset / 3 + scrollOffset + 38 * 2
			);
		} else {
			for (const piece of relevantText) {
				this.drawText(piece, x + gap + xTextOffset, y + yTextOffset / 3 + scrollOffset);
				y += 38;
			}
		}

		if (lengthToShow >= text.length) {
			this.drawAbsoluteImage(
				SpriteBank.getSprite('utility', 'pointer'),
				x + gap + xTextOffset + metrics.width,
				y - 11
			);
		}

		this.context.restore();
	}
	get width() {
		return this.canvas.width;
	}
	get height() {
		return this.canvas.height;
	}
}
