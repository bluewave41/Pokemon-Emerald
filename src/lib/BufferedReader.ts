export class BufferedReader {
	#buffer: Buffer;
	#index: number = 0;

	constructor(buffer: Buffer) {
		this.#buffer = buffer;
	}
	readByte() {
		return this.#buffer.readUInt8(this.#index++);
	}
	readShort() {
		const s = this.#buffer.readUInt16LE(this.#index);
		this.#index += 2;
		return s;
	}
	readInt() {
		const i = this.#buffer.readUInt32LE(this.#index);
		this.#index += 4;
		return i;
	}
	readString() {
		const length = this.readShort();
		let str = '';
		for (let i = 0; i < length; i++) {
			str += String.fromCharCode(this.readByte());
		}
		return str;
	}
}
