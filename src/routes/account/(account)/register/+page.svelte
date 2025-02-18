<script lang="ts">
	import { applyAction, enhance } from '$app/forms';

	let { form } = $props();

	let errors: string[] = $state([]);
</script>

<div class="back">
	<h1>Register</h1>

	<form
		method="POST"
		action="/account?/register"
		use:enhance={({ formData, cancel }) => {
			errors = [];
			if (formData.get('password') !== formData.get('verify-password')) {
				errors.push('Passwords do not match.');
				cancel();
			}
			return async ({ update, result }) => {
				update({ reset: false });
				applyAction(result);
			};
		}}
		class="container"
	>
		<input type="text" name="username" placeholder="Username" />
		<input type="password" name="password" placeholder="Password" />
		<input type="password" name="verify-password" placeholder="Verify Password" />
		<button type="submit">Submit</button>
	</form>
	{#each errors.concat(form?.error) as error}
		<p class="error">{error}</p>
	{/each}
</div>

<style>
	.back {
		display: flex;
		flex-direction: column;
		background-color: var(--foreground);
		padding: 1rem;
		text-align: center;
		border-radius: 1rem;
	}
	.container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.error {
		color: var(--error);
	}
</style>
