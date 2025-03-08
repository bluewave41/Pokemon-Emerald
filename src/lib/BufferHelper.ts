export class BufferHelper {
	#buffer: Buffer;
	#index: number = 0;

	constructor(buffer: Buffer) {
		this.#buffer = buffer;
	}

	readByte() {
		return this.#buffer.readUInt8(this.#index++);
	}
	readBoolean() {
		return Boolean(this.#buffer.readUInt8(this.#index++));
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
	writeByte(b: number) {
		this.#buffer.writeUInt8(b, this.#index++);
	}
	writeBoolean(bool: boolean) {
		this.#buffer.writeUInt8(bool ? 1 : 0, this.#index++);
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
	seek(index: number) {
		this.#index = index;
	}
	expand(size: number) {
		const newBuffer = Buffer.alloc(this.#buffer.length + size);
		this.#buffer.copy(newBuffer);
		this.#buffer = newBuffer;
	}
	getUsed() {
		return this.#buffer.subarray(0, this.#index);
	}
	getBuffer() {
		return this.#buffer;
	}
	hasMore() {
		return this.#index < this.#buffer.length;
	}
	get length() {
		return this.#buffer.length;
	}
}
