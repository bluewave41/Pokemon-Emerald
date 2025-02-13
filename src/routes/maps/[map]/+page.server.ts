import path from 'path';
import type { PageServerLoad } from './$types';
import { promises as fs } from 'fs';

export const load: PageServerLoad = async ({ params }) => {
	const map = await fs.readFile(
		path.join(path.resolve('./static/maps'), path.basename(params.map) + '.map')
	);

	return {
		map
	};
};
