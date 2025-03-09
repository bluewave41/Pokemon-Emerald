import type { SignTile } from '$lib/classes/tiles/SignTile';
import type { Tile } from '$lib/classes/tiles/Tile';
import type { WarpTile } from '$lib/classes/tiles/WarpTile';

export type AnyTile = Tile | SignTile | WarpTile;
