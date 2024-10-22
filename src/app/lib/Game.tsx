import { fetchMap } from "../promises/fetchMap";
import { fetchPack } from "../promises/fetchPack";
import { Canvas } from "./Canvas";
import { Entity } from "./Entity";
import { GameMap } from "./GameMap";
import { Player } from "./Player";
import SpriteBank from "./SpriteBank";

export class Game {
  map: GameMap | null = null;
  player: Player | null = null;
  entities: Entity[] = [];
  initialized: boolean = false;
  canvas: Canvas;

  constructor(canvas: Canvas) {
    this.canvas = canvas;
  }
  async init(area: string) {
    // load map for the area
    this.map = await fetchMap(area);

    // load player sprites
    await SpriteBank.loadPack("player", await fetchPack("player"));

    // create player after sprites exist
    this.player = new Player(8, 8, "down");

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
    this.player.tick(this.canvas);
    for (const entity of this.entities) {
      entity.tick(this.canvas);
    }
  }
}
