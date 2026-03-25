// Base entity class

export class Entity {
  constructor(config = {}) {
    this.id = config.id || Math.random().toString(36).substr(2, 9);
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.width = config.width || 28;
    this.height = config.height || 32;
    this.speed = config.speed || 80;
    this.hp = config.hp || 100;
    this.maxHP = config.maxHP || 100;
  }

  getBounds() {
    return { x: this.x, y: this.y, w: this.width, h: this.height };
  }

  getCenterX() { return this.x + this.width / 2; }
  getCenterY() { return this.y + this.height / 2; }

  distanceTo(other) {
    const dx = this.getCenterX() - other.getCenterX();
    const dy = this.getCenterY() - other.getCenterY();
    return Math.sqrt(dx * dx + dy * dy);
  }

  isAlive() { return this.hp > 0; }

  takeDamage(amount) {
    const actual = Math.max(1, Math.floor(amount));
    this.hp = Math.max(0, this.hp - actual);
    return actual;
  }

  heal(amount) {
    const prev = this.hp;
    this.hp = Math.min(this.maxHP, this.hp + Math.floor(amount));
    return this.hp - prev;
  }

  overlaps(other) {
    return this.x < other.x + (other.width || 28) && this.x + this.width > other.x &&
           this.y < other.y + (other.height || 32) && this.y + this.height > other.y;
  }
}

export default Entity;
