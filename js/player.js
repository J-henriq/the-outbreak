/**
 * Arcane Engineers - Player System
 * Manages player classes, stats, gear, abilities, and progression
 */

class Player {
  constructor(id, playerClass, x, y, isLocalPlayer = false) {
    this.id = id;
    this.playerClass = playerClass;
    this.isLocalPlayer = isLocalPlayer;

    const classData = CONFIG.CLASS_DATA[playerClass];
    const baseStats = classData.baseStats;

    // Position
    this.x = x;
    this.y = y;
    this.width = CONFIG.PLAYER_SIZE;
    this.height = CONFIG.PLAYER_SIZE;
    this.speed = CONFIG.PLAYER_SPEED;

    // Level and experience
    this.level = 1;
    this.exp = 0;
    this.expToLevel = CONFIG.LEVEL_UP_EXP;
    this.skillPoints = 0;

    // Stats (base + bonuses)
    this.stats = { ...baseStats };
    this.statBoosts = { engineering: 0, magic: 0, dexterity: 0, endurance: 0 };

    // Health and mana
    this.maxHealth = CONFIG.BASE_HEALTH + classData.healthBonus + baseStats.endurance * 5;
    this.health = this.maxHealth;
    this.maxMana = CONFIG.BASE_MANA + classData.manaBonus + baseStats.magic * 3;
    this.mana = this.maxMana;
    this.manaRegen = 2; // per second

    // Gear
    this.gear = {};
    CONFIG.GEAR_SLOTS.forEach(slot => { this.gear[slot] = null; });

    // Inventory
    this.inventory = [];
    this.maxInventorySize = 20;

    // Machines deployed
    this.machines = [];
    this.maxMachines = 3;

    // Abilities
    this.abilities = this.initAbilities(playerClass);
    this.abilityCooldowns = {};

    // Skill tree
    this.unlockedSkills = new Set();

    // Combat state
    this.isAlive = true;
    this.invincibleUntil = 0;
    this.facing = { x: 1, y: 0 };
    this.isMoving = false;
    this.attackCooldown = 0;
    this.baseAttackDamage = 10 + baseStats.engineering * 2;
    this.baseAttackRange = 120;

    // Visual
    this.color = classData.color;
    this.name = playerClass;

    // Animation
    this.animFrame = 0;
    this.animTimer = 0;

    // Currency
    this.arcaneShards = 0; // crafting currency
    this.gold = 100;

    // Applied set bonuses
    this.activeSets = {};

    // Cosmetics
    this.cosmetic = null;
  }

  initAbilities(playerClass) {
    const abilityMap = {
      Golemancer: ['SUMMON_STONE_GOLEM', 'ARCANE_STRIKE', 'ENERGY_SHIELD'],
      Alchemist: ['ALCHEMICAL_BLAST', 'ARCANE_STRIKE', 'ENGINEER_TURRET'],
      Artificer: ['DEPLOY_SHOCK_TRAP', 'ENGINEER_TURRET', 'ARCANE_STRIKE']
    };
    const abilityKeys = abilityMap[playerClass] || [];
    return abilityKeys.map(key => ({ key, ...CONFIG.ABILITIES[key] }));
  }

  getTotalStat(statName) {
    return (this.stats[statName] || 0) + (this.statBoosts[statName] || 0);
  }

  getAttackDamage() {
    const engBonus = this.getTotalStat('engineering') * 2;
    const magBonus = this.getTotalStat('magic') * 1.5;
    return Math.floor(this.baseAttackDamage + engBonus + magBonus * 0.3);
  }

  getAttackRange() {
    const dexBonus = this.getTotalStat('dexterity') * 3;
    return this.baseAttackRange + dexBonus;
  }

  getMoveSpeed() {
    const dexBonus = this.getTotalStat('dexterity') * 0.1;
    return this.speed + dexBonus;
  }

  getMaxHealth() {
    const endBonus = this.getTotalStat('endurance') * 5;
    return this.maxHealth + endBonus;
  }

  getMaxMana() {
    const magBonus = this.getTotalStat('magic') * 3;
    return this.maxMana + magBonus;
  }

  gainExp(amount) {
    if (!this.isAlive) return;
    this.exp += amount;
    while (this.exp >= this.expToLevel && this.level < CONFIG.MAX_LEVEL) {
      this.exp -= this.expToLevel;
      this.levelUp();
    }
  }

