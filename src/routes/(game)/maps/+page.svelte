<script lang="ts">
	import { enhance } from '$app/forms';

	let form: HTMLFormElement;

	let { data } = $props();
</script>

<h1>Maps</h1>

<div class="content">
	<form method="POST" action="?/create" use:enhance bind:this={form} enctype="multipart/form-data">
		<input type="file" name="file" onchange={() => form.submit()} />
	</form>

	<div>
		<h2>Available Maps</h2>

		<div>
			{#each data.maps as map}
				<div>
					- #{map.id}: <a class="map" href={`/maps/${map.name}`}>{map.name}</a>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
	}
	.map {
		all: unset;
		&:hover {
			cursor: pointer;
			text-decoration: underline;
		}
	}
</style>
