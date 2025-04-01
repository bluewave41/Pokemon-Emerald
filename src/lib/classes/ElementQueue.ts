import type { UIElement } from './ui/UIElement';

export class ElementQueue {
	elements: UIElement[] = [];

	constructor() {}
	addElement(element: UIElement) {
		this.elements.push(element);
	}
	hasElement(id: string) {
		return this.elements.some((el) => el.id === id);
	}
	getElement(id: string) {
		return this.elements.find((el) => el.id === id);
	}
	removeElement(id: string) {
		const index = this.elements.findLastIndex((el) => el.id === id);
		this.elements.splice(index, 1);
	}
	getElements() {
		return this.elements;
	}
}
