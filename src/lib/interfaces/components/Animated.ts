export interface Animated {
	frames: HTMLImageElement[];
	delay: number;
	activated: boolean;
	repeating: boolean;
	sequence: number[];
	index: number;
	direction: 'forward' | 'backward';
	animating: boolean;
}
