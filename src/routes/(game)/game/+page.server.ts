import { BufferHelper } from '$lib/BufferHelper';
import prisma from '$lib/prisma';
import { mapToBuffer } from '$lib/utils/mapToBuffer';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const { map } = await mapToBuffer('littleroot');

	const player = await prisma.sprites.findMany({
		where: {
			bank: {
				name: 'player'
			}
		}
	});

	const playerBuffer = new BufferHelper(Buffer.alloc(10000));
	playerBuffer.writeByte(player.length);
	for (const image of player) {
		playerBuffer.writeString(image.name);
		playerBuffer.writeString(image.data);
	}

	return {
		map: map.toString('base64'),
		player: playerBuffer.getUsed().toString('base64')
	};
};
