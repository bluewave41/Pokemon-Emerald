import type { Direction } from '@prisma/client';
import type { Position } from './Position';
import type { Sprite } from '../Sprite';
import type { Offset } from './Offset';
import type { MapInfo } from './MapInfo';
import type { TileSprite } from './TileSprite';
import type { MapConnections } from './MapConnections';
import type { Movement } from './Movement';

export interface ComponentTypes {
	Position: Position;
	SubPosition: Position;
	TargetPosition: Position;
	Direction: Direction;
	Movement: Movement;
	Sprite: Sprite;
	Overlay: object;
	Offset: Offset;
	MapInfo: MapInfo;
	Tiles: number[][];
	TileSprite: TileSprite;
	Connections: MapConnections;
	Background: HTMLImageElement;
	Player: object;
	Speed: number;
	Controllable: object;
	Solid: object;
}
