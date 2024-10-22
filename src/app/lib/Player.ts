import { Direction } from "../interfaces/Direction";
import { Canvas } from "./Canvas";
import { Entity } from "./Entity";
import SpriteBank from "./SpriteBank";

export class Player extends Entity {
  subX: number;
  subY: number;
  direction: Direction;
  isMoving: boolean;

  constructor(x: number, y: number, direction: Direction) {
    super(x, y);
    this.subX = 0;
    this.subY = 0;
    this.direction = direction;
    this.isMoving = false;
    this.init();
  }
  init() {
    this.sprites = SpriteBank.getSpriteBank("player");
  }
  tick(canvas: Canvas) {
    canvas.drawSprite(
      this.sprites[this.direction],
      this.x * canvas.tileSize,
      this.y * canvas.tileSize
    );
  }
}
