import type { Canvas } from '../Canvas';
import { Game, type Viewport } from '../Game';

export function viewportSystem(game: Game, canvas: Canvas, viewport: Viewport) {
	const [player] = game.entitiesWith(['Player', 'SubPosition']);
	const connections = game.getComponent(game.activeMapId, 'Connections')!;

	if (!connections) {
		return;
	}

	const leftMapInfo = game.getComponent(game.getMapIdByName(connections.LEFT), 'MapInfo');
	const upMapInfo = game.getComponent(game.getMapIdByName(connections.UP), 'MapInfo');

	const width = connections.LEFT ? (leftMapInfo?.width ?? 0) : 0;
	const height = connections.UP ? (upMapInfo?.height ?? 0) : 0;

	viewport.pos = {
		x: -(player.components.SubPosition.x / Game.getAdjustedTileSize() - viewport.width / 2 + width),
		y: -(
			player.components.SubPosition.y / Game.getAdjustedTileSize() -
			viewport.height / 2 +
			height
		),
		xOffset: width * Game.getAdjustedTileSize(),
		yOffset: height * Game.getAdjustedTileSize()
	};

	canvas.translate(viewport.pos.x, viewport.pos.y);
}
