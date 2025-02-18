<script lang="ts">
	import '$lib/globals.css';

	let { children } = $props();
</script>

<div class="container">
	{@render children()}
</div>

<style>
	.container {
		display: grid;
		place-items: center;
		height: 100%;
	}
</style>
