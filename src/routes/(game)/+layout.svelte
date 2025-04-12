<script>
	import NavBar from '$lib/components/NavBar.svelte';
	import '$lib/globals.css';

	let { children } = $props();
</script>

<div class="container">
	<div class="left">
		<NavBar />
	</div>
	<div class="right">
		{@render children()}
	</div>
</div>

<style>
	.container {
		display: flex;
		height: 100%;
	}
	.left {
		flex: 10%;
	}
	.right {
		display: flex;
		flex-direction: column;
		flex: 80%;
	}
</style>
