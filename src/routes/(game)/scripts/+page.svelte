<script>
	import { enhance } from '$app/forms';

	let { data } = $props();

	let selectedMap = $state(1);
	let scripts = $derived(data.maps.find((map) => map.id === selectedMap)?.Scripts);
</script>

<h1>Scripts</h1>

<select bind:value={selectedMap}>
	{#each data.maps as map}
		<option value={map.id}>{map.name}</option>
	{/each}
</select>

{#each scripts as script}
	<div>
		<a href={`/scripts/${script.id}`}>{script.name}</a>
	</div>
{/each}

<form action="?/create" method="POST" use:enhance>
	<input type="text" name="name" />
	<input type="number" name="mapId" hidden bind:value={selectedMap} />
	<button type="submit">Create</button>
</form>
