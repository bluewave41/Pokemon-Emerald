import type { Direction } from '$lib/interfaces/Direction';

export type HandledKeys = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

interface KeyState {
	down: boolean;
	holdCount: number;
}

export class InternalKeyHandler {
	#keys: Record<HandledKeys, KeyState> = {
		ArrowUp: { down: false, holdCount: 0 },
		ArrowDown: { down: false, holdCount: 0 },
		ArrowLeft: { down: false, holdCount: 0 },
		ArrowRight: { down: false, holdCount: 0 }
	};

	constructor() {}
	keyDown(key: string) {
		if (this.canHandleKey(key) && !this.#keys[key].down) {
			this.#keys[key].down = true;
			this.#keys[key].holdCount = 0;
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
	getPrioritizedKey(): HandledKeys | null {
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
	getKeyState(key: HandledKeys) {
		return this.#keys[key];
	}
}

const KeyHandler = new InternalKeyHandler();
export default KeyHandler;
