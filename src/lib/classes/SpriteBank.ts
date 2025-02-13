import type { MapNames } from '$lib/interfaces/MapNames';

class InternalSpriteBank {
	maps: Record<MapNames, Record<string, Record<number, HTMLImageElement>>> = {
		littleroot: {}
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
	getSprite(map: MapNames, area: string, tile: number) {
		return this.maps[map][area][tile];
	}
}

const SpriteBank = new InternalSpriteBank();
export default SpriteBank;
