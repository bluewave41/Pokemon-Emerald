import { fetchMap } from "../promises/fetchMap";
import { fetchPack } from "../promises/fetchPack";
import { Canvas } from "./Canvas";
import { Entity } from "./Entity";
import { GameMap } from "./GameMap";
import { KeyHandler } from "./KeyHandler";
import { Player } from "./Player";
import SpriteBank from "./SpriteBank";

export class Game {
  map: GameMap | null = null;
  player: Player | null = null;
  entities: Entity[] = [];
  initialized: boolean = false;
  canvas: Canvas;
  keyHandler: KeyHandler = new KeyHandler();

  constructor(canvas: Canvas) {
    this.canvas = canvas;
  }
  async init(area: string) {
    // load map for the area
    this.map = await fetchMap(area);

    // load player sprites
    await SpriteBank.loadPack("player", await fetchPack("player"));

    // create player after sprites exist
    this.player = new Player(0, 0, "down");

    this.initialized = true;
  }
  tick() {
    if (!this.player) {
      throw new Error("Player is null!");
    }
    if (!this.map) {
      throw new Error("Map is null!");
    }
    if (!this.initialized) {
      throw new Error("GameMap is not initialized.");
    }
    this.canvas.reset();
    this.map.drawMap(this.canvas, this.player);
    this.player.tick(this);
    for (const entity of this.entities) {
      entity.tick(this);
    }
  }
  onKeyDown(key: string) {
    this.keyHandler.keyDown(key);
  }
  onKeyUp(key: string) {
    this.keyHandler.keyUp(key);
  }
  isKeyPressed(key: string) {
    return this.keyHandler.getKeyStatus(key);
  }
}
