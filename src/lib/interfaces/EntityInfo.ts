import type { BankNames } from './BankNames';

export interface EntityInfo {
	id: string;
	bankId: BankNames;
	x: number;
	y: number;
	script: string;
}
