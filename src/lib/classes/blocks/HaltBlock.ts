import { Block } from './Block';

export class HaltBlock extends Block {
	constructor() {
		super();
	}
	async run() {
		console.log('halt');
		return 0;
	}
}
