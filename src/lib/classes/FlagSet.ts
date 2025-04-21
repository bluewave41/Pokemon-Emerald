const FLAG_BUCKET_SIZE = 32;

export const Flag = {
	Intro: 1,
	EnteredHouse: 2,
	SetClock: 3,
	SawTV: 4
} as const;

class InternalFlagSet {
	private buckets: number[] = [];

	set(flagIndex: number) {
		if (!this.has(flagIndex)) {
			const bucket = Math.floor(flagIndex / FLAG_BUCKET_SIZE);
			const bit = flagIndex % FLAG_BUCKET_SIZE;
			this.buckets[bucket] = (this.buckets[bucket] ?? 0) | (1 << bit);
			return true;
		}
		return false;
	}

	has(flagIndex: number): boolean {
		const bucket = Math.floor(flagIndex / FLAG_BUCKET_SIZE);
		const bit = flagIndex % FLAG_BUCKET_SIZE;
		return (this.buckets[bucket] ?? 0) & (1 << bit) ? true : false;
	}

	clear(flagIndex: number) {
		const bucket = Math.floor(flagIndex / FLAG_BUCKET_SIZE);
		const bit = flagIndex % FLAG_BUCKET_SIZE;
		this.buckets[bucket] = (this.buckets[bucket] ?? 0) & ~(1 << bit);
	}
}

const FlagSet = new InternalFlagSet();
export default FlagSet;

export type Flag = (typeof Flag)[keyof typeof Flag];

// 1 = Watched introduction
// 2 = Talked to mom inside house
// 3 = Clock set
