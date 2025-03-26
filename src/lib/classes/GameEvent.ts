class InternalGameEvent extends EventTarget {
	once(event: string, callback: () => void) {
		const handler = (e: any) => {
			callback(e);
			GameEvent.removeEventListener(event, handler);
		};
		GameEvent.addEventListener(event, handler);
	}
	waitForOnce(event: string): Promise<any> {
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
