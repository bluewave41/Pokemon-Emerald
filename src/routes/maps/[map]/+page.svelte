<script lang="ts">
	import { page } from '$app/state';
	import { Game } from '$lib/classes/Game.js';

	let { data } = $props();
	let canvasRef: HTMLCanvasElement;
	let game: Game;

	async function init() {
		let animId = 0;

		if (canvasRef) {
			game = new Game(data.map, canvasRef);
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
</script>

<h1>{page.params.map}</h1>

<canvas bind:this={canvasRef}></canvas>
