<script lang="ts">
	import type { Tiles } from '@prisma/client';

	interface Props {
		tiles: Tiles[];
		active: number | null;
		background: number | null;
		onClick: (id: number) => void;
	}

	let { tiles, active, background, onClick }: Props = $props();
</script>

<div class="grid">
	{#each tiles as tile}
		<img
			class={`icon ${tile.id === active ? 'active' : ''} ${tile.id === background ? 'background' : ''}`}
			src={tile.data}
			alt="tile"
			onclick={() => onClick(tile.id)}
		/>
	{/each}
</div>

<style>
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
