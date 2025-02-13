export class BufferedWriter {
	#buffer: Buffer = Buffer.alloc(25000); // TODO: make dynamic
	#index: number = 0;

	constructor(buffer: Buffer) {
		this.#buffer = buffer;
	}
	writeByte(b: number) {
		this.#buffer.writeUInt8(b, this.#index++);
	}
	writeShort(s: number) {
		this.#buffer.writeUInt16LE(s, this.#index);
		this.#index += 2;
	}
	writeInt(i: number) {
		this.#buffer.writeUInt32LE(i, this.#index);
		this.#index += 4;
	}
	writeString(str: string) {
		this.writeShort(str.length);
		for (let i = 0; i < str.length; i++) {
			this.writeByte(str.charCodeAt(i));
		}
	}
}
