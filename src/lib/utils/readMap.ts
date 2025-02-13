import { BufferedReader } from '$lib/BufferedReader';
import { Tile } from '$lib/classes/Tile';

export const readMap = (mapBuffer: Buffer) => {
	const buffer = new BufferedReader(mapBuffer);

	buffer.readByte(); // version
	const name = buffer.readString();
	const width = buffer.readByte();
	const height = buffer.readByte();
	const imageCount = buffer.readShort();
	const images = [];
	for (let i = 0; i < imageCount; i++) {
		images.push(buffer.readString());
	}

	const map: Tile[][] = [];
	for (let y = 0; y < height; y++) {
		const row = [];
		for (let x = 0; x < width; x++) {
			row.push(new Tile(buffer.readByte(), buffer.readByte()));
		}
		map.push(row);
	}

	return {
		name,
		width,
		height,
		images,
		map
	};
};
