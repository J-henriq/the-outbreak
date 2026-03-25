// ─────────────────────────────────────────────────────────
//  ASHENWILD  –  Entities  (Player, Enemy, Projectile, Loot)
// ─────────────────────────────────────────────────────────

// ── Floating damage number ────────────────────────────────
class FloatText {
  constructor(x, y, text, color) {
    this.x = x; this.y = y;
    this.text  = text;
    this.color = color || '#fff';
    this.life  = 1.0;   // 0..1
    this.vy    = -60;   // pixels/sec
  }
  update(dt) {
    this.y    += this.vy * dt;
    this.vy   *= 0.92;
    this.life -= dt * 0.7;
  }
  dead() { return this.life <= 0; }
  draw(ctx, camX, camY) {
    const sx = this.x - camX;
    const sy = this.y - camY;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle   = this.color;
    ctx.font = `bold 14px 'Cinzel', serif`;
    ctx.textAlign   = 'center';
    ctx.fillText(this.text, sx, sy);
    ctx.restore();
  }
}

// ── Projectile ───────────────────────────────────────────
class Projectile {
  constructor(x, y, dx, dy, dmg, fromPlayer, pierce) {
    this.x = x; this.y = y;
    this.dx = dx; this.dy = dy;
    this.dmg = dmg;
    this.fromPlayer = fromPlayer;
    this.pierce = pierce || false;
    this.speed  = CFG.PROJECTILE_SPEED * 60;
    this.life   = 1.5; // seconds
    this.hit    = false;
    this.size   = fromPlayer ? 5 : 4;
  }

  update(dt, world) {
    this.x += this.dx * this.speed * dt;
    this.y += this.dy * this.speed * dt;
    this.life -= dt;

    if (world.isBlockedPx(this.x, this.y)) {
      this.hit = true;
    }
  }

  dead() { return this.hit || this.life <= 0; }

