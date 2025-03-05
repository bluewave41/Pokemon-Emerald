import { BufferHelper } from '$lib/BufferHelper';
import type { MapNames } from '$lib/interfaces/MapNames';
import prisma from '$lib/prisma';

export const mapToBuffer = async (name: MapNames) => {
	const map = await prisma.maps.findFirst({
		include: {
			MapTile: {
				include: { tile: true },
				orderBy: { id: 'asc' }
			}
		},
		where: {
			name
		}
	});

	if (!map) {
		return null;
	}

	const uniqueTiles = await prisma.mapTiles.findMany({
		distinct: ['tileId'],
		select: {
			tileId: true,
			tile: {
				select: {
					data: true
				}
			}
		},
		orderBy: { id: 'asc' },
		where: { mapId: map.id }
	});

	const buffer = new BufferHelper(Buffer.alloc(30000));
	buffer.writeByte(1);
	buffer.writeString(map.name);
	buffer.writeByte(map.width);
	buffer.writeByte(map.height);
	buffer.writeByte(map.backgroundTileId ?? 1);
	buffer.writeShort(uniqueTiles.length);

	// write image data
	for (const { tile } of uniqueTiles) {
		buffer.writeString(tile.data);
	}

	//write map data
	for (const tile of map.MapTile) {
		buffer.writeByte(tile.tileId);
		buffer.writeByte(tile.permissions);
	}

	return buffer.getUsed();
};
