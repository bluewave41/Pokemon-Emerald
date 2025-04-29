import type { ComponentTypes } from '$lib/interfaces/components/ComponentTypes';
import type { ScriptEntityReference } from '$lib/interfaces/components/Script';
import type { Warp } from '$lib/interfaces/components/Warp';
import { equals } from '$lib/utils/equals';
import { updateNewPosition } from '$lib/utils/updateNewPosition';
import { Game } from '../Game';

function getEntityId(cacheId: number | undefined, func: ScriptEntityReference | number) {
	const entityId = typeof func === 'function' ? func(cacheId) : func;
	if (!entityId) {
		throw new Error(`Failed to get entity ID.`);
	}
	return entityId;
}

function getTargetWarp(game: Game, warp: Warp) {
	const warpInstance = game
		.entitiesWith(['Warp', 'Position'])
		.find((aWarp) => aWarp.components.Warp.warpId === warp.targetMapId);
	if (!warpInstance) {
		throw new Error('Failed to find linked warp!');
	}
	return warpInstance;
}

export async function scriptSystem(game: Game, deltaTime: number) {
	const scripts = game.entitiesWith(['Script']);
	const ms = deltaTime * 1000;

	for (const scriptInstance of scripts) {
		const script = scriptInstance.components.Script;
		const step = script.steps[script.index];
		if (!script.waiting) {
			if (step.type === 'animate') {
				if (!step.entityId) {
					throw new Error('Failed to get entity to animate.');
				}

				const entityId = getEntityId(script.cacheId, step.entityId);

				const animationOptions = game.getComponent(entityId, 'Animated');
				if (!animationOptions) {
					throw new Error("Can't animate tile with no Animated component.");
				}

				animationOptions.direction = step.direction;
				animationOptions.animating = true;

				if (animationOptions.direction === 'backward') {
					animationOptions.index = animationOptions.sequence.length - 1;
				}

				script.waiting = {
					type: 'animation',
					entityId
				};
			} else if (step.type === 'move') {
				const entityId = getEntityId(script.cacheId, step.entityId);

				const entity = game.getComponents(entityId, [
					'Movement',
					'TargetPosition',
					'Position',
					'Direction'
				]);

				entity.components.Movement.moving = true;
				updateNewPosition(entity.components.Position, step.direction);
				updateNewPosition(entity.components.TargetPosition, step.direction);

				script.waiting = {
					type: 'movement',
					entityId
				};
			} else if (step.type === 'addComponent') {
				const entityId = getEntityId(script.cacheId, step.entityId);
				game.addComponent(entityId, step.component, {});
				script.index++;
			} else if (step.type === 'removeComponent') {
				const entityId = getEntityId(script.cacheId, step.entityId);
				game.removeComponent(entityId, step.component);
				script.index++;
			} else if (step.type === 'fadeOut') {
				const fadeId = game.createEntity();
				game.addComponent(fadeId, 'Fade', { type: 'out', progress: 0, done: false });
				script.waiting = {
					type: 'fade',
					entityId: fadeId
				};
			} else if (step.type === 'fadeIn') {
				const fades = game.entitiesWith(['Fade']);
				game.deleteEntity(fades[0].id);

				const fadeId = game.createEntity();
				game.addComponent(fadeId, 'Fade', { type: 'in', progress: 1, done: false });
				script.waiting = {
					type: 'fade',
					entityId: fadeId
				};
			} else if (step.type === 'sleep') {
				script.waiting = {
					type: 'sleep',
					time: step.time,
					count: 0
				};
			} else if (step.type === 'loadWarp') {
				const [player] = game.entitiesWith(['Player', 'Position', 'SubPosition', 'TargetPosition']);

				game.unloadAllMaps();

				// no direction to make it active
				game.createMap(await game.loadMapById(step.warp.targetMapId));

				const warpInstance = getTargetWarp(game, step.warp);

				const warp = warpInstance.components.Position;

				game.updatePositions(player, { type: 'grid', x: warp?.x, y: warp?.y });
				game.removeComponent(player.id, 'Hidden');

				game.transitionInProgress = true;
				script.index++;
			} else if (step.type === 'patchComponent') {
				const entityId = getEntityId(script.cacheId, step.entityId);
				for (const key in step.patches) {
					const componentKey = key as keyof ComponentTypes;
					const component = game.getComponent(entityId, componentKey);
					if (typeof component === 'object' && component.constructor == Object) {
						Object.assign(
							component,
							step.patches[componentKey](component, game.getAllComponents(entityId))
						);
					} else {
						game.setComponent(
							entityId,
							componentKey,
							step.patches[componentKey](component, game.getAllComponents(entityId))
						);
					}
				}

				script.index++;
			} else if (step.type === 'setWarpPosition') {
				const warp = game
					.entitiesWith(['Warp', 'Position'])
					.find((warp) => warp.components.Warp.warpId === step.warp.components.Warp.targetWarpId);
				if (!warp) {
					throw new Error(`Couldn't find warp!`);
				}
				const warpEntity = warp;
				const { x, y } = warpEntity.components.Position;
				const entityId = getEntityId(script.cacheId, step.entityId);
				game.setComponent(entityId, 'Position', { type: 'grid', x, y: y - 1 });
				game.setComponent(entityId, 'SubPosition', {
					type: 'pixel',
					x: x * Game.getAdjustedTileSize(),
					y: (y - 1) * Game.getAdjustedTileSize()
				});
				game.setComponent(entityId, 'TargetPosition', {
					type: 'pixel',
					x: x * Game.getAdjustedTileSize(),
					y: (y - 1) * Game.getAdjustedTileSize()
				});

				script.cacheId = warp.id;

				script.index++;
			}
		} else {
			if (script.waiting.type === 'animation') {
				const targetEntity = game.getComponent(script.waiting.entityId, 'Animated');
				if (!targetEntity?.animating) {
					script.index++;
					script.waiting = undefined;
				}
			} else if (script.waiting.type === 'movement') {
				const targetPos = game.getComponent(script.waiting.entityId, 'TargetPosition');
				const subPos = game.getComponent(script.waiting.entityId, 'SubPosition');

				if (equals(targetPos, subPos)) {
					script.index++;
					script.waiting = undefined;
				}
			} else if (script.waiting.type === 'fade') {
				const fade = game.getComponent(script.waiting.entityId, 'Fade');
				if (fade?.done) {
					script.index++;

					if (fade.type === 'in') {
						game.deleteEntity(script.waiting.entityId);
					}

					script.waiting = undefined;
				}
			} else if (script.waiting.type === 'sleep') {
				script.waiting.count += ms;
				if (script.waiting.count > script.waiting.time) {
					script.index++;
					script.waiting = undefined;
				}
			}
		}
		if (script.index >= script.steps.length) {
			game.deleteEntity(scriptInstance.id);
			game.unfreeze();
		}
	}
}
