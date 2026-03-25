/**
 * Arcane Engineers - Entity System
 * Manages enemies, machines (golems, turrets, traps, shields), and projectiles
 */

class EntityManager {
  constructor() {
    this.enemies = [];
    this.machines = [];
    this.projectiles = [];
    this.effects = [];
    this.nextId = 1;
  }

  loadDungeon(dungeon) {
    this.enemies = dungeon.enemies.map(e => ({ ...e }));
    this.machines = [];
    this.projectiles = [];
    this.effects = [];
  }

  // ---- Enemy Management ----

  updateEnemies(deltaTime, players, dungeon, dungeonGen) {
    this.enemies.forEach(enemy => {
      if (!enemy.isAlive) return;

      // Find nearest alive player
      let nearestPlayer = null;
      let nearestDist = Infinity;
      players.forEach(p => {
        if (!p.isAlive) return;
        const dx = p.x - enemy.x;
        const dy = p.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestPlayer = p;
        }
      });

      if (!nearestPlayer) return;

      // Aggro detection
      if (nearestDist < enemy.aggroRange) {
        enemy.aggro = true;
        enemy.target = nearestPlayer.id;
      }

      if (!enemy.aggro) return;

      // Movement toward player
      const dx = nearestPlayer.x - enemy.x;
      const dy = nearestPlayer.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      if (dist > enemy.attackRange) {
        const nx = dx / dist;
        const ny = dy / dist;
        const newX = enemy.x + nx * enemy.speed;
        const newY = enemy.y + ny * enemy.speed;

        // Collision with walls
        if (dungeonGen.isWalkable(dungeon, newX, enemy.y)) {
          enemy.x = newX;
        }
        if (dungeonGen.isWalkable(dungeon, enemy.x, newY)) {
          enemy.y = newY;
        }
      }

      // Attack
      if (dist <= enemy.attackRange) {
        const now = Date.now();
        if (now - enemy.lastAttack >= enemy.attackCooldown) {
          enemy.lastAttack = now;
          // Ranged enemies fire projectiles
          if (enemy.attackRange > 60) {
            const projDx = dx / dist;
            const projDy = dy / dist;
            this.projectiles.push({
              id: this.nextId++,
              x: enemy.x,
              y: enemy.y,
              vx: projDx * 4,
              vy: projDy * 4,
              damage: enemy.damage,
              range: enemy.attackRange * 1.5,
              distTraveled: 0,
              radius: 0,
              color: '#e74c3c',
              owner: 'enemy',
              enemyId: enemy.id
            });
          } else {
            // Melee direct damage
            nearestPlayer.takeDamage(enemy.damage);
            this.addEffect(nearestPlayer.x, nearestPlayer.y, 'hit', '#e74c3c');
          }
        }
      }

      // Animation
      enemy.animTimer += deltaTime;
      if (enemy.animTimer > 300) {
        enemy.animTimer = 0;
        enemy.animFrame = (enemy.animFrame + 1) % 4;
      }
    });

