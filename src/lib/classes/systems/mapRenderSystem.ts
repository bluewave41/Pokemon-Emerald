import type { Canvas } from '../Canvas';
import type { Game } from '../Game';

export function mapRenderSystem(game: Game, canvas: Canvas) {
	const mapEntities = game.entitiesWith(['MapInfo', 'Tiles']);

	for (const id of mapEntities) {
		const tiles = game.getComponent(id, 'Tiles')!;
		const background = game.getComponent(id, 'Background')!;

		for (let row = 0; row < tiles.length; row++) {
			for (let col = 0; col < tiles[0].length; col++) {
				const tileId = tiles[row][col];
				const tile = game.getComponent(tileId, 'TileSprite')!;

				canvas.drawImage(background, col, row);
				canvas.drawImage(tile.sprite.images[0], col, row);
			}
		}
	}
}
