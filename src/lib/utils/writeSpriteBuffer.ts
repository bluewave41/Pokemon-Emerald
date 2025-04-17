import { BufferHelper } from '$lib/BufferHelper';
import type { BankNames } from '$lib/interfaces/BankNames';
import prisma from '$lib/prisma';

export const writeSpriteBuffer = async (bank: BankNames) => {
	const sprites = await prisma.sprite.findMany({
		where: {
			Bank: {
				name: bank
			}
		}
	});

	const buffer = new BufferHelper(Buffer.alloc(20000));
	buffer.writeByte(sprites.length);
	for (const image of sprites) {
		buffer.writeString(image.name);
		buffer.writeString(image.data);
	}

	return buffer.getUsed();
};
