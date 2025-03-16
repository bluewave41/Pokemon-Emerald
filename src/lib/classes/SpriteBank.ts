import { BufferHelper } from '$lib/BufferHelper';
import type { BankNames } from '$lib/interfaces/BankNames';
import type { Image } from '$lib/interfaces/Image';
import { Buffer } from 'buffer';

export interface SpriteInfo {
	images: HTMLImageElement[];
	delay: number;
	sequence: number[];
}

class InternalSpriteBank {
	tiles: Record<number, SpriteInfo> = {};
	sprites: Record<BankNames, Record<string, HTMLImageElement>> = {
		player: {}
	};

	constructor() {}
	async readMap(imageBuffer: string) {
		const buffer = new BufferHelper(Buffer.from(imageBuffer, 'base64'));
		const imageCount = buffer.readShort();
		const images: Image<number>[] = [];

		for (let i = 0; i < imageCount; i++) {
			const image: Image<number> = {
				id: buffer.readShort(),
				data: buffer.readString(),
				animated: buffer.readBoolean()
			};
			if (image.animated) {
				image.delay = buffer.readShort();
				const sequenceLength = buffer.readByte();
				const sequence: number[] = [];
				for (let i = 0; i < sequenceLength; i++) {
					sequence.push(buffer.readByte());
				}
				const frames: string[] = [];
				const frameLength = buffer.readByte();
				for (let i = 0; i < frameLength; i++) {
					frames.push(buffer.readString());
				}
				image.sequence = sequence;
				image.frames = frames;
			}
			images.push(image);
		}

		await Promise.all(
			images.map(
				(srcImage) =>
					new Promise<void>((resolve) => {
						if (this.tiles[srcImage.id]) {
							// already loaded
							resolve();
						}

						const loadImage = (src: string) =>
							new Promise<HTMLImageElement>((resolveImage) => {
								const image = new Image();
								image.onload = () => resolveImage(image);
								image.src = src;
							});

						const imageSources = [srcImage.data, ...(srcImage.frames ?? [])];

						Promise.all(imageSources.map(loadImage)).then((loadedImages) => {
							this.tiles[srcImage.id] = {
								images: loadedImages,
								delay: srcImage.delay,
								sequence: srcImage.sequence
							};
							resolve();
						});
					})
			)
		);
	}
	async readBank(bank: BankNames, imageBuffer: string) {
		const buffer = new BufferHelper(Buffer.from(imageBuffer, 'base64'));
		const imageCount = buffer.readByte();
		const images: Image<string>[] = [];
		for (let i = 0; i < imageCount; i++) {
			images.push({
				id: buffer.readString(),
				data: buffer.readString()
			});
		}

		await Promise.all(
			images.map(
				(imageData) =>
					new Promise<void>((resolve) => {
						const image = new Image();

						image.onload = () => {
							this.sprites[bank][imageData.id] = image;
							resolve();
						};
						image.src = imageData.data;
					})
			)
		);
	}
	getTile(id: number) {
		return this.tiles[id];
	}
	getSprite(bank: BankNames, sprite: string) {
		return this.sprites[bank][sprite];
	}
}

const SpriteBank = new InternalSpriteBank();
export default SpriteBank;
