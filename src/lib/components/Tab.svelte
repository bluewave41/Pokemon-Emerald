<script lang="ts">
	interface Props {
		label: string;
		onClick: () => void;
	}

	let { label, onClick }: Props = $props();
</script>

<button class="tab" onclick={onClick}>
	{label}
</button>

<style>
	.tab {
		all: unset;
		text-align: center;
		padding: 0.5rem;
		background-color: var(--foreground);
		border: 1px solid var(--border);

		&:hover {
			cursor: pointer;
		}
	}
</style>
