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
				include: { Sign: true, Warp: true }
			},
			Scripts: true
		},
		where: {
			name
		}
	});

	if (!map) {
		throw new Error('Map was null');
	}

	const buffer = new BufferHelper(Buffer.alloc(100000));
	buffer.writeByte(1);
	buffer.writeByte(map.id);
	buffer.writeString(map.name);
	buffer.writeByte(map.width);
	buffer.writeByte(map.height);
	buffer.writeByte(map.backgroundTileId ?? 1);

	//write map data
	for (const tile of map.MapTile) {
		buffer.writeByte(tile.tileId);
		buffer.writeBoolean(tile.tile.overlay);
		buffer.writeByte(tile.permissions);
		buffer.writeDirection(tile.tile.jumpDirection);
		buffer.writeBoolean(tile.tile.activatedAnimation ?? false);
	}

	buffer.writeByte(map.Events.length);
	for (const event of map.Events) {
		buffer.writeEventId(event.type);
		buffer.writeByte(event.x);
		buffer.writeByte(event.y);
		switch (event.type) {
			case 'SIGN':
				buffer.writeString(event.Sign?.text ?? '');
				break;
			case 'WARP':
				if (!event.Warp || !event.Warp.mapId || !event.Warp.warpId) {
					throw new Error(`Invalid warp found with ID ${event.id}`);
				}
				buffer.writeByte(event.Warp.warpId);
				buffer.writeDirection(event.Warp?.direction);
				buffer.writeShort(event.Warp?.mapId);
				buffer.writeByte(event.Warp?.warpId);
				buffer.writeWarpType(event.Warp.type);
				break;
		}
	}

	buffer.writeByte(map.Scripts.length);
	for (const script of map.Scripts) {
		buffer.writeBoolean(script.x !== null && script.y !== null);
		buffer.writeByte(script.mapId);
		buffer.writeString(script.name);
		buffer.writeString(script.script);
		if (script.x && script.y) {
			buffer.writeByte(script.x);
			buffer.writeByte(script.y);
		}
	}

	return {
		map: buffer.getUsed()
	};
};
