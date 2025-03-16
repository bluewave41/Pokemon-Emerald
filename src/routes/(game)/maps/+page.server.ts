import { fail } from '@sveltejs/kit';
import { zfd } from 'zod-form-data';
import { Jimp } from 'jimp';
import type { PageServerLoad } from './$types.js';
import { removeExtension } from '$lib/utils/removeExtension.js';
import prisma from '$lib/prisma.js';

export const load: PageServerLoad = async () => {
	const maps = (await prisma.map.findMany()).map((map) => map.name);

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
		const map: number[][] = [];

		for (let y = 0; y < height; y += 16) {
			const row = [];
			for (let x = 0; x < width; x += 16) {
				const tile = image.clone().crop({ x, y, w: 16, h: 16 });
				const base64 = await tile.getBase64('image/png');
				const foundImage = images.find((img) => img === base64);
				if (!foundImage) {
					images.push(base64);
				}
				row.push(images.findIndex((image) => image === base64) + 1);
			}
			map.push(row);
		}

		await prisma.$transaction(async (transaction) => {
			const insertedMap = await transaction.map.create({
				data: {
					name: simplifiedName,
					area: 'overworld',
					width: width / 16,
					height: height / 16
				}
			});

			const highestTileId =
				(
					await prisma.tile.findFirst({
						orderBy: { id: 'desc' },
						select: { id: true }
					})
				)?.id ?? 1;

			await transaction.tile.createMany({
				data: images.map((img, index) => ({
					id: index + highestTileId,
					data: img,
					original: img
				})),
				skipDuplicates: true
			});

			await transaction.mapTile.createMany({
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
