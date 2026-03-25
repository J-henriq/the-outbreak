// Melee, ranged, and magic combat resolution
import { SPELLS } from '../data/skills.js';

export class CombatSystem {
  constructor(player, audio) {
    this.player = player;
    this.audio = audio;
  }

  // Player attacks enemies
  playerAttack(enemies, target, projectiles, mode = 'basic') {
    const player = this.player;
    if (player.attackCooldown > 0) return null;

    const weapon = player.equipped ? player.equipped.weapon : null;
    const subtype = weapon ? weapon.subtype : null;

    // Determine attack type based on weapon
    if (subtype === 'bow') {
      return this._rangedAttack(player, enemies, target, projectiles);
    } else if (subtype === 'staff') {
      return this._magicAttack(player, enemies, target, projectiles, 'fireball');
    } else {
      return this._meleeAttack(player, enemies, target);
    }
  }

  _meleeAttack(player, enemies, target) {
    const cooldownMult = 1 - (player.skillBonuses.cooldownReduction || 0);
    player.attackCooldown = player.baseAttackCooldown * cooldownMult;

    if (this.audio) this.audio.playAttack();

    const results = [];
    const range = player.attackRange;
    const damageMult = 1 + (player.skillBonuses.meleeDamageBonus || 0);

    // Berserker check
    let dmgMult = damageMult;
    if (player.statusEffects && player.statusEffects.berserker) {
      dmgMult *= player.statusEffects.berserker.damageMultiplier || 1;
    }

    for (const e of enemies) {
      if (e.hp <= 0) continue;
      if (player.distanceTo(e) <= range) {
        const isCrit = Math.random() < player.critChance;
        let dmg = Math.floor(player.meleeDamage * dmgMult);
        if (isCrit) dmg = Math.floor(dmg * 2);

        // Lifesteal
        if (player.equipped && player.equipped.weapon && player.equipped.weapon.lifesteal) {
          player.hp = Math.min(player.maxHP, player.hp + Math.floor(dmg * player.equipped.weapon.lifesteal));
        }

        const actual = e.takeDamage(dmg);
        results.push({ damage: actual, isCrit, x: e.x + e.size / 2, y: e.y, killed: e.hp <= 0, enemy: e, color: '#ff4444' });
      }
    }
    return results.length > 0 ? results : null;
  }

  _rangedAttack(player, enemies, target, projectiles) {
    // Need arrows
    const arrowCount = this._getArrowCount(player);
    if (arrowCount <= 0) {
      // Fallback to melee
      return this._meleeAttack(player, enemies, target);
    }

    const cooldownMult = 1 - (player.skillBonuses.cooldownReduction || 0);
    player.attackCooldown = player.baseAttackCooldown * cooldownMult * 0.8;

    if (this.audio) this.audio.playArrow();
    this._consumeArrow(player);

    const damageMult = 1 + (player.skillBonuses.rangedDamageBonus || 0);
    const isCrit = Math.random() < player.critChance;
    const baseDmg = Math.floor(player.rangedDamage * damageMult * (isCrit ? 2 : 1));

    const dx = target.x - (player.x + 14);
    const dy = target.y - (player.y + 16);
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const speed = 420;

    projectiles.push({
      x: player.x + 14, y: player.y + 16,
      vx: (dx / len) * speed, vy: (dy / len) * speed,
      type: 'arrow', damage: baseDmg, isCrit,
      fromPlayer: true, life: 1.5,
      angle: Math.atan2(dy, dx)
    });

    return [{ damage: 0, x: player.x, y: player.y - 10, isCrit: false, color: '#88ff44' }];
  }

  _magicAttack(player, enemies, target, projectiles, spellId = 'fireball') {
    const spell = SPELLS[spellId];
    if (!spell) return null;

    if (!player.useMana(spell.manaCost)) {
      // Not enough mana, basic attack
      return this._meleeAttack(player, enemies, target);
    }

    const cooldownMult = 1 - (player.skillBonuses.cooldownReduction || 0);
    player.attackCooldown = player.baseAttackCooldown * cooldownMult * 1.2;

    if (this.audio) this.audio.playMagic();

    const damageMult = 1 + (player.skillBonuses.magicDamageBonus || 0);

    const dx = target.x - (player.x + 14);
    const dy = target.y - (player.y + 16);
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const speed = spell.speed || 320;

    projectiles.push({
      x: player.x + 14, y: player.y + 16,
      vx: (dx / len) * speed, vy: (dy / len) * speed,
      type: spellId,
      damage: Math.floor(spell.damage(player.magicDamage) * damageMult),
      aoe: spell.aoe || 0,
      slow: spell.slow || 0, slowDuration: spell.slowDuration || 0,
      chain: spell.chain || 0,
      fromPlayer: true, life: 2.0,
      color: spell.color
    });

    return null;
  }

  castSpell(spellId, enemies, target, projectiles) {
    return this._magicAttack(this.player, enemies, target, projectiles, spellId);
  }

  applyProjectileDamage(proj, enemy) {
    const isCrit = proj.isCrit || false;
    const dmg = proj.damage || 0;
    const actual = enemy.takeDamage(dmg);

    if (proj.slow && proj.slowDuration) {
      enemy.applySlow(proj.slow, proj.slowDuration);
    }

    // AoE: handled by caller for explosions; here just single target
    return [{ damage: actual, isCrit, x: enemy.x + enemy.size / 2, y: enemy.y, killed: enemy.hp <= 0, enemy, color: proj.color || '#ff4444' }];
  }

  checkEnemyAttack(enemy, player, renderer) {
    if (enemy.hp <= 0 || enemy.aiState !== 'attack') return;
    if (enemy.attackTimer > 0) return;
    if (player.iframes > 0) return;

    enemy.attackTimer = enemy.attackCooldown;
    enemy.isAttacking = true;
    setTimeout(() => { enemy.isAttacking = false; }, 300);

    if (enemy.isRanged) {
      // Will be handled by projectile system - spawn projectile toward player
      // We just set a flag that the caller can check
      enemy._wantsToShoot = true;
      enemy._shootTarget = { x: player.x + 14, y: player.y + 16 };
    } else {
      const dist = enemy.distanceTo(player);
      if (dist <= enemy.attackRange + 16) {
        const dmg = player.takeDamage(enemy.damage);
        if (dmg > 0 && renderer) {
          renderer.addDamageNumber(player.x, player.y - 10, dmg, false, false);
          renderer.screenFlash('rgb(255,0,0)', 0.1);
          if (this.audio) this.audio.playHit();
          if (player.hp <= 0) return true; // signal player death
        }
      }
    }
    return false;
  }

  _getArrowCount(player) {
    if (!player._inventory) return 999; // fallback
    return player._inventory.getItemCount('arrows');
  }

  _consumeArrow(player) {
    if (player._inventory) player._inventory.removeItem('arrows', 1);
  }
}

export default CombatSystem;
