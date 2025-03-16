<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { Game } from '$lib/classes/Game.js';
	import Tab from '$lib/components/Tab.svelte';
	import TileGrid from '$lib/components/TileGrid.svelte';
	import type { MapEvent } from '$lib/interfaces/Events.js';
	import type { PageProps } from './$types.js';
	import { Tile } from '$lib/classes/tiles/Tile.js';
	import { SignTile } from '$lib/classes/tiles/SignTile.js';
	import type { TileKind } from '$lib/interfaces/TileKind.js';
	import SpriteBank from '$lib/classes/SpriteBank.js';
	import { GameEditor } from '$lib/classes/GameEditor.svelte.js';

	let { data }: PageProps = $props();

	const tabs = ['Tiles', 'Permissions', 'Events'];

	let canvasRef: HTMLCanvasElement;
	let topCanvasRef: HTMLCanvasElement;
	let editor: GameEditor = $state(
		new GameEditor(
			data.map,
			data.tiles.filter((tile) => tile.overlay).map((tile) => tile.id)
		)
	);

	let events: MapEvent[] = $state([]);

	const colorTable: Record<number, string> = {
		0: 'blue',
		1: 'red',
		2: 'green'
	};

	const updateTileType = (type: TileKind) => {
		const { selectedTile } = editor.options;
		if (!selectedTile) {
			return;
		}
		const { x, y } = selectedTile;
		switch (type) {
			case 'tile':
				editor.map.tiles[y][x] = new Tile(
					x,
					y,
					selectedTile?.id,
					selectedTile?.overlay,
					selectedTile?.permissions
				);
				break;
			case 'sign':
				editor.map.tiles[y][x] = new SignTile(selectedTile, '');
			case 'warp':
				break;
		}
		editor.options.selectedTile = editor.map.getTile(x, y);
	};

	async function init() {
		let animId = 0;

		if (canvasRef) {
			await SpriteBank.readMap(data.images);
			editor = new GameEditor(
				data.map,
				data.tiles.filter((tile) => tile.overlay).map((tile) => tile.id)
			);
			editor.setRefs(canvasRef, topCanvasRef);
			events = editor.map.events;

			const render = () => {
				animId++;
				editor.tick();
				editor.topCanvas.context.globalAlpha = 0.5;

				// draw top layer
				if (editor.options.activeTab === 'Permissions') {
					for (let y = 0; y < editor.map.height; y++) {
						for (let x = 0; x < editor.map.width; x++) {
							const tile = editor.map.getTile(x, y);
							editor.topCanvas.drawOverlay(x, y, { color: colorTable[tile.permissions] });
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
		var rect = editor.canvas.canvas.getBoundingClientRect();

		return {
			x: Math.floor((e.clientX - rect.left) / Game.getAdjustedTileSize()),
			y: Math.floor((e.clientY - rect.top) / Game.getAdjustedTileSize())
		};
	};

	const onMouseMove = (e: MouseEvent) => {
		if (editor.mouse.down) {
			handleMouseDown(e);
		}
	};

	const handleMouseDown = (e: MouseEvent) => {
		const { x, y } = getMousePosition(e);
		switch (editor.options.activeTab) {
			case 'Tiles':
				switch (e.buttons) {
					case 1:
						if (!editor.options.activeTile) {
							break;
						}
						editor.map.getTile(x, y).newId = editor.options.activeTile;
						break;
					case 2:
						editor.options.activeTile = editor.map.getTile(x, y).id;
						break;
				}
				break;
			case 'Permissions':
				editor.map.getTile(x, y).permissions = editor.options.activeColor;
				break;
			case 'Events':
				editor.options.selectedTile = editor.map.getTile(x, y);
				break;
		}

		editor.mouse.down = true;
	};

	const onMouseDown = (e: MouseEvent) => {
		handleMouseDown(e);
		editor.mouse.down = true;
	};
</script>

<h1>{page.params.map}</h1>
<div class="tabs">
	{#each tabs as tab}
		<Tab label={tab} onClick={() => (editor.options.activeTab = tab)} />
	{/each}
</div>

<div class="wrapper">
	<div class="left-top">
		<div
			class="container"
			onmousemove={onMouseMove}
			onmousedown={onMouseDown}
			onmouseup={() => (editor.mouse.down = false)}
			oncontextmenu={(e) => e.preventDefault()}
		>
			<canvas bind:this={canvasRef}></canvas>
			<canvas class="topCanvas" bind:this={topCanvasRef}></canvas>
		</div>

		{#if editor}
			<form
				method="POST"
				action="?/save"
				use:enhance={({ formData }) => {
					formData.append(
						'map',
						JSON.stringify({
							...editor.map.toJSON(),
							overlayTiles: editor.overlayTiles,
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
			{#if editor.options.activeTile !== null}
				{@const { activeTile } = editor.options}
				<button
					onclick={() => {
						editor.options.backgroundTile = activeTile;
						editor.map.backgroundTile = activeTile;
					}}>Set background tile</button
				>
			{/if}
		{/if}
	</div>
	{#if editor}
		<div class="right">
			<div>
				{#if editor.options.activeTab === 'Tiles'}
					<TileGrid
						tiles={data.tiles}
						active={editor.options.activeTile}
						background={editor.options.backgroundTile}
						onClick={(tile) => (editor.options.activeTile = tile.id)}
					/>
					{#if editor.options.activeTile}
						{@const { activeTile } = editor.options}
						{#key editor.options.activeTile}
							<div>Properties</div>
							<div>
								<label for="overlay">Overlay</label>
								<input
									name="overlay"
									type="checkbox"
									checked={editor.overlayTiles.includes(editor.options.activeTile)}
									onchange={(e) => {
										editor.overlayTiles = e.currentTarget.checked
											? [...editor.overlayTiles, activeTile]
											: editor.overlayTiles.filter((el) => el !== activeTile);
									}}
								/>
							</div>
						{/key}
					{/if}
				{/if}
				{#if editor.options.activeTab === 'Permissions'}
					{#each Object.entries(colorTable) as [key, value]}
						<button
							class={`square ${value} ${key === editor.options.activeColor.toString() ? 'selected' : ''}`}
							onclick={() => (editor.options.activeColor = parseInt(key))}>{key}</button
						>
					{/each}
				{/if}
				{#if editor.options.activeTab === 'Events' && editor.options.selectedTile}
					{@const { selectedTile } = editor.options}
					<p>Events</p>
					<p>X: {editor.options.selectedTile?.x}</p>
					<p>Y: {editor.options.selectedTile?.y}</p>
					{#key editor.options.selectedTile}
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
	{/if}
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
