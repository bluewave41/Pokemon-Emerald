import { directions } from '$lib/interfaces/Direction';
import type { Direction } from '@prisma/client';
import type { EntityWith, Game } from '../Game';

function getMapFromDirection(
	loadedMaps: EntityWith<'MapInfo' | 'Direction'>[],
	direction: Direction
) {
	return loadedMaps.find((el) => el.components.Direction === direction)?.components.MapInfo;
}

export async function mapSystem(game: Game) {
	const activeMap = game.getComponent(game.activeMapId, 'MapInfo');
	const connections = game.getComponent(game.activeMapId, 'Connections');

	if (!activeMap) {
		return;
	}

	const loadPromises: Promise<number>[] = [];

	if (connections) {
		for (const direction of directions) {
			const mapName = connections[direction];
			if (mapName && !game.hasMapLoaded(mapName)) {
				const loadMapPromise = game.loadMap(mapName, direction);
				loadPromises.push(loadMapPromise);
			}
		}
	}

	const mapInfo = (await Promise.all(loadPromises)).map((id) => ({
		entityId: id,
		direction: game.getComponent(id, 'Direction')!,
		...game.getComponent(id, 'MapInfo')!
	}));

	if (!mapInfo.length && !game.transitionInProgress) {
		// nothing new was loaded
		return;
	}

	const connectedMaps = game.entitiesWith(['MapInfo', 'Direction']);

	const positions = {
		UP: {
			x: getMapFromDirection(connectedMaps, 'LEFT')?.width ?? 0,
			y: 0
		},
		LEFT: {
			x: 0,
			y: getMapFromDirection(connectedMaps, 'UP')?.height ?? 0
		},
		RIGHT: {
			x: getMapFromDirection(connectedMaps, 'LEFT')?.width ?? 0 + activeMap?.width,
			y: getMapFromDirection(connectedMaps, 'UP')?.height ?? 0
		},
		DOWN: {
			x: getMapFromDirection(connectedMaps, 'LEFT')?.width ?? 0,
			y: getMapFromDirection(connectedMaps, 'UP')?.height ?? 0 + activeMap?.height
		},
		ACTIVE: {
			x: getMapFromDirection(connectedMaps, 'LEFT')?.width ?? 0,
			y: getMapFromDirection(connectedMaps, 'UP')?.height ?? 0
		}
	};

	for (const map of mapInfo) {
		game.setComponent(map.entityId, 'Position', positions[map.direction]);
	}

	// set active map
	game.setComponent(game.activeMapId, 'Position', positions.ACTIVE);

	game.transitionInProgress = false;
}
