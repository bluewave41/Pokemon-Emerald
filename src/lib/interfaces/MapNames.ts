import { z } from 'zod';
import type { BankNames } from './BankNames';

export type MapNames =
	| 'littleroot'
	| 'route101'
	| 'oldale'
	| 'route102'
	| 'player-house'
	| 'player-house-upstairs'
	| 'rival-house';

export const mapNamesSchema = z.enum([
	'littleroot',
	'route101',
	'oldale',
	'route102',
	'player-house',
	'player-house-upstairs',
	'rival-house'
]);

// player will always be loaded
interface Resource {
	connections: {
		UP: MapNames | null;
		LEFT: MapNames | null;
		RIGHT: MapNames | null;
		DOWN: MapNames | null;
	} | null;
	sprites: BankNames[];
}

export const GameMapResources: Record<MapNames, Resource> = {
	littleroot: {
		connections: {
			UP: 'route101',
			LEFT: null,
			RIGHT: null,
			DOWN: null
		},
		sprites: ['npc-fat', 'mom']
	},
	route101: {
		connections: {
			UP: 'oldale',
			LEFT: null,
			RIGHT: null,
			DOWN: 'littleroot'
		},
		sprites: []
	},
	oldale: {
		connections: {
			UP: null,
			LEFT: 'route102',
			RIGHT: null,
			DOWN: 'route101'
		},
		sprites: []
	},
	route102: {
		connections: {
			UP: null,
			LEFT: null,
			RIGHT: 'oldale',
			DOWN: null
		},
		sprites: []
	},
	'player-house': {
		connections: null,
		sprites: []
	},
	'player-house-upstairs': {
		connections: null,
		sprites: []
	},
	'rival-house': {
		connections: null,
		sprites: []
	}
};
