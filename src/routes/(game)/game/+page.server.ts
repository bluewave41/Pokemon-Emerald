import { mapToBuffer } from '$lib/utils/mapToBuffer';
import { writeSpriteBuffer } from '$lib/utils/writeSpriteBuffer';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const { map } = await mapToBuffer('littleroot');

	const player = await writeSpriteBuffer('player');
	const npcFat = await writeSpriteBuffer('npc-fat');
	const mom = await writeSpriteBuffer('mom');
	const utility = await writeSpriteBuffer('utility');
	const misc = await writeSpriteBuffer('misc');
	const vigoroth = await writeSpriteBuffer('vigoroth');

	return {
		map: map.toString('base64'),
		player: player.toString('base64'),
		mom: mom.toString('base64'),
		npc: npcFat.toString('base64'),
		utility: utility.toString('base64'),
		misc: misc.toString('base64'),
		vigoroth: vigoroth.toString('base64')
	};
};
