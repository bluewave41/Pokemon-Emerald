<script lang="ts">
	import { page } from '$app/state';
	import { Game } from '$lib/classes/Game.js';

	let { data } = $props();
	let canvasRef: HTMLCanvasElement;
	let topCanvasRef: HTMLCanvasElement;
	let game: Game;
	let selectedColor = $state(0);

	const colorTable: Record<number, string> = {
		0: 'blue',
		1: 'red',
		2: 'green'
	};

	async function init() {
		let animId = 0;

		if (canvasRef) {
			game = new Game(data.map, canvasRef, topCanvasRef);
			await game.init();

			const render = () => {
				animId++;
				game.tick();
				game.topCanvas.context.globalAlpha = 0.5;

				// draw top layer
				for (let y = 0; y < game.map.height; y++) {
					for (let x = 0; x < game.map.width; x++) {
						const tile = game.map.getTile(x, y);
						game.topCanvas.drawOverlay(x, y, { color: colorTable[tile.permissions] });
					}
				}
				window.requestAnimationFrame(render);
			};
			render();
		}
	}

	$effect(() => {
		init();
	});
</script>

<h1>{page.params.map}</h1>

<div class="container">
	<canvas bind:this={canvasRef}></canvas>
	<canvas class="topCanvas" bind:this={topCanvasRef}></canvas>
</div>
<div class="buttons">
	{#each Object.entries(colorTable) as [key, value]}
		<button
			class={`square ${value} ${key === selectedColor.toString() ? 'selected' : ''}`}
			onclick={() => (selectedColor = parseInt(key))}>{key}</button
		>
	{/each}
</div>

<style>
	.container {
		position: relative;
	}
	.buttons {
		display: flex;
		gap: 0.5rem;
		padding-top: 0.5rem;
	}
	.topCanvas {
		position: absolute;
		top: 0;
	}
	.square {
		all: unset;
		display: grid;
		place-items: center;
		padding: 1rem;
		border: 1px solid var(--border);
		width: 1rem;

		&:hover {
			cursor: pointer;
		}
	}
	.blue {
		background-color: blue;
	}
	.red {
		background-color: red;
	}
	.green {
		background-color: green;
	}
	.selected {
		outline: 1px solid yellow;
	}
</style>
