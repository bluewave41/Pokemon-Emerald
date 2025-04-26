import type { Canvas } from '../Canvas';
import type { Game } from '../Game';

export function mapOverlaySysyem(game: Game, canvas: Canvas) {
	const mapPosition = game.getComponent(game.activeMapId, 'Position')!;
	const tileEntities = game.entitiesWith(['TileSprite', 'Position', 'Overlay']);

	for (const id of tileEntities) {
		const sprite = game.getComponent(id, 'TileSprite')!;
		const pos = game.getComponent(id, 'Position')!;

		canvas.drawImage(sprite.sprite.images[0], pos.x + mapPosition.x, pos.y + mapPosition.y);
	}
}
