import prisma from '$lib/prisma';
import { Direction, Prisma } from '@prisma/client';
import { error } from '@sveltejs/kit';
import { Jimp } from 'jimp';
import { z } from 'zod';
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
			files: z.union([zfd.file(), zfd.file().array()])
		});

		const result = await schema.safeParseAsync(await request.formData());
		if (result.error) {
			console.log(result.error);
			return error(400);
		}

		const { tile } = result.data;

		const files = Array.isArray(result.data.files) ? result.data.files : [result.data.files];

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
			sequence: zfd.text().optional(),
			delay: zfd.numeric().optional(),
			activated: zfd.text().optional(),
			repeating: zfd.text().optional(),
			jumpDirection: zfd.text().optional(),
			script: z.string().transform((val) => (val === '' ? null : val))
		});

		const formData = await request.formData();

		const result = await schema.safeParseAsync(formData);
		if (result.error) {
			console.log('HERE', result.error);
			return error(400);
		}

		const { tile, sequence, delay, repeating, activated, jumpDirection, script } = result.data;

		const data: Partial<Prisma.TileUpdateInput> = {};
		if (sequence) {
			data.sequence = sequence.split(',').map((el) => parseInt(el));
		}
		if (delay) {
			data.delay = delay;
		}
		data.repeating = repeating ? true : false;
		data.activatedAnimation = activated ? true : false;
		if (jumpDirection) {
			data.jumpDirection = jumpDirection as Direction;
		}
		if (script) {
			data.script = script;
		}

		await prisma.tile.update({
			data,
			where: {
				id: tile
			}
		});
	}
};
