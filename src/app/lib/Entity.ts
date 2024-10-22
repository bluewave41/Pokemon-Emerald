import { Canvas } from "./Canvas";

export class Entity {
  x: number;
  y: number;
  sprites: Record<string, HTMLImageElement> = {};

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  init() {}
  tick(canvas: Canvas) {}
}
