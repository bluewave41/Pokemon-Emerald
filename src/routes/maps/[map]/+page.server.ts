import path from 'path';
import type { PageServerLoad } from './$types';
import { promises as fs } from 'fs';
import { zfd } from 'zod-form-data';
import { fail } from '@sveltejs/kit';
import { BufferHelper } from '$lib/BufferHelper';

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
		for (const image of map.images) {
			buffer.writeString(image);
		}

		for (let y = 0; y < map.tiles.length; y++) {
			for (let x = 0; x < map.tiles[0].length; x++) {
				buffer.writeByte(map.tiles[y][x].id);
				buffer.writeByte(map.tiles[y][x].permissions);
			}
		}

		await fs.writeFile(`./static/maps/${map.name}.map`, buffer.getUsed(), 'binary');
	}
};
