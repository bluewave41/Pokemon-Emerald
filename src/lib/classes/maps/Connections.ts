import type { MapNames } from '$lib/interfaces/MapNames';
import type { Direction } from '@prisma/client';

const Connections: Record<MapNames, Record<Direction, MapNames | null>> = {
	littleroot: {
		UP: 'route101',
		DOWN: null,
		LEFT: null,
		RIGHT: null
	},
	route101: {
		UP: 'oldale',
		DOWN: 'littleroot',
		LEFT: null,
		RIGHT: null
	},
	oldale: {
		UP: null,
		DOWN: 'route101',
		LEFT: 'route102',
		RIGHT: null
	},
	route102: {
		UP: null,
		DOWN: null,
		LEFT: null,
		RIGHT: 'oldale'
	},
	'player-house': {
		UP: null,
		DOWN: null,
		LEFT: null,
		RIGHT: null
	}
};

export default Connections;
