import type { EditorWarpProps } from '$lib/classes/tiles/Warp';
import { z } from 'zod';

export type TileEvents = 'none' | 'sign' | 'warp';
export type MapEvents = EditorWarpProps;
export const tileEventKindSchema = z.union([
	z.literal('none'),
	z.literal('sign'),
	z.literal('warp')
]);
