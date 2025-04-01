import axios from 'axios';
import Connections from './Connections';
import { GameMap } from './GameMap';
import { Buffer } from 'buffer';
import type { MapNames } from '$lib/interfaces/MapNames';
import type { Direction } from '@prisma/client';

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
			this.up = await this.fetchMapByName(connections.UP);
		}
		if (connections.LEFT) {
			this.left = await this.fetchMapByName(connections.LEFT);
		}
		if (connections.DOWN) {
			this.down = await this.fetchMapByName(connections.DOWN);
		}
	}
	async fetchMapById(id: number) {
		const response = await axios.get(`/maps/id?id=${id}`);
		if (response.status === 200) {
			return GameMap.readMap(Buffer.from(response.data.map, 'base64'));
		}
		throw new Error(`Failed to get map with ID: ${id}`);
	}
	async fetchMapByName(name: MapNames) {
		const response = await axios.get(`/maps/name?name=${name}`);
		if (response.status === 200) {
			return GameMap.readMap(Buffer.from(response.data.map, 'base64'));
		}
		return null;
	}
	handleWarpTo(map: GameMap) {
		this.active = map;
		this.up = null;
		this.left = null;
		this.right = null;
		this.down = null;
		this.connect();
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
	hasMap(direction: Direction) {
		switch (direction) {
			case 'UP':
				return this.up !== null;
			case 'LEFT':
				return this.left !== null;
			case 'RIGHT':
				return this.right !== null;
			case 'DOWN':
				return this.down !== null;
		}
	}
}
