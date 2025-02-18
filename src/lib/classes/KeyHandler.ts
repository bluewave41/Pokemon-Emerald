export type HandledKeys = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';
export type ActiveKeys = 'Enter';

interface KeyState {
	down: boolean;
	holdCount: number;
}

interface ActiveKeyState {
	active: boolean;
}

export class InternalKeyHandler {
	#keys: Record<HandledKeys, KeyState> = {
		ArrowUp: { down: false, holdCount: 0 },
		ArrowDown: { down: false, holdCount: 0 },
		ArrowLeft: { down: false, holdCount: 0 },
		ArrowRight: { down: false, holdCount: 0 }
	};
	#activeKeys: Record<ActiveKeys, ActiveKeyState> = {
		Enter: { active: false }
	};

	constructor() {}
	keyDown(key: string) {
		if (this.canHandleKey(key) && !this.#keys[key].down) {
			this.#keys[key].down = true;
			this.#keys[key].holdCount = 0;
		} else if (this.canHandleActiveKey(key)) {
			this.#activeKeys[key].active = !this.#activeKeys[key].active;
		}
	}
	keyUp(key: string) {
		if (this.canHandleKey(key)) {
			this.#keys[key].down = false;
		}
	}
	tick() {
		for (const key in this.#keys) {
			const typedKey = key as HandledKeys;
			if (this.#keys[typedKey].down) {
				this.#keys[typedKey].holdCount++;
			}
		}
	}
	getPrioritizedKey(): Exclude<HandledKeys, 'Enter'> | null {
		// up and right are prioritized
		if (this.#keys.ArrowUp.down) {
			return 'ArrowUp';
		} else if (this.#keys.ArrowRight.down) {
			return 'ArrowRight';
		} else if (this.#keys.ArrowDown.down) {
			return 'ArrowDown';
		} else if (this.#keys.ArrowLeft.down) {
			return 'ArrowLeft';
		}
		return null;
	}
	canHandleKey(key: string): key is HandledKeys {
		return key in this.#keys;
	}
	canHandleActiveKey(key: string): key is ActiveKeys {
		return key in this.#activeKeys;
	}
	getKeyState(key: HandledKeys) {
		return this.#keys[key];
	}
	getActiveKeyState(key: ActiveKeys) {
		return this.#activeKeys[key];
	}
}

const KeyHandler = new InternalKeyHandler();
export default KeyHandler;
