<script>
	import { enhance } from '$app/forms';
</script>

<div class="back">
	<h1>Login</h1>

	<form
		method="POST"
		action="/account?/login"
		use:enhance={({ formData, cancel }) => {
			return async ({ update, result }) => {
				if (result.type === 'success') {
					localStorage.setItem('jwt', result.data);
				}
			};
		}}
		class="container"
	>
		<input type="text" name="username" placeholder="Username" />
		<input type="password" name="password" placeholder="Password" />
		<button type="submit">Submit</button>
	</form>
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
</style>
