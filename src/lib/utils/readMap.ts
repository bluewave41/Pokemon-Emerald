import { BufferHelper } from '$lib/BufferHelper';
import type { BankNames } from '$lib/interfaces/BankNames';
import type { EntityInfo } from '$lib/interfaces/EntityInfo';
import type { MapNames } from '$lib/interfaces/MapNames';
import type { ScriptInfo } from '$lib/interfaces/ScriptInfo';
import type { SignInfo } from '$lib/interfaces/SignInfo';
import type { TileInfo } from '$lib/interfaces/TileInfo';
import type { WarpInfo } from '$lib/interfaces/WarpInfo';

export type MapInfo = ReturnType<typeof readMap>;

export function readMap(mapBuffer: Buffer) {
	const buffer = new BufferHelper(mapBuffer);

	buffer.readByte(); // version
	const id = buffer.readByte();
	const name = buffer.readString() as MapNames;
	const width = buffer.readByte();
	const height = buffer.readByte();
	const backgroundId = buffer.readByte();

	const tiles: TileInfo[][] = [];

	for (let y = 0; y < height; y++) {
		const row: TileInfo[] = [];
		for (let x = 0; x < width; x++) {
			row.push({
				x,
				y,
				id: buffer.readByte(),
				properties: buffer.readByte(),
				script: buffer.readBoolean() === true ? buffer.readString() : null,
				activatedAnimation: buffer.readBoolean(),
				repeatingAnimation: buffer.readBoolean()
			});

			// do something with background tile
		}
		tiles.push(row);
	}

	const signs: SignInfo[] = [];
	const warps: WarpInfo[] = [];

	const numOfEvents = buffer.readByte();
	for (let i = 0; i < numOfEvents; i++) {
		const eventId = buffer.readEventId();
		const x = buffer.readByte();
		const y = buffer.readByte();
		switch (eventId) {
			case 'sign':
				signs.push({ x, y, text: buffer.readString() });
				break;
			case 'warp':
				warps.push({
					x,
					y,
					warpId: buffer.readByte(),
					activateDirection: buffer.readDirection(),
					targetMapId: buffer.readShort(),
					targetWarpId: buffer.readByte(),
					warpType: buffer.readWarpType()
				});
				break;
		}
	}

	const numOfScripts = buffer.readByte();
	const scripts: ScriptInfo[] = [];

	for (let i = 0; i < numOfScripts; i++) {
		const hasCoordinates = buffer.readBoolean();
		scripts.push({
			mapId: buffer.readByte(),
			name: buffer.readString(),
			condition: buffer.readString(),
			setup: buffer.readString(),
			script: buffer.readString(),
			x: hasCoordinates ? buffer.readByte() : null,
			y: hasCoordinates ? buffer.readByte() : null
		});
	}

	const numOfEntities = buffer.readByte();
	const entities: EntityInfo[] = [];

	for (let i = 0; i < numOfEntities; i++) {
		entities.push({
			id: buffer.readString(),
			bankId: buffer.readString() as BankNames,
			x: buffer.readByte(),
			y: buffer.readByte(),
			script: buffer.readString()
		});
	}

	return {
		id,
		name,
		width,
		height,
		tiles,
		backgroundId,
		scripts,
		entities
	};
}
