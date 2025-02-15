<script>
	import Game from '$lib/icons/game.svelte';
	import Image from '$lib/icons/image.svelte';
	import Map from '$lib/icons/map.svelte';

	const links = [
		{
			label: 'Maps',
			Icon: Map,
			href: '/maps'
		},
		{
			label: 'Images',
			Icon: Image,
			href: '/images'
		},
		{
			label: 'Sprites',
			Icon: Image,
			href: '/sprites'
		},
		{
			label: 'Game',
			Icon: Game,
			href: '/game'
		}
	];
</script>

<div class="navbar">
	<h1>Pokemon</h1>
	<div class="links">
		{#each links as link}
			<a class="row" href={link.href}>
				<link.Icon size="1rem" color="#053bfb" />
				{link.label}
			</a>
		{/each}
	</div>
</div>

<style>
	.links {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.navbar {
		padding: 0.5rem;
		height: 100%;
		background-color: var(--foreground);
	}
	.row {
		all: unset;
		display: flex;
		gap: 0.5rem;
		align-items: center;

		&:hover {
			text-decoration: underline;
			cursor: pointer;
		}
	}
</style>
