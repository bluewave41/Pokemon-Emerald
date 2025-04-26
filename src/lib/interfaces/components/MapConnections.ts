import type { MapNames } from '../MapNames';

export interface Connections {
	UP?: MapNames | null;
	LEFT?: MapNames | null;
	RIGHT?: MapNames | null;
	DOWN?: MapNames | null;
}

export type MapConnections = Connections | null;
