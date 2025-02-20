import type { GameMap } from './GameMap';

export class MapHandler {
	up: GameMap | null = null;
	down: GameMap | null = null;
	left: GameMap | null = null;
	right: GameMap | null = null;
	active: GameMap;

	constructor(active: GameMap) {
		this.active = active;
	}
	setUp(map: GameMap) {
		this.up = map;
	}
}
