import axios from 'axios';
import Connections from './Connections';
import { GameMap } from './GameMap';
import { Buffer } from 'buffer';

export class MapHandler {
	up: GameMap | null = null;
	down: GameMap | null = null;
	left: GameMap | null = null;
	right: GameMap | null = null;
	active: GameMap;

	constructor(active: GameMap) {
		this.active = active;
		this.connect();
	}
	async connect() {
		const connections = Connections[this.active.name];
		if (connections.UP) {
			this.up = await this.setMap(connections.UP);
		}
		if (connections.LEFT) {
			this.left = await this.setMap(connections.LEFT);
		}
		if (connections.DOWN) {
			this.down = await this.setMap(connections.DOWN);
		}
	}
	async setMap(name: string) {
		const response = await axios.get(`/maps?name=${name}`);
		if (response.status === 200) {
			return GameMap.readMap(Buffer.from(response.data.map, 'base64'));
		}
		return null;
	}
	setActive(map: GameMap) {
		this.active = map;
	}
	setUp(map: GameMap) {
		this.up = map;
	}
	setDown(map: GameMap) {
		this.down = map;
	}
	setLeft(map: GameMap) {
		this.left = map;
	}
	setRight(map: GameMap) {
		this.right = map;
	}
}
