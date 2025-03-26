<script lang="ts">
	import { enhance } from '$app/forms';
	import TileGrid from '$lib/components/TileGrid.svelte';
	import type { Tile } from '@prisma/client';
	import type { PageData } from './$types.js';

	let { data } = $props();
	let selectedTile: PageData['tiles'][0] | Tile | null = $state(null);
	let form: HTMLFormElement;
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
					<input type="checkbox" name="animated" bind:checked={selectedTile.animated} />
					{#if selectedTile.animated}
						<form
							action="?/upload"
							method="POST"
							use:enhance
							bind:this={form}
							enctype="multipart/form-data"
						>
							<input type="text" hidden name="tile" bind:value={selectedTile.id} />
							<input type="file" multiple name="files" onchange={() => form.submit()} />
						</form>
						{#if 'TileFrame' in selectedTile}
							<p>{selectedTile.TileFrame.length} frames.</p>
							{#each selectedTile.TileFrame as frame, index}
								<div class="row">
									<img class="img" src={frame.data} alt="Tile" />
									<p>{index + 1}</p>
								</div>
							{/each}
							<form action="?/update" method="POST" use:enhance>
								<div class="col-container">
									<input type="text" hidden name="tile" bind:value={selectedTile.id} />
									<label for="sequence">Sequence</label>
									<input type="text" name="sequence" bind:value={selectedTile.sequence} />
									<label for="delay">Delay</label>
									<input type="delay" name="delay" bind:value={selectedTile.delay} />
									<div>
										<label for="activated">Activated</label>
										<input type="checkbox" bind:checked={selectedTile.activatedAnimation} />
									</div>
									<input
										type="hidden"
										name="activated"
										bind:value={selectedTile.activatedAnimation}
									/>
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
