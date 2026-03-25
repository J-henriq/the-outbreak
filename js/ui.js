/**
 * Arcane Engineers - UI System
 * Handles all HUD, menus, overlays, and on-screen displays
 */

class UISystem {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.notifications = [];
    this.floatingTexts = [];
  }

  // ---- Main Menu ----

  drawMainMenu(selectedOption = 0) {
    const ctx = this.ctx;
    const W = CONFIG.CANVAS_WIDTH;
    const H = CONFIG.CANVAS_HEIGHT;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#050510');
    grad.addColorStop(1, '#0a0a2a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Decorative arcane circles
    this.drawArcaneCircles(ctx, W, H);

    // Title
    ctx.save();
    ctx.shadowBlur = 30;
    ctx.shadowColor = CONFIG.UI.ACCENT_BLUE;
    ctx.fillStyle = CONFIG.UI.ACCENT_GOLD;
    ctx.font = 'bold 56px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ARCANE', W / 2, H / 2 - 100);
    ctx.fillStyle = CONFIG.UI.ACCENT_BLUE;
    ctx.fillText('ENGINEERS', W / 2, H / 2 - 40);
    ctx.shadowBlur = 0;
    ctx.restore();

    // Tagline
    ctx.fillStyle = CONFIG.UI.TEXT_SECONDARY;
    ctx.font = 'italic 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Where Magic and Machinery Intertwine', W / 2, H / 2 + 10);

    // Menu options
    const options = ['Play Solo', 'Co-op (2-3 Players)', 'Leaderboard', 'Settings'];
    options.forEach((opt, i) => {
      const y = H / 2 + 60 + i * 50;
      const isSelected = i === selectedOption;

      if (isSelected) {
        ctx.fillStyle = 'rgba(74, 144, 217, 0.2)';
        ctx.fillRect(W / 2 - 120, y - 18, 240, 36);
        ctx.strokeStyle = CONFIG.UI.ACCENT_BLUE;
        ctx.lineWidth = 1;
        ctx.strokeRect(W / 2 - 120, y - 18, 240, 36);
      }

      ctx.fillStyle = isSelected ? CONFIG.UI.ACCENT_GOLD : CONFIG.UI.TEXT_PRIMARY;
      ctx.font = isSelected ? 'bold 18px sans-serif' : '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(opt, W / 2, y);
    });

    // Version
    ctx.fillStyle = CONFIG.UI.TEXT_SECONDARY;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('v1.0.0', W - 16, H - 16);
  }

  drawArcaneCircles(ctx, W, H) {
    const time = Date.now() * 0.0005;
    for (let i = 0; i < 3; i++) {
      const radius = 120 + i * 60;
      ctx.strokeStyle = `rgba(74, 144, 217, ${0.08 - i * 0.02})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(W / 2, H / 2 - 60, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating dots on circles
      for (let d = 0; d < 8; d++) {
        const angle = (d / 8) * Math.PI * 2 + time * (i + 1);
        const x = W / 2 + Math.cos(angle) * radius;
        const y = H / 2 - 60 + Math.sin(angle) * radius;
        ctx.fillStyle = `rgba(74, 144, 217, ${0.3 - i * 0.08})`;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // ---- Class Selection ----

  drawClassSelect(hoveredClass = null) {
    const ctx = this.ctx;
    const W = CONFIG.CANVAS_WIDTH;
    const H = CONFIG.CANVAS_HEIGHT;

    // Background
    ctx.fillStyle = CONFIG.UI.BG_DARK;
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.fillStyle = CONFIG.UI.ACCENT_GOLD;
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('Choose Your Discipline', W / 2, 30);

    ctx.fillStyle = CONFIG.UI.TEXT_SECONDARY;
    ctx.font = '14px sans-serif';
    ctx.fillText('Each engineer brings unique skills to the team', W / 2, 66);

    // Class cards
    const classes = Object.values(CONFIG.CLASSES);
    const cardW = 240;
    const cardH = 360;
    const spacing = 30;
    const totalW = classes.length * cardW + (classes.length - 1) * spacing;
    const startX = (W - totalW) / 2;

    classes.forEach((cls, i) => {
      const data = CONFIG.CLASS_DATA[cls];
      const cx = startX + i * (cardW + spacing);
      const cy = 100;
      const isHovered = hoveredClass === cls;

      // Card background
      ctx.fillStyle = isHovered ? CONFIG.UI.BG_LIGHT : CONFIG.UI.BG_MID;
      ctx.fillRect(cx, cy, cardW, cardH);

      // Card border
      ctx.strokeStyle = isHovered ? data.color : CONFIG.UI.BORDER;
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.strokeRect(cx, cy, cardW, cardH);

      if (isHovered) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = data.color;
        ctx.strokeRect(cx, cy, cardW, cardH);
        ctx.shadowBlur = 0;
      }

      // Class icon area
      ctx.fillStyle = data.color + '33';
      ctx.fillRect(cx, cy, cardW, 100);

      // Class symbol
      ctx.shadowBlur = 15;
      ctx.shadowColor = data.color;
      ctx.fillStyle = data.color;
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const icons = { Golemancer: '⚙', Alchemist: '⚗', Artificer: '🔧' };
      ctx.fillText(icons[cls] || cls[0], cx + cardW / 2, cy + 50);
      ctx.shadowBlur = 0;

      // Class name
      ctx.fillStyle = data.color;
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(cls, cx + cardW / 2, cy + 108);

      // Role badge
      ctx.fillStyle = CONFIG.UI.BG_DARK;
      ctx.fillRect(cx + cardW / 2 - 50, cy + 132, 100, 20);
      ctx.fillStyle = data.color;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(data.role, cx + cardW / 2, cy + 142);

      // Description
      ctx.fillStyle = CONFIG.UI.TEXT_SECONDARY;
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const words = data.description.split(' ');
      let line = '';
      let lineY = cy + 166;
      words.forEach(word => {
        const test = line + word + ' ';
        if (ctx.measureText(test).width > cardW - 24 && line) {
          ctx.fillText(line, cx + 12, lineY);
          line = word + ' ';
          lineY += 16;
        } else {
          line = test;
        }
      });
      if (line) ctx.fillText(line, cx + 12, lineY);

      // Stats
      const statY = cy + 256;
      ctx.fillStyle = CONFIG.UI.TEXT_SECONDARY;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Base Stats:', cx + 12, statY);

      const stats = Object.entries(data.baseStats);
      stats.forEach(([stat, val], si) => {
        const sy2 = statY + 16 + si * 18;
        const label = stat.charAt(0).toUpperCase() + stat.slice(1);
        ctx.fillStyle = CONFIG.UI.TEXT_SECONDARY;
        ctx.fillText(label, cx + 12, sy2);

        // Stat bar
        const barW = cardW - 90;
        ctx.fillStyle = '#222';
        ctx.fillRect(cx + 90, sy2, barW, 10);
        ctx.fillStyle = data.color;
        ctx.fillRect(cx + 90, sy2, barW * (val / 10), 10);
      });

      // Starting ability
      ctx.fillStyle = CONFIG.UI.ACCENT_GOLD;
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`✦ ${data.startingAbility}`, cx + cardW / 2, cy + 340);
    });

    // Instructions
    ctx.fillStyle = CONFIG.UI.TEXT_SECONDARY;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Click a class to select • Press ESC to go back', W / 2, H - 24);
  }

  // ---- HUD (In-Game) ----

  drawHUD(players, currentPlayer, dungeonLevel, killCount, runTime) {
    const ctx = this.ctx;
    const W = CONFIG.CANVAS_WIDTH;

    // Bottom bar
    ctx.fillStyle = 'rgba(10, 10, 26, 0.85)';
    ctx.fillRect(0, CONFIG.CANVAS_HEIGHT - 80, W, 80);
    ctx.strokeStyle = CONFIG.UI.BORDER;
    ctx.lineWidth = 1;
    ctx.strokeRect(0, CONFIG.CANVAS_HEIGHT - 80, W, 80);

    // Player panels
    players.forEach((player, i) => {
      const panelX = i * 300 + 10;
      const panelY = CONFIG.CANVAS_HEIGHT - 74;
      this.drawPlayerPanel(ctx, player, panelX, panelY, player === currentPlayer);
    });

    // Dungeon info (top right)
    ctx.fillStyle = 'rgba(10, 10, 26, 0.75)';
    ctx.fillRect(W - 160, 8, 152, 52);
    ctx.strokeStyle = CONFIG.UI.BORDER;
    ctx.strokeRect(W - 160, 8, 152, 52);
    ctx.fillStyle = CONFIG.UI.TEXT_SECONDARY;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Floor: ${dungeonLevel}`, W - 150, 24);
    ctx.fillText(`Kills: ${killCount}`, W - 150, 38);
    ctx.fillText(`Time: ${this.formatTime(runTime)}`, W - 150, 52);

    // Ability bar
    if (currentPlayer) {
      this.drawAbilityBar(ctx, currentPlayer, W);
    }

    // Notifications
    this.drawNotifications(ctx);
    this.updateFloatingTexts(ctx);
  }

  drawPlayerPanel(ctx, player, x, y, isActive) {
    const panelW = 285;
    const panelH = 64;

    if (isActive) {
      ctx.strokeStyle = player.color;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, panelW, panelH);
    }

    // Name & level
    ctx.fillStyle = player.color;
    ctx.font = `bold 11px sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`${player.playerClass} Lv.${player.level}`, x + 4, y + 4);

    // HP bar
    const barW = panelW - 8;
    const hpRatio = player.health / player.getMaxHealth();
    ctx.fillStyle = '#1a0a0a';
    ctx.fillRect(x + 4, y + 18, barW, 12);
    const hpGrad = ctx.createLinearGradient(x + 4, 0, x + 4 + barW * hpRatio, 0);
    hpGrad.addColorStop(0, '#c0392b');
    hpGrad.addColorStop(1, '#e74c3c');
    ctx.fillStyle = hpGrad;
    ctx.fillRect(x + 4, y + 18, barW * hpRatio, 12);
    ctx.fillStyle = CONFIG.UI.TEXT_PRIMARY;
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.ceil(player.health)}/${player.getMaxHealth()}`, x + 4 + barW / 2, y + 24);

    // Mana bar
    const mpRatio = player.mana / player.getMaxMana();
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(x + 4, y + 34, barW, 8);
    ctx.fillStyle = CONFIG.UI.MANA_BAR;
    ctx.fillRect(x + 4, y + 34, barW * mpRatio, 8);

    // EXP bar
    const expRatio = player.exp / player.expToLevel;
    ctx.fillStyle = '#1a1a00';
    ctx.fillRect(x + 4, y + 46, barW, 4);
    ctx.fillStyle = CONFIG.UI.EXP_BAR;
    ctx.fillRect(x + 4, y + 46, barW * expRatio, 4);

    // Dead indicator
    if (!player.isAlive) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(x, y, panelW, panelH);
      ctx.fillStyle = '#e74c3c';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DOWNED', x + panelW / 2, y + panelH / 2 + 4);
    }
  }

  drawAbilityBar(ctx, player, W) {
    const barY = CONFIG.CANVAS_HEIGHT - 100;
    const centerX = W / 2;
    const slotSize = 48;
    const padding = 6;

    player.abilities.forEach((ability, i) => {
      const slotX = centerX + (i - Math.floor(player.abilities.length / 2)) * (slotSize + padding);
      const slotY = barY - slotSize;

      const cdPercent = player.getAbilityCooldownPercent(i);
      const onCooldown = cdPercent < 1;

      // Slot background
      ctx.fillStyle = CONFIG.UI.BG_DARK;
      ctx.fillRect(slotX, slotY, slotSize, slotSize);

      // Cooldown overlay
      if (onCooldown) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(slotX, slotY, slotSize, slotSize * (1 - cdPercent));
      }

      // Ability icon (placeholder)
      ctx.fillStyle = onCooldown ? '#555' : CONFIG.UI.ACCENT_BLUE;
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const icons = {
        SUMMON_STONE_GOLEM: '⚙', ALCHEMICAL_BLAST: '💥',
        DEPLOY_SHOCK_TRAP: '⚡', ARCANE_STRIKE: '✦',
        ENGINEER_TURRET: '🔫', ENERGY_SHIELD: '🛡'
      };
      ctx.fillText(icons[ability.key] || '?', slotX + slotSize / 2, slotY + slotSize / 2);

      // Border
      ctx.strokeStyle = onCooldown ? '#444' : CONFIG.UI.ACCENT_BLUE;
      ctx.lineWidth = 1;
      ctx.strokeRect(slotX, slotY, slotSize, slotSize);

      // Keybind label
      ctx.fillStyle = CONFIG.UI.TEXT_SECONDARY;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`[${i + 1}]`, slotX + slotSize / 2, slotY + slotSize + 12);
    });
  }

  // ---- Inventory Screen ----

  drawInventory(player) {
    const ctx = this.ctx;
    const W = CONFIG.CANVAS_WIDTH;
    const H = CONFIG.CANVAS_HEIGHT;

    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, W, H);

    const panelW = 700;
    const panelH = 520;
    const panelX = (W - panelW) / 2;
    const panelY = (H - panelH) / 2;

    ctx.fillStyle = CONFIG.UI.BG_MID;
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = CONFIG.UI.BORDER;
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX, panelY, panelW, panelH);

    ctx.fillStyle = CONFIG.UI.ACCENT_GOLD;
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Inventory & Equipment', panelX + 16, panelY + 16);

    ctx.fillStyle = CONFIG.UI.TEXT_SECONDARY;
    ctx.font = '12px sans-serif';
    ctx.fillText(`${player.playerClass} — Level ${player.level}  |  Gold: ${player.gold}  |  Arcane Shards: ${player.arcaneShards}`, panelX + 16, panelY + 42);

    // Equipment slots (left panel)
    ctx.fillStyle = CONFIG.UI.TEXT_SECONDARY;
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('Equipped', panelX + 16, panelY + 66);

    const slots = CONFIG.GEAR_SLOTS;
    const slotSize = 48;
    slots.forEach((slot, i) => {
      const slotX = panelX + 16 + (i % 4) * (slotSize + 6);
      const slotY = panelY + 82 + Math.floor(i / 4) * (slotSize + 6);
      const item = player.gear[slot];

      ctx.fillStyle = CONFIG.UI.BG_DARK;
      ctx.fillRect(slotX, slotY, slotSize, slotSize);
      ctx.strokeStyle = item ? CONFIG.RARITY[item.rarity].color : '#333';
      ctx.lineWidth = 1;
      ctx.strokeRect(slotX, slotY, slotSize, slotSize);

      ctx.fillStyle = CONFIG.UI.TEXT_SECONDARY;
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(slot.toUpperCase(), slotX + slotSize / 2, slotY + slotSize - 6);

      if (item) {
        ctx.fillStyle = CONFIG.RARITY[item.rarity].color;
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.name.split(' ')[0], slotX + slotSize / 2, slotY + 24);
      }
    });

    // Stats panel (right panel)
    const statsX = panelX + 240;
    ctx.fillStyle = CONFIG.UI.TEXT_SECONDARY;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Character Stats', statsX, panelY + 66);

    const statColors = {
      engineering: CONFIG.UI.ACCENT_GOLD,
      magic: CONFIG.UI.ACCENT_PURPLE,
      dexterity: CONFIG.UI.ACCENT_GREEN,
      endurance: CONFIG.UI.HEALTH_BAR
    };

    Object.entries(CONFIG.STATS).forEach(([, statKey], i) => {
      const statY = panelY + 86 + i * 24;
      const total = player.getTotalStat(statKey);
      const base = player.stats[statKey] || 0;
      const boost = player.statBoosts[statKey] || 0;

      ctx.fillStyle = statColors[statKey] || CONFIG.UI.TEXT_PRIMARY;
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${statKey.charAt(0).toUpperCase() + statKey.slice(1)}:`, statsX, statY + 12);

      ctx.fillStyle = CONFIG.UI.TEXT_PRIMARY;
      ctx.textAlign = 'right';
      ctx.fillText(base.toString(), statsX + 160, statY + 12);

      if (boost > 0) {
        ctx.fillStyle = CONFIG.UI.ACCENT_GREEN;
        ctx.fillText(`+${boost}`, statsX + 200, statY + 12);
      }
    });

    // Set bonuses
    if (Object.keys(player.activeSets).length > 0) {
      ctx.fillStyle = CONFIG.UI.ACCENT_GOLD;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Active Set Bonuses:', statsX, panelY + 200);
      Object.entries(player.activeSets).forEach(([setKey, bonus], i) => {
        const setData = CONFIG.SETS[setKey];
        ctx.fillStyle = CONFIG.UI.ACCENT_GOLD;
        ctx.font = '11px sans-serif';
        ctx.fillText(`${setData.name} (${bonus.count}pc): ${bonus.description}`, statsX, panelY + 218 + i * 16);
      });
    }

    // Inventory grid
    ctx.fillStyle = CONFIG.UI.TEXT_SECONDARY;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Backpack (${player.inventory.length}/${player.maxInventorySize})`, panelX + 16, panelY + 200);

    player.inventory.forEach((item, i) => {
      if (!item.slot) return; // skip non-gear items
      const invX = panelX + 16 + (i % 8) * (slotSize + 4);
      const invY = panelY + 220 + Math.floor(i / 8) * (slotSize + 4);

      ctx.fillStyle = CONFIG.UI.BG_DARK;
      ctx.fillRect(invX, invY, slotSize, slotSize);
      ctx.strokeStyle = CONFIG.RARITY[item.rarity]?.color || '#aaa';
      ctx.lineWidth = 1;
      ctx.strokeRect(invX, invY, slotSize, slotSize);

      ctx.fillStyle = CONFIG.RARITY[item.rarity]?.color || '#aaa';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.name.split(' ')[0], invX + slotSize / 2, invY + 28);
    });

    // Close hint
    ctx.fillStyle = CONFIG.UI.TEXT_SECONDARY;
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Press [I] or [ESC] to close', W / 2, panelY + panelH - 16);
  }

  // ---- Skill Tree Screen ----

  drawSkillTree(player, hoveredSkill = null) {
    const ctx = this.ctx;
    const W = CONFIG.CANVAS_WIDTH;
    const H = CONFIG.CANVAS_HEIGHT;

    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = CONFIG.UI.ACCENT_GOLD;
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${player.playerClass} Skill Tree`, W / 2, 40);

    ctx.fillStyle = CONFIG.UI.TEXT_SECONDARY;
    ctx.font = '14px sans-serif';
    ctx.fillText(`Skill Points: ${player.skillPoints}`, W / 2, 64);

    const tree = CONFIG.SKILL_TREES[player.playerClass];
    if (!tree) return;

    const classData = CONFIG.CLASS_DATA[player.playerClass];
    const nodeW = 120;
    const nodeH = 48;
    const colSpacing = 160;
    const rowSpacing = 90;
    const offsetX = W / 2 - colSpacing;
    const offsetY = 100;

    // Draw connection lines first
    tree.forEach(skill => {
      skill.requires.forEach(reqId => {
        const req = tree.find(s => s.id === reqId);
        if (!req) return;
        const x1 = offsetX + req.col * colSpacing + nodeW / 2;
        const y1 = offsetY + req.row * rowSpacing + nodeH;
        const x2 = offsetX + skill.col * colSpacing + nodeW / 2;
        const y2 = offsetY + skill.row * rowSpacing;

        const bothUnlocked = player.unlockedSkills.has(skill.id) && player.unlockedSkills.has(reqId);
        ctx.strokeStyle = bothUnlocked ? classData.color : '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });
    });

    // Draw skill nodes
    tree.forEach(skill => {
      const nx = offsetX + skill.col * colSpacing;
      const ny = offsetY + skill.row * rowSpacing;
      const isUnlocked = player.unlockedSkills.has(skill.id);
      const isHovered = hoveredSkill === skill.id;
      const requirementsMet = skill.requires.every(r => player.unlockedSkills.has(r));
      const canUnlock = requirementsMet && !isUnlocked && player.skillPoints >= skill.cost;

      ctx.fillStyle = isUnlocked ? classData.color + '44' : (canUnlock ? CONFIG.UI.BG_LIGHT : CONFIG.UI.BG_DARK);
      ctx.fillRect(nx, ny, nodeW, nodeH);
      ctx.strokeStyle = isUnlocked ? classData.color : (canUnlock ? CONFIG.UI.TEXT_SECONDARY : '#333');
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.strokeRect(nx, ny, nodeW, nodeH);

      if (isHovered) {
        ctx.shadowBlur = 12;
        ctx.shadowColor = classData.color;
        ctx.strokeRect(nx, ny, nodeW, nodeH);
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = isUnlocked ? classData.color : (canUnlock ? CONFIG.UI.TEXT_PRIMARY : '#555');
      ctx.font = `bold 12px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(skill.name, nx + nodeW / 2, ny + nodeH / 2 - 6);
      ctx.fillStyle = CONFIG.UI.TEXT_SECONDARY;
      ctx.font = '10px sans-serif';
      ctx.fillText(`Cost: ${skill.cost} SP`, nx + nodeW / 2, ny + nodeH / 2 + 8);

      if (isUnlocked) {
        ctx.fillStyle = classData.color;
        ctx.font = '16px sans-serif';
        ctx.fillText('✓', nx + nodeW - 12, ny + 14);
      }
    });

    // Hovered skill description
    if (hoveredSkill) {
      const skill = tree.find(s => s.id === hoveredSkill);
      if (skill) {
        ctx.fillStyle = CONFIG.UI.BG_MID;
        ctx.fillRect(W / 2 - 200, H - 100, 400, 80);
        ctx.strokeStyle = CONFIG.UI.BORDER;
        ctx.strokeRect(W / 2 - 200, H - 100, 400, 80);
        ctx.fillStyle = CONFIG.UI.ACCENT_GOLD;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(skill.name, W / 2, H - 82);
        ctx.fillStyle = CONFIG.UI.TEXT_SECONDARY;
        ctx.font = '12px sans-serif';
        ctx.fillText(skill.description, W / 2, H - 62);
        ctx.fillText(`Cost: ${skill.cost} Skill Points`, W / 2, H - 42);
      }
    }

    ctx.fillStyle = CONFIG.UI.TEXT_SECONDARY;
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Click a skill to unlock • Press [K] or [ESC] to close', W / 2, H - 16);
  }

  // ---- Game Over / Victory ----

  drawGameOver(score, kills, time) {
    const ctx = this.ctx;
    const W = CONFIG.CANVAS_WIDTH;
    const H = CONFIG.CANVAS_HEIGHT;

    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 52px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#e74c3c';
    ctx.fillText('DEFEATED', W / 2, H / 2 - 80);
    ctx.shadowBlur = 0;

    ctx.fillStyle = CONFIG.UI.TEXT_SECONDARY;
    ctx.font = '18px sans-serif';
    ctx.fillText(`Score: ${score}  |  Kills: ${kills}  |  Time: ${this.formatTime(time)}`, W / 2, H / 2);
    ctx.fillText('Press [R] to restart or [ESC] for main menu', W / 2, H / 2 + 50);
  }

  drawVictory(score, kills, time, rank) {
    const ctx = this.ctx;
    const W = CONFIG.CANVAS_WIDTH;
    const H = CONFIG.CANVAS_HEIGHT;

    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = CONFIG.UI.ACCENT_GOLD;
    ctx.font = 'bold 52px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 25;
    ctx.shadowColor = CONFIG.UI.ACCENT_GOLD;
    ctx.fillText('VICTORY!', W / 2, H / 2 - 100);
    ctx.shadowBlur = 0;

    ctx.fillStyle = CONFIG.UI.TEXT_PRIMARY;
    ctx.font = '20px sans-serif';
    ctx.fillText(`Score: ${score}`, W / 2, H / 2 - 40);
    ctx.fillText(`Kills: ${kills}  |  Time: ${this.formatTime(time)}`, W / 2, H / 2);
    if (rank) {
      ctx.fillStyle = CONFIG.UI.ACCENT_BLUE;
      ctx.fillText(`Leaderboard: #${rank.scoreRank} score, #${rank.timeRank} time`, W / 2, H / 2 + 40);
    }
    ctx.fillStyle = CONFIG.UI.TEXT_SECONDARY;
    ctx.font = '16px sans-serif';
    ctx.fillText('Press [R] to play again or [ESC] for main menu', W / 2, H / 2 + 80);
  }

  // ---- Leaderboard ----

  drawLeaderboard(leaderboard) {
    const ctx = this.ctx;
    const W = CONFIG.CANVAS_WIDTH;
    const H = CONFIG.CANVAS_HEIGHT;

    ctx.fillStyle = CONFIG.UI.BG_DARK;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = CONFIG.UI.ACCENT_GOLD;
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('LEADERBOARD', W / 2, 30);

    const sections = [
      { title: 'Top Scores', data: leaderboard.highScores, x: 40, cols: ['Name', 'Class', 'Lv', 'Score', 'Kills'] },
      { title: 'Fastest Clears', data: leaderboard.fastestClears, x: W / 2 + 20, cols: ['Name', 'Class', 'Floor', 'Time', 'Score'] }
    ];

    sections.forEach(section => {
      ctx.fillStyle = CONFIG.UI.ACCENT_BLUE;
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(section.title, section.x, 80);

      const headerY = 106;
      section.cols.forEach((col, ci) => {
        ctx.fillStyle = CONFIG.UI.TEXT_SECONDARY;
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(col, section.x + ci * 80, headerY);
      });

      ctx.strokeStyle = CONFIG.UI.BORDER;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(section.x, headerY + 14);
      ctx.lineTo(section.x + 390, headerY + 14);
      ctx.stroke();

      if (!section.data || section.data.length === 0) {
        ctx.fillStyle = CONFIG.UI.TEXT_SECONDARY;
        ctx.font = 'italic 13px sans-serif';
        ctx.fillText('No records yet', section.x, headerY + 30);
      } else {
        section.data.slice(0, 10).forEach((entry, ri) => {
          const ry = headerY + 24 + ri * 20;
          const values = section.title === 'Top Scores'
            ? [entry.playerName, entry.playerClass, entry.level, entry.score, entry.kills]
            : [entry.playerName, entry.playerClass, entry.dungeonLevel, leaderboard.getFormattedTime(entry.time), entry.score];
          values.forEach((val, ci) => {
            ctx.fillStyle = ri === 0 ? CONFIG.UI.ACCENT_GOLD : CONFIG.UI.TEXT_PRIMARY;
            ctx.font = ri === 0 ? 'bold 12px sans-serif' : '12px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(String(val).substring(0, 10), section.x + ci * 80, ry);
          });
        });
      }
    });

    // Rare finds
    ctx.fillStyle = CONFIG.UI.ACCENT_PURPLE;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('Rarest Finds', 40, H - 160);

    if (!leaderboard.rareFinds || leaderboard.rareFinds.length === 0) {
      ctx.fillStyle = CONFIG.UI.TEXT_SECONDARY;
      ctx.font = 'italic 13px sans-serif';
      ctx.fillText('No rare finds yet', 40, H - 136);
    } else {
      leaderboard.rareFinds.slice(0, 3).forEach((find, i) => {
        const rarityData = CONFIG.RARITY[find.rarity];
        ctx.fillStyle = rarityData ? rarityData.color : '#aaa';
        ctx.font = '12px sans-serif';
        ctx.fillText(`${find.playerName} found ${find.itemName} (Floor ${find.dungeonLevel})`, 40, H - 136 + i * 18);
      });
    }

    ctx.fillStyle = CONFIG.UI.TEXT_SECONDARY;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Press [ESC] to go back', W / 2, H - 20);
  }

  // ---- Pause Screen ----

  drawPause() {
    const ctx = this.ctx;
    const W = CONFIG.CANVAS_WIDTH;
    const H = CONFIG.CANVAS_HEIGHT;

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = CONFIG.UI.TEXT_PRIMARY;
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PAUSED', W / 2, H / 2 - 30);

    ctx.fillStyle = CONFIG.UI.TEXT_SECONDARY;
    ctx.font = '16px sans-serif';
    ctx.fillText('Press [P] or [ESC] to resume', W / 2, H / 2 + 20);
    ctx.fillText('[I] Inventory  |  [K] Skills  |  [Q] Quit to Menu', W / 2, H / 2 + 50);
  }

  // ---- Notifications & Floating Text ----

  addNotification(text, color = CONFIG.UI.TEXT_PRIMARY, duration = 3000) {
    this.notifications.push({ text, color, duration, createdAt: Date.now() });
  }

  addFloatingText(text, x, y, color = CONFIG.UI.TEXT_PRIMARY) {
    this.floatingTexts.push({ text, x, y, color, life: 1.0, vy: -1.5 });
  }

  drawNotifications(ctx) {
    const now = Date.now();
    this.notifications = this.notifications.filter(n => now - n.createdAt < n.duration);

    this.notifications.forEach((n, i) => {
      const alpha = Math.min(1, (n.duration - (now - n.createdAt)) / 500);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(8, 8 + i * 28, 280, 22);
      ctx.fillStyle = n.color;
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.text, 16, 19 + i * 28);
      ctx.globalAlpha = 1;
    });
  }

  updateFloatingTexts(ctx) {
    this.floatingTexts.forEach(ft => {
      ft.y += ft.vy;
      ft.life -= 0.02;
    });
    this.floatingTexts = this.floatingTexts.filter(ft => ft.life > 0);

    this.floatingTexts.forEach(ft => {
      ctx.globalAlpha = ft.life;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.globalAlpha = 1;
    });
  }

  formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = UISystem;
}
