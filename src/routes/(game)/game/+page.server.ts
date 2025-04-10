import { BufferHelper } from '$lib/BufferHelper';
import prisma from '$lib/prisma';
import { mapToBuffer } from '$lib/utils/mapToBuffer';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const { map } = await mapToBuffer('littleroot');

	const player = await prisma.sprite.findMany({
		where: {
			bank: {
				name: 'player'
			}
		}
	});

	const npc = await prisma.sprite.findMany({
		where: {
			bank: {
				name: 'npc-fat'
			}
		}
	});

	const utility = await prisma.sprite.findMany({
		where: {
			bank: {
				name: 'utility'
			}
		}
	});

	const playerBuffer = new BufferHelper(Buffer.alloc(10000));
	playerBuffer.writeByte(player.length);
	for (const image of player) {
		playerBuffer.writeString(image.name);
		playerBuffer.writeString(image.data);
	}

	const npcBuffer = new BufferHelper(Buffer.alloc(20000));
	npcBuffer.writeByte(npc.length);
	for (const image of npc) {
		npcBuffer.writeString(image.name);
		npcBuffer.writeString(image.data);
	}

	const utilityBuffer = new BufferHelper(Buffer.alloc(20000));
	utilityBuffer.writeByte(utility.length);
	for (const image of utility) {
		utilityBuffer.writeString(image.name);
		utilityBuffer.writeString(image.data);
	}

	return {
		map: map.toString('base64'),
		player: playerBuffer.getUsed().toString('base64'),
		npc: npcBuffer.getUsed().toString('base64'),
		utility: utilityBuffer.getUsed().toString('base64')
	};
};
