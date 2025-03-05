import { fail } from '@sveltejs/kit';
import { zfd } from 'zod-form-data';
import { Jimp } from 'jimp';
import type { PageServerLoad } from './$types.js';
import { removeExtension } from '$lib/utils/removeExtension.js';
import prisma from '$lib/prisma.js';

export const load: PageServerLoad = async () => {
	const maps = (await prisma.maps.findMany()).map((map) => map.name);

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

		const images: { data: string; hash: string }[] = [];
		const map: number[][] = [];

		for (let y = 0; y < height; y += 16) {
			const row = [];
			for (let x = 0; x < width; x += 16) {
				const tile = image.clone().crop({ x, y, w: 16, h: 16 });
				const base64 = await tile.getBase64('image/png');
				const hash = tile.hash();
				const foundImage = images.find((img) => img.hash === hash);
				if (!foundImage) {
					images.push({
						data: base64,
						hash
					});
				}
				row.push(images.findIndex((image) => image.hash === hash) + 1);
			}
			map.push(row);
		}

		/*const buffer = new BufferHelper(Buffer.alloc(30000));
		buffer.writeByte(1);
		buffer.writeString(simplifiedName);
		buffer.writeByte(width / 16);
		buffer.writeByte(height / 16);
		buffer.writeByte(0);
		buffer.writeShort(images.length);
		for (const image of images) {
			buffer.writeString(image);
		}

		for (let y = 0; y < map.length; y++) {
			for (let x = 0; x < map[0].length; x++) {
				buffer.writeByte(map[y][x]);
				buffer.writeByte(0);
			}
		}*/

		await prisma.$transaction(async (transaction) => {
			const insertedMap = await transaction.maps.create({
				data: {
					name: simplifiedName,
					area: 'overworld',
					width: width / 16,
					height: height / 16
				}
			});

			const highestTileId =
				(
					await prisma.tiles.findFirst({
						orderBy: { id: 'desc' },
						select: { id: true }
					})
				)?.id ?? 1;

			await transaction.tiles.createMany({
				data: images.map((img, index) => ({
					...img,
					id: index + highestTileId,
					original: img.data
				})),
				skipDuplicates: true
			});

			await transaction.mapTiles.createMany({
				data: map.flatMap((col, y) =>
					col.flatMap((row, x) => ({
						mapId: insertedMap.id,
						tileId: row,
						x,
						y,
						permissions: 0
					}))
				)
			});
		});
	}
};
