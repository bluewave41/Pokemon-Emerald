import { BufferHelper } from '$lib/BufferHelper';
import type { BankNames } from '$lib/interfaces/BankNames';
import type { MapNames } from '$lib/interfaces/MapNames';
import type { SpriteFile } from '$lib/interfaces/SpriteFile';

class InternalSpriteBank {
	maps: Record<MapNames, Record<string, Record<number, HTMLImageElement>>> = {
		littleroot: {}
	};
	sprites: Record<BankNames, Record<string, HTMLImageElement>> = {
		player: {}
	};

	constructor() {}
	async readMap(map: MapNames, area: string, images: string[]) {
		if (!this.maps[map][area]) {
			this.maps[map][area] = {};
		}
		await Promise.all(
			images.map(
				(src, index) =>
					new Promise<void>((resolve) => {
						const image = new Image();

						image.onload = () => {
							this.maps[map][area][index] = image;
							resolve();
						};
						image.src = src;
					})
			)
		);
	}
	async readBank(bank: BankNames, images: SpriteFile[]) {
		await Promise.all(
			images.map(
				(imageData) =>
					new Promise<void>((resolve) => {
						const image = new Image();

						image.onload = () => {
							this.sprites[bank][imageData.name] = image;
							resolve();
						};
						image.src = imageData.data;
					})
			)
		);
	}
	getTile(map: MapNames, area: string, tile: number) {
		return this.maps[map][area][tile];
	}
	getSprite(bank: BankNames, sprite: string) {
		return this.sprites[bank][sprite];
	}
}

const SpriteBank = new InternalSpriteBank();
export default SpriteBank;
