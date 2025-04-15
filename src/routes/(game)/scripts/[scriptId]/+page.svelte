<script>
	import { enhance } from '$app/forms';

	let { data } = $props();
</script>

<form action="?/update" method="POST" use:enhance>
	<div>
		<input type="numeric" name="x" placeholder="X" bind:value={data.script.x} />
		<input type="numeric" name="y" placeholder="Y" bind:value={data.script.y} />
		<button type="submit">Save</button>
	</div>
	<textarea
		name="condition"
		bind:value={data.script.condition}
		placeholder="Condition"
		onkeydown={(e) =>
			e.key === 'Tab' &&
			(e.preventDefault(),
			e.target.setRangeText('\t', e.target.selectionStart, e.target.selectionEnd, 'end'))}
	></textarea>
	<textarea
		name="setup"
		bind:value={data.script.setup}
		placeholder="Setup"
		onkeydown={(e) =>
			e.key === 'Tab' &&
			(e.preventDefault(),
			e.target.setRangeText('\t', e.target.selectionStart, e.target.selectionEnd, 'end'))}
	></textarea>
	<textarea
		name="script"
		bind:value={data.script.script}
		placeholder="Script"
		onkeydown={(e) =>
			e.key === 'Tab' &&
			(e.preventDefault(),
			e.target.setRangeText('\t', e.target.selectionStart, e.target.selectionEnd, 'end'))}
	></textarea>
</form>

<style>
	form {
		width: 100%;
		height: 100%;
	}
	textarea {
		width: 100%;
		height: 33%;
		background-color: var(--foreground);
		color: var(--copy);
		outline: 0;
	}
</style>
