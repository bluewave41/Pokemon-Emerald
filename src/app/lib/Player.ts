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
  speed: number = 70;

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
  setDirection(direction: Direction) {
    this.direction = direction;
    this.activeSprite = direction;
  }
  move(newX: number, newY: number, direction: Direction, game: Game) {
    const newTile = game.getTile(newX, newY);
    if (newTile?.getPermissions().impassable) {
      this.setDirection(direction);
      return;
    }
    this.isMoving = true;
    this.lastFrameTime = game.frameTime;
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
    if (this.isMoving && this.lastFrameTime) {
      const deltaTime = (game.frameTime - this.lastFrameTime) / 1000;
      this.lastFrameTime = game.frameTime;

      const distance = Math.round(this.speed * deltaTime);

      if (this.subX < this.endX) {
        if (this.subX > this.endX - GLOBALS.tileSize / 2) {
          this.activeSprite = "right";
        }
        this.subX = Math.min(this.subX + distance, this.endX);
      } else if (this.subX > this.endX) {
        if (this.subX < this.endX + GLOBALS.tileSize / 2) {
          this.activeSprite = "left";
        }
        this.subX = Math.max(this.subX - distance, this.endX);
      }

      if (this.subY < this.endY) {
        if (this.subY > this.endY - GLOBALS.tileSize / 2) {
          this.activeSprite = "down";
        }
        this.subY = Math.min(this.subY + distance, this.endY);
      } else if (this.subY > this.endY) {
        if (this.subY < this.endY + GLOBALS.tileSize / 2) {
          this.activeSprite = "up";
        }
        this.subY = Math.max(this.subY - distance, this.endY);
      }

      if (this.subX === this.endX && this.subY === this.endY) {
        this.isMoving = false;
        this.walkFrame = this.walkFrame === 1 ? 2 : 1;
      }
    } else {
      if (game.isKeyPressed("ArrowUp") && !this.isMoving) {
        this.move(this.x, this.y - 1, "up", game);
      }
      if (game.isKeyPressed("ArrowDown") && !this.isMoving) {
        this.move(this.x, this.y + 1, "down", game);
      }
      if (game.isKeyPressed("ArrowLeft") && !this.isMoving) {
        this.move(this.x - 1, this.y, "left", game);
      }
      if (game.isKeyPressed("ArrowRight") && !this.isMoving) {
        this.move(this.x + 1, this.y, "right", game);
      }
    }

    const drawOffset = Number.isInteger(parseInt(this.activeSprite.slice(-1)));

    game.canvas.drawSprite(
      this.sprites[this.activeSprite],
      this.subX,
      this.subY + (drawOffset ? 1 : 0)
    );
  }
}
