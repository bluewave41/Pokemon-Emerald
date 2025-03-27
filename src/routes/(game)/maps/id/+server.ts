import { type MapNames } from '$lib/interfaces/MapNames';
import prisma from '$lib/prisma.js';
import { mapToBuffer } from '$lib/utils/mapToBuffer.js';
import { error, json } from '@sveltejs/kit';
import { z } from 'zod';

export async function GET({ url }) {
	const schema = z.object({
		id: z.string()
	});

	const result = await schema.safeParseAsync(Object.fromEntries(url.searchParams));
	if (result.error) {
		return error(400, { message: 'Invalid id given.' });
	}

	const name = (
		await prisma.map.findFirst({
			select: { name: true },
			where: {
				id: parseInt(result.data.id)
			}
		})
	)?.name as MapNames;

	if (!name) {
		throw new Error('Invalid id given.');
	}

	const { map } = await mapToBuffer(name);

	return json({
		map: map.toString('base64')
	});
}
