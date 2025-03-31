import { Block } from './Block';

export class HaltBlock extends Block {
	constructor() {
		super();
	}
	async run() {
		return 0;
	}
}
