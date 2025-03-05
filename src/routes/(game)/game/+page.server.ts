import { mapToBuffer } from '$lib/utils/mapToBuffer';
import type { PageServerLoad } from './$types';
import { promises as fs } from 'fs';

export const load: PageServerLoad = async () => {
	const player = await fs.readFile('./static/sprites/player.bank');

	const map = await mapToBuffer('littleroot');
	if (!map) {
		throw new Error('Invalid map name');
	}

	return {
		map: map.toString('base64'),
		player: player.toString('base64')
	};
};
