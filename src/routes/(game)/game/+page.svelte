<script lang="ts">
	import { page } from '$app/state';
	import { Game } from '$lib/classes/Game.js';
	import KeyHandler from '$lib/classes/KeyHandler.js';

	let { data } = $props();
	let canvasRef: HTMLCanvasElement;
	let game: Game;

	async function init() {
		if (canvasRef) {
			game = new Game(data.map, canvasRef);

			await game.init();

			const render = (frameTime: number) => {
				game.tick(frameTime);
				window.requestAnimationFrame(render);
			};
			render(0);
		}
	}

	$effect(() => {
		init();
	});

	const onKeyDown = (e: KeyboardEvent) => {
		KeyHandler.keyDown(e.key);
	};

	const onKeyUp = (e: KeyboardEvent) => {
		KeyHandler.keyUp(e.key);
	};
</script>

<h1>{page.params.map}</h1>

<div class="container" onkeydown={onKeyDown} onkeyup={onKeyUp} tabIndex={1}>
	<canvas bind:this={canvasRef}></canvas>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		position: relative;
	}
</style>
