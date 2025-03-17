import { BufferHelper } from '$lib/BufferHelper';
import prisma from '$lib/prisma';

export const load = async () => {
	const images = await prisma.mapTile.findMany({
		distinct: ['tileId'],
		select: {
			tileId: true,
			tile: {
				select: {
					overlay: true,
					data: true,
					animated: true,
					sequence: true,
					delay: true,
					TileFrame: {
						select: {
							id: true,
							data: true
						}
					}
				}
			}
		},
		orderBy: { id: 'asc' }
		//where: { mapId: map.id }
	});

	const imageBuffer = new BufferHelper(Buffer.alloc(50000));

	imageBuffer.writeShort(images.length);

	for (const tile of images) {
		imageBuffer.writeShort(tile.tileId);
		imageBuffer.writeString(tile.tile.data);
		imageBuffer.writeBoolean(tile.tile.animated);
		if (tile.tile.animated && tile.tile.delay) {
			imageBuffer.writeShort(tile.tile.delay);
			imageBuffer.writeByte(tile.tile.sequence.length);
			for (const sequence of tile.tile.sequence) {
				imageBuffer.writeByte(sequence);
			}
			imageBuffer.writeByte(tile.tile.TileFrame.length);
			for (const frame of tile.tile.TileFrame) {
				imageBuffer.writeString(frame.data);
			}
		}
	}

	return {
		images: imageBuffer.getUsed().toString('base64')
	};
};
