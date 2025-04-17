type GameEventMap = {
	movementFinished: object;
	animationComplete: object;
	fadedOut: object;
	fadedIn: object;
	continueText: object;
	npcMovementFinished: object;
	flagSet: object;
	signComplete: object;
};

export type DispatchedEvent =
	| 'movementFinished'
	| 'animationComplete'
	| 'fadedOut'
	| 'fadedIn'
	| 'continueText'
	| 'npcMovementFinished'
	| 'flagSet'
	| 'signComplete';

type GameEventName = keyof GameEventMap;

class InternalGameEvent extends EventTarget {
	dispatch<K extends GameEventName>(type: K, detail: GameEventMap[K]) {
		this.dispatchEvent(new CustomEvent(type, { detail }));
	}
	once<K extends GameEventName>(type: K, callback: (event: CustomEvent<GameEventMap[K]>) => void) {
		const handler = (e: Event) => {
			callback(e as CustomEvent<GameEventMap[K]>);
			GameEvent.removeEventListener(type, handler);
		};
		GameEvent.addEventListener(type, handler);

		this.addEventListener(type, callback as EventListener);
	}
	attach<K extends GameEventName>(
		type: K,
		callback: (event: CustomEvent<GameEventMap[K]>) => void
	) {
		this.addEventListener(type, callback as EventListener);
	}
	waitForOnce<K extends GameEventName>(type: K) {
		return new Promise((resolve) => {
			const handler = (e: Event) => {
				resolve(e);
				this.removeEventListener(type, handler);
			};

			this.addEventListener(type, handler);
		});
	}
}

const GameEvent = new InternalGameEvent();

export default GameEvent;