  levelUp() {
    this.level++;
    this.skillPoints++;
    this.expToLevel = Math.floor(CONFIG.LEVEL_UP_EXP * Math.pow(CONFIG.EXP_SCALE, this.level - 1));

    // Increase base stats
    const classData = CONFIG.CLASS_DATA[this.playerClass];
    const dominant = Object.entries(classData.baseStats).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    this.stats[dominant] += 2;
    Object.keys(this.stats).forEach(s => {
      if (s !== dominant) this.stats[s] += 1;
    });

    // Increase max health and mana
    this.maxHealth += 10 + this.getTotalStat('endurance');
    this.maxMana += 5 + this.getTotalStat('magic');
    this.health = Math.min(this.health + 30, this.getMaxHealth());
    this.mana = Math.min(this.mana + 20, this.getMaxMana());

    return { level: this.level, message: `Level Up! Now level ${this.level}` };
  }

  equipGear(item) {
    if (!item || !item.slot) return false;
    const old = this.gear[item.slot];
    this.gear[item.slot] = item;

    // Remove old gear stat bonuses
    if (old && old.statBonuses) {
      Object.entries(old.statBonuses).forEach(([stat, val]) => {
        this.statBoosts[stat] = (this.statBoosts[stat] || 0) - val;
      });
    }

    // Apply new gear stat bonuses
    if (item.statBonuses) {
      Object.entries(item.statBonuses).forEach(([stat, val]) => {
        this.statBoosts[stat] = (this.statBoosts[stat] || 0) + val;
      });
    }

    this.recalculateSetBonuses();
    return true;
  }

  unequipGear(slot) {
    const item = this.gear[slot];
    if (!item) return null;
    this.gear[slot] = null;
    if (item.statBonuses) {
      Object.entries(item.statBonuses).forEach(([stat, val]) => {
        this.statBoosts[stat] = (this.statBoosts[stat] || 0) - val;
      });
    }
    this.recalculateSetBonuses();
    return item;
  }

  recalculateSetBonuses() {
    // Remove previous set bonuses
    Object.values(this.activeSets).forEach(bonus => {
      if (bonus && bonus.statBonuses) {
        Object.entries(bonus.statBonuses).forEach(([stat, val]) => {
          this.statBoosts[stat] = (this.statBoosts[stat] || 0) - val;
        });
      }
    });
    this.activeSets = {};

    const equippedNames = Object.values(this.gear).filter(Boolean).map(g => g.name);
    Object.entries(CONFIG.SETS).forEach(([setKey, setData]) => {
      const count = setData.pieces.filter(p => equippedNames.includes(p)).length;
      let activeBonus = null;
      Object.entries(setData.bonuses).forEach(([req, bonus]) => {
        if (count >= parseInt(req)) activeBonus = bonus;
      });
      if (activeBonus) {
        this.activeSets[setKey] = { count, ...activeBonus };
        Object.entries(activeBonus).forEach(([k, v]) => {
          if (typeof v === 'number' && this.statBoosts[k] !== undefined) {
            this.statBoosts[k] = (this.statBoosts[k] || 0) + v;
          }
        });
      }
    });
  }

  addToInventory(item) {
    if (this.inventory.length >= this.maxInventorySize) return false;
    this.inventory.push(item);
    return true;
  }

  removeFromInventory(itemId) {
    const idx = this.inventory.findIndex(i => i.id === itemId);
    if (idx !== -1) {
      const [item] = this.inventory.splice(idx, 1);
      return item;
    }
    return null;
  }

  useAbility(abilityIndex, targetX, targetY, world) {
    const ability = this.abilities[abilityIndex];
    if (!ability) return null;

    const now = Date.now();
    const lastUsed = this.abilityCooldowns[ability.key] || 0;
    if (now - lastUsed < ability.cooldown) return null;
    if (this.mana < ability.manaCost) return null;

    this.mana -= ability.manaCost;
    this.abilityCooldowns[ability.key] = now;

    return this.executeAbility(ability, targetX, targetY, world);
  }

  executeAbility(ability, targetX, targetY, world) {
    switch (ability.type) {
      case 'projectile': {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        return {
          type: 'projectile',
          x: this.x,
          y: this.y,
          vx: (dx / dist) * 6,
          vy: (dy / dist) * 6,
          damage: ability.damage + this.getTotalStat('magic') * 3,
          range: ability.range || 200,
          radius: ability.radius || 0,
          color: ability.color || '#9b59b6',
          owner: this.id,
          abilityKey: ability.key
        };
      }
      case 'summon':
      case 'deploy': {
        const machineKey = ability.machine;
        const machineData = CONFIG.MACHINES[machineKey];
        if (!machineData) return null;
        if (this.machines.length >= this.maxMachines) return null;
        return {
          type: 'deploy',
          machineKey,
          x: targetX,
          y: targetY,
          owner: this.id,
          machineData: { ...machineData }
        };
      }
      default:
        return null;
    }
  }

