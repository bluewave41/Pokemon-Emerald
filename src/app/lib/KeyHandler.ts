export class KeyHandler {
  keys: Record<string, boolean> = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  };
  constructor() {}
  keyDown(key: string) {
    this.keys[key] = true;
  }
  keyUp(key: string) {
    this.keys[key] = false;
  }
  getKeyStatus(key: string) {
    return this.keys[key];
  }
}
