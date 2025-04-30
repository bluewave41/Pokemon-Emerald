<script lang="ts">
	import { page } from '$app/state';
	import { Canvas } from '$lib/classes/Canvas.js';
	import { Game, type EntityWith } from '$lib/classes/Game.js';
	import GameEvent from '$lib/classes/GameEvent.js';
	import KeyHandler from '$lib/classes/KeyHandler.js';
	import SpriteBank from '$lib/classes/SpriteBank.js';
	import { readMap, type MapInfo } from '$lib/utils/readMap.js';
	import { Buffer } from 'buffer';

	let { data } = $props();
	let canvasRef: HTMLCanvasElement;
	let game: Game | null = $state(null);
	let status = $state(0);
	let scripts: EntityWith<'ScriptInfo'>[] = [];

	GameEvent.attach('rerender', () => {
		status++;
		scripts = game!.entitiesWith(['ScriptInfo']);
	});

	async function init() {
		if (canvasRef) {
			const canvas = new Canvas(canvasRef);

			const gameInfo: MapInfo = readMap(Buffer.from(data.map, 'base64'));

			await SpriteBank.readMap(data.images);

			await SpriteBank.readBank('player', data.player);
			await SpriteBank.readBank('mom', data.mom);
			await SpriteBank.readBank('npc-fat', data.npc);
			await SpriteBank.readBank('utility', data.utility);
			await SpriteBank.readBank('misc', data.misc);
			await SpriteBank.readBank('vigoroth', data.vigoroth);

			game = new Game(canvas, gameInfo);

			GameEvent.dispatchEvent(new CustomEvent('rerender'));

			const render = async (frameTime: number) => {
				await game!.tick(frameTime);
				window.requestAnimationFrame(render);
			};
			render(0);
		}
	}

	$effect(() => {
		init();
	});

	const onKeyDown = (e: KeyboardEvent) => {
		KeyHandler.keyDown(e.key);
	};

	const onKeyUp = (e: KeyboardEvent) => {
		KeyHandler.keyUp(e.key);
	};
</script>

<h1>{page.params.map}</h1>

<div role="presentation" class="container" onkeydown={onKeyDown} onkeyup={onKeyUp} tabIndex={1}>
	<canvas bind:this={canvasRef}></canvas>
</div>

<input
	type="text"
	class="console"
	onkeydown={(e) => {
		const input = e.target as HTMLInputElement;
		if (e.key === 'Enter') {
			try {
				game?.executeScript(
					{
						name: 'console',
						mapId: game.mapHandler.active.id,
						condition: 'true',
						setup: '',
						script: input.value,
						x: null,
						y: null
					},
					'script'
				);
			} catch (e) {
				console.log(e);
			} finally {
				input.value = '';
			}
		}
	}}
/>

{#key status}
	{#if game}
		{#each scripts as script}
			<button
				onclick={() => {
					game?.addComponent(game.createEntity(), 'Script', {
						index: 0,
						cache: {},
						simpleCache: undefined,
						steps: new Function(`return ${script.components.ScriptInfo.setup}`).call(game),
						waiting: undefined
					});
					//game?.executeScript(script.components.ScriptInfo.setup, 'setup');
					//game?.executeScript(script.components.ScriptInfo.script, 'script');
				}}
			>
				{script.components.ScriptInfo.name}
			</button>
		{/each}
	{/if}
{/key}

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		position: relative;
		height: 100%;
	}
	.console {
		width: 100%;
		position: absolute;
		bottom: 0;
	}
</style>
