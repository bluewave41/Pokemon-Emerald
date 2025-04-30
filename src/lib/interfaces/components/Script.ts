import type { Direction } from '@prisma/client';
import type { ComponentTypes } from './ComponentTypes';
import type { Warp } from './Warp';
import type { EntityWith } from '$lib/classes/Game';
import type { BankNames } from '../BankNames';

export type Script = {
	index: number;
	steps: ScriptStep[];
	simpleCache: number | undefined;
	cache: { [key: string]: any };
	waiting:
		| {
				type: 'animation' | 'movement' | 'fade';
				entityId: number;
		  }
		| { type: 'sleep'; time: number; count: number }
		| undefined;
};

export type ScriptEntityReference = number | ((cache: number | undefined) => number | undefined);

export type ScriptStep =
	| { type: 'animate'; entityId: ScriptEntityReference; direction: 'forward' | 'backward' }
	| { type: 'setPosition'; entityId: ScriptEntityReference; x: number; y: number }
	| { type: 'setAnimationIndex'; index: number }
	| { type: 'move'; entityId: ScriptEntityReference; direction: Direction }
	| { type: 'jump'; entityId: ScriptEntityReference; direction: Direction }
	| {
			type: 'addComponent';
			entityId: ScriptEntityReference;
			component: keyof ComponentTypes;
			properties: ComponentTypes[keyof ComponentTypes];
	  }
	| {
			type: 'removeComponent';
			entityId: ScriptEntityReference;
			component: keyof ComponentTypes;
	  }
	| {
			type: 'patchComponent';
			entityId: ScriptEntityReference;
			patches: {
				[K in keyof ComponentTypes]?: (
					comp: ComponentTypes[K],
					components: { [K in keyof ComponentTypes]: ComponentTypes[K] }
				) => Partial<ComponentTypes[K]>;
			};
	  }
	| {
			type: 'setWarpPosition';
			entityId: ScriptEntityReference;
			warp: EntityWith<'Warp' | 'Position'>;
	  }
	| { type: 'fadeOut' }
	| { type: 'fadeIn' }
	| { type: 'sleep'; time: number }
	| { type: 'loadWarp'; warp: Warp }
	| { type: 'checkFlag'; flag: number }
	| { type: 'createObject'; bank: BankNames; sprite: string; x: number; y: number };
