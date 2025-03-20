import type { Direction } from '$lib/interfaces/Direction';
import type { MapNames } from '$lib/interfaces/MapNames';

const Connections: Record<MapNames, Record<Direction, MapNames | null>> = {
	littleroot: {
		up: 'route101',
		down: null,
		left: null,
		right: null
	},
	route101: {
		up: 'oldale',
		down: 'littleroot',
		left: null,
		right: null
	},
	oldale: {
		up: null,
		down: 'route101',
		left: 'route102',
		right: null
	},
	route102: {
		up: null,
		down: null,
		left: null,
		right: 'oldale'
	}
};

export default Connections;
