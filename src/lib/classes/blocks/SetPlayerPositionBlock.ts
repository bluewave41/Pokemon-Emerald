import { Block } from './Block';

export class SetPlayerPosition extends Block {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		super('SetPlayerPosition');
		this.x = x;
		this.y = y;
	}
}
