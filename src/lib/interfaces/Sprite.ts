import type { BankNames } from './BankNames';

export interface Sprite {
	bankId: BankNames;
	sprites: Record<string, HTMLImageElement>;
}
