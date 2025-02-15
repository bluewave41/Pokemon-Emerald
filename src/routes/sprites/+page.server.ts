import { fail } from '@sveltejs/kit';
import { zfd } from 'zod-form-data';
import { promises as fs } from 'fs';
import type { PageServerLoad } from './$types.js';
import { removeExtension } from '$lib/utils/removeExtension.js';

export const load: PageServerLoad = async () => {
	const sprites = (await fs.readdir('./static/sprites')).map(removeExtension);

	return {
		sprites
	};
};

export const actions = {
	create: async ({ request }) => {
		const schema = zfd.formData({
			bank: zfd.text()
		});

		const result = await schema.safeParseAsync(await request.formData());
		if (result.error) {
			return fail(400);
		}

		const { bank } = result.data;

		await fs.writeFile(`./static/sprites/${bank}.bank`, Buffer.alloc(1).fill(0));
	}
};
