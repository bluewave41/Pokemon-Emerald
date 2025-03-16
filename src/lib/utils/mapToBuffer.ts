import { BufferHelper } from '$lib/BufferHelper';
import type { MapNames } from '$lib/interfaces/MapNames';
import prisma from '$lib/prisma';

export const mapToBuffer = async (name: MapNames) => {
	const map = await prisma.map.findFirst({
		include: {
			MapTile: {
				include: { tile: true },
				orderBy: { id: 'asc' }
			},
			Events: {
				include: { sign: true }
			}
		},
		where: {
			name
		}
	});

	if (!map) {
		throw new Error('Map was null');
	}

	const buffer = new BufferHelper(Buffer.alloc(50000));
	buffer.writeByte(1);
	buffer.writeString(map.name);
	buffer.writeByte(map.width);
	buffer.writeByte(map.height);
	buffer.writeByte(map.backgroundTileId ?? 1);

	//write map data
	for (const tile of map.MapTile) {
		buffer.writeByte(tile.tileId);
		buffer.writeBoolean(tile.tile.overlay);
		buffer.writeByte(tile.permissions);
	}

	for (const event of map.Events) {
		buffer.writeEventId(event.type);
		buffer.writeByte(event.x);
		buffer.writeByte(event.y);
		buffer.writeString(event.sign?.text ?? '');
	}

	return {
		map: buffer.getUsed()
	};
};
