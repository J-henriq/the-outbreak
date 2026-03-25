// Socket.IO client network layer

export class Network {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.playerId = null;
    this.handlers = {};
    this.moveThrottle = 0;
    this.MOVE_INTERVAL = 50; // ms between move updates
  }

  connect(url = '') {
    if (typeof io === 'undefined') {
      console.warn('Socket.IO not available, running offline');
      return;
    }
    this.socket = io(url, { transports: ['websocket', 'polling'] });

    this.socket.on('connect', () => {
      this.connected = true;
      this.playerId = this.socket.id;
      console.log('Connected to server:', this.socket.id);
      this._emit('connect', { id: this.socket.id });
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('Disconnected from server');
      this._emit('disconnect', {});
    });

    this.socket.on('players:current', (players) => this._emit('players:current', players));
    this.socket.on('player:joined', (data) => this._emit('player:joined', data));
    this.socket.on('player:moved', (data) => this._emit('player:moved', data));
    this.socket.on('player:attacked', (data) => this._emit('player:attacked', data));
    this.socket.on('player:updated', (data) => this._emit('player:updated', data));
    this.socket.on('player:left', (data) => this._emit('player:left', data));
    this.socket.on('pvp:hit', (data) => this._emit('pvp:hit', data));
    this.socket.on('pvp:attacked', (data) => this._emit('pvp:attacked', data));
    this.socket.on('chat:message', (data) => this._emit('chat:message', data));
  }

  on(event, handler) {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(handler);
  }

  off(event, handler) {
    if (!this.handlers[event]) return;
    this.handlers[event] = this.handlers[event].filter(h => h !== handler);
  }

  _emit(event, data) {
    if (this.handlers[event]) this.handlers[event].forEach(h => h(data));
  }

  joinGame(playerData) {
    if (this.socket) this.socket.emit('player:join', playerData);
  }

  sendMove(x, y, zone) {
    if (!this.socket || !this.connected) return;
    const now = Date.now();
    if (now - this.moveThrottle < this.MOVE_INTERVAL) return;
    this.moveThrottle = now;
    this.socket.emit('player:move', { x, y, zone });
  }

  sendAttack(data) {
    if (this.socket) this.socket.emit('player:attack', data);
  }

  sendUpdate(data) {
    if (this.socket) this.socket.emit('player:update', data);
  }

  sendPvpAttack(targetId, damage, type) {
    if (this.socket) this.socket.emit('pvp:attack', { targetId, damage, type });
  }

  sendChat(message) {
    if (this.socket) this.socket.emit('chat:message', { message });
  }

  disconnect() {
    if (this.socket) { this.socket.disconnect(); this.socket = null; }
  }
}

export default Network;
