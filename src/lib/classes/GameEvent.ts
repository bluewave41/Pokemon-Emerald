import type { BlockEvents } from './blocks/Block';

class InternalGameEvent extends EventTarget {
	once(event: BlockEvents, callback: () => void) {
		const handler = (e: any) => {
			callback(e);
			GameEvent.removeEventListener(event, handler);
		};
		GameEvent.addEventListener(event, handler);
	}
	waitForOnce(event: BlockEvents): Promise<any> {
		return new Promise((resolve) => {
			const handler = (e: any) => {
				resolve(e);
				this.removeEventListener(event, handler);
			};

			this.addEventListener(event, handler);
		});
	}
}

const GameEvent = new InternalGameEvent();

export default GameEvent;
