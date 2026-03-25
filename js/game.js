// ─────────────────────────────────────────────────────────
//  ASHENWILD  –  Main Game Class
// ─────────────────────────────────────────────────────────

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx    = this.canvas.getContext('2d');

    // Game state
    this.state    = 'title';   // title | create | playing | dead | victory
    this.zoneIdx  = 0;
    this.playTime = 0;

    // Game objects
    this.player      = null;
    this.world       = null;
    this.enemies     = [];
    this.projectiles = [];
    this.loots       = [];
    this.floats      = [];

    // Camera
    this.camX = 0;
    this.camY = 0;

    // Boss reference
    this.boss = null;

    // Combat system
    this.combat = null;

    // Timing
    this._lastTime = 0;
    this._tickAccum = 0;

    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    this.canvas.width  = W;
    this.canvas.height = H;
  }

  // ── Zone Loading ──────────────────────────────────────
  loadZone(idx) {
    this.zoneIdx     = idx;
    this.world       = new World(idx);
    this.enemies     = [];
    this.projectiles = [];
    this.loots       = [];
    this.floats      = [];
    this.boss        = null;

    const T  = CFG.TILE;
    const cx = Math.floor(this.world.W / 2) * T + T / 2;
    const cy = Math.floor(this.world.H / 2) * T + T / 2;

    // Spawn player in centre
    this.player.x = cx;
    this.player.y = cy;
    this.player.hp = this.player.maxHp;  // full heal on zone enter

    // Spawn enemies
    this._spawnEnemies(idx);

    this.log(`Entering ${CFG.ZONES[idx]}...`, 'info');
  }

  _spawnEnemies(zoneIdx) {
    const defs = ENEMY_DEFS.filter(e => e.zone === zoneIdx);
    const regular = defs.filter(e => !e.boss);
    const bossDef  = defs.find(e => e.boss);

    const T  = CFG.TILE;
    const W  = this.world.W;
    const H  = this.world.H;

    // Spawn 8-12 regular enemies scattered around
    const count = 8 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i++) {
      const def = regular[Math.floor(Math.random() * regular.length)];
      let x, y, attempts = 0;
      do {
        x = (4 + Math.floor(Math.random() * (W - 8))) * T + T/2;
        y = (4 + Math.floor(Math.random() * (H - 8))) * T + T/2;
        attempts++;
      } while (attempts < 20 && (
        this.world.isBlockedPx(x, y) ||
        Math.abs(x - this.player.x) < 200 ||
        Math.abs(y - this.player.y) < 200
      ));
      this.enemies.push(new Enemy(def, x, y));
    }

    // Spawn boss far from player
    if (bossDef) {
      let bx, by, attempts = 0;
      do {
        bx = (10 + Math.floor(Math.random() * (W - 20))) * T + T/2;
        by = (10 + Math.floor(Math.random() * (H - 20))) * T + T/2;
        attempts++;
      } while (attempts < 30 && (
        this.world.isBlockedPx(bx, by) ||
        Math.abs(bx - this.player.x) < 400
      ));
      this.boss = new Enemy(bossDef, bx, by);
      this.enemies.push(this.boss);
      this.log(`⚠ ${bossDef.name} lurks in this zone!`, 'combat');
    }
  }

  // ── Public API used by Combat ─────────────────────────
  log(text, type) { UI.addMessage(text, type); }

  onBossKilled(en) {
    this.log(`⚔ ${en.name} defeated! Zone cleared!`, 'loot');
    if (this.boss === en) this.boss = null;

    // After a brief delay, show victory then advance zone
    setTimeout(() => {
      UI.showVictory(CFG.ZONES[this.zoneIdx]);
    }, 1500);
  }

  // ── Ability input ─────────────────────────────────────
  _handleAbilityInput() {
    const abilityKeys = ['Digit1','Digit2','Digit3','Digit4','Digit5'];
    abilityKeys.forEach((key, i) => {
      if (Input.isDown(key)) {
        const wx = Input.mouse.x + this.camX;
        const wy = Input.mouse.y + this.camY;
        const result = this.player.useAbility(i, wx, wy, this.world, this.projectiles, this.floats);
        if (result) {
          this.combat.applyAbility(this.player, i, wx, wy, this.floats);
          if (result.dash) this.log(`Used ${this.player.abilities[i].name}!`, 'info');
        }
      }
    });

    // I key – toggle inventory
    if (Input.isDown('KeyI')) {
      if (!this._iKeyHeld) {
        UI.toggleInventory(this.player);
        this._iKeyHeld = true;
      }
    } else {
      this._iKeyHeld = false;
    }
  }

  // ── Camera ────────────────────────────────────────────
  _updateCamera() {
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const mapW = this.world.W * CFG.TILE;
    const mapH = this.world.H * CFG.TILE;

    this.camX = Math.max(0, Math.min(mapW - cw, this.player.x - cw / 2));
    this.camY = Math.max(0, Math.min(mapH - ch, this.player.y - ch / 2));
  }

  // ── Render ────────────────────────────────────────────
  _render() {
    const ctx = this.ctx;
    const cw  = this.canvas.width;
    const ch  = this.canvas.height;

    ctx.clearRect(0, 0, cw, ch);

    // World
    this.world.draw(ctx, this.camX, this.camY, cw, ch);

    // Loot
    this.loots.forEach(l => l.draw(ctx, this.camX, this.camY));

    // Player
    this.player.draw(ctx, this.camX, this.camY);

    // Enemies
    this.enemies.forEach(e => {
      if (!e.dead()) e.draw(ctx, this.camX, this.camY);
    });

    // Projectiles
    this.projectiles.forEach(p => p.draw(ctx, this.camX, this.camY));

    // Floating texts
    this.floats.forEach(f => f.draw(ctx, this.camX, this.camY));

    // Melee swing arc (visual feedback)
    if (this.player.attackCd > 0 && !this.player.isRanged) {
      const ang  = Math.atan2(
        Input.mouse.y + this.camY - this.player.y,
        Input.mouse.x + this.camX - this.player.x
      );
      const sx = this.player.x - this.camX;
      const sy = this.player.y - this.camY;
      ctx.save();
      ctx.globalAlpha = this.player.attackCd * 1.5;
      ctx.strokeStyle = '#ffe060';
      ctx.lineWidth   = 3;
      ctx.shadowColor = '#ffe060';
      ctx.shadowBlur  = 8;
      ctx.beginPath();
      ctx.arc(sx, sy, CFG.MELEE_RANGE, ang - 0.6, ang + 0.6);
      ctx.stroke();
      ctx.restore();
    }

    // Zone enter fade-in (for first 0.5s of play time per zone reset)
    // handled by zoneEnterTimer
    if (this._zoneEnterTimer > 0) {
      ctx.save();
      ctx.globalAlpha = this._zoneEnterTimer / 0.5;
      ctx.fillStyle   = '#000';
      ctx.fillRect(0, 0, cw, ch);
      ctx.restore();
    }
  }

  // ── Game Update ───────────────────────────────────────
  _update(dt) {
    if (this.state !== 'playing') return;

    this.playTime += dt;
    if (this._zoneEnterTimer > 0) this._zoneEnterTimer -= dt;

    // Input
    this._handleAbilityInput();

    // Player
    this.player.update(dt, this.world);

    // Combat
    this.combat.update(dt);

    // Floating texts
    for (let i = this.floats.length - 1; i >= 0; i--) {
      this.floats[i].update(dt);
      if (this.floats[i].dead()) this.floats.splice(i, 1);
    }

    // Camera
    this._updateCamera();

    // Check death
    if (this.player.dead()) {
      this.state = 'dead';
      setTimeout(() => UI.showDeath(this.player, this.playTime), 800);
    }

    // HUD
    UI.updateHUD(this.player, CFG.ZONES[this.zoneIdx]);
    UI.updateBossBar(this.boss);

    // Refresh inventory if open
    if (UI.inventoryOpen) {
      UI.renderInventory(this.player);
    }
  }

  // ── Main Loop ─────────────────────────────────────────
  _loop(now) {
    const dt = Math.min((now - this._lastTime) / 1000, 0.1);
    this._lastTime = now;

    if (this.state === 'playing') {
      this._update(dt);
      this._render();
    }

    requestAnimationFrame(t => this._loop(t));
  }

  // ── Start ─────────────────────────────────────────────
  startGame(charData) {
    this.player  = new Player(charData);
    this.combat  = new Combat(this);
    this.playTime = 0;
    this.state   = 'playing';
    this._zoneEnterTimer = 0.5;

    Input.attachCanvas(this.canvas);

    this.loadZone(0);

    UI.showScreen('screen-game');

    // Kick off first skill level-up notifications
    this.player.skills.onLevelUp((skill, lv) => {
      this.log(`✦ ${skill.charAt(0).toUpperCase()+skill.slice(1)} leveled up to ${lv}!`, 'skill');
    });

    this._lastTime = performance.now();
    requestAnimationFrame(t => this._loop(t));
  }

  // Advance to next zone after victory
  nextZone() {
    const next = this.zoneIdx + 1;
    if (next >= CFG.ZONES.length) {
      UI.addMessage('You have conquered all known zones. The frontier bows to you.', 'skill');
      UI.showScreen('screen-game');
      return;
    }
    this._zoneEnterTimer = 0.5;
    this.loadZone(next);
    UI.showScreen('screen-game');
  }

  // Respawn in current zone
  respawn() {
    this.player.hp = this.player.maxHp;
    this.player.en = this.player.maxEn;
    this.state = 'playing';
    this.loadZone(this.zoneIdx);
    UI.showScreen('screen-game');
  }

  backToTitle() {
    this.state = 'title';
    UI.showScreen('screen-title');
  }
}
