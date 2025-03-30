<script lang="ts">
	import type { Prisma, Tile } from '@prisma/client';

	interface Props {
		tiles: Prisma.TileGetPayload<{ include: { TileFrame: true } }>[];
		active?: number | null;
		background?: number | null;
		onClick: (tile: Prisma.TileGetPayload<{ include: { TileFrame: true } }>) => void;
	}

	let { tiles, active, background, onClick }: Props = $props();
</script>

<div class="grid">
	{#each tiles as tile}
		<button onclick={() => onClick(tile)}>
			<img
				class={`icon ${tile.id === active ? 'active' : ''} ${tile.id === background ? 'background' : ''}`}
				src={tile.data}
				alt="tile"
			/>
		</button>
	{/each}
</div>

<style>
	button {
		all: unset;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(5, 16px);
		gap: 1px;
	}
	.icon {
		&:hover {
			cursor: pointer;
		}
	}
	.active {
		outline: 1px solid yellow;
	}
	.background {
		outline: 1px solid red;
	}
</style>
