import { Direction } from "../interfaces/Direction";
import { Entity } from "./Entity";
import { Game } from "./Game";
import GLOBALS from "./globals";
import SpriteBank from "./SpriteBank";

export class Player extends Entity {
  subX: number;
  subY: number;
  endX: number = 0;
  endY: number = 0;
  direction: Direction;
  isMoving: boolean;
  walkFrame: 1 | 2 = 1;
  activeSprite: string;

  constructor(x: number, y: number, direction: Direction) {
    super(x, y);
    this.subX = x * GLOBALS.tileSize;
    this.subY = y * GLOBALS.tileSize;
    this.direction = direction;
    this.isMoving = false;
    this.activeSprite = direction;
    this.init();
  }
  init() {
    this.sprites = SpriteBank.getSpriteBank("player");
  }
  move(newX: number, newY: number, direction: Direction) {
    this.isMoving = true;
    // set pixel position in world
    this.subX = this.x * GLOBALS.tileSize;
    this.subY = this.y * GLOBALS.tileSize;

    // set new position in world
    this.x = newX;
    this.y = newY;

    this.endX = newX * GLOBALS.tileSize;
    this.endY = newY * GLOBALS.tileSize;

    this.direction = direction;
    this.activeSprite = this.direction + this.walkFrame;
  }
  tick(game: Game) {
    if (this.isMoving) {
      if (this.subX > this.endX) {
        this.subX -= 1;
        if (this.subX < this.endX + GLOBALS.tileSize / 2) {
          this.activeSprite = "left";
        }
      } else if (this.subX < this.endX) {
        this.subX += 1;
        if (this.subX > this.endX - GLOBALS.tileSize / 2) {
          this.activeSprite = "right";
        }
      } else if (this.subY > this.endY) {
        this.subY -= 1;
        if (this.subY < this.endY + GLOBALS.tileSize / 2) {
          this.activeSprite = "up";
        }
      } else if (this.subY < this.endY) {
        this.subY += 1;
        if (this.subY > this.endY - GLOBALS.tileSize / 2) {
          this.activeSprite = "down";
        }
      }
      if (this.subX === this.endX && this.subY === this.endY) {
        this.isMoving = false;
        this.walkFrame = this.walkFrame === 1 ? 2 : 1;
      }
    } else {
      if (game.isKeyPressed("ArrowUp") && !this.isMoving) {
        this.move(this.x, this.y - 1, "up");
      }
      if (game.isKeyPressed("ArrowDown") && !this.isMoving) {
        this.move(this.x, this.y + 1, "down");
      }
      if (game.isKeyPressed("ArrowLeft") && !this.isMoving) {
        this.move(this.x - 1, this.y, "left");
      }
      if (game.isKeyPressed("ArrowRight") && !this.isMoving) {
        this.move(this.x + 1, this.y, "right");
      }
    }

    game.canvas.drawSprite(
      this.sprites[this.activeSprite],
      this.subX,
      this.subY
    );
  }
}
