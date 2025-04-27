export interface Animated {
	frames: HTMLImageElement[];
	delay: number;
	activated: boolean;
	repeating: boolean;
	index: number;
	sequence: number[];
}
