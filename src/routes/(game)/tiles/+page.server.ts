import prisma from '$lib/prisma';
import { error } from '@sveltejs/kit';
import { Jimp } from 'jimp';
import { zfd } from 'zod-form-data';

export async function load() {
	const tiles = await prisma.tile.findMany({
		include: { TileFrame: true },
		orderBy: { id: 'asc' }
	});

	return {
		tiles
	};
}

export const actions = {
	upload: async ({ request }) => {
		const schema = zfd.formData({
			tile: zfd.numeric(),
			files: zfd.file().array()
		});

		const result = await schema.safeParseAsync(await request.formData());
		if (result.error) {
			return error(400);
		}

		const { tile, files } = result.data;

		const fileData = await Promise.all(
			files.map(async (file) => ({
				data: await (await Jimp.read(await file.arrayBuffer())).getBase64('image/png')
			}))
		);

		await prisma.tile.update({
			data: {
				animated: true,
				TileFrame: {
					createMany: {
						data: fileData
					}
				}
			},
			where: {
				id: tile
			}
		});
	},
	update: async ({ request }) => {
		const schema = zfd.formData({
			tile: zfd.numeric(),
			sequence: zfd.text(),
			delay: zfd.numeric()
		});

		const result = await schema.safeParseAsync(await request.formData());
		if (result.error) {
			console.log(result.error);
			return error(400);
		}

		const { tile, sequence, delay } = result.data;

		await prisma.tile.update({
			data: {
				sequence: sequence.split(',').map((el) => parseInt(el)),
				delay
			},
			where: {
				id: tile
			}
		});
	}
};
