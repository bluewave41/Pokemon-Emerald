<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';

	let formRef: HTMLFormElement;
	let { data, form } = $props();
</script>

<h1>{page.params.bank}</h1>

<form method="POST" action="?/add" bind:this={formRef} enctype="multipart/form-data" use:enhance>
	<input type="file" name="files" multiple onchange={() => formRef.submit()} />
	<input type="text" name="bank" hidden value={page.params.bank} />
</form>

<div class="container">
	{#each data.sprites as sprite}
		<div class="sprite">
			<img src={sprite.data} alt={sprite.name} />
			<p>{sprite.name}</p>
		</div>
	{/each}
</div>

{#if form?.errors}
	<ul class="error">
		{#each form?.errors as error}
			<li>{error}</li>
		{/each}
	</ul>
{/if}

<style>
	.container {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
	}
	.sprite {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--border);
		width: 3rem;
		height: 3rem;
		font-size: 12px;
	}
	.error {
		color: var(--error);
	}
</style>
