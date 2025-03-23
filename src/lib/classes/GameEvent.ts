import EventEmitter from 'events';

class InternalGameEvent extends EventEmitter {}

const GameEvent = new InternalGameEvent();
export default GameEvent;
