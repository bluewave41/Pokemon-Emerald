import { fail } from '@sveltejs/kit';
import { zfd } from 'zod-form-data';
import { Jimp } from 'jimp';
import { BufferedWriter } from '$lib/BufferedWriter.js';
import { promises as fs } from 'fs';
import type { PageServerLoad } from './$types.js';
import { removeExtension } from '$lib/utils/removeExtension.js';

export const load: PageServerLoad = async () => {
	const maps = (await fs.readdir('./static/maps')).map(removeExtension);

	return {
		maps
	};
};

export const actions = {
	create: async ({ request }) => {
		const schema = zfd.formData({
			file: zfd.file()
		});

		const data = await request.formData();

		const result = await schema.safeParseAsync(data);
		if (result.error) {
			console.log(result.error);
			return fail(400);
		}

		const { file } = result.data;

		const simplifiedName = removeExtension(file.name);

		const image = await Jimp.read(await file.arrayBuffer());

		const { width, height } = image.bitmap;

		const images: string[] = [];
		const map = [];

		for (let y = 0; y < height; y += 16) {
			const row = [];
			for (let x = 0; x < width; x += 16) {
				const tile = image.clone().crop({ x, y, w: 16, h: 16 });
				const base64 = await tile.getBase64('image/bmp');
				if (!images.includes(base64)) {
					images.push(base64);
				}
				row.push(images.findIndex((image) => image === base64));
			}
			map.push(row);
		}

		const buffer = new BufferedWriter();
		buffer.writeByte(1);
		buffer.writeString(simplifiedName);
		buffer.writeByte(width / 16);
		buffer.writeByte(height / 16);
		buffer.writeShort(images.length);
		for (const image of images) {
			buffer.writeString(image);
		}

		for (let y = 0; y < map.length; y++) {
			for (let x = 0; x < map[0].length; x++) {
				buffer.writeByte(map[y][x]);
				buffer.writeByte(0);
			}
		}

		await fs.writeFile(`./static/maps/${simplifiedName}.map`, buffer.getUsed());
	}
};
