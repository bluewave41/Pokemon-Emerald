import { maps } from "../interfaces/Maps";
import { BufferedReader } from "./BufferedReader";

class InternalSprteBank {
  tiles: Record<string, Record<string, Record<number, HTMLImageElement>>>;
  sprites: Record<string, Record<string, HTMLImageElement>>;

  constructor() {
    const tiles: Record<string, Record<string, string>> = {};
    const sprites: Record<string, Record<string, HTMLImageElement>> = {};
    for (const map of maps) {
      tiles[map] = {};
    }
    this.tiles = tiles;
    this.sprites = sprites;
  }
  async loadMap(area: string, images: string[]) {
    const [map, subArea] = area.split("/");
    const self = this;
    const promises = [];

    this.tiles[map][subArea] = {};

    for (let i = 0; i < images.length; i++) {
      promises.push(
        new Promise<void>((resolve) => {
          const index = i;
          const image = new Image();
          image.onload = function () {
            self.tiles[map][subArea][index + 1] = image;
            resolve();
          };

          image.src = images[i];
        })
      );
    }
    return await Promise.all(promises);
  }
  async loadPack(key: string, buffer: Buffer) {
    const reader = new BufferedReader(buffer);
    const spriteCount = reader.readShort();
    const images: { name: string; data: string }[] = [];
    const promises = [];
    const self = this;

    this.sprites[key] = {};

    for (let i = 0; i < spriteCount; i++) {
      images.push({
        name: reader.readString(),
        data: reader.readString(),
      });
    }

    for (let i = 0; i < images.length; i++) {
      const { name, data } = images[i];
      promises.push(
        new Promise<void>((resolve) => {
          const image = new Image();
          image.onload = function () {
            self.sprites[key][name] = image;
            resolve();
          };

          image.src = data;
        })
      );
    }

    return await Promise.all(promises);
  }
  getTile(key: string, id: number) {
    const [area, subArea] = key.split("/");
    return this.tiles[area][subArea][id];
  }
  getBank(key: string) {
    const [area, subArea] = key.split("/");
    return this.tiles[area][subArea];
  }
  getSpriteBank(key: string) {
    return this.sprites[key];
  }
}

const SpriteBank = new InternalSprteBank();
export default SpriteBank;
