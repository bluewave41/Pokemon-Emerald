<script lang="ts">
	import { page } from '$app/state';
	import { Canvas } from '$lib/classes/Canvas.js';
	import { Game } from '$lib/classes/Game.js';
	import KeyHandler from '$lib/classes/KeyHandler.js';
	import { GameMap } from '$lib/classes/maps/GameMap.js';
	import SpriteBank from '$lib/classes/SpriteBank.js';
	import { Buffer } from 'buffer';

	let { data } = $props();
	let canvasRef: HTMLCanvasElement;
	let game: Game;

	async function init() {
		if (canvasRef) {
			const canvas = new Canvas(canvasRef);
			await SpriteBank.readMap(data.images);
			const gameMap = GameMap.readMap(canvas, Buffer.from(data.map, 'base64'));

			//player
			await SpriteBank.readBank('player', data.player);
			await SpriteBank.readBank('npc-fat', data.npc);
			await SpriteBank.readBank('utility', data.utility);

			game = new Game(canvas, gameMap);

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
