import type { Direction } from '$lib/interfaces/Direction';

export type HandledKeys = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

interface KeyState {
	down: boolean;
}

export class InternalKeyHandler {
	#keys: Record<HandledKeys, KeyState> = {
		ArrowUp: { down: false },
		ArrowDown: { down: false },
		ArrowLeft: { down: false },
		ArrowRight: { down: false }
	};

	constructor() {}
	keyDown(key: string) {
		if (this.canHandleKey(key)) {
			this.#keys[key].down = true;
		}
	}
	keyUp(key: string) {
		if (this.canHandleKey(key)) {
			this.#keys[key].down = false;
		}
	}
	getMainDirection(): Direction | null {
		// up and right are prioritized
		if (this.#keys.ArrowUp.down) {
			return 'up';
		} else if (this.#keys.ArrowRight.down) {
			return 'right';
		} else if (this.#keys.ArrowDown.down) {
			return 'down';
		} else if (this.#keys.ArrowLeft.down) {
			return 'left';
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
