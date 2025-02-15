<script lang="ts">
	import { page } from '$app/state';
	import { Game } from '$lib/classes/Game.js';
	import KeyHandler from '$lib/classes/KeyHandler.js';

	let { data } = $props();
	let canvasRef: HTMLCanvasElement;
	let topCanvasRef: HTMLCanvasElement;
	let game: Game;

	async function init() {
		let animId = 0;

		if (canvasRef) {
			game = new Game(data.map, canvasRef, topCanvasRef);

			await game.init();

			const render = () => {
				animId++;
				game.tick();
				window.requestAnimationFrame(render);
			};
			render();
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
	<canvas class="topCanvas" bind:this={topCanvasRef}></canvas>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		position: relative;
	}
	.topCanvas {
		position: absolute;
		top: 0;
	}
</style>
