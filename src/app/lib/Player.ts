import { Direction } from "../interfaces/Direction";
import { Entity } from "./Entity";
import { Game } from "./Game";
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
  tick(game: Game) {
    if (game.isKeyPressed("ArrowUp")) {
      this.y--;
    }
    if (game.isKeyPressed("ArrowDown")) {
      this.y++;
    }
    if (game.isKeyPressed("ArrowLeft")) {
      this.x--;
    }
    if (game.isKeyPressed("ArrowRight")) {
      this.x++;
    }
    game.canvas.drawSprite(
      this.sprites[this.direction],
      this.x * game.canvas.tileSize,
      this.y * game.canvas.tileSize
    );
  }
}
