import GLOBALS from "./globals";

interface CanvasOptions {
  color?: string;
  opacity?: number;
}

export class Canvas {
  context: CanvasRenderingContext2D;
  tileSize: number;
  scale: number;

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");
    if (!context) {
      throw Error("Couldn't create context for canvas.");
    }
    this.context = context;
    this.scale = 2;
    this.tileSize = GLOBALS.tileSize * this.scale;
  }
  reset() {
    this.context.resetTransform();
    this.context.clearRect(
      0,
      0,
      this.context.canvas.width,
      this.context.canvas.height
    );
    this.context.globalAlpha = 1;
  }
  drawTile(image: HTMLImageElement, x: number, y: number) {
    this.context.drawImage(
      image,
      x * this.tileSize,
      y * this.tileSize,
      this.tileSize,
      this.tileSize
    );
  }
  drawRect(x: number, y: number, options?: CanvasOptions) {
    if (options?.color) {
      this.context.fillStyle = options.color;
    }
    if (options?.opacity) {
      this.context.globalAlpha = options.opacity;
    }
    this.context.fillRect(
      x * GLOBALS.tileSize,
      y * GLOBALS.tileSize,
      this.tileSize,
      this.tileSize
    );
  }
  drawSprite(image: HTMLImageElement, x: number, y: number) {
    this.context.drawImage(image, x, y, this.tileSize, this.tileSize);
  }
}
