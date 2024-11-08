import { PERMISSIONS } from "./Permissions";

export class Tile {
  id: number;
  permissions: number;

  constructor(id: number, permissions: number) {
    this.id = id;
    this.permissions = permissions;
  }
  getPermissions() {
    return PERMISSIONS[this.permissions];
  }
}
