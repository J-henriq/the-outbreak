// Enemy entity with AI

import { Entity } from './Entity.js';
import { ENEMIES as ENEMY_DEFS } from '../data/enemies.js';
import { createItem } from '../data/items.js';

export class Enemy extends Entity {
  constructor(type, x, y) {
    const def = ENEMY_DEFS[type];
    if (!def) throw new Error(`Unknown enemy type: ${type}`);

    super({
      x, y,
      width: def.size || 28,
      height: def.size || 28,
      speed: def.speed || 60
    });

    this.type = type;
    this.name = def.name;
    this.hp = def.hp;
    this.maxHP = def.hp;
    this.damage = def.damage;
    this.defense = def.defense || 0;
    this.xpReward = def.xpReward || 10;  // used by Game
    this.goldDropRange = def.goldDrop || [0, 5];
    this.color = def.color;
    this.size = def.size || 28;
    this.aggroRange = def.aggroRange || 100;
    this.attackRange = def.attackRange || 40;
    this.attackCooldown = def.attackCooldown || 1.5;
    this.isBoss = def.isBoss || false;
    this.isRanged = def.ranged || false;
    this.isMagic = def.magic || false;
    this.isFireBreath = def.fireBreath || false;
    this.drops = def.drops || [];

    // Expose stats for Game.js to use
    this.stats = { xpReward: def.xpReward || 10 };

    // AI state
    this.aiState = 'idle';
    this.wanderTimer = 0;
    this.wanderDx = 0;
    this.wanderDy = 0;
    this.attackTimer = 0;
    this.fleeHP = 0.2;
    this.hitFlash = 0;
    this.isAttacking = false;
    this.stunTimer = 0;
    this.slowFactor = 1.0;
    this.deathAnim = null;
    this._deathTimer = null;

    // Patrol
    this.patrolOrigin = { x, y };
  }

  update(dt, player, world) {
    if (this.hp <= 0) return;

    this.hitFlash = Math.max(0, this.hitFlash - dt * 3);
    this.attackTimer = Math.max(0, this.attackTimer - dt);
    if (this.stunTimer > 0) { this.stunTimer -= dt; return; }

    const dist = this.distanceTo(player);

    // AI state machine
    if (this.hp / this.maxHP < this.fleeHP && !this.isBoss) {
      this.aiState = 'flee';
    } else if (dist < this.aggroRange && player.hp > 0) {
      this.aiState = dist < this.attackRange ? 'attack' : 'chase';
    } else {
      this.aiState = 'idle';
    }

    const spd = this.speed * this.slowFactor;

    if (this.aiState === 'chase') {
      const dx = player.x - this.x, dy = player.y - this.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      world.moveEntity(this, (dx / len) * spd * dt, (dy / len) * spd * dt);
    } else if (this.aiState === 'flee') {
      const dx = this.x - player.x, dy = this.y - player.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      world.moveEntity(this, (dx / len) * spd * dt * 1.3, (dy / len) * spd * dt * 1.3);
    } else if (this.aiState === 'idle') {
      this.wanderTimer -= dt;
      if (this.wanderTimer <= 0) {
        this.wanderTimer = 1.5 + Math.random() * 2;
        this.wanderDx = (Math.random() - 0.5) * 2;
        this.wanderDy = (Math.random() - 0.5) * 2;
      }
      world.moveEntity(this, this.wanderDx * spd * 0.3 * dt, this.wanderDy * spd * 0.3 * dt);
    }
    // 'attack' state: handled by CombatSystem
  }

  takeDamage(amount) {
    const actual = Math.max(1, Math.floor(amount - this.defense * 0.5));
    this.hp = Math.max(0, this.hp - actual);
    this.hitFlash = 0.3;
    return actual;
  }

  getGoldDrop() {
    const [min, max] = this.goldDropRange;
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  getLoot(playerLuck = 5) {
    const luckMult = 1 + (playerLuck - 5) * 0.04;
    const results = [];
    for (const drop of this.drops) {
      if (Math.random() < drop.chance * luckMult) {
        const qty = drop.qty[0] + Math.floor(Math.random() * (drop.qty[1] - drop.qty[0] + 1));
        const item = createItem(drop.itemId, qty);
        if (item) results.push(item);
      }
    }
    return results;
  }

  applyStun(duration) { this.stunTimer = duration; }

  applySlow(amount, duration) {
    this.slowFactor = 1 - amount;
    setTimeout(() => { this.slowFactor = 1.0; }, duration);
  }
}

export default Enemy;
