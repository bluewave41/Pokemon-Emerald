<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { Game } from '$lib/classes/Game.js';
	import { GameEditor } from '$lib/classes/GameEditor.js';
	import Tab from '$lib/components/Tab.svelte';
	import TileGrid from '$lib/components/TileGrid.svelte';
	import type { MapEvent } from '$lib/interfaces/Events.js';
	import type { AnyTile } from '$lib/interfaces/AnyTile.js';
	import type { PageProps } from './$types.js';
	import { Tile } from '$lib/classes/tiles/Tile.js';
	import { SignTile } from '$lib/classes/tiles/SignTile.js';
	import type { TileKind } from '$lib/interfaces/TileKind.js';

	type Tabs = 'Tiles' | 'Permissions' | 'Events';

	const tabs: Tabs[] = ['Tiles', 'Permissions', 'Events'];

	let { data }: PageProps = $props();

	let canvasRef: HTMLCanvasElement;
	let topCanvasRef: HTMLCanvasElement;
	let game: GameEditor = new GameEditor(
		data.map,
		data.tiles.filter((tile) => tile.overlay).map((tile) => tile.id)
	);
	let mouse: { down: boolean } = $state({
		down: false
	});

	let events: MapEvent[] = $state([]);

	let options = $state<{
		activeTab: Tabs;
		activeTile: number | null;
		activeColor: number;
		backgroundTile: number | null;
		selectedTile: AnyTile | null;
	}>({
		activeTab: 'Tiles',
		activeTile: null,
		activeColor: 0,
		backgroundTile: game.map.backgroundTile,
		selectedTile: null
	});

	const colorTable: Record<number, string> = {
		0: 'blue',
		1: 'red',
		2: 'green'
	};

	const updateTileType = (type: TileKind) => {
		const { selectedTile } = options;
		if (!selectedTile) {
			return;
		}
		const { x, y } = selectedTile;
		switch (type) {
			case 'tile':
				game.map.tiles[y][x] = new Tile(
					x,
					y,
					selectedTile?.id,
					selectedTile?.overlay,
					selectedTile?.permissions
				);
				break;
			case 'sign':
				game.map.tiles[y][x] = new SignTile(selectedTile, '');
			case 'warp':
				break;
		}
		options.selectedTile = game.map.getTile(x, y);
	};

	async function init() {
		let animId = 0;

		if (canvasRef) {
			game.setRefs(canvasRef, topCanvasRef);
			events = game.map.events;
			await game.init();

			const render = () => {
				animId++;
				game.tick();
				game.topCanvas.context.globalAlpha = 0.5;

				// draw top layer
				if (options.activeTab === 'Permissions') {
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
		if (mouse.down) {
			handleMouseDown(e);
		}
	};

	const handleMouseDown = (e: MouseEvent) => {
		const { x, y } = getMousePosition(e);
		switch (options.activeTab) {
			case 'Tiles':
				switch (e.buttons) {
					case 1:
						if (!options.activeTile) {
							break;
						}
						game.map.getTile(x, y).id = options.activeTile;
						break;
					case 2:
						options.activeTile = game.map.getTile(x, y).id;
						break;
				}
				break;
			case 'Permissions':
				game.map.getTile(x, y).permissions = options.activeColor;
				break;
			case 'Events':
				options.selectedTile = game.map.getTile(x, y);
				break;
		}

		mouse.down = true;
	};

	const onMouseDown = (e: MouseEvent) => {
		handleMouseDown(e);
		mouse.down = true;
	};
</script>

<h1>{page.params.map}</h1>
<div class="tabs">
	{#each tabs as tab}
		<Tab label={tab} onClick={() => (options.activeTab = tab)} />
	{/each}
</div>

<div class="wrapper">
	<div class="left-top">
		<div
			class="container"
			onmousemove={onMouseMove}
			onmousedown={onMouseDown}
			onmouseup={() => (mouse.down = false)}
			oncontextmenu={(e) => e.preventDefault()}
		>
			<canvas bind:this={canvasRef}></canvas>
			<canvas class="topCanvas" bind:this={topCanvasRef}></canvas>
		</div>

		<form
			method="POST"
			action="?/save"
			use:enhance={({ formData }) => {
				formData.append(
					'map',
					JSON.stringify({
						...game.map.toJSON(),
						overlayTiles: game.overlayTiles,
						events: events.map((ev) => ev.toJSON())
					})
				);
			}}
		>
			<button>Save</button>
		</form>
		<form method="POST" action="?/reset" use:enhance>
			<button>Reset</button>
		</form>
		{#if options.activeTile !== null}
			{@const { activeTile } = options}
			<button
				onclick={() => {
					options.backgroundTile = activeTile;
					game.map.backgroundTile = activeTile;
				}}>Set background tile</button
			>
		{/if}
	</div>
	<div class="right">
		<div>
			{#if options.activeTab === 'Tiles'}
				<TileGrid
					tiles={data.tiles}
					active={options.activeTile}
					background={options.backgroundTile}
					onClick={(id) => (options.activeTile = id)}
				/>
				{#if options.activeTile}
					{@const { activeTile } = options}
					{#key options.activeTile}
						<div>Properties</div>
						<div>
							<label for="overlay">Overlay</label>
							<input
								name="overlay"
								type="checkbox"
								checked={game.overlayTiles.includes(options.activeTile)}
								onchange={(e) => {
									game.overlayTiles = e.currentTarget.checked
										? [...game.overlayTiles, activeTile]
										: game.overlayTiles.filter((el) => el !== activeTile);
								}}
							/>
						</div>
					{/key}
				{/if}
			{/if}
			{#if options.activeTab === 'Permissions'}
				{#each Object.entries(colorTable) as [key, value]}
					<button
						class={`square ${value} ${key === options.activeColor.toString() ? 'selected' : ''}`}
						onclick={() => (options.activeColor = parseInt(key))}>{key}</button
					>
				{/each}
			{/if}
			{#if options.activeTab === 'Events' && options.selectedTile}
				{@const { selectedTile } = options}
				<p>Events</p>
				<p>X: {options.selectedTile?.x}</p>
				<p>Y: {options.selectedTile?.y}</p>
				{#key options.selectedTile}
					<select onchange={(e) => updateTileType(e.currentTarget.value as TileKind)}>
						<option value="none" selected={selectedTile.kind === 'tile'}>None</option>
						<option value="sign" selected={selectedTile.kind === 'sign'}>Sign</option>
					</select>
					<div>
						{#if selectedTile.isSign()}
							<input
								type="text"
								value={selectedTile.text}
								onchange={(e) => (selectedTile.text = e.currentTarget.value)}
							/>
						{/if}
					</div>
				{/key}
			{/if}
		</div>
	</div>
</div>

<style>
	.wrapper {
		display: grid;
		grid-template-areas: 'left right' 'bottom right';
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		gap: 1rem;
	}
	.tabs {
		display: flex;
	}
	.left-top {
		grid-area: left;
	}

	.left-bottom {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		justify-content: center;
		grid-area: bottom;
	}

	.right {
		display: flex;
		flex-direction: column;
		grid-area: right;
		gap: 1rem;
	}

	.col {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 70%;
	}
	.subCol {
		flex: 15%;
	}
	.row {
		height: 50%;
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
