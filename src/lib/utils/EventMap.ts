import { SignEvent } from '$lib/classes/events/SignEvent';

export const EventMap: Record<number, typeof SignEvent | null> = {
	0: null,
	1: SignEvent
};
