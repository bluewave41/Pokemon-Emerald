class InternalGameEvent extends EventTarget {
	once(event: string, callback: () => void) {
		const handler = (e: any) => {
			callback(e);
			GameEvent.removeEventListener(event, handler);
		};
		GameEvent.addEventListener(event, handler);
	}
}

const GameEvent = new InternalGameEvent();

export default GameEvent;
