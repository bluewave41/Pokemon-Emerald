<script>
	import Game from '$lib/icons/game.svelte';
	import Image from '$lib/icons/image.svelte';
	import Login from '$lib/icons/login.svelte';
	import Logout from '$lib/icons/logout.svelte';
	import Map from '$lib/icons/map.svelte';
	import Script from '$lib/icons/script.svelte';

	const links = [
		{
			label: 'Login',
			Icon: Login,
			href: '/account/login'
		},
		{
			label: 'Logout',
			Icon: Logout,
			href: '/account/logout'
		},
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
		},
		{
			label: 'Tiles',
			Icon: Image,
			href: '/tiles'
		},
		{
			label: 'Scripts',
			Icon: Script,
			href: '/scripts'
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
