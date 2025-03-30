import type { Block } from './blocks/Block';
import type { Game } from './Game';

export class BlockQueue {
	blocks: Block[] = [];
	game: Game;
	index: number = -1;

	constructor(game: Game) {
		this.game = game;
	}
	add(block: Block) {
		this.blocks.push(block);
	}
	addMultiple(blocks: Block[]) {
		this.blocks.push(...blocks);
	}
	addIf(block: Block, condition: boolean) {
		if (condition) {
			this.add(block);
		}
	}
	async handleBlocks() {
		this.index++;
		for (let i = this.index; i < this.blocks.length; i++) {
			this.index = i;
			const block = this.blocks[i];
			const retVal = await block.run(this.game);
			if (retVal === 0) {
				return;
			}
		}
	}
}