  getAbilityCooldownPercent(abilityIndex) {
    const ability = this.abilities[abilityIndex];
    if (!ability) return 0;
    const now = Date.now();
    const lastUsed = this.abilityCooldowns[ability.key] || 0;
    const elapsed = now - lastUsed;
    if (elapsed >= ability.cooldown) return 1;
    return elapsed / ability.cooldown;
  }

  takeDamage(amount) {
    if (!this.isAlive) return 0;
    const now = Date.now();
    if (now < this.invincibleUntil) return 0;

    const actual = Math.max(1, amount - this.getDamageReduction());
    this.health -= actual;
    this.invincibleUntil = now + 300;

    if (this.health <= 0) {
      this.health = 0;
      this.isAlive = false;
    }
    return actual;
  }

  getDamageReduction() {
    return Math.floor(this.getTotalStat('endurance') * 0.5);
  }

  heal(amount) {
    const oldHealth = this.health;
    this.health = Math.min(this.health + amount, this.getMaxHealth());
    return this.health - oldHealth;
  }

  restoreMana(amount) {
    const oldMana = this.mana;
    this.mana = Math.min(this.mana + amount, this.getMaxMana());
    return this.mana - oldMana;
  }

  revive() {
    this.isAlive = true;
    this.health = Math.floor(this.getMaxHealth() * 0.5);
    this.invincibleUntil = Date.now() + 3000;
  }

  unlockSkill(skillId) {
    if (this.skillPoints <= 0) return false;
    const tree = CONFIG.SKILL_TREES[this.playerClass];
    if (!tree) return false;
    const skill = tree.find(s => s.id === skillId);
    if (!skill) return false;
    if (this.unlockedSkills.has(skillId)) return false;
    if (skill.cost > this.skillPoints) return false;
    const requirementsMet = skill.requires.every(r => this.unlockedSkills.has(r));
    if (!requirementsMet) return false;

    this.unlockedSkills.add(skillId);
    this.skillPoints -= skill.cost;

    // Apply stat bonuses from skill
    if (skill.statBonus) {
      Object.entries(skill.statBonus).forEach(([stat, val]) => {
        this.statBoosts[stat] = (this.statBoosts[stat] || 0) + val;
      });
    }
    return true;
  }

  update(deltaTime) {
    if (!this.isAlive) return;

    // Mana regeneration
    const manaRegen = (this.manaRegen + this.getTotalStat('magic') * 0.1) * (deltaTime / 1000);
    this.mana = Math.min(this.mana + manaRegen, this.getMaxMana());

    // Animation
    this.animTimer += deltaTime;
    if (this.animTimer > 200) {
      this.animTimer = 0;
      if (this.isMoving) {
        this.animFrame = (this.animFrame + 1) % 4;
      } else {
        this.animFrame = 0;
      }
    }
  }

  draw(ctx, camera) {
    if (!this.isAlive) return;

    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;
    const half = this.width / 2;

    // Shadow
    ctx.beginPath();
    ctx.ellipse(screenX, screenY + half - 2, half * 0.8, half * 0.3, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fill();

    // Body
    ctx.save();
    if (Date.now() < this.invincibleUntil) {
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(Date.now() * 0.02);
    }

    // Glow effect
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(screenX - half, screenY - half, this.width, this.height, 6);
    } else {
      ctx.rect(screenX - half, screenY - half, this.width, this.height);
    }
    ctx.fill();
    ctx.shadowBlur = 0;

    // Class icon (simplified)
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = `bold ${half}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const icons = { Golemancer: 'G', Alchemist: 'A', Artificer: 'F' };
    ctx.fillText(icons[this.playerClass] || '?', screenX, screenY);

    ctx.restore();

    // Name tag
    if (this.isLocalPlayer) {
      ctx.fillStyle = CONFIG.UI.ACCENT_GOLD;
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${this.name} Lv.${this.level}`, screenX, screenY - half - 2);
    }

    // Health bar above player
    const barW = 36;
    const barH = 4;
    const barX = screenX - barW / 2;
    const barY = screenY - half - 10;

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = CONFIG.UI.HEALTH_BAR;
    ctx.fillRect(barX, barY, barW * (this.health / this.getMaxHealth()), barH);
  }

  serialize() {
    return {
      id: this.id,
      playerClass: this.playerClass,
      level: this.level,
      exp: this.exp,
      stats: { ...this.stats },
      statBoosts: { ...this.statBoosts },
      health: this.health,
      maxHealth: this.maxHealth,
      mana: this.mana,
      maxMana: this.maxMana,
      gear: { ...this.gear },
      unlockedSkills: Array.from(this.unlockedSkills),
      skillPoints: this.skillPoints,
      gold: this.gold,
      arcaneShards: this.arcaneShards
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Player;
}