    // Collect killed enemies before removing them so callers can process drops/EXP
    const killed = this.enemies.filter(e => !e.isAlive);
    this.enemies = this.enemies.filter(e => e.isAlive);
    return killed;
  }

  damageEnemy(enemyId, damage) {
    const enemy = this.enemies.find(e => e.id === enemyId);
    if (!enemy || !enemy.isAlive) return 0;
    const actual = Math.max(1, damage);
    enemy.health -= actual;
    if (enemy.health <= 0) {
      enemy.health = 0;
      enemy.isAlive = false;
    }
    return actual;
  }

  // ---- Machine Management ----

  deployMachine(machineKey, x, y, ownerId) {
    const machineData = CONFIG.MACHINES[machineKey];
    if (!machineData) return null;

    const machine = {
      id: this.nextId++,
      key: machineKey,
      type: machineData.type,
      name: machineData.name,
      x,
      y,
      width: machineData.size,
      height: machineData.size,
      health: machineData.health || Infinity,
      maxHealth: machineData.health || Infinity,
      damage: machineData.damage || 0,
      range: machineData.range || 0,
      fireRate: machineData.fireRate || 0,
      lastFired: 0,
      color: machineData.color,
      ownerId,
      duration: machineData.duration || 60000,
      deployedAt: Date.now(),
      active: true,
      triggerRadius: machineData.triggerRadius || 0,
      shieldAmount: machineData.shieldAmount || 0
    };

    this.machines.push(machine);
    return machine;
  }

  updateMachines(deltaTime, players) {
    const now = Date.now();
    this.machines = this.machines.filter(m => {
      if (now - m.deployedAt > m.duration) {
        return false;
      }
      return m.active;
    });

    this.machines.forEach(machine => {
      if (!machine.active) return;

      switch (machine.type) {
        case 'turret':
          this.updateTurret(machine);
          break;
        case 'golem':
          this.updateGolem(machine, players);
          break;
        case 'trap':
          this.checkTrap(machine);
          break;
        case 'shield':
          this.updateShield(machine, players);
          break;
      }
    });
  }

  updateTurret(turret) {
    const now = Date.now();
    if (now - turret.lastFired < turret.fireRate) return;

    // Find nearest enemy in range
    let nearest = null;
    let nearestDist = turret.range;
    this.enemies.forEach(e => {
      if (!e.isAlive) return;
      const dx = e.x - turret.x;
      const dy = e.y - turret.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = e;
      }
    });

    if (nearest) {
      turret.lastFired = now;
      const dx = nearest.x - turret.x;
      const dy = nearest.y - turret.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      this.projectiles.push({
        id: this.nextId++,
        x: turret.x,
        y: turret.y,
        vx: (dx / dist) * 7,
        vy: (dy / dist) * 7,
        damage: turret.damage,
        range: turret.range,
        distTraveled: 0,
        radius: 0,
        color: turret.color,
        owner: 'machine',
        machineId: turret.id
      });
    }
  }

  updateGolem(golem, players) {
    // Golems move toward nearest enemy
    let nearest = null;
    let nearestDist = 300;
    this.enemies.forEach(e => {
      if (!e.isAlive) return;
      const dx = e.x - golem.x;
      const dy = e.y - golem.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = e;
      }
    });

    if (nearest) {
      const dx = nearest.x - golem.x;
      const dy = nearest.y - golem.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const speed = 1.5;
      if (dist > 40) {
        golem.x += (dx / dist) * speed;
        golem.y += (dy / dist) * speed;
      } else {
        // Melee attack
        const now = Date.now();
        if (!golem.lastAttack || now - golem.lastAttack > 1200) {
          golem.lastAttack = now;
          this.damageEnemy(nearest.id, golem.damage);
          this.addEffect(nearest.x, nearest.y, 'hit', '#7f8c8d');
        }
      }
    }
  }

  checkTrap(trap) {
    const now = Date.now();
    if (trap.nextActivation && now < trap.nextActivation) return;

    this.enemies.forEach(e => {
      if (!e.isAlive || !trap.active) return;
      const dx = e.x - trap.x;
      const dy = e.y - trap.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < trap.triggerRadius) {
        this.damageEnemy(e.id, trap.damage);
        this.addEffect(trap.x, trap.y, 'explosion', '#f1c40f');
        e.stunUntil = now + 1500;
        trap.active = false;
        trap.nextActivation = now + 3000;
      }
    });

    // Re-enable trap after cooldown
    if (!trap.active && trap.nextActivation && now >= trap.nextActivation) {
      trap.active = true;
    }
  }

  updateShield(shield, players) {
    // Shield protects nearby players
    players.forEach(p => {
      if (!p.isAlive) return;
      const dx = p.x - shield.x;
      const dy = p.y - shield.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < shield.range && !p.shielded) {
        p.shielded = true;
        p.shieldAmount = shield.shieldAmount;
      }
    });
  }

  // ---- Projectile Management ----

  updateProjectiles(deltaTime, players, dungeonGen, dungeon) {
    const toRemove = [];

    this.projectiles.forEach((proj, idx) => {
      proj.x += proj.vx;
      proj.y += proj.vy;
      proj.distTraveled += Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);

      // Check range
      if (proj.distTraveled >= proj.range) {
        toRemove.push(idx);
        if (proj.radius > 0) this.explode(proj);
        return;
      }

      // Check wall collision
      if (!dungeonGen.isWalkable(dungeon, proj.x, proj.y)) {
        toRemove.push(idx);
        if (proj.radius > 0) this.explode(proj);
        return;
      }

      // Check enemy hits (player/machine projectiles)
      if (proj.owner !== 'enemy') {
        for (let i = 0; i < this.enemies.length; i++) {
          const e = this.enemies[i];
          if (!e.isAlive) continue;
          if (this.checkCollision(proj, e)) {
            if (proj.radius > 0) {
              this.explode(proj);
            } else {
              this.damageEnemy(e.id, proj.damage);
              this.addEffect(e.x, e.y, 'hit', proj.color);
            }
            toRemove.push(idx);
            break;
          }
        }
      }

      // Check player hits (enemy projectiles)
      if (proj.owner === 'enemy') {
        players.forEach(p => {
          if (!p.isAlive) return;
          if (this.checkCollision(proj, p)) {
            const dmg = p.takeDamage(proj.damage);
            this.addEffect(p.x, p.y, 'hit', '#e74c3c');
            toRemove.push(idx);
          }
        });
      }
    });

    // Remove in reverse order to preserve indices
    const uniqueRemove = [...new Set(toRemove)].sort((a, b) => b - a);
    uniqueRemove.forEach(idx => this.projectiles.splice(idx, 1));
  }

  explode(proj) {
    // Area damage
    this.enemies.forEach(e => {
      if (!e.isAlive) return;
      const dx = e.x - proj.x;
      const dy = e.y - proj.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < proj.radius) {
        const falloff = 1 - dist / proj.radius;
        this.damageEnemy(e.id, Math.floor(proj.damage * falloff));
      }
    });
    this.addEffect(proj.x, proj.y, 'explosion', proj.color);
  }

  checkCollision(a, b) {
    const halfA = (a.size || 8) / 2;
    const halfB = b.width / 2;
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    return dx < halfA + halfB && dy < halfA + halfB;
  }

  // ---- Visual Effects ----

  addEffect(x, y, type, color) {
    this.effects.push({
      x, y, type, color,
      life: 1.0,
      createdAt: Date.now()
    });
  }

  updateEffects(deltaTime) {
    this.effects = this.effects.filter(e => {
      e.life -= deltaTime / 500;
      return e.life > 0;
    });
  }

  // ---- Rendering ----

  drawEnemies(ctx, camera) {
    this.enemies.forEach(e => {
      if (!e.isAlive) return;
      const sx = e.x - camera.x;
      const sy = e.y - camera.y;
      const half = e.size / 2;

      // Skip if off-screen
      if (sx < -64 || sx > CONFIG.CANVAS_WIDTH + 64 || sy < -64 || sy > CONFIG.CANVAS_HEIGHT + 64) return;

      // Shadow
      ctx.beginPath();
      ctx.ellipse(sx, sy + half - 2, half * 0.8, half * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fill();

      // Body
      ctx.shadowBlur = e.isBoss ? 20 : 8;
      ctx.shadowColor = e.color;
      ctx.fillStyle = e.color;
      ctx.beginPath();
      if (e.isBoss) {
        // Boss diamond shape
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(Math.PI / 4 + e.animFrame * 0.05);
        ctx.fillRect(-half * 0.8, -half * 0.8, e.size * 0.8, e.size * 0.8);
        ctx.restore();
      } else {
        ctx.arc(sx, sy, half, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Health bar
      if (e.health < e.maxHealth) {
        const barW = Math.max(e.size, 32);
        const barH = e.isBoss ? 6 : 3;
        const barX = sx - barW / 2;
        const barY = sy - half - 12;
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = e.isBoss ? '#e74c3c' : '#e74c3c';
        ctx.fillRect(barX, barY, barW * (e.health / e.maxHealth), barH);

        if (e.isBoss) {
          ctx.fillStyle = CONFIG.UI.TEXT_PRIMARY;
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(e.name, sx, barY - 2);
        }
      }
    });
  }

  drawMachines(ctx, camera) {
    this.machines.forEach(m => {
      if (!m.active && m.type !== 'trap') return;
      const sx = m.x - camera.x;
      const sy = m.y - camera.y;
      const half = m.width / 2;

      ctx.shadowBlur = 10;
      ctx.shadowColor = m.color;
      ctx.fillStyle = m.color;

      switch (m.type) {
        case 'turret':
          ctx.beginPath();
          ctx.arc(sx, sy, half, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ddd';
          ctx.fillRect(sx - 3, sy - half - 8, 6, 12);
          break;
        case 'golem':
          ctx.fillStyle = m.color;
          ctx.fillRect(sx - half, sy - half, m.width, m.height);
          break;
        case 'trap':
          if (m.active) {
            ctx.strokeStyle = m.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(sx - half, sy - half, m.width, m.height);
          }
          break;
        case 'shield':
          ctx.globalAlpha = 0.3;
          ctx.beginPath();
          ctx.arc(sx, sy, m.range, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          break;
      }

      ctx.shadowBlur = 0;

      // Duration bar
      const elapsed = Date.now() - m.deployedAt;
      const remaining = 1 - elapsed / m.duration;
      if (remaining > 0) {
        ctx.fillStyle = m.color;
        ctx.fillRect(sx - half, sy - half - 5, m.width * remaining, 3);
      }
    });
  }

  drawProjectiles(ctx, camera) {
    this.projectiles.forEach(proj => {
      const sx = proj.x - camera.x;
      const sy = proj.y - camera.y;

      ctx.shadowBlur = 8;
      ctx.shadowColor = proj.color;
      ctx.fillStyle = proj.color;
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  drawEffects(ctx, camera) {
    this.effects.forEach(effect => {
      const sx = effect.x - camera.x;
      const sy = effect.y - camera.y;
      const alpha = effect.life;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = effect.color;

      if (effect.type === 'explosion') {
        const radius = 30 * (1 - effect.life) * 2 + 10;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (effect.type === 'hit') {
        ctx.beginPath();
        ctx.arc(sx, sy, 8 * alpha, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EntityManager;
}
