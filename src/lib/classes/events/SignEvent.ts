import type { BufferHelper } from '$lib/BufferHelper';
import SignEventUi from '$lib/components/events/SignEventUI.svelte';
import type { Events } from '$lib/interfaces/Events';
import { BaseEvent, type EventShape } from './BaseEvent';

interface SignEventShape extends EventShape {
	text: string;
}

export class SignEvent extends BaseEvent {
	id: number = 1;
	text: string;
	type: Events = 'sign';

	constructor(x: number, y: number, text: string) {
		super(x, y);
		this.text = text;
	}
	getEditorUI() {
		return {
			component: SignEventUi,
			props: {
				text: this.text
			}
		};
	}
	update(value: string) {
		this.text = value;
	}
	toJSON() {
		return {
			id: this.id,
			x: this.position.x,
			y: this.position.y,
			text: this.text
		};
	}
	static read(buffer: BufferHelper) {
		return new SignEvent(buffer.readByte(), buffer.readByte(), buffer.readString());
	}
	static write(buffer: BufferHelper, data: SignEventShape) {
		buffer.writeByte(data.id);
		buffer.writeByte(data.x);
		buffer.writeByte(data.y);
		buffer.writeString(data.text);
	}
}
