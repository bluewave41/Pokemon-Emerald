import type { Direction } from '@prisma/client';
import type { Sprite } from '../Sprite';
import type { Offset } from './Offset';
import type { MapInfo } from './MapInfo';
import type { MapConnections } from './MapConnections';
import type { Movement } from './Movement';
import type { Animated } from './Animated';
import type { Script } from './Script';
import type { Warp } from './Warp';
import type { PixelPosition } from './PixelPosition';
import type { GridPosition } from './GridPosition';
import type { Fade } from './Fade';

export interface ComponentTypes {
	Position: GridPosition;
	SubPosition: PixelPosition;
	TargetPosition: PixelPosition;
	Direction: Direction;
	Movement: Movement;
	Sprite: Sprite;
	Overlay: object;
	Offset: Offset;
	MapInfo: MapInfo;
	Tiles: number[][];
	TileSprite: HTMLImageElement;
	Connections: MapConnections;
	Background: HTMLImageElement;
	Player: object;
	Speed: number;
	Controllable: object;
	Solid: object;
	Animated: Animated;
	Timer: number;
	Script: Script;
	Warp: Warp;
	Hidden: boolean;
	Fade: Fade;
}
