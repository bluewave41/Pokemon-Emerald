import { mapNamesSchema } from '$lib/interfaces/MapNames';
import { mapToBuffer } from '$lib/utils/mapToBuffer.js';
import { error, json } from '@sveltejs/kit';
import { z } from 'zod';

export async function GET({ url }) {
	const schema = z.object({
		name: mapNamesSchema
	});

	const result = await schema.safeParseAsync(Object.fromEntries(url.searchParams));
	if (result.error) {
		return error(400, { message: 'Invalid id given.' });
	}

	const { map } = await mapToBuffer(result.data.name);

	return json({
		map: map.toString('base64')
	});
}
