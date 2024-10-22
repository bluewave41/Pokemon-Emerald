import { Game } from "./Game";

export class Entity {
  x: number;
  y: number;
  sprites: Record<string, HTMLImageElement> = {};

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  init() {}
  tick(game: Game) {}
}
