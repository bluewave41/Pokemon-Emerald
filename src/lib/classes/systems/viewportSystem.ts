import type { Canvas } from '../Canvas';
import { Game, type Viewport } from '../Game';

export function viewportSystem(game: Game, canvas: Canvas, viewport: Viewport) {
	const [playerId] = game.entitiesWith(['Player']);

	if (!playerId) {
		return;
	}

	const position = game.getComponent(playerId, 'SubPosition')!;
	const connections = game.getComponent(game.activeMapId, 'Connections')!;

	const width = connections.left ? (game.getComponent(connections.left, 'MapInfo')?.width ?? 0) : 0;
	const height = connections.left
		? (game.getComponent(connections.left, 'MapInfo')?.width ?? 0)
		: 0;

	viewport.pos = {
		x: -(position.x / Game.getAdjustedTileSize() - viewport.width / 2 + width),
		y: -(position.y / Game.getAdjustedTileSize() - viewport.height / 2 + height),
		xOffset: width * Game.getAdjustedTileSize(),
		yOffset: height * Game.getAdjustedTileSize()
	};

	canvas.translate(viewport.pos.x, viewport.pos.y);
}
