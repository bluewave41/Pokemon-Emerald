import type { PageServerLoad } from './$types';
import { zfd } from 'zod-form-data';
import { fail } from '@sveltejs/kit';
import { removeExtension } from '$lib/utils/removeExtension';
import prisma from '$lib/prisma';
import { Jimp } from 'jimp';

export const load: PageServerLoad = async ({ params }) => {
	const sprites = await prisma.sprites.findMany({
		where: {
			bank: {
				name: params.bank
			}
		}
	});

	return {
		sprites
	};
};

export const actions = {
	add: async ({ request }) => {
		const schema = zfd.formData({
			bank: zfd.text(),
			files: zfd
				.file()
				.or(zfd.file().array())
				.transform((files: File[] | File) => (Array.isArray(files) ? files : [files]))
		});

		const data = await request.formData();

		const result = await schema.safeParseAsync(data);
		if (result.error) {
			console.log(result.error);
			return fail(400);
		}

		const { bank } = result.data;
		const files = await Promise.all(
			result.data.files.map(async (file) => ({
				data: await (await Jimp.read(await file.arrayBuffer())).getBase64('image/png'),
				name: removeExtension(file.name)
			}))
		);

		await prisma.spriteBank.update({
			data: {
				Sprites: {
					create: files
				}
			},
			where: {
				name: bank
			}
		});
	}
};
