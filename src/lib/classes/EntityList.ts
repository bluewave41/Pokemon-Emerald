import type { Entity } from './entities/Entity';

export class EntityList {
	entities: Entity[] = [];

	constructor() {}
	addEntity(entity: Entity) {
		this.entities.push(entity);
	}
	removeEntity(id: string) {
		this.entities = this.entities.filter((entity) => entity.id !== id);
	}
	getEntity(id: string) {
		return this.entities.find((entity) => entity.id === id);
	}
	getEntities() {
		return this.entities;
	}
	setEntities(entities: Entity[]) {
		this.entities = entities;
	}
}
