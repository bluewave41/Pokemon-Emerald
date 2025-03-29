import GameEvent from '../GameEvent';
import { Block } from './Block';

export class WaitForContinueBlock extends Block {
	constructor() {
		super();
	}
	async run() {
		await GameEvent.waitForOnce('continue');
	}
}
