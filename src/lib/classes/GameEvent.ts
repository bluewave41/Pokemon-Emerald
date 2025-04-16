export type DispatchedEvent =
	| 'movementFinished'
	| 'animationComplete'
	| 'fadedOut'
	| 'fadedIn'
	| 'continueText'
	| 'npcMovementFinished'
	| 'flagSet';

class InternalGameEvent extends EventTarget {
	once(event: DispatchedEvent, callback: () => void) {
		const handler = (e: any) => {
			callback(e);
			GameEvent.removeEventListener(event, handler);
		};
		GameEvent.addEventListener(event, handler);
	}
	attach(event: DispatchedEvent, callback: () => void) {
		const handler = (e: any) => {
			callback(e);
		};
		GameEvent.addEventListener(event, handler);
	}
	waitForOnce(event: DispatchedEvent): Promise<any> {
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
