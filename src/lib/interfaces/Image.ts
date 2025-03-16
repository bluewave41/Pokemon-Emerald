export interface Image<T> {
	id: T;
	data: string;
	animated: boolean;
	sequence?: number[];
	frames?: string[];
	delay?: number;
}
