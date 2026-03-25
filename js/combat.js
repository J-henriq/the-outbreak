// ─────────────────────────────────────────────────────────
//  ASHENWILD  –  Combat System
// ─────────────────────────────────────────────────────────

class Combat {
  constructor(game) {
    this.game = game;
  }

  // Called each frame; handles all combat interactions
  update(dt) {
    const { player, enemies, projectiles, loots, floats, world } = this.game;

    // ── Player basic attack (click) ───────────────────────
    if (Input.mouse.down || Input.consumeClick()) {
      const wx = Input.mouse.x + this.game.camX;
      const wy = Input.mouse.y + this.game.camY;
      const result = player.basicAttack(wx, wy, world, projectiles, floats);
      if (result && result.type === 'melee') {
        this._meleeHit(player, enemies, result.dmg, wx, wy, false, floats);
      }
    }

    // ── Projectile movement and collision ─────────────────
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const proj = projectiles[i];
      proj.update(dt, world);
      if (proj.dead()) { projectiles.splice(i, 1); continue; }

      if (proj.fromPlayer) {
        // Hit enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
          const en = enemies[j];
          if (en.dead()) continue;
          if (this._circleHit(proj, en)) {
            const dmg = this._calcDamage(player, en, proj.dmg);
            const actual = en.takeDamage(dmg);
            floats.push(new FloatText(en.x, en.y - 24, actual,
              dmg > proj.dmg * 1.5 ? CFG.C.DMG_CRIT : CFG.C.DMG_PLAYER));
            player.skills.addXP('attack',   5);
            player.skills.addXP('strength', 3);
            if (!proj.pierce) { proj.hit = true; }
            this._checkDeath(j);
          }
        }
      } else {
        // Hit player
        if (this._circleHitPlayer(proj, player)) {
          const actual = player.takeDamage(proj.dmg);
          if (actual > 0) {
            floats.push(new FloatText(player.x, player.y - 24, actual, CFG.C.DMG_ENEMY));
            this.game.log(`${actual} damage taken!`, 'combat');
          }
          proj.hit = true;
        }
      }
    }

    // ── Loot pickup ───────────────────────────────────────
    for (let i = loots.length - 1; i >= 0; i--) {
      const loot = loots[i];
      loot.update(dt);
      if (loot.dead()) { loots.splice(i, 1); continue; }
      const dx = player.x - loot.x, dy = player.y - loot.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 28) {
        const item = ITEMS.find(it => it.id === loot.itemId);
        if (player.pickupItem(loot.itemId)) {
          this.game.log(`Picked up ${item ? item.emoji + ' ' + item.name : loot.itemId}`, 'loot');
          // Auto-equip if better
          this._autoEquip(player, loot.itemId);
          loots.splice(i, 1);
        }
      }
    }

    // ── Enemy updates ─────────────────────────────────────
    for (let j = enemies.length - 1; j >= 0; j--) {
      enemies[j].update(dt, player, world, projectiles);
      if (enemies[j].dead()) {
        this._onEnemyDeath(j);
      }
    }
  }

  _circleHit(proj, en) {
    const dx = proj.x - en.x, dy = proj.y - en.y;
    return Math.sqrt(dx*dx + dy*dy) < (proj.size + en.size);
  }

  _circleHitPlayer(proj, player) {
    const dx = proj.x - player.x, dy = proj.y - player.y;
    return Math.sqrt(dx*dx + dy*dy) < (proj.size + player.size);
  }

  _meleeHit(player, enemies, baseDmg, tx, ty, isAbility, floats) {
    const range = CFG.MELEE_RANGE;
    enemies.forEach((en, j) => {
      if (en.dead()) return;
      const dx = en.x - tx, dy = en.y - ty;
      const d  = Math.sqrt(dx*dx + dy*dy);
      if (d > range) return;
      // Also must be near player
      const pd = Math.sqrt((en.x-player.x)**2 + (en.y-player.y)**2);
      if (pd > range * 1.5) return;

      const dmg    = this._calcDamage(player, en, baseDmg);
      const actual = en.takeDamage(dmg);
      floats.push(new FloatText(en.x, en.y - 24, actual,
        isAbility ? CFG.C.DMG_CRIT : CFG.C.DMG_PLAYER));
      player.skills.addXP('attack',   5);
      player.skills.addXP('strength', 4);
    });
  }

  // Apply ability result to nearby enemies
  applyAbility(player, abilityIdx, targetX, targetY, floats) {
    const ab  = player.abilities[abilityIdx];
    if (!ab)  return;
    const { enemies, world, projectiles } = this.game;

    // Damage abilities handled by projectile or melee
    if (ab.dmgMult && !ab.proj && !ab.dash) {
      const dmg = Math.floor(player.atk * ab.dmgMult);
      this._meleeHit(player, enemies, dmg, targetX, targetY, true, floats);
    }

    // Slow
    if (ab.slow) {
      enemies.forEach(en => {
        const d = Math.sqrt((en.x-targetX)**2 + (en.y-targetY)**2);
        if (d < 80) en.slow(2.5);
      });
    }

    // Stun
    if (ab.stun) {
      enemies.forEach(en => {
        const d = Math.sqrt((en.x-targetX)**2 + (en.y-targetY)**2);
        if (d < 80) en.stun(ab.stun);
      });
    }

    // AoE damage zone
    if (ab.aoe) {
      const dmg = Math.floor(player.atk * (ab.dmgMult || 1.2));
      enemies.forEach(en => {
        const d = Math.sqrt((en.x-targetX)**2 + (en.y-targetY)**2);
        if (d < 100) {
          const actual = en.takeDamage(dmg);
          floats.push(new FloatText(en.x, en.y - 24, actual, CFG.C.DMG_CRIT));
        }
      });
    }

    // DoT
    if (ab.dot) {
      enemies.forEach(en => {
        const d = Math.sqrt((en.x-targetX)**2 + (en.y-targetY)**2);
        if (d < 100) en.applyDot(player.atk * 0.3, 3);
      });
    }

    // Mark
    if (ab.mark) {
      enemies.forEach(en => {
        const d = Math.sqrt((en.x-targetX)**2 + (en.y-targetY)**2);
        if (d < 300) en.mark(8);
      });
    }

    // Turret – spawn an enemy-targeting projectile periodically (simplified)
    if (ab.turret) {
      // For simplicity, immediately deal damage in a range
      const dmg = Math.floor(player.atk * 3);
      let hit = false;
      enemies.forEach(en => {
        const d = Math.sqrt((en.x-targetX)**2 + (en.y-targetY)**2);
        if (d < 160 && !hit) {
          const actual = en.takeDamage(dmg);
          floats.push(new FloatText(en.x, en.y - 24, actual, CFG.C.DMG_CRIT));
          hit = true;
        }
      });
    }

    // Pull
    if (ab.pull) {
      enemies.forEach(en => {
        const d = Math.sqrt((en.x-player.x)**2 + (en.y-player.y)**2);
        if (d < 200) {
          const ang = Math.atan2(player.y - en.y, player.x - en.x);
          const nx = en.x + Math.cos(ang) * 80;
          const ny = en.y + Math.sin(ang) * 80;
          if (!world.isBlockedPx(nx, ny)) { en.x = nx; en.y = ny; }
        }
      });
    }
  }

  _calcDamage(player, enemy, baseDmg) {
    let dmg = baseDmg + player.skills.dmgBonus();
    // Crit
    const critChance = 0.05 + (player.raceName === 'Umbral' ? 0.15 : 0);
    if (Math.random() < critChance) dmg *= 2;
    // Mark bonus
    if (enemy.marked) dmg *= 1.25;
    return Math.floor(dmg);
  }

  _checkDeath(idx) {
    // Will be called from update loop; just marking
  }

  _onEnemyDeath(idx) {
    const { enemies, player, floats, loots } = this.game;
    const en = enemies[idx];
    if (!en) return;

    // XP reward
    const xp = en.xp;
    player.skills.addXP('attack',   xp * 0.4);
    player.skills.addXP('strength', xp * 0.3);
    player.skills.addXP('agility',  xp * 0.2);
    player.skills.addXP('prayer',   xp * 0.1);

    floats.push(new FloatText(en.x, en.y - 40, `+${xp} XP`, CFG.C.EXP_BAR));
    this.game.log(`Defeated ${en.name}! +${xp} XP`, 'info');

    // Loot drop
    const table = LOOT_TABLES[en.id] || [];
    if (table.length > 0 && Math.random() < (en.boss ? 1.0 : 0.45)) {
      const itemId = this._rollLoot(table);
      if (itemId) {
        loots.push(new LootDrop(en.x + (Math.random()-0.5)*30,
                                en.y + (Math.random()-0.5)*30, itemId));
        const item = ITEMS.find(i => i.id === itemId);
        if (item) this.game.log(`${en.name} dropped ${item.emoji} ${item.name}!`, 'loot');
      }
    }

    // Check if boss
    if (en.boss) {
      this.game.onBossKilled(en);
    }

    enemies.splice(idx, 1);
  }

  _rollLoot(table) {
    const total = table.reduce((s, e) => s + e.w, 0);
    let r = Math.random() * total;
    for (const entry of table) {
      r -= entry.w;
      if (r <= 0) return entry.id;
    }
    return table[table.length - 1].id;
  }

  _autoEquip(player, itemId) {
    const item = ITEMS.find(i => i.id === itemId);
    if (!item) return;
    const current = player.equippedItem(item.slot);
    const newAtk  = (item.stats.atk || 0);
    const newDef  = (item.stats.def || 0);
    const curAtk  = current ? (current.stats.atk || 0) : 0;
    const curDef  = current ? (current.stats.def || 0) : 0;
    if (!current || (newAtk + newDef) > (curAtk + curDef)) {
      player.equipItem(itemId);
      this.game.log(`Auto-equipped ${item.emoji} ${item.name}`, 'loot');
    }
  }
}
