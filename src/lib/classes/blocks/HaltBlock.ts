import { Block } from './Block';

export class HaltBlock extends Block {
	constructor() {
		super('halt');
	}
	async run() {
		return 0;
	}
}
