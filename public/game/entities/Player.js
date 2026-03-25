// Player entity with stats, leveling, combat

import { Entity } from './Entity.js';

export class Player extends Entity {
  constructor(config = {}) {
    super({
      x: config.x || 0, y: config.y || 0,
      width: 28, height: 32,
      speed: 120
    });

    this.name = config.name || 'Hero';
    this.class = config.class || 'warrior';

    // Core stats
    this.stats = {
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      strength: 5 + (this.class === 'warrior' ? 3 : 0),
      agility: 5 + (this.class === 'archer' ? 3 : 0),
      magic: 5 + (this.class === 'mage' ? 3 : 0),
      endurance: 5 + (this.class === 'warrior' ? 2 : 0),
      luck: 5
    };

    this.statPoints = 0;
    this.skillPoints = 0;

    // Derived stats
    this._recalcStats();

    this.gold = 50;

    // Equipment
    this.equipped = {
      weapon: null, armor: null, helmet: null,
      boots: null, ring: null, amulet: null
    };

    // Combat
    this.attackCooldown = 0;
    this.attackRange = 52;
    this.iframes = 0;     // invincibility frames

    // Action bar (8 slots, each: {type:'spell'|'skill'|'item', id, itemId})
    this.actionBar = new Array(8).fill(null);

    // Status effects
    this.statusEffects = {};  // { poison, burn, slow, berserker, etc. }

    // Skill bonuses (applied by SkillSystem)
    this.skillBonuses = {
      meleeDamageBonus: 0, rangedDamageBonus: 0, magicDamageBonus: 0,
      damageReduction: 0, cooldownReduction: 0, critBonus: 0,
      maxHPBonus: 0, maxManaBonus: 0, manaCostReduction: 0
    };

    // Movement direction
    this.facing = 'down';
    this.isMoving = false;
    this.animFrame = 0;
    this.animTimer = 0;
  }

  _recalcStats() {
    const s = this.stats;
    // Equipment bonuses
    let eqStr = 0, eqAgi = 0, eqMag = 0, eqEnd = 0, eqLuck = 0, eqDef = 0, eqDmg = 0, eqMana = 0;
    if (this.equipped) {
      for (const item of Object.values(this.equipped)) {
        if (!item) continue;
        eqStr += item.strBonus || 0;
        eqAgi += item.agiBonus || 0;
        eqMag += item.magicBonus || 0;
        eqEnd += item.endBonus || 0;
        eqLuck += item.luckBonus || 0;
        eqDef += item.defense || 0;
        eqDmg += item.damage || 0;
        eqMana += item.manaBonus || 0;
      }
    }
    const skillHP = this.skillBonuses ? this.skillBonuses.maxHPBonus || 0 : 0;
    const skillMana = this.skillBonuses ? this.skillBonuses.maxManaBonus || 0 : 0;

    this.maxHP = 50 + (s.endurance + eqEnd) * 10 + (s.level - 1) * 8 + skillHP;
    this.maxMana = 30 + (s.magic + eqMag) * 5 + (s.level - 1) * 4 + skillMana + eqMana;
    this.defense = (s.endurance + eqEnd) * 0.5 + eqDef + (s.level - 1) * 0.3;
    this.meleeDamage = (s.strength + eqStr) * 2 + eqDmg;
    this.rangedDamage = (s.agility + eqAgi) * 1.5 + eqDmg;
    this.magicDamage = s.magic + eqMag;
    this.critChance = 0.05 + (s.luck + eqLuck) * 0.01 + (this.skillBonuses ? this.skillBonuses.critBonus || 0 : 0);
    this.baseAttackCooldown = Math.max(0.3, 0.8 - (s.agility + eqAgi) * 0.02) * (1 - (this.skillBonuses ? this.skillBonuses.cooldownReduction || 0 : 0));

    // Clamp HP/mana if recalculating
    if (!this.hp) this.hp = this.maxHP;
    if (!this.mana) this.mana = this.maxMana;
    this.hp = Math.min(this.hp, this.maxHP);
    this.mana = Math.min(this.mana, this.maxMana);
  }

  update(dt, input, world) {
    let dx = 0, dy = 0;

    if (input.isDown('ArrowUp') || input.isDown('KeyW')) dy = -1;
    if (input.isDown('ArrowDown') || input.isDown('KeyS')) dy = 1;
    if (input.isDown('ArrowLeft') || input.isDown('KeyA')) dx = -1;
    if (input.isDown('ArrowRight') || input.isDown('KeyD')) dx = 1;

    // Normalize diagonal
    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

    // Apply slow effect
    let spd = this.speed;
    if (this.statusEffects.slow) spd *= (1 - this.statusEffects.slow.amount);

    const moved = dx !== 0 || dy !== 0;
    if (moved) {
      world.moveEntity(this, dx * spd * dt, dy * spd * dt);
      if (dx < 0) this.facing = 'left';
      else if (dx > 0) this.facing = 'right';
      else if (dy < 0) this.facing = 'up';
      else this.facing = 'down';
    }
    this.isMoving = moved;

    // Timers
    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.iframes > 0) this.iframes -= dt;

    // Status effect ticks
    for (const [key, effect] of Object.entries(this.statusEffects)) {
      effect.duration -= dt;
      if (effect.duration <= 0) {
        delete this.statusEffects[key];
      }
    }

    // Mana regen (2% per second)
    this.mana = Math.min(this.maxMana, this.mana + this.maxMana * 0.02 * dt);

    return moved;
  }

  takeDamage(amount) {
    if (this.iframes > 0) return 0;
    const dmgReduction = this.defense * 0.5 + (this.skillBonuses.damageReduction || 0) * 100;
    const actual = Math.max(1, Math.floor(amount - dmgReduction));
    this.hp = Math.max(0, this.hp - actual);
    this.iframes = 0.5;
    return actual;
  }

  addXP(amount) {
    this.stats.xp += amount;
    if (this.stats.xp >= this.stats.xpToNextLevel) {
      this._levelUp();
      return true;
    }
    return false;
  }

  _levelUp() {
    const s = this.stats;
    s.xp -= s.xpToNextLevel;
    s.level++;
    s.xpToNextLevel = Math.floor(100 * Math.pow(1.35, s.level - 1));
    this.statPoints += 3;
    this.skillPoints += 1;

    // Class bonus on level up
    if (this.class === 'warrior') s.strength++;
    else if (this.class === 'mage') s.magic++;
    else if (this.class === 'archer') s.agility++;

    this._recalcStats();
    // Full heal on level up
    this.hp = this.maxHP;
    this.mana = this.maxMana;
  }

  spendStatPoint(stat) {
    if (this.statPoints <= 0) return false;
    if (!['strength', 'agility', 'magic', 'endurance', 'luck'].includes(stat)) return false;
    this.stats[stat]++;
    this.statPoints--;
    this._recalcStats();
    return true;
  }

  useMana(amount) {
    const cost = amount * (1 - (this.skillBonuses.manaCostReduction || 0));
    if (this.mana < cost) return false;
    this.mana -= cost;
    return true;
  }

  equipItem(item, slot) {
    this.equipped[slot] = item;
    this._recalcStats();
  }

  unequipItem(slot) {
    const item = this.equipped[slot];
    this.equipped[slot] = null;
    this._recalcStats();
    return item;
  }

  setActionBar(slot, data) {
    this.actionBar[slot] = data;
  }

  applySkillBonuses(bonuses) {
    this.skillBonuses = { ...this.skillBonuses, ...bonuses };
    this._recalcStats();
  }
}

export default Player;
