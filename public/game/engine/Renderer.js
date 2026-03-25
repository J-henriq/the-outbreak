// Canvas 2D renderer with pixel art style, camera, lighting, and particles

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.WIDTH = 800;
    this.HEIGHT = 600;
    this.camera = { x: 0, y: 0 };
    this.particles = [];
    this.damageNumbers = [];
    this.lightSources = [];
    this.flashTimer = 0;
    this.flashColor = 'rgba(255,255,255,0)';
    // Tile colors
    this.TILE_COLORS = {
      0: '#1a1a2e',     // void
      1: '#4a7c59',     // grass
      2: '#7c7c7c',     // stone floor
      3: '#2a2a2e',     // wall
      4: '#2a5a8c',     // water
      5: '#c4a35a',     // sand
      6: '#4a3a2a',     // dungeon floor
      7: '#1a1414',     // dungeon wall
      8: '#3a5a3a',     // tree (acts as wall)
      9: '#2a4a2a',     // tree dark
      10: '#5a3a1a',    // door
      11: '#ccaa44',    // chest
      12: '#cc4422',    // portal/entrance
    };
    this.TILE_SIZE = 32;
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = this.WIDTH;
    this.offscreenCanvas.height = this.HEIGHT;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d');
    this.offscreenCtx.imageSmoothingEnabled = false;
  }

  setCameraTarget(entity) {
    this.cameraTarget = entity;
  }

  updateCamera() {
    if (!this.cameraTarget) return;
    const targetX = this.cameraTarget.x - this.WIDTH / 2 + this.cameraTarget.width / 2;
    const targetY = this.cameraTarget.y - this.HEIGHT / 2 + this.cameraTarget.height / 2;
    // Smooth follow
    this.camera.x += (targetX - this.camera.x) * 0.12;
    this.camera.y += (targetY - this.camera.y) * 0.12;
    // Clamp to world bounds
    if (this.worldWidth) {
      this.camera.x = Math.max(0, Math.min(this.worldWidth * this.TILE_SIZE - this.WIDTH, this.camera.x));
      this.camera.y = Math.max(0, Math.min(this.worldHeight * this.TILE_SIZE - this.HEIGHT, this.camera.y));
    }
  }

  setWorldBounds(w, h) {
    this.worldWidth = w;
    this.worldHeight = h;
  }

  worldToScreen(wx, wy) {
    return { x: wx - this.camera.x, y: wy - this.camera.y };
  }

  screenToWorld(sx, sy) {
    return { x: sx + this.camera.x, y: sy + this.camera.y };
  }

  clear() {
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
  }

  // Draw tile map
  drawTileMap(tileMap, offsetX = 0, offsetY = 0) {
    const ts = this.TILE_SIZE;
    const camX = Math.floor(this.camera.x);
    const camY = Math.floor(this.camera.y);
    const startCol = Math.max(0, Math.floor(camX / ts));
    const startRow = Math.max(0, Math.floor(camY / ts));
    const endCol = Math.min(tileMap[0].length - 1, startCol + Math.ceil(this.WIDTH / ts) + 1);
    const endRow = Math.min(tileMap.length - 1, startRow + Math.ceil(this.HEIGHT / ts) + 1);
    const ctx = this.ctx;

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const tile = tileMap[row][col];
        const sx = col * ts - camX + offsetX;
        const sy = row * ts - camY + offsetY;
        ctx.fillStyle = this.TILE_COLORS[tile] || '#1a1a2e';
        ctx.fillRect(sx, sy, ts, ts);

        // Add detail to some tiles
        if (tile === 1) { // grass variation
          if ((col + row) % 3 === 0) {
            ctx.fillStyle = '#3d6b4a';
            ctx.fillRect(sx + 2, sy + 2, 4, 2);
            ctx.fillRect(sx + 8, sy + 14, 2, 4);
          }
        } else if (tile === 2 || tile === 6) { // floor tiles - add subtle grid
          ctx.strokeStyle = 'rgba(0,0,0,0.15)';
          ctx.strokeRect(sx + 0.5, sy + 0.5, ts - 1, ts - 1);
        } else if (tile === 4) { // water - animated shimmer
          const shimmer = Math.sin(Date.now() * 0.002 + col * 0.5 + row * 0.3) * 0.15 + 0.15;
          ctx.fillStyle = `rgba(100,180,255,${shimmer})`;
          ctx.fillRect(sx + 4, sy + 8, ts - 8, 4);
          ctx.fillRect(sx + 8, sy + 20, ts - 14, 4);
        } else if (tile === 8 || tile === 9) { // trees
          ctx.fillStyle = tile === 8 ? '#2d4a2d' : '#1a3a1a';
          ctx.fillRect(sx + 8, sy, 16, 32);  // trunk top
          ctx.fillStyle = tile === 8 ? '#4a7a4a' : '#2d5a2d';
          ctx.fillRect(sx + 4, sy + 4, 24, 22);
          ctx.fillRect(sx + 2, sy + 10, 28, 14);
        } else if (tile === 11) { // chest
          ctx.fillStyle = '#8b6914';
          ctx.fillRect(sx + 4, sy + 10, 24, 16);
          ctx.fillStyle = '#ccaa44';
          ctx.fillRect(sx + 4, sy + 10, 24, 5);
          ctx.fillStyle = '#888800';
          ctx.fillRect(sx + 13, sy + 14, 6, 6);
        } else if (tile === 12) { // portal
          const pulse = Math.sin(Date.now() * 0.004) * 0.3 + 0.7;
          ctx.fillStyle = `rgba(200,68,34,${pulse})`;
          ctx.beginPath();
          ctx.arc(sx + ts / 2, sy + ts / 2, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(255,120,80,${pulse * 0.6})`;
          ctx.beginPath();
          ctx.arc(sx + ts / 2, sy + ts / 2, 7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  // Draw player as pixel art character
  drawPlayer(player, isLocal = true) {
    const s = this.worldToScreen(player.x, player.y);
    const ctx = this.ctx;
    const w = player.width || 28;
    const h = player.height || 32;

    if (player.hp <= 0) return;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(s.x + w / 2, s.y + h, w / 2 - 2, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Determine colors based on class
    const colors = {
      warrior: { body: '#cc3322', trim: '#ff6644', head: '#ffbb99', hair: '#442211' },
      mage:    { body: '#3344cc', trim: '#6688ff', head: '#ffbb99', hair: '#222266' },
      archer:  { body: '#22aa44', trim: '#55dd66', head: '#ffbb99', hair: '#442200' }
    };
    const c = colors[player.class] || colors.warrior;

    // Legs
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(s.x + 6, s.y + 20, 7, 12);
    ctx.fillRect(s.x + 15, s.y + 20, 7, 12);

    // Body
    ctx.fillStyle = c.body;
    ctx.fillRect(s.x + 4, s.y + 8, 20, 14);
    // Trim / belt
    ctx.fillStyle = c.trim;
    ctx.fillRect(s.x + 4, s.y + 8, 20, 3);
    ctx.fillStyle = '#8b6914';
    ctx.fillRect(s.x + 4, s.y + 19, 20, 3);

    // Arms
    ctx.fillStyle = c.body;
    ctx.fillRect(s.x, s.y + 8, 5, 10);
    ctx.fillRect(s.x + 23, s.y + 8, 5, 10);

    // Weapon visual (simplified)
    if (player.equipped && player.equipped.weapon) {
      const wpn = player.equipped.weapon;
      ctx.fillStyle = wpn.icon_color || '#aaaaaa';
      if (wpn.subtype === 'bow') {
        ctx.strokeStyle = wpn.icon_color || '#8b6914';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(s.x - 4, s.y + 12, 8, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
      } else if (wpn.subtype === 'staff') {
        ctx.fillRect(s.x - 3, s.y + 2, 3, 20);
        ctx.fillStyle = '#aa44ff';
        ctx.beginPath();
        ctx.arc(s.x - 2, s.y + 2, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(s.x - 4, s.y + 6, 3, 18);
      }
    }

    // Head
    ctx.fillStyle = c.head;
    ctx.fillRect(s.x + 6, s.y, 16, 10);
    // Hair
    ctx.fillStyle = c.hair;
    ctx.fillRect(s.x + 6, s.y, 16, 3);
    ctx.fillRect(s.x + 6, s.y, 3, 8);
    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(s.x + 9, s.y + 4, 3, 2);
    ctx.fillRect(s.x + 16, s.y + 4, 3, 2);

    // Armor overlay if equipped
    if (player.equipped && player.equipped.armor) {
      const armor = player.equipped.armor;
      ctx.fillStyle = armor.icon_color + '99';
      ctx.fillRect(s.x + 4, s.y + 10, 20, 12);
    }

    // Name tag
    if (!isLocal) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(s.x + w / 2 - 24, s.y - 18, 48, 13);
      ctx.fillStyle = '#88aaff';
      ctx.font = '9px "Courier New"';
      ctx.textAlign = 'center';
      ctx.fillText(player.name || 'Player', s.x + w / 2, s.y - 8);
      ctx.textAlign = 'left';
    }

    // Health bar above
    if (!isLocal) {
      const bw = 32, bh = 4;
      const bx = s.x + w / 2 - bw / 2, by = s.y - 22;
      ctx.fillStyle = '#330000';
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = '#cc2222';
      ctx.fillRect(bx, by, bw * (player.hp / player.maxHP), bh);
    }

    // Local player: green highlight
    if (isLocal) {
      ctx.strokeStyle = 'rgba(100,255,100,0.3)';
      ctx.strokeRect(s.x + 4, s.y, 20, 32);
    }

    // Invincibility blink
    if (player.iframes > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(s.x, s.y, w, h);
    }
  }

  // Draw enemy
  drawEnemy(enemy) {
    if (enemy.hp <= 0 && !enemy.deathAnim) return;
    const s = this.worldToScreen(enemy.x, enemy.y);
    const ctx = this.ctx;
    const sz = enemy.size || 28;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(s.x + sz / 2, s.y + sz, sz / 2 - 2, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const alpha = enemy.deathAnim ? enemy.deathAnim : 1.0;
    ctx.globalAlpha = alpha;

    if (enemy.type === 'slime') {
      ctx.fillStyle = enemy.color;
      ctx.beginPath();
      ctx.ellipse(s.x + sz / 2, s.y + sz * 0.65, sz / 2, sz * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(s.x + sz / 2 - 5, s.y + sz * 0.5, 3, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(s.x + sz / 2 + 5, s.y + sz * 0.5, 3, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (enemy.type === 'skeleton' || enemy.type === 'skeleton_archer') {
      ctx.fillStyle = enemy.color;
      ctx.fillRect(s.x + sz / 2 - 8, s.y, 16, 12);
      ctx.fillStyle = '#bbbb99';
      ctx.fillRect(s.x + sz / 2 - 6, s.y + 12, 12, 14);
      ctx.fillRect(s.x + sz / 2 - 10, s.y + 12, 4, 10);
      ctx.fillRect(s.x + sz / 2 + 6, s.y + 12, 4, 10);
      ctx.fillRect(s.x + sz / 2 - 4, s.y + 26, 4, 10);
      ctx.fillRect(s.x + sz / 2, s.y + 26, 4, 10);
      ctx.fillStyle = '#cc2222';
      ctx.fillRect(s.x + sz / 2 - 5, s.y + 4, 3, 3);
      ctx.fillRect(s.x + sz / 2 + 2, s.y + 4, 3, 3);
      if (enemy.type === 'skeleton_archer') {
        ctx.strokeStyle = '#8b6914';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(s.x + sz / 2 + 12, s.y + 14, 8, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
      }
    } else if (enemy.type === 'orc' || enemy.type === 'orc_warlord') {
      const isWarlord = enemy.type === 'orc_warlord';
      const bodyColor = isWarlord ? '#225511' : enemy.color;
      ctx.fillStyle = bodyColor;
      ctx.fillRect(s.x + sz / 2 - (isWarlord ? 14 : 10), s.y, isWarlord ? 28 : 20, isWarlord ? 40 : 32);
      ctx.fillStyle = '#88aa44';
      ctx.fillRect(s.x + sz / 2 - 8, s.y, 16, 10);
      ctx.fillStyle = '#cc4422';
      ctx.fillRect(s.x + sz / 2 - 6, s.y + 3, 4, 4);
      ctx.fillRect(s.x + sz / 2 + 2, s.y + 3, 4, 4);
      if (isWarlord) {
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(s.x + sz / 2 - 12, s.y - 6, 24, 6);
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(s.x + sz / 2 - 2, s.y - 14, 4, 8);
      }
    } else if (enemy.type === 'mage_enemy') {
      ctx.fillStyle = '#2a1a44';
      ctx.fillRect(s.x + sz / 2 - 8, s.y + 8, 16, 20);
      ctx.fillStyle = '#ffbb99';
      ctx.fillRect(s.x + sz / 2 - 6, s.y, 12, 10);
      ctx.fillStyle = enemy.color;
      ctx.fillRect(s.x + sz / 2 - 8, s.y, 16, 4);
      ctx.beginPath();
      ctx.moveTo(s.x + sz / 2 - 8, s.y);
      ctx.lineTo(s.x + sz / 2 + 8, s.y);
      ctx.lineTo(s.x + sz / 2, s.y - 10);
      ctx.closePath();
      ctx.fill();
      const glow = Math.sin(Date.now() * 0.005) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(170,68,255,${glow * 0.8})`;
      ctx.beginPath();
      ctx.arc(s.x + sz / 2 + 12, s.y + 12, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (enemy.type === 'cave_bat') {
      ctx.fillStyle = enemy.color;
      ctx.beginPath();
      ctx.ellipse(s.x + sz / 2, s.y + sz / 2, sz / 2 - 2, sz / 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(s.x, s.y + sz / 3, sz / 2 - 2, 4);
      ctx.fillRect(s.x + sz / 2 + 2, s.y + sz / 3, sz / 2 - 2, 4);
    } else if (enemy.type === 'stone_golem') {
      ctx.fillStyle = enemy.color;
      ctx.fillRect(s.x + sz / 2 - 16, s.y, 32, 44);
      ctx.fillStyle = '#998877';
      ctx.fillRect(s.x + sz / 2 - 12, s.y, 24, 14);
      ctx.fillStyle = '#cc4422';
      ctx.fillRect(s.x + sz / 2 - 8, s.y + 4, 5, 5);
      ctx.fillRect(s.x + sz / 2 + 3, s.y + 4, 5, 5);
      ctx.fillStyle = '#665544';
      ctx.fillRect(s.x + sz / 2 - 20, s.y + 8, 8, 20);
      ctx.fillRect(s.x + sz / 2 + 12, s.y + 8, 8, 20);
    } else if (enemy.type === 'dragon_boss') {
      const t = Date.now() * 0.003;
      ctx.fillStyle = enemy.color;
      ctx.fillRect(s.x + sz / 2 - 24, s.y + 10, 48, 40);
      ctx.fillStyle = '#882200';
      ctx.fillRect(s.x + sz / 2 - 20, s.y, 40, 15);
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(s.x + sz / 2 - 6, s.y + 4, 5, 5);
      ctx.fillRect(s.x + sz / 2 + 1, s.y + 4, 5, 5);
      // Wings
      ctx.fillStyle = '#aa1100';
      ctx.beginPath();
      ctx.moveTo(s.x + sz / 2 - 20, s.y + 20);
      ctx.lineTo(s.x + sz / 2 - 50 + Math.sin(t) * 8, s.y - 10);
      ctx.lineTo(s.x + sz / 2 - 10, s.y + 30);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s.x + sz / 2 + 20, s.y + 20);
      ctx.lineTo(s.x + sz / 2 + 50 + Math.sin(t) * 8, s.y - 10);
      ctx.lineTo(s.x + sz / 2 + 10, s.y + 30);
      ctx.fill();
      // Fire breath
      if (enemy.isAttacking) {
        const fireGlow = Math.random() * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255,100,0,${fireGlow})`;
        ctx.beginPath();
        ctx.ellipse(s.x + sz / 2, s.y + 20, 30, 12, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Generic enemy
      ctx.fillStyle = enemy.color || '#cc4422';
      ctx.fillRect(s.x, s.y, sz, sz);
    }

    ctx.globalAlpha = 1.0;

    // Health bar
    if (enemy.hp > 0) {
      const bw = enemy.isBoss ? 64 : 36;
      const bx = s.x + sz / 2 - bw / 2;
      const by = s.y - 8;
      ctx.fillStyle = '#330000';
      ctx.fillRect(bx, by, bw, 4);
      const ratio = enemy.hp / enemy.maxHP;
      ctx.fillStyle = ratio > 0.5 ? '#cc2222' : ratio > 0.25 ? '#cc8800' : '#cc0000';
      ctx.fillRect(bx, by, bw * ratio, 4);

      if (enemy.isBoss) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(bx - 2, by - 11, bw + 4, 10);
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 8px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText(enemy.name, bx + bw / 2, by - 3);
        ctx.textAlign = 'left';
      }
    }

    // Hit flash
    if (enemy.hitFlash > 0) {
      ctx.globalAlpha = Math.min(1, enemy.hitFlash * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(s.x + sz / 2 - 10, s.y, 20, sz);
      ctx.globalAlpha = 1.0;
    }
  }

  // Draw NPC
  drawNPC(npc) {
    const s = this.worldToScreen(npc.x, npc.y);
    const ctx = this.ctx;
    // Body
    ctx.fillStyle = npc.color || '#ccaa44';
    ctx.fillRect(s.x + 4, s.y + 8, 20, 14);
    // Head
    ctx.fillStyle = '#ffcc88';
    ctx.fillRect(s.x + 7, s.y, 14, 10);
    // Chat bubble indicator
    if (npc.hasQuest) {
      const pulse = Math.sin(Date.now() * 0.004) * 2;
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(s.x + 10, s.y - 16 + pulse, 8, 8);
      ctx.fillStyle = '#ff9900';
      ctx.font = 'bold 10px "Courier New"';
      ctx.textAlign = 'center';
      ctx.fillText('!', s.x + 14, s.y - 10 + pulse);
      ctx.textAlign = 'left';
    } else if (npc.questComplete) {
      ctx.fillStyle = '#44cc44';
      ctx.fillRect(s.x + 10, s.y - 14, 8, 8);
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 8px "Courier New"';
      ctx.textAlign = 'center';
      ctx.fillText('✓', s.x + 14, s.y - 8);
      ctx.textAlign = 'left';
    }
    // Name
    ctx.fillStyle = '#ffcc88';
    ctx.font = '9px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText(npc.name, s.x + 14, s.y - 20);
    ctx.textAlign = 'left';
  }

  // Draw projectile
  drawProjectile(proj) {
    const s = this.worldToScreen(proj.x, proj.y);
    const ctx = this.ctx;
    ctx.fillStyle = proj.color || '#ffcc00';
    if (proj.type === 'arrow') {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(proj.angle || 0);
      ctx.fillStyle = '#8b6914';
      ctx.fillRect(-8, -1, 16, 3);
      ctx.fillStyle = '#ccaa44';
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(3, -4);
      ctx.lineTo(3, 4);
      ctx.fill();
      ctx.restore();
    } else if (proj.type === 'fireball') {
      const glow = Math.random() * 0.3 + 0.7;
      ctx.fillStyle = `rgba(255,160,0,${glow})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff4400';
      ctx.beginPath();
      ctx.arc(s.x, s.y, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (proj.type === 'ice_lance') {
      ctx.fillStyle = '#88ccff';
      ctx.fillRect(s.x - 8, s.y - 2, 16, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(s.x - 2, s.y - 1, 4, 2);
    } else if (proj.type === 'lightning') {
      ctx.strokeStyle = '#ffff88';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ffff00';
      ctx.beginPath();
      ctx.arc(s.x, s.y, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (proj.type === 'magic_bolt') {
      ctx.fillStyle = proj.color || '#aa44ff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (proj.type === 'fire_breath') {
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = '#ff6600';
      ctx.beginPath();
      ctx.arc(s.x, s.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    } else {
      ctx.beginPath();
      ctx.arc(s.x, s.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Particle system
  addParticle(x, y, opts = {}) {
    this.particles.push({
      x, y,
      vx: opts.vx !== undefined ? opts.vx : (Math.random() - 0.5) * 120,
      vy: opts.vy !== undefined ? opts.vy : (Math.random() - 0.5) * 120,
      life: opts.life || 0.6,
      maxLife: opts.life || 0.6,
      color: opts.color || '#ffcc00',
      size: opts.size || 4,
      gravity: opts.gravity !== undefined ? opts.gravity : 80
    });
  }

  addDamageNumber(x, y, damage, isCrit = false, isHeal = false) {
    this.damageNumbers.push({
      x, y: y - 10,
      damage,
      isCrit,
      isHeal,
      life: 1.2,
      maxLife: 1.2,
      vy: -60
    });
  }

  spawnHitParticles(x, y, color = '#ff4444', count = 6) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      this.addParticle(x, y, {
        vx: Math.cos(angle) * 80,
        vy: Math.sin(angle) * 80,
        color,
        size: 3,
        life: 0.4
      });
    }
  }

  spawnExplosion(x, y, color = '#ff6600', count = 12, radius = 40) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 60 + Math.random() * radius;
      this.addParticle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 4 + Math.random() * 4,
        life: 0.6 + Math.random() * 0.4,
        gravity: 20
      });
    }
  }

  updateParticles(dt) {
    this.particles = this.particles.filter(p => p.life > 0);
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.life -= dt;
    }
    this.damageNumbers = this.damageNumbers.filter(d => d.life > 0);
    for (const d of this.damageNumbers) {
      d.y += d.vy * dt;
      d.vy *= 0.95;
      d.life -= dt;
    }
  }

  drawParticles() {
    const ctx = this.ctx;
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      const s = this.worldToScreen(p.x, p.y);
      ctx.fillRect(s.x - p.size / 2, s.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1.0;
  }

  drawDamageNumbers() {
    const ctx = this.ctx;
    for (const d of this.damageNumbers) {
      const alpha = d.life / d.maxLife;
      ctx.globalAlpha = alpha;
      const s = this.worldToScreen(d.x, d.y);
      if (d.isHeal) {
        ctx.fillStyle = '#44ff88';
        ctx.font = 'bold 14px "Courier New"';
        ctx.fillText('+' + d.damage, s.x, s.y);
      } else if (d.isCrit) {
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 18px "Courier New"';
        ctx.fillText(d.damage + '!', s.x, s.y);
      } else {
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 13px "Courier New"';
        ctx.fillText(d.damage, s.x, s.y);
      }
    }
    ctx.globalAlpha = 1.0;
  }

  // Lighting overlay (dark with torch light radial gradient)
  drawLighting(lightSources, ambientAlpha = 0.55) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = `rgba(0,0,5,${ambientAlpha})`;
    ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
    ctx.globalCompositeOperation = 'screen';
    for (const light of lightSources) {
      const s = this.worldToScreen(light.x, light.y);
      const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, light.radius);
      grad.addColorStop(0, light.color || 'rgba(255,200,100,0.25)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(s.x, s.y, light.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Minimap
  drawMinimap(minimapCanvas, tileMap, player, enemies, npcs) {
    const mctx = minimapCanvas.getContext('2d');
    const mw = minimapCanvas.width, mh = minimapCanvas.height;
    if (!tileMap || !tileMap.length) return;
    const mapW = tileMap[0].length, mapH = tileMap.length;
    const scaleX = mw / mapW, scaleY = mh / mapH;
    mctx.fillStyle = '#0a0a14';
    mctx.fillRect(0, 0, mw, mh);
    // Draw tiles
    for (let row = 0; row < mapH; row++) {
      for (let col = 0; col < mapW; col++) {
        const t = tileMap[row][col];
        let color = '#1a2a1a';
        if (t === 1) color = '#2a4a2a';
        else if (t === 2 || t === 6) color = '#444444';
        else if (t === 3 || t === 7) color = '#111';
        else if (t === 4) color = '#1a3a5a';
        else if (t === 5) color = '#6a5a2a';
        else if (t === 8 || t === 9) color = '#1a3a1a';
        else if (t === 12) color = '#aa3322';
        mctx.fillStyle = color;
        mctx.fillRect(col * scaleX, row * scaleY, Math.max(1, scaleX), Math.max(1, scaleY));
      }
    }
    // Enemies
    for (const e of enemies) {
      if (e.hp <= 0) continue;
      mctx.fillStyle = e.isBoss ? '#ff8800' : '#ff4444';
      const ex = (e.x / 32) * scaleX, ey = (e.y / 32) * scaleY;
      mctx.fillRect(ex - 1, ey - 1, 3, 3);
    }
    // NPCs
    for (const npc of npcs) {
      mctx.fillStyle = '#ffcc44';
      mctx.fillRect((npc.x / 32) * scaleX - 1, (npc.y / 32) * scaleY - 1, 3, 3);
    }
    // Player
    const px = (player.x / 32) * scaleX, py = (player.y / 32) * scaleY;
    mctx.fillStyle = '#00ff88';
    mctx.fillRect(px - 2, py - 2, 5, 5);
    // Viewport rect
    mctx.strokeStyle = 'rgba(200,200,255,0.4)';
    mctx.strokeRect(
      (this.camera.x / 32) * scaleX,
      (this.camera.y / 32) * scaleY,
      (this.WIDTH / 32) * scaleX,
      (this.HEIGHT / 32) * scaleY
    );
  }

  // Screen flash (on damage, level up)
  screenFlash(color, duration = 0.2) {
    this.flashTimer = duration;
    this.flashColor = color;
  }

  drawScreenFlash(dt) {
    if (this.flashTimer <= 0) return;
    this.flashTimer -= dt;
    const alpha = this.flashTimer * 2;
    this.ctx.fillStyle = this.flashColor.replace(')', `,${Math.min(1, alpha)})`).replace('rgb(', 'rgba(');
    this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
  }

  // Zone transition overlay
  drawFade(alpha) {
    this.ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
  }
}

export default Renderer;
