import type { GameMap } from '../maps/GameMap';
import { Entity } from './Entity';

export class Sprite extends Entity {
	constructor(x: number, y: number, map: GameMap) {
		super(x, y, map);
	}
}
