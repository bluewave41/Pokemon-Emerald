import type { Canvas } from '../Canvas';
import type { Game } from '../Game';

export function mapRenderSystem(game: Game, canvas: Canvas) {
	const mapEntities = game.entitiesWith(['MapInfo', 'Tiles', 'Position']);
	for (const id of mapEntities) {
		const tileEntities = game.getComponent(id, 'Tiles')!.flat();
		const background = game.getComponent(id, 'Background')!;
		const position = game.getComponent(id, 'Position')!;

		for (const id of tileEntities) {
			const sprite = game.getComponent(id, 'TileSprite')!;
			const pos = game.getComponent(id, 'Position')!;
			const overlay = game.getComponent(id, 'Overlay');

			canvas.drawImage(background, pos.x + position.x, pos.y + position.y);

			if (!overlay) {
				canvas.drawImage(sprite.sprite.images[0], pos.x + position.x, pos.y + position.y);
			}
		}
	}
}
