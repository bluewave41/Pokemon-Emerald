<script>
	import SpriteBank from '$lib/classes/SpriteBank.js';
	import { onMount } from 'svelte';

	let { data, children } = $props();
	let ready = $state(false);

	onMount(async () => {
		await SpriteBank.readMap(data.images);
		ready = true;
	});
</script>

{#if ready}
	<div>
		{@render children()}
	</div>
{/if}
