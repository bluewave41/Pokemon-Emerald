import path from 'path';
import type { PageServerLoad } from './$types';
import { promises as fs } from 'fs';
import { zfd } from 'zod-form-data';
import { fail } from '@sveltejs/kit';
import { BufferHelper } from '$lib/BufferHelper';
import { Jimp, rgbaToInt } from 'jimp';
import { EventMap } from '$lib/utils/EventMap';

const removeImageBackground = async (background: string, top: string) => {
	if (background === top) {
		return top;
	}

	const backgroundImage = await Jimp.read(background);
	const topImage = await Jimp.read(top);
	const { width, height } = backgroundImage.bitmap;
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const p1 = backgroundImage.getPixelColor(x, y);
			const p2 = topImage.getPixelColor(x, y);
			if (p1 === p2) {
				topImage.setPixelColor(rgbaToInt(0, 0, 0, 0), x, y);
			}
		}
	}
	return await topImage.getBase64('image/png');
};

export const load: PageServerLoad = async ({ params }) => {
	const map = await fs.readFile(
		path.join(path.resolve('./static/maps'), path.basename(params.map) + '.map')
	);

	return {
		map: map.toString('base64')
	};
};

export const actions = {
	save: async ({ request }) => {
		const schema = zfd.formData({
			map: zfd.text()
		});

		const data = await request.formData();

		const result = await schema.safeParseAsync(data);
		if (result.error) {
			console.log(result.error);
			return fail(400);
		}

		const map = JSON.parse(result.data.map);

		const buffer = new BufferHelper(Buffer.alloc(30000));
		buffer.writeByte(1);
		buffer.writeString(map.name);
		buffer.writeByte(map.width);
		buffer.writeByte(map.height);
		buffer.writeByte(map.backgroundTile.id);
		buffer.writeShort(map.images.length);

		// now lets remove the background for every image where it matches the background tile

		for (const image of map.images) {
			buffer.writeString(await removeImageBackground(map.backgroundTile.data, image));
		}

		for (let y = 0; y < map.tiles.length; y++) {
			for (let x = 0; x < map.tiles[0].length; x++) {
				buffer.writeByte(map.tiles[y][x].id);
				buffer.writeByte(map.tiles[y][x].permissions);
			}
		}

		// write events
		for (const event of map.events) {
			const e = EventMap[event.id];
			e?.write(buffer, event);
		}

		await fs.writeFile(`./static/maps/${map.name}.map`, buffer.getUsed(), 'binary');
	}
};
