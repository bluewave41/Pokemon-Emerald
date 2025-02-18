<script>
	import { enhance } from '$app/forms';

	let { data } = $props();
</script>

<h1>Sprites</h1>

<form method="POST" action="?/create" use:enhance>
	<input type="text" name="bank" />
</form>

<div class="content">
	<h2>Banks</h2>

	<div>
		{#each data.sprites as bank}
			- <a class="bank" href={`/sprites/${bank}`}>{bank}</a>
		{/each}
	</div>
</div>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.bank {
		all: unset;
		&:hover {
			cursor: pointer;
			text-decoration: underline;
		}
	}
</style>
