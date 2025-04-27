import type { Canvas } from '../Canvas';
import type { Game } from '../Game';

export function mapRenderSystem(game: Game, canvas: Canvas) {
	const maps = game.entitiesWith(['MapInfo', 'Tiles', 'Position', 'Background']);

	for (const map of maps) {
		const tileEntities = map.components.Tiles.flat();
		const background = map.components.Background;
		const position = map.components.Position;

		for (const id of tileEntities) {
			const sprite = game.getComponent(id, 'TileSprite')!;
			const pos = game.getComponent(id, 'Position')!;
			const overlay = game.getComponent(id, 'Overlay');

			canvas.drawImage(background, pos.x + position.x, pos.y + position.y);

			if (!overlay) {
				canvas.drawImage(sprite, pos.x + position.x, pos.y + position.y);
			}
		}
	}
}
