import type { PageServerLoad } from './$types';
import { zfd } from 'zod-form-data';
import { error, fail } from '@sveltejs/kit';
import { Jimp, rgbaToInt } from 'jimp';
import { mapToBuffer } from '$lib/utils/mapToBuffer';
import { z } from 'zod';
import { mapNamesSchema } from '$lib/interfaces/MapNames';
import prisma from '$lib/prisma';
import { gameMapSchema } from '$lib/classes/maps/GameMap';

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
	const schema = z.object({
		map: mapNamesSchema
	});

	const result = schema.safeParse(params);
	if (result.error) {
		return error(400, 'Invalid map name.');
	}

	const map = await mapToBuffer(result.data.map);
	const tiles = await prisma.tiles.findMany();

	return {
		map: map.toString('base64'),
		tiles
	};
};

export const actions = {
	save: async ({ request }) => {
		const schema = zfd.formData({
			map: zfd.text().transform(async (map) => {
				const parsedMap = JSON.parse(map);
				const result = await gameMapSchema.safeParseAsync(parsedMap);

				if (!result.success) {
					throw new Error(result.error.message);
				}

				return result.data;
			})
		});

		const data = await request.formData();

		const result = await schema.safeParseAsync(data);
		if (result.error) {
			console.log(result.error);
			return fail(400);
		}

		const { map } = result.data;

		const updated = await prisma.maps.update({
			data: {
				name: map.name,
				width: map.width,
				height: map.height,
				backgroundTileId: map.backgroundTile
			},
			where: {
				name: map.name
			}
		});

		const tiles = await prisma.mapTiles.findMany({
			select: {
				tile: {
					select: {
						original: true
					}
				}
			},
			where: {
				mapId: updated.id
			}
		});

		console.log(tiles);

		// now we need to remove the background tile from each tile

		console.log('TILES', map.tiles.flat());

		await prisma.mapTiles.updateMany({
			data: map.tiles
				.flat()
				.map((tile) => ({
					x: tile.x,
					y: tile.y,
					tileId: tile.id,
					permissions: tile.permissions
				}))
				.slice(0, 1),
			where: {
				mapId: updated.id
			}
		});

		/*const map = JSON.parse(result.data.map);

		const buffer = new BufferHelper(Buffer.alloc(30000));
		buffer.writeByte(1);
		buffer.writeString(map.name);
		buffer.writeByte(map.width);
		buffer.writeByte(map.height);
		buffer.writeByte(map.backgroundTile.id);
		buffer.writeShort(map.images.length);

		// now lets remove the background for every image where it matches the background tile

		//for (const image of map.images) {
		//	buffer.writeString(await removeImageBackground(map.backgroundTile.data, image));
		//}

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

		await fs.writeFile(`./static/maps/${map.name}.map`, buffer.getUsed(), 'binary');*/
	}
};
