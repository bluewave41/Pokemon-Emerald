export interface TileInfo {
	x: number;
	y: number;
	id: number;
	properties: number;
	script: string | null;
	activatedAnimation: boolean;
	repeatingAnimation: boolean;
}
