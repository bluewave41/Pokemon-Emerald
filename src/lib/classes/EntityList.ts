import type { Entity } from './entities/Entity';
import type { GridPosition } from './Position';

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
	getEntityOnTile(position: GridPosition) {
		return this.entities.find((entity) => entity.coords.getCurrent().equals(position));
	}
	getEntities() {
		return this.entities;
	}
	setEntities(entities: Entity[]) {
		this.entities = entities;
	}
}
