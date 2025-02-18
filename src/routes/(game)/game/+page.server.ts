import type { PageServerLoad } from './$types';
import { promises as fs } from 'fs';

export const load: PageServerLoad = async () => {
	const map = await fs.readFile('./static/maps/littleroot.map');
	const player = await fs.readFile('./static/sprites/player.bank');

	return {
		map: map.toString('base64'),
		player: player.toString('base64')
	};
};
