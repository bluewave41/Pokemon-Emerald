import { sleep } from '$lib/utils/sleep';
import { Block } from './Block';

export class SleepBlock extends Block {
	time: number;
	constructor(time: number) {
		super();
		this.time = time;
	}
	async run() {
		await sleep(this.time);
		return 1;
	}
}
