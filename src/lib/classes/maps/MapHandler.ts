import axios from 'axios';
import Connections from './Connections';
import { GameMap } from './GameMap';
import { Buffer } from 'buffer';
import SpriteBank from '../SpriteBank';

export class MapHandler {
	up: GameMap | null = null;
	down: GameMap | null = null;
	left: GameMap | null = null;
	right: GameMap | null = null;
	active: GameMap;

	constructor(active: GameMap) {
		this.active = active;
		//this.connect();
	}
	async connect() {
		const connections = Connections[this.active.name];
		if (connections.up) {
			const response = await axios.get(`/maps?name=${connections.up}`);
			console.log(response);
			if (response.status === 200) {
				this.up = GameMap.readMap(Buffer.from(response.data, 'base64'));
				await SpriteBank.readMap(this.up.name, this.up.area, this.up.images);
			}
		}
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
}
