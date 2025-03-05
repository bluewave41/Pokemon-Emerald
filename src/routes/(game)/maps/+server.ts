import { mapNamesSchema } from '$lib/interfaces/MapNames';
import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET({ url }) {
	const schema = z.object({
		name: mapNamesSchema
	});

	const result = await schema.safeParseAsync(Object.fromEntries(url.searchParams));
	if (result.error) {
		return error(400, { message: 'Invalid name given.' });
	}

	const map = await fs.readFile(
		path.join(path.resolve('./static/maps'), path.basename(result.data.name) + '.map')
	);

	return json(map.toString('base64'));
}
