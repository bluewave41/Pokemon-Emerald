<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { Game } from '$lib/classes/Game.js';
	import { GameEditor } from '$lib/classes/GameEditor.js';
	import SpriteBank from '$lib/classes/SpriteBank.js';

	let { data } = $props();
	let canvasRef: HTMLCanvasElement;
	let topCanvasRef: HTMLCanvasElement;
	let game: GameEditor;
	let selectedColor = $state(0);
	let mouse = $state({
		down: false,
		selectingBackground: false
	});
	let backgroundTile: { id: number | null; data: string | null } = $state({
		id: null,
		data: null
	});

	const colorTable: Record<number, string> = {
		0: 'blue',
		1: 'red',
		2: 'green'
	};

	async function init() {
		let animId = 0;

		if (canvasRef) {
			game = new GameEditor(data.map, canvasRef, topCanvasRef);
			await game.init();

			backgroundTile = {
				id: game.map.backgroundTile,
				data: SpriteBank.getTile(game.map.name, game.map.area, game.map.backgroundTile).src
			};

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

	const getMousePosition = (e: MouseEvent) => {
		var rect = game.canvas.canvas.getBoundingClientRect();

		return {
			x: Math.floor((e.clientX - rect.left) / Game.getAdjustedTileSize()),
			y: Math.floor((e.clientY - rect.top) / Game.getAdjustedTileSize())
		};
	};

	const onMouseMove = (e: MouseEvent) => {
		const { x, y } = getMousePosition(e);
		if (mouse.down) {
			const tile = game.map.getTile(x, y);
			tile.permissions = selectedColor;
		}
	};

	const onMouseDown = (e: MouseEvent) => {
		const { x, y } = getMousePosition(e);

		if (mouse.selectingBackground) {
			const tile = game.map.getTile(x, y);
			backgroundTile = {
				id: tile.id,
				data: SpriteBank.getTile(game.map.name, game.map.area, tile.id).src
			};
			return;
		}
		mouse.down = true;
		const tile = game.map.getTile(x, y);
		tile.permissions = selectedColor;
	};
</script>

<h1>{page.params.map}</h1>

<div
	class="container"
	onmousemove={onMouseMove}
	onmousedown={onMouseDown}
	onmouseup={() => (mouse.down = false)}
>
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
	<img class="image" src={backgroundTile.data} onclick={() => (mouse.selectingBackground = true)} />
</div>

<form
	method="POST"
	action="?/save"
	use:enhance={({ formData }) =>
		formData.append('map', JSON.stringify({ ...game.map.toJSON(), backgroundTile }))}
>
	<button>Save</button>
</form>

<style>
	.container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
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
	.image {
		width: 1rem;
		height: 1rem;
		outline: 1px solid blue;

		&:hover {
			cursor: pointer;
		}
	}
</style>
