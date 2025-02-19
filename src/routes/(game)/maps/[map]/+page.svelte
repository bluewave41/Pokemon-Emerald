<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import type { BaseEvent } from '$lib/classes/events/BaseEvent.js';
	import { SignEvent } from '$lib/classes/events/SignEvent.js';
	import { Game } from '$lib/classes/Game.js';
	import { GameEditor } from '$lib/classes/GameEditor.js';
	import SpriteBank from '$lib/classes/SpriteBank.js';
	import Switch from '$lib/icons/switch.svelte';
	import type { MapEvent } from '$lib/interfaces/Events.js';

	type Mode = 'color' | 'select';

	const modes: Mode[] = ['color', 'select'];

	let { data } = $props();
	let canvasRef: HTMLCanvasElement;
	let topCanvasRef: HTMLCanvasElement;
	let game: GameEditor;
	let selectedColor = $state(0);
	let mouse: { down: boolean; selectingBackground: boolean; mode: Mode } = $state({
		down: false,
		selectingBackground: false,
		mode: 'color'
	});
	let backgroundTile: { id: number | null; data: string | null } = $state({
		id: null,
		data: null
	});
	let selectedTile: { x: number; y: number; event: MapEvent | undefined } | null = $state(null);
	let events: MapEvent[] = $state([]);
	let selectInput: HTMLSelectElement;

	const colorTable: Record<number, string> = {
		0: 'blue',
		1: 'red',
		2: 'green'
	};

	const onChange = (e: Event) => {
		const target = e.target as HTMLSelectElement;
		selectedTile?.event?.update(target.value);
	};

	const onTileChange = (e: Event) => {
		if (!selectedTile) {
			return;
		}
		const target = e.target as HTMLSelectElement;
		switch (target.value) {
			case 'sign':
				events.push(new SignEvent(selectedTile?.x, selectedTile?.y, ''));
				break;
		}
		selectedTile.event = events.find(
			(ev) => ev?.position.x === selectedTile?.x && ev?.position.y === selectedTile?.y
		);
	};

	async function init() {
		let animId = 0;

		if (canvasRef) {
			game = new GameEditor(data.map, canvasRef, topCanvasRef);
			events = game.map.events;
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
				if (mouse.mode !== 'select') {
					for (let y = 0; y < game.map.height; y++) {
						for (let x = 0; x < game.map.width; x++) {
							const tile = game.map.getTile(x, y);
							game.topCanvas.drawOverlay(x, y, { color: colorTable[tile.permissions] });
						}
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

		if (mouse.mode === 'select') {
			const event = events.find((ev) => ev?.position.x === x && ev?.position.y === y);
			if (selectInput) {
				selectInput.value = event?.type ?? 'none';
			}
			selectedTile = { x, y, event };
			return;
		}

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

<div class="wrapper">
	<div class="col">
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
			<button
				onclick={() =>
					(mouse.mode = modes[(modes.findIndex((mode) => mode === mouse.mode) + 1) % modes.length])}
			>
				<Switch size="2rem" color="black" />
			</button>
			{#each Object.entries(colorTable) as [key, value]}
				<button
					class={`square ${value} ${key === selectedColor.toString() ? 'selected' : ''}`}
					onclick={() => (selectedColor = parseInt(key))}>{key}</button
				>
			{/each}
			<img
				class="image"
				src={backgroundTile.data}
				onclick={() => (mouse.selectingBackground = true)}
			/>
		</div>

		<form
			method="POST"
			action="?/save"
			use:enhance={({ formData }) => {
				formData.append(
					'map',
					JSON.stringify({
						...game.map.toJSON(),
						backgroundTile,
						events: events.map((ev) => ev.toJSON())
					})
				);
			}}
		>
			<button>Save</button>
		</form>
	</div>
	<div>
		<h1>Options</h1>
		<p>Mode: {mouse.mode}</p>
		{#if selectedTile}
			<h3>Event</h3>
			<select onchange={onTileChange} bind:this={selectInput}>
				<option value="none">None</option>
				<option value="sign" selected={selectedTile.event?.type === 'sign'}>Sign</option>
			</select>
			<p>X: {selectedTile?.x}</p>
			<p>Y: {selectedTile?.y}</p>
			{@const Component = selectedTile.event?.getEditorUI().component}
			<Component {...selectedTile.event?.getEditorUI().props} {onChange} />
		{/if}
	</div>
</div>

<style>
	.wrapper {
		display: flex;
		gap: 1rem;
	}
	.col {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
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
		align-items: center;
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
