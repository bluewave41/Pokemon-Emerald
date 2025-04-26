import { directions } from '$lib/interfaces/Direction';
import type { Direction } from '@prisma/client';
import type { Game } from '../Game';
import type { MapInfo } from '$lib/interfaces/components/MapInfo';

interface MapSystemMap extends MapInfo {
	entityId: number;
	direction: Direction;
}

function getMapFromDirection(maps: MapSystemMap[], direction: Direction) {
	return maps.find((el) => el.direction === direction);
}

export async function mapSystem(game: Game) {
	const connections = game.getComponent(game.activeMapId, 'Connections');
	if (!connections) {
		return;
	}

	const loadPromises: Promise<number>[] = [];

	for (const direction of directions) {
		const mapName = connections[direction];
		if (mapName && !game.hasMapLoaded(mapName)) {
			const loadMapPromise = game.loadMap(mapName, direction);
			loadPromises.push(loadMapPromise);
		}
	}

	const mapInfo = (await Promise.all(loadPromises)).map((id) => ({
		entityId: id,
		direction: game.getComponent(id, 'Direction')!,
		...game.getComponent(id, 'MapInfo')!
	}));

	if (!mapInfo.length) {
		// nothing new was loaded
		return;
	}

	const positions = {
		UP: {
			x: getMapFromDirection(mapInfo, 'LEFT')?.width ?? 0,
			y: 0
		},
		ACTIVE: {
			x: getMapFromDirection(mapInfo, 'LEFT')?.width ?? 0,
			y: getMapFromDirection(mapInfo, 'UP')?.height ?? 0
		}
	};

	for (const map of mapInfo) {
		if (map.direction === 'UP') {
			game.setComponent(map.entityId, 'Position', positions.UP);
		}
	}

	// set active map
	game.setComponent(game.activeMapId, 'Position', positions.ACTIVE);
}
