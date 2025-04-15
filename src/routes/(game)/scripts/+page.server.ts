import type { PageServerLoad } from './$types.js';
import prisma from '$lib/prisma.js';
import { zfd } from 'zod-form-data';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const maps = await prisma.map.findMany({
		select: {
			id: true,
			name: true,
			Scripts: true
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
			mapId: zfd.numeric(),
			name: zfd.text()
		});
		const fd = await request.formData();

		const result = await schema.safeParseAsync(fd);
		if (result.error) {
			return fail(400);
		}

		const { mapId, name } = result.data;

		await prisma.script.create({
			data: {
				mapId,
				name
			}
		});
	}
};
