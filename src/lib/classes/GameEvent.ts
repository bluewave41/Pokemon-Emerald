type GameEventMap = {
	movementFinished: object;
	animationComplete: object;
	fadedOut: object;
	fadedIn: object;
	continueText: { scroll: boolean };
	npcMovementFinished: object;
	flagSet: object;
	textComplete: object;
	rerender: object;
	textScrolled: object;
};

export type DispatchedEvent =
	| 'movementFinished'
	| 'animationComplete'
	| 'fadedOut'
	| 'fadedIn'
	| 'continueText'
	| 'npcMovementFinished'
	| 'flagSet'
	| 'textComplete'
	| 'textScrolled';

type GameEventName = keyof GameEventMap;

class InternalGameEvent extends EventTarget {
	dispatch<K extends GameEventName>(type: K, detail?: GameEventMap[K]) {
		this.dispatchEvent(new CustomEvent<GameEventMap[K]>(type, { detail }));
	}
	once<K extends GameEventName>(type: K, callback: (event: CustomEvent<GameEventMap[K]>) => void) {
		const handler = (e: Event) => {
			callback(e as CustomEvent<GameEventMap[K]>);
			this.removeEventListener(type, handler);
		};
		this.addEventListener(type, handler);
	}
	attach<K extends GameEventName>(
		type: K,
		callback: (event: CustomEvent<GameEventMap[K]>) => void
	) {
		this.addEventListener(type, callback as EventListener);
	}
	detach<K extends GameEventName>(
		type: K,
		callback: (event: CustomEvent<GameEventMap[K]>) => void
	) {
		this.removeEventListener(type, callback as EventListener);
	}
	waitForOnce<K extends GameEventName>(type: K): Promise<CustomEvent<GameEventMap[K]>> {
		return new Promise((resolve) => {
			const handler = (e: Event) => {
				resolve(e as CustomEvent<GameEventMap[K]>);
				this.removeEventListener(type, handler);
			};
			this.addEventListener(type, handler);
		});
	}
}

const GameEvent = new InternalGameEvent();

export default GameEvent;
