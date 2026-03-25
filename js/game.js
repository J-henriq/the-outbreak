/**
 * Arcane Engineers - Main Game Engine
 * Handles the game loop, state management, input, and rendering
 */

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    canvas.width = CONFIG.CANVAS_WIDTH;
    canvas.height = CONFIG.CANVAS_HEIGHT;

    // Systems
    this.ui = new UISystem(canvas, this.ctx);
    this.dungeonGen = new DungeonGenerator();
    this.entities = new EntityManager();
    this.gearSystem = new GearSystem();
    this.leaderboard = new LeaderboardSystem();

    // State
    this.state = CONFIG.GAME_STATES.MAIN_MENU;
    this.prevState = null;

    // Players
    this.players = [];
    this.localPlayer = null;
    this.selectedClass = null;
    this.selectedMenuOption = 0;
    this.hoveredClass = null;
    this.hoveredSkill = null;

    // Dungeon
    this.dungeon = null;
    this.dungeonLevel = 1;
    this.camera = { x: 0, y: 0 };

    // Game stats
    this.killCount = 0;
    this.score = 0;
    this.runStartTime = 0;
    this.elapsedTime = 0;

    // Input
    this.keys = {};
    this.mouse = { x: 0, y: 0, buttons: {} };

    // Timing
    this.lastTime = 0;
    this.animationId = null;

    // Cosmetics shop
    this.cosmetics = this.initCosmetics();

    this.setupInput();
    this.startLoop();
  }

  // ---- Initialization ----

  initCosmetics() {
    return [
      { id: 'skin_shadow', name: 'Shadow Form', description: 'Dark ethereal appearance', price: 200, type: 'skin', color: '#2c3e50' },
      { id: 'skin_fire', name: 'Ember Skin', description: 'Blazing fire aesthetic', price: 200, type: 'skin', color: '#e74c3c' },
      { id: 'pet_spark', name: 'Spark Pet', description: 'A tiny floating spark familiar', price: 150, type: 'pet' },
      { id: 'machine_chrome', name: 'Chrome Machines', description: 'Sleek chrome finish for all machines', price: 100, type: 'machine_skin' },
      { id: 'trail_arcane', name: 'Arcane Trail', description: 'Leave a trail of arcane energy', price: 175, type: 'trail' }
    ];
  }

  // ---- Input Handling ----

  setupInput() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      this.handleKeyDown(e.key);
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = CONFIG.CANVAS_WIDTH / rect.width;
      const scaleY = CONFIG.CANVAS_HEIGHT / rect.height;
      this.mouse.x = (e.clientX - rect.left) * scaleX;
      this.mouse.y = (e.clientY - rect.top) * scaleY;
      this.handleMouseMove();
    });

    this.canvas.addEventListener('mousedown', (e) => {
      this.mouse.buttons[e.button] = true;
      this.handleMouseClick(e.button);
    });

    this.canvas.addEventListener('mouseup', (e) => {
      this.mouse.buttons[e.button] = false;
    });

    // Prevent context menu
    this.canvas.addEventListener('contextmenu', e => e.preventDefault());
  }

  handleKeyDown(key) {
    switch (this.state) {
      case CONFIG.GAME_STATES.MAIN_MENU:
        if (key === 'ArrowUp') this.selectedMenuOption = Math.max(0, this.selectedMenuOption - 1);
        if (key === 'ArrowDown') this.selectedMenuOption = Math.min(3, this.selectedMenuOption + 1);
        if (key === 'Enter' || key === ' ') this.handleMainMenuSelect();
        break;

      case CONFIG.GAME_STATES.CLASS_SELECT:
        if (key === 'Escape') this.setState(CONFIG.GAME_STATES.MAIN_MENU);
        break;

      case CONFIG.GAME_STATES.PLAYING:
        if (key === 'p' || key === 'P') this.setState(CONFIG.GAME_STATES.PAUSED);
        if (key === 'Escape') this.setState(CONFIG.GAME_STATES.PAUSED);
        if (key === 'i' || key === 'I') this.setState(CONFIG.GAME_STATES.INVENTORY);
        if (key === 'k' || key === 'K') this.setState(CONFIG.GAME_STATES.SKILL_TREE);
        // Ability keys 1-3
        if (key === '1') this.useAbility(0);
        if (key === '2') this.useAbility(1);
        if (key === '3') this.useAbility(2);
        // Interact
        if (key === 'e' || key === 'E') this.interact();
        break;

      case CONFIG.GAME_STATES.PAUSED:
        if (key === 'p' || key === 'P' || key === 'Escape') this.setState(CONFIG.GAME_STATES.PLAYING);
        if (key === 'i' || key === 'I') this.setState(CONFIG.GAME_STATES.INVENTORY);
        if (key === 'k' || key === 'K') this.setState(CONFIG.GAME_STATES.SKILL_TREE);
        if (key === 'q' || key === 'Q') this.setState(CONFIG.GAME_STATES.MAIN_MENU);
        break;

      case CONFIG.GAME_STATES.INVENTORY:
      case CONFIG.GAME_STATES.SKILL_TREE:
        if (key === 'Escape' || key === 'i' || key === 'I' || key === 'k' || key === 'K') {
          this.setState(CONFIG.GAME_STATES.PLAYING);
        }
        break;

      case CONFIG.GAME_STATES.GAME_OVER:
      case CONFIG.GAME_STATES.VICTORY:
        if (key === 'r' || key === 'R') this.restartRun();
        if (key === 'Escape') this.setState(CONFIG.GAME_STATES.MAIN_MENU);
        break;

      case CONFIG.GAME_STATES.LEADERBOARD:
        if (key === 'Escape') this.setState(CONFIG.GAME_STATES.MAIN_MENU);
        break;
    }
  }

  handleMainMenuSelect() {
    switch (this.selectedMenuOption) {
      case 0: // Play Solo
        this.setState(CONFIG.GAME_STATES.CLASS_SELECT);
        break;
      case 1: // Co-op (simplified for browser - show message)
        this.ui.addNotification('Co-op: Share this screen with friends! Each picks a class.', CONFIG.UI.ACCENT_BLUE, 4000);
        this.setState(CONFIG.GAME_STATES.CLASS_SELECT);
        break;
      case 2: // Leaderboard
        this.setState(CONFIG.GAME_STATES.LEADERBOARD);
        break;
      case 3: // Settings
        this.ui.addNotification('Settings coming soon!', CONFIG.UI.TEXT_SECONDARY, 2000);
        break;
    }
  }

  handleMouseMove() {
    if (this.state === CONFIG.GAME_STATES.CLASS_SELECT) {
      const classes = Object.values(CONFIG.CLASSES);
      const cardW = 240;
      const spacing = 30;
      const totalW = classes.length * cardW + (classes.length - 1) * spacing;
      const startX = (CONFIG.CANVAS_WIDTH - totalW) / 2;

      this.hoveredClass = null;
      classes.forEach((cls, i) => {
        const cx = startX + i * (cardW + spacing);
        const cy = 100;
        if (this.mouse.x >= cx && this.mouse.x <= cx + cardW &&
            this.mouse.y >= cy && this.mouse.y <= cy + 360) {
          this.hoveredClass = cls;
        }
      });
    }

    if (this.state === CONFIG.GAME_STATES.SKILL_TREE && this.localPlayer) {
      const tree = CONFIG.SKILL_TREES[this.localPlayer.playerClass];
      if (!tree) return;
      const nodeW = 120;
      const nodeH = 48;
      const colSpacing = 160;
      const rowSpacing = 90;
      const offsetX = CONFIG.CANVAS_WIDTH / 2 - colSpacing;
      const offsetY = 100;

      this.hoveredSkill = null;
      tree.forEach(skill => {
        const nx = offsetX + skill.col * colSpacing;
        const ny = offsetY + skill.row * rowSpacing;
        if (this.mouse.x >= nx && this.mouse.x <= nx + nodeW &&
            this.mouse.y >= ny && this.mouse.y <= ny + nodeH) {
          this.hoveredSkill = skill.id;
        }
      });
    }
  }

  handleMouseClick(button) {
    if (button !== 0) {
      // Right-click: use ability 0 toward mouse
      if (this.state === CONFIG.GAME_STATES.PLAYING && button === 2) {
        this.useAbility(0);
      }
      return;
    }

    switch (this.state) {
      case CONFIG.GAME_STATES.MAIN_MENU: {
        // Check button clicks
        const options = ['Play Solo', 'Co-op', 'Leaderboard', 'Settings'];
        options.forEach((_, i) => {
          const y = CONFIG.CANVAS_HEIGHT / 2 + 60 + i * 50;
          if (Math.abs(this.mouse.y - y) < 18 && Math.abs(this.mouse.x - CONFIG.CANVAS_WIDTH / 2) < 120) {
            this.selectedMenuOption = i;
            this.handleMainMenuSelect();
          }
        });
        break;
      }

      case CONFIG.GAME_STATES.CLASS_SELECT:
        if (this.hoveredClass) {
          this.startGame(this.hoveredClass);
        }
        break;

      case CONFIG.GAME_STATES.PLAYING:
        // Left-click: basic attack toward mouse
        this.performBasicAttack();
        break;

      case CONFIG.GAME_STATES.SKILL_TREE:
        if (this.hoveredSkill && this.localPlayer) {
          const success = this.localPlayer.unlockSkill(this.hoveredSkill);
          if (success) {
            const tree = CONFIG.SKILL_TREES[this.localPlayer.playerClass];
            const skill = tree.find(s => s.id === this.hoveredSkill);
            this.ui.addNotification(`Unlocked: ${skill.name}!`, CONFIG.UI.ACCENT_GOLD);
          } else {
            this.ui.addNotification('Cannot unlock skill (requires: skill points or prerequisites).', '#e74c3c');
          }
        }
        break;
    }
  }

  // ---- Game State ----

  setState(newState) {
    this.prevState = this.state;
    this.state = newState;
  }

  startGame(playerClass) {
    this.selectedClass = playerClass;
    this.dungeonLevel = 1;
    this.killCount = 0;
    this.score = 0;
    this.runStartTime = Date.now();

    // Create player
    this.dungeonGen = new DungeonGenerator();
    this.dungeon = this.dungeonGen.generate(this.dungeonLevel);
    this.entities.loadDungeon(this.dungeon);

    const player = new Player('p1', playerClass, this.dungeon.startX, this.dungeon.startY, true);

    // Give starting gear
    const startingGear = this.gearSystem.generateGear(1, 'COMMON', 'weapon');
    player.equipGear(startingGear);

    this.players = [player];
    this.localPlayer = player;

    this.camera.x = player.x - CONFIG.CANVAS_WIDTH / 2;
    this.camera.y = player.y - CONFIG.CANVAS_HEIGHT / 2;

    this.setState(CONFIG.GAME_STATES.PLAYING);
    this.ui.addNotification(`Welcome, ${playerClass}! Survive the dungeon!`, CONFIG.UI.ACCENT_GOLD, 4000);
    this.ui.addNotification('WASD/Arrows: Move | Click: Attack | 1-3: Abilities | E: Interact', CONFIG.UI.TEXT_SECONDARY, 5000);
  }

  restartRun() {
    if (this.selectedClass) {
      this.startGame(this.selectedClass);
    } else {
      this.setState(CONFIG.GAME_STATES.CLASS_SELECT);
    }
  }

  nextFloor() {
    this.dungeonLevel++;
    this.dungeonGen = new DungeonGenerator();
    this.dungeon = this.dungeonGen.generate(this.dungeonLevel);
    this.entities.loadDungeon(this.dungeon);

    // Reposition players
    this.players.forEach(p => {
      p.x = this.dungeon.startX;
      p.y = this.dungeon.startY;
      if (!p.isAlive) p.revive();
    });

    this.score += 500 * this.dungeonLevel;
    this.ui.addNotification(`Floor ${this.dungeonLevel}! Enemies grow stronger...`, CONFIG.UI.ACCENT_GOLD, 3000);
  }

  // ---- Player Actions ----

  performBasicAttack() {
    if (!this.localPlayer || !this.localPlayer.isAlive) return;
    const now = Date.now();
    const attackCooldown = 400 - this.localPlayer.getTotalStat('dexterity') * 5;
    if (now - (this.localPlayer.lastBasicAttack || 0) < Math.max(200, attackCooldown)) return;
    this.localPlayer.lastBasicAttack = now;

    const worldX = this.mouse.x + this.camera.x;
    const worldY = this.mouse.y + this.camera.y;
    const dx = worldX - this.localPlayer.x;
    const dy = worldY - this.localPlayer.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    this.localPlayer.facing = { x: dx / dist, y: dy / dist };

    const proj = {
      id: this.entities.nextId++,
      x: this.localPlayer.x,
      y: this.localPlayer.y,
      vx: (dx / dist) * 8,
      vy: (dy / dist) * 8,
      damage: this.localPlayer.getAttackDamage(),
      range: this.localPlayer.getAttackRange(),
      distTraveled: 0,
      radius: 0,
      color: this.localPlayer.color,
      owner: this.localPlayer.id
    };
    this.entities.projectiles.push(proj);
  }

  useAbility(abilityIndex) {
    if (!this.localPlayer || !this.localPlayer.isAlive) return;
    const worldX = this.mouse.x + this.camera.x;
    const worldY = this.mouse.y + this.camera.y;
    const result = this.localPlayer.useAbility(abilityIndex, worldX, worldY, this.dungeon);

    if (!result) {
      const ability = this.localPlayer.abilities[abilityIndex];
      if (ability) {
        const cdPct = this.localPlayer.getAbilityCooldownPercent(abilityIndex);
        if (cdPct < 1) {
          const remaining = Math.ceil(ability.cooldown * (1 - cdPct) / 1000);
          this.ui.addNotification(`${ability.name} on cooldown (${remaining}s)`, '#888');
        } else if (this.localPlayer.mana < ability.manaCost) {
          this.ui.addNotification(`Not enough mana! (${ability.manaCost} needed)`, CONFIG.UI.MANA_BAR);
        }
      }
      return;
    }

    if (result.type === 'projectile') {
      this.entities.projectiles.push(result);
      this.ui.addNotification(`${this.localPlayer.abilities[abilityIndex].name}!`, this.localPlayer.color);
    } else if (result.type === 'deploy') {
      const machine = this.entities.deployMachine(result.machineKey, result.x, result.y, result.owner);
      if (machine) {
        this.localPlayer.machines.push(machine);
        this.ui.addNotification(`${machine.name} deployed!`, CONFIG.UI.ACCENT_GREEN);
      }
    }
  }

  interact() {
    if (!this.localPlayer || !this.localPlayer.isAlive) return;
    const px = this.localPlayer.x;
    const py = this.localPlayer.y;
    const range = 48;

    // Check for chests
    this.dungeon.chests.forEach(chest => {
      if (chest.opened) return;
      const dx = chest.x - px;
      const dy = chest.y - py;
      if (Math.sqrt(dx * dx + dy * dy) < range) {
        chest.opened = true;
        this.openChest(chest);
      }
    });

    // Check for portals (advance floor)
    this.dungeon.portals.forEach(portal => {
      const dx = portal.x - px;
      const dy = portal.y - py;
      if (Math.sqrt(dx * dx + dy * dy) < range) {
        this.nextFloor();
      }
    });
  }

  openChest(chest) {
    if (!chest.loot || !this.localPlayer) return;
    chest.loot.forEach(item => {
      if (item.type === 'gold') {
        this.localPlayer.gold += item.amount;
        this.ui.addNotification(`Found ${item.amount} gold!`, CONFIG.UI.ACCENT_GOLD);
        this.ui.addFloatingText(`+${item.amount}g`, chest.x - this.camera.x, chest.y - this.camera.y, CONFIG.UI.ACCENT_GOLD);
      } else if (item.type === 'arcaneShards') {
        this.localPlayer.arcaneShards += item.amount;
        this.ui.addNotification(`Found ${item.amount} Arcane Shards!`, CONFIG.UI.ACCENT_PURPLE);
      } else if (item.slot) {
        // It's gear
        const added = this.localPlayer.addToInventory(item);
        if (added) {
          const rarityData = CONFIG.RARITY[item.rarity];
          this.ui.addNotification(`Found: ${item.name}!`, rarityData?.color || '#aaa');
          this.ui.addFloatingText(`[${item.rarity}] ${item.name}`, chest.x - this.camera.x, chest.y - this.camera.y, rarityData?.color || '#aaa');

          // Track rare finds
          if (item.rarity === 'EPIC' || item.rarity === 'LEGENDARY') {
            this.leaderboard.addRareFind(this.localPlayer.playerClass, item.name, item.rarity, this.dungeonLevel);
          }
        }
      }
    });
    this.score += 50;
  }

  // ---- Update ----

  update(deltaTime) {
    if (this.state !== CONFIG.GAME_STATES.PLAYING) return;

    this.elapsedTime = Date.now() - this.runStartTime;

    // Move local player
    this.movePlayer(deltaTime);

    // Update players
    this.players.forEach(p => p.update(deltaTime));

    // Update entities
    this.entities.updateEnemies(deltaTime, this.players, this.dungeon, this.dungeonGen);
    this.entities.updateMachines(deltaTime, this.players);
    this.entities.updateProjectiles(deltaTime, this.players, this.dungeonGen, this.dungeon);
    this.entities.updateEffects(deltaTime);

    // Check enemy deaths and award exp/score
    const justKilled = this.entities.enemies.filter(e => !e.isAlive);
    // Note: dead enemies are removed in updateEnemies, so we track kills separately
    // The kill tracking is handled below

    // Update camera
    if (this.localPlayer) {
      const targetX = this.localPlayer.x - CONFIG.CANVAS_WIDTH / 2;
      const targetY = this.localPlayer.y - CONFIG.CANVAS_HEIGHT / 2;
      this.camera.x += (targetX - this.camera.x) * 0.1;
      this.camera.y += (targetY - this.camera.y) * 0.1;
    }

    // Check game over
    const allDead = this.players.every(p => !p.isAlive);
    if (allDead) {
      this.submitRunToLeaderboard();
      this.setState(CONFIG.GAME_STATES.GAME_OVER);
    }
  }

  movePlayer(deltaTime) {
    if (!this.localPlayer || !this.localPlayer.isAlive) return;
    const player = this.localPlayer;
    const speed = player.getMoveSpeed();
    let dx = 0, dy = 0;

    if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) dx -= speed;
    if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) dx += speed;
    if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) dy -= speed;
    if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) dy += speed;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      dx *= 0.707;
      dy *= 0.707;
    }

    player.isMoving = dx !== 0 || dy !== 0;

    // Collision detection
    const half = player.width / 2;
    const corners = [
      { x: player.x + dx + half - 2, y: player.y + half - 2 },
      { x: player.x + dx - half + 2, y: player.y + half - 2 },
      { x: player.x + dx + half - 2, y: player.y - half + 2 },
      { x: player.x + dx - half + 2, y: player.y - half + 2 }
    ];

    const canMoveX = corners.every(c => this.dungeonGen.isWalkable(this.dungeon, c.x, player.y));
    if (canMoveX) player.x += dx;

    const cornersY = [
      { x: player.x + half - 2, y: player.y + dy + half - 2 },
      { x: player.x - half + 2, y: player.y + dy + half - 2 },
      { x: player.x + half - 2, y: player.y + dy - half + 2 },
      { x: player.x - half + 2, y: player.y + dy - half + 2 }
    ];

    const canMoveY = cornersY.every(c => this.dungeonGen.isWalkable(this.dungeon, player.x, c.y));
    if (canMoveY) player.y += dy;

    // Update facing direction
    if (dx !== 0 || dy !== 0) {
      player.facing = { x: dx, y: dy };
    }
  }

  onEnemyKilled(enemy) {
    this.killCount++;
    this.score += enemy.exp * 2;
    this.players.forEach(p => p.gainExp(enemy.exp));
    this.ui.addFloatingText(`+${enemy.exp} EXP`, enemy.x - this.camera.x, enemy.y - this.camera.y, CONFIG.UI.EXP_BAR);

    // Chance to drop gear
    if (Math.random() < 0.25 + (enemy.isBoss ? 0.5 : 0)) {
      const drop = this.gearSystem.generateGear(
        this.dungeonLevel,
        enemy.isBoss ? 'RARE' : null
      );
      if (this.localPlayer && this.localPlayer.addToInventory(drop)) {
        const rarityData = CONFIG.RARITY[drop.rarity];
        this.ui.addNotification(`${enemy.name} dropped: ${drop.name}!`, rarityData?.color || '#aaa');
        if (drop.rarity === 'EPIC' || drop.rarity === 'LEGENDARY') {
          this.leaderboard.addRareFind(this.localPlayer.playerClass, drop.name, drop.rarity, this.dungeonLevel);
        }
      }
    }
  }

  submitRunToLeaderboard() {
    if (!this.localPlayer) return;
    const rank = this.leaderboard.submitRun({
      playerName: this.localPlayer.playerClass,
      playerClass: this.localPlayer.playerClass,
      level: this.localPlayer.level,
      dungeonLevel: this.dungeonLevel,
      time: this.elapsedTime,
      score: this.score,
      kills: this.killCount,
      teamSize: this.players.length
    });
    return rank;
  }

  // ---- Rendering ----

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    switch (this.state) {
      case CONFIG.GAME_STATES.MAIN_MENU:
        this.ui.drawMainMenu(this.selectedMenuOption);
        break;

      case CONFIG.GAME_STATES.CLASS_SELECT:
        this.ui.drawClassSelect(this.hoveredClass);
        break;

      case CONFIG.GAME_STATES.PLAYING:
      case CONFIG.GAME_STATES.PAUSED:
        this.renderGame();
        if (this.state === CONFIG.GAME_STATES.PAUSED) {
          this.ui.drawPause();
        }
        break;

      case CONFIG.GAME_STATES.INVENTORY:
        this.renderGame();
        if (this.localPlayer) {
          this.ui.drawInventory(this.localPlayer);
        }
        break;

      case CONFIG.GAME_STATES.SKILL_TREE:
        this.renderGame();
        if (this.localPlayer) {
          this.ui.drawSkillTree(this.localPlayer, this.hoveredSkill);
        }
        break;

      case CONFIG.GAME_STATES.GAME_OVER:
        this.renderGame();
        this.ui.drawGameOver(this.score, this.killCount, this.elapsedTime);
        break;

      case CONFIG.GAME_STATES.VICTORY:
        this.renderGame();
        this.ui.drawVictory(this.score, this.killCount, this.elapsedTime, null);
        break;

      case CONFIG.GAME_STATES.LEADERBOARD:
        this.ui.drawLeaderboard(this.leaderboard);
        break;
    }
  }

  renderGame() {
    if (!this.dungeon) return;
    this.renderDungeon();
    this.entities.drawEffects(this.ctx, this.camera);
    this.entities.drawMachines(this.ctx, this.camera);
    this.entities.drawProjectiles(this.ctx, this.camera);
    this.entities.drawEnemies(this.ctx, this.camera);
    this.renderChests();
    this.renderPortals();
    this.players.forEach(p => p.draw(this.ctx, this.camera));
    this.ui.drawHUD(this.players, this.localPlayer, this.dungeonLevel, this.killCount, this.elapsedTime);
  }

  renderDungeon() {
    const ctx = this.ctx;
    const ts = CONFIG.TILE_SIZE;
    const startCol = Math.max(0, Math.floor(this.camera.x / ts));
    const endCol = Math.min(this.dungeon.cols, Math.ceil((this.camera.x + CONFIG.CANVAS_WIDTH) / ts));
    const startRow = Math.max(0, Math.floor(this.camera.y / ts));
    const endRow = Math.min(this.dungeon.rows, Math.ceil((this.camera.y + CONFIG.CANVAS_HEIGHT) / ts));

    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        const tile = this.dungeon.tiles[row][col];
        const sx = col * ts - this.camera.x;
        const sy = row * ts - this.camera.y;

        switch (tile) {
          case CONFIG.TILES.WALL:
            // Wall gradient
            ctx.fillStyle = '#0d0d1f';
            ctx.fillRect(sx, sy, ts, ts);
            ctx.fillStyle = '#181830';
            ctx.fillRect(sx, sy, ts - 2, ts - 2);
            break;
          case CONFIG.TILES.FLOOR:
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(sx, sy, ts, ts);
            // Subtle grid
            ctx.strokeStyle = '#222244';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(sx, sy, ts, ts);
            break;
          case CONFIG.TILES.DOOR:
            ctx.fillStyle = '#2c1810';
            ctx.fillRect(sx, sy, ts, ts);
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(sx + 4, sy + 2, ts - 8, ts - 4);
            break;
          case CONFIG.TILES.CHEST:
          case CONFIG.TILES.PORTAL:
            // These are drawn as entities
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(sx, sy, ts, ts);
            break;
          case CONFIG.TILES.MACHINE_SLOT:
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(sx, sy, ts, ts);
            ctx.strokeStyle = '#4a90d966';
            ctx.lineWidth = 1;
            ctx.strokeRect(sx + 2, sy + 2, ts - 4, ts - 4);
            break;
        }
      }
    }
  }

  renderChests() {
    const ctx = this.ctx;
    const ts = CONFIG.TILE_SIZE;
    this.dungeon.chests.forEach(chest => {
      const sx = chest.x - this.camera.x;
      const sy = chest.y - this.camera.y;

      if (sx < -32 || sx > CONFIG.CANVAS_WIDTH + 32 || sy < -32 || sy > CONFIG.CANVAS_HEIGHT + 32) return;

      if (!chest.opened) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = CONFIG.UI.ACCENT_GOLD;
        ctx.fillStyle = '#8b6914';
        ctx.fillRect(sx, sy, ts - 4, ts - 8);
        ctx.fillStyle = CONFIG.UI.ACCENT_GOLD;
        ctx.fillRect(sx, sy, ts - 4, 10);
        ctx.shadowBlur = 0;
        // Interaction hint
        const px = this.localPlayer?.x;
        const py = this.localPlayer?.y;
        if (px && py) {
          const d = Math.sqrt((chest.x - px) ** 2 + (chest.y - py) ** 2);
          if (d < 60) {
            ctx.fillStyle = CONFIG.UI.TEXT_PRIMARY;
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('[E]', sx + (ts - 4) / 2, sy - 8);
          }
        }
      } else {
        ctx.fillStyle = '#3d2a0a';
        ctx.fillRect(sx, sy, ts - 4, ts - 8);
      }
    });
  }

  renderPortals() {
    const ctx = this.ctx;
    const time = Date.now() * 0.002;
    this.dungeon.portals.forEach(portal => {
      const sx = portal.x - this.camera.x;
      const sy = portal.y - this.camera.y;

      ctx.save();
      ctx.shadowBlur = 20 + Math.sin(time) * 8;
      ctx.shadowColor = CONFIG.UI.ACCENT_PURPLE;
      const grad = ctx.createRadialGradient(sx, sy, 5, sx, sy, 24);
      grad.addColorStop(0, '#9b59b6');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sx, sy, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = CONFIG.UI.TEXT_PRIMARY;
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PORTAL', sx, sy + 32);
      if (this.localPlayer) {
        const d = Math.sqrt((portal.x - this.localPlayer.x) ** 2 + (portal.y - this.localPlayer.y) ** 2);
        if (d < 60) ctx.fillText('[E] Next Floor', sx, sy - 30);
      }
      ctx.restore();
    });
  }

  // ---- Game Loop ----

  startLoop() {
    const loop = (timestamp) => {
      if (this.lastTime === 0) {
        this.lastTime = timestamp;
      }
      const deltaTime = Math.min(timestamp - this.lastTime, 50);
      this.lastTime = timestamp;

      // Track enemy kills
      const prevEnemyCount = this.entities.enemies.length;
      this.update(deltaTime);
      const newEnemyCount = this.entities.enemies.length;

      // Simple kill detection
      if (prevEnemyCount > newEnemyCount && this.state === CONFIG.GAME_STATES.PLAYING) {
        const killed = prevEnemyCount - newEnemyCount;
        // Award for the kill (approximate)
        for (let k = 0; k < killed; k++) {
          this.killCount++;
          this.score += 50 * this.dungeonLevel;
        }
      }

      this.render();
      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

// Bootstrap
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
      window.game = new Game(canvas);
    }
  });
}
