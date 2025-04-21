import { BufferHelper } from '$lib/BufferHelper';
import prisma from '$lib/prisma';

export const load = async () => {
	const images = await prisma.mapTile.findMany({
		distinct: ['tileId'],
		select: {
			tileId: true,
			Tile: {
				select: {
					overlay: true,
					original: true,
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
	});

	const imageBuffer = new BufferHelper(Buffer.alloc(100000));

	imageBuffer.writeShort(images.length);

	for (const tile of images) {
		imageBuffer.writeShort(tile.tileId);
		imageBuffer.writeString(tile.Tile.original);
		imageBuffer.writeBoolean(tile.Tile.animated);
		if (tile.Tile.animated && tile.Tile.delay) {
			imageBuffer.writeShort(tile.Tile.delay);
			imageBuffer.writeByte(tile.Tile.sequence.length);
			for (const sequence of tile.Tile.sequence) {
				imageBuffer.writeByte(sequence);
			}
			imageBuffer.writeByte(tile.Tile.TileFrame.length);
			for (const frame of tile.Tile.TileFrame) {
				imageBuffer.writeString(frame.data);
			}
		}
	}

	return {
		images: imageBuffer.getUsed().toString('base64')
	};
};
