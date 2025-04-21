import type { Direction, EventType, WarpType } from '@prisma/client';

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
	readEventId() {
		switch (this.readByte()) {
			case 1:
				return 'sign';
			case 2:
				return 'warp';
		}
	}
	readDirection(): Direction {
		const b = this.readByte();
		switch (b) {
			case 1:
				return 'UP';
			case 2:
				return 'LEFT';
			case 3:
				return 'RIGHT';
			case 4:
				return 'DOWN';
		}
		throw new Error(`Invalid direction: ${b}`);
	}
	readWarpType(): WarpType {
		const b = this.readByte();
		switch (b) {
			case 1:
				return 'DOOR';
			case 2:
				return 'CAVE';
			case 3:
				return 'STAIRS';
			default:
				throw new Error(`Invalid warp type received from buffer: ${b}`);
		}
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
	writeString(str: string | null) {
		if (!str) {
			this.writeShort(0);
			return;
		}
		this.writeShort(str.length);
		for (let i = 0; i < str.length; i++) {
			this.writeByte(str.charCodeAt(i));
		}
	}
	writeEventId(event: EventType) {
		switch (event) {
			case 'SIGN':
				this.writeByte(1);
				break;
			case 'WARP':
				this.writeByte(2);
				break;
		}
	}
	writeDirection(direction: Direction | null) {
		switch (direction) {
			case 'UP':
				this.writeByte(1);
				break;
			case 'LEFT':
				this.writeByte(2);
				break;
			case 'RIGHT':
				this.writeByte(3);
				break;
			case 'DOWN':
				this.writeByte(4);
				break;
			case null:
				this.writeByte(0);
				break;
		}
	}
	writeWarpType(type: WarpType) {
		switch (type) {
			case 'DOOR':
				this.writeByte(1);
				break;
			case 'CAVE':
				this.writeByte(2);
				break;
			case 'STAIRS':
				this.writeByte(3);
				break;
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
	get index() {
		return this.#index;
	}
}
