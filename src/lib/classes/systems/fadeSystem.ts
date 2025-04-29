import type { Canvas } from '../Canvas';
import type { Game } from '../Game';

export function fadeSystem(game: Game, canvas: Canvas) {
	const progress = 0.05;
	const [fadeInstance] = game.entitiesWith(['Fade']);
	if (!fadeInstance) {
		return;
	}

	const fade = fadeInstance.components.Fade;

	if (fade.type === 'in') {
		fade.progress -= progress;
		if (fade.progress <= 0) {
			fade.done = true;
		}
	} else {
		fade.progress += progress;
		if (fade.progress >= 1) {
			fade.done = true;
		}
	}

	canvas.context.fillStyle = `rgba(0, 0, 0, ${fade.progress})`;
	canvas.context.fillRect(0, 0, canvas.context.canvas.width, canvas.context.canvas.height);
}
