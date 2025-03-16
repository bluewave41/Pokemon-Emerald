<script lang="ts">
	import { enhance } from '$app/forms';
	import TileGrid from '$lib/components/TileGrid.svelte';
	import type { Tile } from '@prisma/client';
	import type { PageData } from './$types.js';

	let { data } = $props();
	let selectedTile: PageData['tiles'][0] | Tile | null = $state(null);
	let form: HTMLFormElement;

	const markTileAnimated = () => {
		const tile = data.tiles.find((tile) => tile.id === selectedTile?.id);
		if (!tile) {
			return;
		}
		tile.animated = !tile.animated;
		selectedTile = tile;
	};

	$inspect(selectedTile);
</script>

<h1>Tiles</h1>

<div class="container">
	<div class="col">
		<TileGrid
			tiles={data.tiles}
			active={selectedTile?.id}
			onClick={(tile) => (selectedTile = tile)}
		/>
	</div>
	<div class="col">
		<div class="col-container">
			{#if selectedTile}
				{selectedTile.id}
				<img class="img" src={selectedTile.data} alt="Tile" />
				<div>
					<label for="animated">Animated</label>
					<input
						type="checkbox"
						name="animated"
						checked={selectedTile.animated}
						onchange={markTileAnimated}
					/>
					{#if selectedTile.animated}
						<form
							action="?/upload"
							method="POST"
							use:enhance
							bind:this={form}
							enctype="multipart/form-data"
						>
							<input type="text" hidden name="tile" value={selectedTile.id} />
							<input type="file" multiple name="files" onchange={() => form.submit()} />
						</form>
						{#if 'TileFrame' in selectedTile}
							<p>{selectedTile.TileFrame.length} frames.</p>
							{#each selectedTile.TileFrame as frame}
								<div class="row">
									<img class="img" src={frame.data} alt="Tile" />
									<p>{frame.id}</p>
								</div>
							{/each}
							<form action="?/update" method="POST" use:enhance>
								<div class="col-container">
									<input type="text" hidden name="tile" value={selectedTile.id} />
									<label for="sequence">Sequence</label>
									<input type="text" name="sequence" value={selectedTile.sequence} />
									<label for="delay">Delay</label>
									<input type="delay" name="delay" value={selectedTile.delay} />
								</div>
								<button type="submit">Update</button>
							</form>
						{/if}
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.container {
		display: flex;
		width: 100%;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.col {
		display: flex;
		flex: 50%;
		justify-content: center;
	}
	.col-container {
		display: flex;
		flex-direction: column;
	}
	.img {
		width: 2rem;
		height: 2rem;
	}
</style>
