import { Tile } from "./Tile";
import { BufferedReader } from "../lib/BufferedReader";
import { Canvas } from "./Canvas";
import SpriteBank from "./SpriteBank";
import { Player } from "./Player";
import GLOBALS from "./globals";

export class GameMap {
  area: string;
  width: number;
  height: number;
  tiles: Tile[][];
  backgroundTile: number;

  constructor(
    area: string,
    width: number,
    height: number,
    tiles: Tile[][],
    backgroundTile: number
  ) {
    this.area = area;
    this.width = width;
    this.height = height;
    this.tiles = tiles;
    this.backgroundTile = backgroundTile;
  }
  static async loadMap(area: string, buffer: Buffer) {
    const reader = new BufferedReader(buffer);
    const width = reader.readByte();
    const height = reader.readByte();
    const backgroundTile = reader.readByte();
    const imageCount = reader.readShort();
    const images = [];
    const tiles: Tile[][] = [];

    for (let i = 0; i < imageCount; i++) {
      images.push(reader.readString());
    }

    for (let y = 0; y < height; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < width; x++) {
        row.push(new Tile(reader.readByte(), reader.readByte()));
      }
      tiles.push(row);
    }

    await SpriteBank.loadMap(area, images);

    return new GameMap(area, width, height, tiles, backgroundTile);
  }
  drawMap(canvas: Canvas, player: Player) {
    const { tileSize } = canvas;
    canvas.context.translate(
      -player.subX + (GLOBALS.viewPortWidth * tileSize) / 2,
      -player.subY + (GLOBALS.viewPortHeight * tileSize) / 2
    );
    // draw background
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        canvas.drawTile(
          SpriteBank.getTile(this.area, this.backgroundTile),
          x,
          y
        );
      }
    }

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.tiles[y][x];
        canvas.drawTile(SpriteBank.getTile(this.area, tile.id), x, y);
      }
    }
  }
  getTile(x: number, y: number) {
    return this.tiles[x][y];
  }
}
