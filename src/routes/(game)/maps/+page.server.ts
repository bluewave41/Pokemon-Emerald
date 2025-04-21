import { fail } from '@sveltejs/kit';
import { zfd } from 'zod-form-data';
import { Jimp } from 'jimp';
import type { PageServerLoad } from './$types.js';
import { removeExtension } from '$lib/utils/removeExtension.js';
import prisma from '$lib/prisma.js';
import crypto from 'crypto';

interface TileInfo {
	data: string;
	hash: string;
	new: boolean;
}

export const load: PageServerLoad = async () => {
	const maps = await prisma.map.findMany({
		select: {
			id: true,
			name: true
		},
		where: {
			id: { not: 0 }
		},
		orderBy: { id: 'asc' }
	});

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

		const map: number[][] = [];

		const existingTiles: TileInfo[] = (
			await prisma.tile.findMany({
				select: {
					id: true,
					data: true,
					hash: true
				},
				orderBy: {
					id: 'asc'
				}
			})
		).map((tile) => ({
			...tile,
			new: false
		}));

		const highestMapId =
			(
				await prisma.map.findFirst({
					orderBy: { id: 'desc' },
					take: 1
				})
			)?.id ?? 0;

		for (let y = 0; y < height; y += 16) {
			const row = [];
			for (let x = 0; x < width; x += 16) {
				const tile = image.clone().crop({ x, y, w: 16, h: 16 });
				const base64 = await tile.getBase64('image/png');
				const hash = crypto.createHash('md5').update(base64).digest('hex');
				const foundImage = existingTiles.find((img) => img.hash === hash);
				if (!foundImage) {
					existingTiles.push({
						data: base64,
						hash,
						new: true
					});
				}
				row.push(existingTiles.findIndex((image) => image.hash === hash) + 1);
			}
			map.push(row);
		}

		await prisma.$transaction(async (transaction) => {
			const insertedMap = await transaction.map.create({
				data: {
					id: highestMapId + 1,
					name: simplifiedName,
					width: width / 16,
					height: height / 16
				}
			});

			await transaction.tile.createMany({
				data: existingTiles
					.filter((tile) => tile.new)
					.map((image) => ({
						data: image.data,
						hash: image.hash,
						original: image.data
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
