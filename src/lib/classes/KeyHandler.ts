import { Direction } from '@prisma/client';

export type ActiveKeys = 'z';
export type MovementKeys = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

export const keyToDirection: Record<MovementKeys, Direction> = {
	ArrowUp: 'UP',
	ArrowLeft: 'LEFT',
	ArrowRight: 'RIGHT',
	ArrowDown: 'DOWN'
};

interface KeyState {
	down: boolean;
	holdCount: number;
}

interface PressedKey {
	down: boolean;
	initial: boolean;
}

export class InternalKeyHandler {
	#keys: Record<MovementKeys, KeyState> = {
		ArrowUp: { down: false, holdCount: 0 },
		ArrowDown: { down: false, holdCount: 0 },
		ArrowLeft: { down: false, holdCount: 0 },
		ArrowRight: { down: false, holdCount: 0 }
	};
	#pressedKeys: Record<ActiveKeys, PressedKey> = {
		z: { down: false, initial: false }
	};

	constructor() {}
	keyDown(key: string) {
		if (this.canHandleKey(key) && !this.#keys[key].down) {
			this.#keys[key].down = true;
			this.#keys[key].holdCount = 0;
		} else if (this.canHandlePressedKey(key)) {
			this.#pressedKeys[key] = {
				down: true,
				initial: true
			};
		}
	}
	keyUp(key: string) {
		if (this.canHandleKey(key)) {
			this.#keys[key].down = false;
		} else if (this.canHandlePressedKey(key)) {
			this.#pressedKeys[key] = {
				down: false,
				initial: false
			};
		}
	}
	tick() {
		for (const key in this.#keys) {
			const typedKey = key as MovementKeys;
			if (this.#keys[typedKey].down) {
				this.#keys[typedKey].holdCount++;
			}
		}
	}
	getPrioritizedKey(): Exclude<MovementKeys, 'Enter'> | null {
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
	canHandleKey(key: string): key is MovementKeys {
		return key in this.#keys;
	}
	canHandlePressedKey(key: string): key is ActiveKeys {
		return key in this.#pressedKeys;
	}
	getKeyState(key: MovementKeys) {
		return this.#keys[key];
	}
	getActiveKeyState(key: ActiveKeys) {
		const value = { ...this.#pressedKeys[key] };
		this.#pressedKeys[key].initial = false;
		return value;
	}
	keyToDirection(key: MovementKeys) {
		switch (key) {
			case 'ArrowUp':
				return Direction.UP;
			case 'ArrowLeft':
				return Direction.LEFT;
			case 'ArrowRight':
				return Direction.RIGHT;
			case 'ArrowDown':
				return Direction.DOWN;
		}
	}
}

const KeyHandler = new InternalKeyHandler();
export default KeyHandler;
