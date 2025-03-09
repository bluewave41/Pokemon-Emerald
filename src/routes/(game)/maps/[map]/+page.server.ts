import type { PageServerLoad } from './$types';
import { zfd } from 'zod-form-data';
import { error, fail } from '@sveltejs/kit';
import { Jimp, rgbaToInt } from 'jimp';
import { mapToBuffer } from '$lib/utils/mapToBuffer';
import { z } from 'zod';
import { mapNamesSchema } from '$lib/interfaces/MapNames';
import prisma from '$lib/prisma';
import { gameEditorMapSchema } from '$lib/classes/maps/GameMap';

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
	const tiles = await prisma.tiles.findMany({
		orderBy: { id: 'asc' }
	});

	return {
		map: map.toString('base64'),
		tiles
	};
};

export const actions = {
	reset: async ({ request }) => {
		const schema = zfd.formData({
			name: zfd.text()
		});
		const result = await schema.safeParseAsync(await request.formData());
		if (!result) {
			return fail(400);
		}

		await prisma.$executeRaw`UPDATE "Tiles" SET data = original`;
	},
	save: async ({ request }) => {
		const schema = zfd.formData({
			map: zfd.text().transform(async (map) => {
				const parsedMap = JSON.parse(map);
				const result = await gameEditorMapSchema.safeParseAsync(parsedMap);

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
						id: true,
						original: true
					}
				}
			},
			where: {
				mapId: updated.id
			}
		});

		const updates = tiles.map(async ({ tile }) => {
			const backgroundImage = map.images[map.backgroundTile - 1];
			const processedData = await removeImageBackground(backgroundImage, tile.original);

			return prisma.tiles.update({
				data: { data: processedData },
				where: {
					id: tile.id
				}
			});
		});

		await Promise.all(updates);

		// update tile overlays
		const uniqueTiles = Array.from(new Set(tiles.map((tile) => tile.tile.id)));

		// reset them all
		await prisma.tiles.updateMany({
			data: {
				overlay: false
			},
			where: {
				id: {
					in: uniqueTiles
				}
			}
		});

		//set them
		await prisma.tiles.updateMany({
			data: {
				overlay: true
			},
			where: {
				id: {
					in: map.overlayTiles
				}
			}
		});

		await prisma.$transaction(
			map.tiles.flat().map((tile) =>
				prisma.mapTiles.update({
					where: {
						mapId_x_y: {
							x: tile.x,
							y: tile.y,
							mapId: updated.id
						}
					},
					data: {
						tileId: tile.id,
						permissions: tile.permissions
					}
				})
			)
		);

		const eventTiles = map.tiles.flat().filter((tile) => tile.kind === 'sign');
	}
};