  draw(ctx, camX, camY) {
    const C = CFG.C;
    const sx = this.x - camX;
    const sy = this.y - camY;
    ctx.save();
    ctx.fillStyle = this.fromPlayer ? C.PROJ_PLAYER : C.PROJ_ENEMY;
    // Glow
    ctx.shadowColor = this.fromPlayer ? '#ffe080' : '#ff4020';
    ctx.shadowBlur  = 8;
    ctx.beginPath();
    ctx.arc(sx, sy, this.size, 0, Math.PI * 2);
    ctx.fill();
    // Trail
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(sx - this.dx * 12, sy - this.dy * 12, this.size * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ── Loot Drop ────────────────────────────────────────────
class LootDrop {
  constructor(x, y, itemId) {
    this.x = x; this.y = y;
    this.itemId = itemId;
    this.bob    = 0;
    this.pulse  = 0;
    this.data   = ITEMS.find(i => i.id === itemId);
    this.life   = 30; // seconds before despawn
  }

  update(dt) {
    this.bob   += dt * 2.5;
    this.pulse += dt * 3;
    this.life  -= dt;
  }

  dead() { return this.life <= 0; }

  draw(ctx, camX, camY) {
    if (!this.data) return;
    const sx = this.x - camX;
    const sy = this.y - camY + Math.sin(this.bob) * 3;

    // Glow ring (tier color)
    const tierCol = TIER_COLORS[this.data.tier] || '#aaa';
    ctx.save();
    ctx.globalAlpha = 0.35 + Math.sin(this.pulse) * 0.15;
    ctx.shadowColor = tierCol;
    ctx.shadowBlur  = 14;
    ctx.strokeStyle = tierCol;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.arc(sx, sy, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Icon
    ctx.font = '18px serif';
    ctx.textAlign  = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.data.emoji, sx, sy);
  }
}

// ── Enemy ────────────────────────────────────────────────
class Enemy {
  constructor(def, x, y) {
    this.def  = def;
    this.id   = def.id;
    this.name = def.name;
    this.x    = x;
    this.y    = y;
    this.maxHp = def.hp;
    this.hp    = def.hp;
    this.atk   = def.atk;
    this.def   = def.def;
    this.spd   = def.spd * 30; // pixels/sec
    this.xp    = def.xp;
    this.boss  = def.boss || false;
    this.color = def.color;
    this.emoji = def.emoji;
    this.size  = this.boss ? 26 : 16;

    // AI state
    this.state      = 'idle';   // idle | aggro | attack | stunned
    this.aggroRange = this.boss ? 400 : 220;
    this.attackRange= this.boss ? 70  : 50;
    this.attackTimer= 0;
    this.attackCd   = this.boss ? 1.5 : 2.0;
    this.stunTimer  = 0;
    this.marked     = false;
    this.markedTimer= 0;
    this.slowed     = false;
    this.slowTimer  = 0;
    this.dotDmg     = 0;
    this.dotTimer   = 0;
    this.vx = 0; this.vy = 0;

    // Boss ability
    this.bossAbilityTimer = 0;
    this.bossAbilityCd    = 6;
    this.bossAbilityActive= false;
    this.bossAbilityVisual= 0;

    // Hit flash
    this.hitFlash = 0;
  }

  dist(px, py) {
    const dx = this.x - px, dy = this.y - py;
    return Math.sqrt(dx*dx + dy*dy);
  }

  takeDamage(dmg) {
    const actual = Math.max(1, dmg - (this.def * 0.5));
    this.hp = Math.max(0, this.hp - actual);
    this.hitFlash = 0.15;
    return actual;
  }

  stun(t) { this.state = 'stunned'; this.stunTimer = t; }
  slow(t) { this.slowed = true; this.slowTimer = t; }
  applyDot(dmg, dur) { this.dotDmg = dmg; this.dotTimer = dur; }
  mark(dur) { this.marked = true; this.markedTimer = dur; }

  dead() { return this.hp <= 0; }

  update(dt, player, world, projectiles) {
    if (this.dead()) return;

    // Stun
    if (this.state === 'stunned') {
      this.stunTimer -= dt;
      if (this.stunTimer <= 0) this.state = 'aggro';
      this.hitFlash -= dt;
      return;
    }

    // Slow
    if (this.slowed) {
      this.slowTimer -= dt;
      if (this.slowTimer <= 0) this.slowed = false;
    }

    // DoT
    if (this.dotTimer > 0) {
      this.dotTimer -= dt;
      this.hp = Math.max(0, this.hp - this.dotDmg * dt);
    }

    // Mark
    if (this.marked) {
      this.markedTimer -= dt;
      if (this.markedTimer <= 0) this.marked = false;
    }

    // Hit flash
    this.hitFlash = Math.max(0, this.hitFlash - dt * 3);

    const d = this.dist(player.x, player.y);

    // State machine
    if (this.state === 'idle') {
      if (d < this.aggroRange) this.state = 'aggro';
    }

    if (this.state === 'aggro') {
      if (d > this.attackRange) {
        // Move toward player
        const speed = this.spd * (this.slowed ? 0.35 : 1);
        const ang = Math.atan2(player.y - this.y, player.x - this.x);
        this.vx = Math.cos(ang) * speed;
        this.vy = Math.sin(ang) * speed;

        const nx = this.x + this.vx * dt;
        const ny = this.y + this.vy * dt;
        if (!world.isBlockedPx(nx, this.y)) this.x = nx;
        if (!world.isBlockedPx(this.x, ny)) this.y = ny;
      } else {
        // Attack
        this.attackTimer -= dt;
        if (this.attackTimer <= 0) {
          this.attackTimer = this.attackCd;
          // Ranged enemies shoot projectile; melee hit directly
          if (this.boss) {
            // Boss fires 3-way spread
            for (let a = -0.3; a <= 0.31; a += 0.3) {
              const ang = Math.atan2(player.y - this.y, player.x - this.x) + a;
              projectiles.push(new Projectile(this.x, this.y, Math.cos(ang), Math.sin(ang),
                this.atk, false));
            }
          } else {
            const ang = Math.atan2(player.y - this.y, player.x - this.x);
            projectiles.push(new Projectile(this.x, this.y, Math.cos(ang), Math.sin(ang),
              this.atk, false));
          }
        }
      }

      // Boss ability
      if (this.boss) {
        this.bossAbilityTimer -= dt;
        if (this.bossAbilityTimer <= 0) {
          this.bossAbilityTimer  = this.bossAbilityCd;
          this.bossAbilityActive = true;
          this.bossAbilityVisual = 0.8;
          // Burst projectiles in all directions
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
            projectiles.push(new Projectile(this.x, this.y, Math.cos(a), Math.sin(a),
              this.atk * 1.5, false));
          }
        }
        if (this.bossAbilityActive) {
          this.bossAbilityVisual -= dt;
          if (this.bossAbilityVisual <= 0) this.bossAbilityActive = false;
        }
      }
    }
  }

  draw(ctx, camX, camY) {
    const sx = this.x - camX;
    const sy = this.y - camY;
    const r  = this.size;

    ctx.save();

    // Shadow
    ctx.fillStyle = CFG.C.SHADOW;
    ctx.beginPath();
    ctx.ellipse(sx, sy + r, r * 0.9, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Boss ability shockwave
    if (this.bossAbilityActive && this.bossAbilityVisual > 0) {
      const wave = 1 - this.bossAbilityVisual;
      ctx.globalAlpha = this.bossAbilityVisual * 0.5;
      ctx.strokeStyle = '#ff40ff';
      ctx.lineWidth   = 3;
      ctx.beginPath();
      ctx.arc(sx, sy, r + wave * 120, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Mark indicator
    if (this.marked) {
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = '#ff9900';
      ctx.lineWidth   = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(sx, sy, r + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    // Body
    if (this.hitFlash > 0) {
      ctx.shadowColor = '#fff';
      ctx.shadowBlur  = 12;
    }

    if (this.boss) {
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur  = 20;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
      // Inner ring
      ctx.strokeStyle = '#ffffff44';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Emoji icon
    ctx.globalAlpha = 1;
    ctx.shadowBlur  = 0;
    ctx.font = `${this.boss ? 20 : 14}px serif`;
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.emoji, sx, sy);

    // HP bar (if not full)
    if (this.hp < this.maxHp) {
      const bw = this.boss ? 60 : 34;
      const by = sy - r - 8;
      ctx.fillStyle = CFG.C.HP_BAR_BG;
      ctx.fillRect(sx - bw/2, by, bw, 5);
      const pct = this.hp / this.maxHp;
      ctx.fillStyle = this.boss ? CFG.C.HP_BAR_BOSS : CFG.C.HP_BAR;
      ctx.fillRect(sx - bw/2, by, bw * pct, 5);
    }

    ctx.restore();
  }
}

// ── Player ───────────────────────────────────────────────
class Player {
  constructor(charData) {
    const cls   = CLASSES[charData.className];
    const race  = RACES[charData.race];

    this.name      = charData.name || 'Adventurer';
    this.className = charData.className;
    this.raceName  = charData.race;
    this.color     = cls.color;

    // Base stats from class + race
    this.maxHp  = cls.stats.hp + (race.stats.hp || 0) + 100;
    this.hp     = this.maxHp;
    this.maxEn  = 100;
    this.en     = 100;
    this.baseAtk = cls.stats.atk + (race.stats.atk || 0);
    this.baseDef  = cls.stats.def + (race.stats.def || 0);
    this.baseSpd  = (cls.stats.spd + (race.stats.spd || 0)) * 30 + 100; // px/sec
    this.isRanged = cls.stats.range === 'ranged';

    // Position (will be set when entering zone)
    this.x = 0; this.y = 0;
    this.size = 14;

    // Abilities
    this.abilities = cls.abilities;
    this.abilityCooldowns = new Array(5).fill(0);

    // Inventory
    this.equipped = { weapon: null, armor: null, offhand: null };
    this.bag = [];  // array of item IDs (up to 20 slots)

    // Skills
    this.skills = new Skills(race.bonuses);

    // Combat
    this.attackCd    = 0;
    this.attackSpeed = CFG.BASE_ATTACK_TICKS * CFG.TICK_MS / 1000;
    this.invincible  = 0;  // seconds of i-frames
    this.defBuff     = 0;
    this.defBuffTimer= 0;
    this.shield      = 0;  // absorb shield
    this.stealthy    = false;
    this.stealthTimer= 0;

    // Level (derived from skills average)
    this._level = 1;

    // Visual
    this.facing   = { x: 1, y: 0 };
    this.walkAnim = 0;
    this.hitFlash = 0;
  }

  get level() {
    const sk = this.skills;
    return Math.floor((sk.attack.lv + sk.strength.lv + sk.agility.lv + sk.prayer.lv) / 4);
  }

  get atk() {
    let a = this.baseAtk + this.skills.atkBonus();
    const w = this.equippedItem('weapon');
    if (w) a += w.stats.atk;
    return Math.floor(a);
  }

  get def() {
    let d = this.baseDef;
    const armor = this.equippedItem('armor');
    const off   = this.equippedItem('offhand');
    if (armor) d += armor.stats.def;
    if (off)   d += off.stats.def;
    if (this.defBuff > 0) d *= (1 + this.defBuff);
    return Math.floor(d);
  }

  get spd() {
    return this.baseSpd * (1 + this.skills.spdBonus());
  }

  equippedItem(slot) {
    const id = this.equipped[slot];
    return id ? ITEMS.find(i => i.id === id) : null;
  }

  equipItem(itemId) {
    const item = ITEMS.find(i => i.id === itemId);
    if (!item) return false;
    // Unequip old to bag
    const old = this.equipped[item.slot];
    if (old) this.bag.push(old);
    this.equipped[item.slot] = itemId;
    // Remove from bag
    const idx = this.bag.indexOf(itemId);
    if (idx >= 0) this.bag.splice(idx, 1);
    return true;
  }

  pickupItem(itemId) {
    if (this.bag.length >= 20) return false;
    this.bag.push(itemId);
    return true;
  }

  takeDamage(dmg) {
    if (this.invincible > 0) return 0;
    if (this.stealthy) return 0;

    // Shield absorb
    if (this.shield > 0) {
      const absorb = Math.min(this.shield, dmg);
      this.shield -= absorb;
      dmg -= absorb;
    }

    const actual = Math.max(1, dmg - this.def * 0.4);
    this.hp = Math.max(0, this.hp - actual);
    this.hitFlash   = 0.2;
    this.invincible = 0.4;
    return actual;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  dead() { return this.hp <= 0; }

  // Use ability by index; returns { hit, aoe, dash, etc. } or null if on cd
  useAbility(idx, targetX, targetY, world, projectiles, floats) {
    const ab = this.abilities[idx];
    if (!ab) return null;
    if (this.abilityCooldowns[idx] > 0) return null;

    this.abilityCooldowns[idx] = ab.cd;

    const result = { type: ab.name };

    // Dash / teleport
    if (ab.dash || ab.blink) {
      const ang = Math.atan2(targetY - this.y, targetX - this.x);
      const dist = ab.blink ? 120 : 80;
      const nx = this.x + Math.cos(ang) * dist;
      const ny = this.y + Math.sin(ang) * dist;
      if (!world.isBlockedPx(nx, ny)) {
        this.x = nx; this.y = ny;
      }
      result.dash = true;
    }

    // Projectile
    if (ab.proj) {
      const ang  = Math.atan2(targetY - this.y, targetX - this.x);
      const dmg  = Math.floor(this.atk * (ab.dmgMult || 1));
      projectiles.push(new Projectile(this.x, this.y, Math.cos(ang), Math.sin(ang),
        dmg, true, ab.pierce));
      result.proj = true;
    }

    // Heal
    if (ab.heal) {
      this.heal(ab.heal + this.skills.prayerLv() * 0.5);
      floats.push(new FloatText(this.x, this.y - 20, `+${ab.heal}`, CFG.C.HEAL));
      result.heal = true;
    }

    // Shield
    if (ab.shield) {
      this.shield += ab.shield;
      result.shield = true;
    }

    // Defense buff
    if (ab.defBuff) {
      this.defBuff      = ab.defBuff;
      this.defBuffTimer = 4;
      result.defBuff = true;
    }

    // Stealth
    if (ab.stealth) {
      this.stealthy     = true;
      this.stealthTimer = 3;
      result.stealth = true;
    }

    return result;
  }

  update(dt, world) {
    // Attack cooldown
    if (this.attackCd > 0) this.attackCd -= dt;

    // Ability cooldowns
    for (let i = 0; i < 5; i++) {
      if (this.abilityCooldowns[i] > 0) this.abilityCooldowns[i] -= dt;
    }

    // I-frames
    if (this.invincible > 0) this.invincible -= dt;

    // Defense buff timer
    if (this.defBuffTimer > 0) {
      this.defBuffTimer -= dt;
      if (this.defBuffTimer <= 0) this.defBuff = 0;
    }

    // Stealth timer
    if (this.stealthy) {
      this.stealthTimer -= dt;
      if (this.stealthTimer <= 0) this.stealthy = false;
    }

    // Energy regen
    this.en = Math.min(this.maxEn, this.en + 8 * dt);

    // Walk animation
    const moving = Input.isMoveUp() || Input.isMoveDown() || Input.isMoveLeft() || Input.isMoveRight();
    if (moving) this.walkAnim += dt * 8;

    // Hit flash
    this.hitFlash = Math.max(0, this.hitFlash - dt * 4);

    // Movement
    let vx = 0, vy = 0;
    if (Input.isMoveLeft())  { vx -= 1; this.facing = { x: -1, y: 0 }; }
    if (Input.isMoveRight()) { vx += 1; this.facing = { x:  1, y: 0 }; }
    if (Input.isMoveUp())    { vy -= 1; this.facing = { x:  0, y: -1 }; }
    if (Input.isMoveDown())  { vy += 1; this.facing = { x:  0, y:  1 }; }

    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }

    const speed = this.spd;
    const nx = this.x + vx * speed * dt;
    const ny = this.y + vy * speed * dt;

    if (!world.isBlockedPx(nx, this.y)) this.x = nx;
    if (!world.isBlockedPx(this.x, ny)) this.y = ny;

    // Skill XP for moving
    if (moving) this.skills.addXP('agility', dt * 1.5);
  }

  // Basic attack towards (tx,ty), returns projectile or null
  basicAttack(tx, ty, world, projectiles, floats) {
    if (this.attackCd > 0) return null;
    this.attackCd = this.attackSpeed * (1 - this.skills.spdBonus() * 0.3);

    const ang = Math.atan2(ty - this.y, tx - this.x);
    const dmg = Math.floor(this.atk + this.skills.dmgBonus());

    this.skills.addXP('attack',   8);
    this.skills.addXP('strength', 6);

    if (this.isRanged) {
      projectiles.push(new Projectile(this.x, this.y, Math.cos(ang), Math.sin(ang), dmg, true));
      return 'ranged';
    } else {
      // Melee – instant hit in range
      return { type: 'melee', dmg, ang };
    }
  }

  draw(ctx, camX, camY) {
    const sx = this.x - camX;
    const sy = this.y - camY;
    const r  = this.size;

    ctx.save();

    // Shadow
    ctx.fillStyle = CFG.C.SHADOW;
    ctx.beginPath();
    ctx.ellipse(sx, sy + r, r * 0.85, r * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stealth effect
    if (this.stealthy) {
      ctx.globalAlpha = 0.3;
    }

    // Hit flash
    if (this.hitFlash > 0) {
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur  = 14;
    }

    // Shield bubble
    if (this.shield > 0) {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle   = '#60a0ff';
      ctx.shadowColor = '#3080ff';
      ctx.shadowBlur  = 16;
      ctx.beginPath();
      ctx.arc(sx, sy, r + 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 0;
    }

    // Body
    ctx.shadowColor = this.color;
    ctx.shadowBlur  = 8;
    ctx.fillStyle   = this.color;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();

    // Inner highlight
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(sx - r * 0.3, sy - r * 0.3, r * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Direction indicator
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(
      sx + this.facing.x * (r - 3),
      sy + this.facing.y * (r - 3),
      3.5, 0, Math.PI * 2
    );
    ctx.fill();

    // Walk bob legs
    if (this.walkAnim % 1 < 0.5) {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(sx - 5, sy + r - 2, 4, 5);
      ctx.fillRect(sx + 1, sy + r + 1, 4, 5);
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(sx - 5, sy + r + 1, 4, 5);
      ctx.fillRect(sx + 1, sy + r - 2, 4, 5);
    }

    ctx.restore();
  }
}
