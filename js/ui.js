// ─────────────────────────────────────────────────────────
//  ASHENWILD  –  UI Manager
// ─────────────────────────────────────────────────────────

const UI = (() => {

  // ── Screen switching ──────────────────────────────────
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  }

  // ── Character Creation ────────────────────────────────
  let selectedRace  = 'Human';
  let selectedClass = 'Vanguard';

  function initCreate() {
    const raceList  = document.getElementById('race-list');
    const classList = document.getElementById('class-list');

    // Races
    Object.keys(RACES).forEach(key => {
      const btn = document.createElement('button');
      btn.className = 'option-btn' + (key === selectedRace ? ' selected' : '');
      btn.textContent = RACES[key].emoji + '  ' + RACES[key].name;
      btn.addEventListener('click', () => {
        selectedRace = key;
        document.querySelectorAll('#race-list .option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        updateRaceDesc();
        updatePreview();
      });
      raceList.appendChild(btn);
    });

    // Classes
    Object.keys(CLASSES).forEach(key => {
      const btn = document.createElement('button');
      btn.className = 'option-btn' + (key === selectedClass ? ' selected' : '');
      btn.textContent = CLASSES[key].emoji + '  ' + CLASSES[key].name;
      btn.addEventListener('click', () => {
        selectedClass = key;
        document.querySelectorAll('#class-list .option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        updateClassDesc();
        updatePreview();
      });
      classList.appendChild(btn);
    });

    updateRaceDesc();
    updateClassDesc();
    updatePreview();
  }

  function updateRaceDesc() {
    const r   = RACES[selectedRace];
    const el  = document.getElementById('race-desc');
    el.innerHTML = `<p>${r.desc}</p>` +
      r.passives.map(p => `<p class="passive">⬥ ${p}</p>`).join('');
  }

  function updateClassDesc() {
    const c  = CLASSES[selectedClass];
    const el = document.getElementById('class-desc');
    el.innerHTML = `<p>${c.desc}</p><br>` +
      `<p class="passive">Abilities: ${c.abilities.map(a => a.emoji + a.name).join(' · ')}</p>`;
  }

  function updatePreview() {
    const canvas = document.getElementById('preview-canvas');
    const ctx    = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const race  = RACES[selectedRace];
    const cls   = CLASSES[selectedClass];

    // Background
    const grad = ctx.createRadialGradient(W/2, H/2, 10, W/2, H/2, W/2);
    grad.addColorStop(0, '#1e1e26');
    grad.addColorStop(1, '#0d0d12');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Character preview
    const cx = W / 2, cy = H / 2 - 10;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 28, 22, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body glow
    ctx.shadowColor = cls.color;
    ctx.shadowBlur  = 20;
    ctx.fillStyle   = cls.color;
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.fill();

    // Race color ring
    ctx.shadowBlur  = 0;
    ctx.strokeStyle = race.color;
    ctx.lineWidth   = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.stroke();

    // Race & class emoji
    ctx.font = '28px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(cls.emoji, cx, cy);

    // Name
    ctx.fillStyle = '#c8a84b';
    ctx.font = "bold 11px 'Cinzel', serif";
    ctx.fillText(cls.name.toUpperCase(), cx, cy + 50);
    ctx.fillStyle = '#999';
    ctx.font = "10px 'Cinzel', serif";
    ctx.fillText(race.name, cx, cy + 65);

    // Stat preview
    const hp  = cls.stats.hp  + (race.stats.hp  || 0) + 100;
    const atk = cls.stats.atk + (race.stats.atk || 0);
    const def = cls.stats.def + (race.stats.def || 0);
    const spd = cls.stats.spd + (race.stats.spd || 0);

    const sp = document.getElementById('stat-preview');
    sp.innerHTML =
      `<div>HP</div><span>${hp}</span>` +
      `<div>ATK</div><span>${atk}</span>` +
      `<div>DEF</div><span>${def}</span>` +
      `<div>SPD</div><span>${spd}</span>`;
  }

  function getCreateData() {
    return {
      race:      selectedRace,
      className: selectedClass,
      name:      document.getElementById('char-name').value.trim() || 'Adventurer',
    };
  }

  // ── HUD Updates ───────────────────────────────────────
  function updateHUD(player, zoneName) {
    // HP / EN bars
    const hpPct = player.hp / player.maxHp * 100;
    const enPct = player.en / player.maxEn * 100;
    document.getElementById('bar-hp').style.width = hpPct + '%';
    document.getElementById('bar-en').style.width = enPct + '%';
    document.getElementById('bar-hp-text').textContent = `${Math.ceil(player.hp)}/${player.maxHp}`;
    document.getElementById('bar-en-text').textContent = `${Math.ceil(player.en)}/${player.maxEn}`;

    // Char info
    document.getElementById('hud-name').textContent  = player.name;
    document.getElementById('hud-class').textContent = player.className;
    document.getElementById('hud-level').textContent = `Lv.${player.level}`;

    // Zone name
    document.getElementById('zone-name').textContent = zoneName || '';

    // Skills
    const sk = player.skills;
    ['attack', 'strength', 'agility', 'prayer'].forEach(name => {
      const bar = document.getElementById(`sk-${name === 'strength' ? 'str' : name}`);
      const lv  = document.getElementById(`sk-${name === 'strength' ? 'str' : name}-lv`);
      if (bar) bar.style.width = (sk.progress(name) * 100) + '%';
      if (lv)  lv.textContent = sk[name].lv;
    });

    // Abilities
    player.abilities.forEach((ab, i) => {
      const slot   = document.getElementById(`ab-${i}`);
      const icon   = document.getElementById(`ab-icon-${i}`);
      const cdEl   = document.getElementById(`ab-cd-${i}`);
      if (!slot) return;
      if (icon) icon.textContent = ab.emoji;
      const cd = player.abilityCooldowns[i];
      if (cd > 0) {
        slot.classList.add('on-cd');
        if (cdEl) cdEl.textContent = Math.ceil(cd) + 's';
      } else {
        slot.classList.remove('on-cd');
        if (cdEl) cdEl.textContent = '';
      }
    });
  }

  function updateBossBar(boss) {
    const el = document.getElementById('boss-bar');
    if (!boss || boss.dead()) {
      el.classList.add('hidden');
      return;
    }
    el.classList.remove('hidden');
    document.getElementById('boss-name-text').textContent = boss.name.toUpperCase();
    const pct = boss.hp / boss.maxHp * 100;
    document.getElementById('bar-boss').style.width = pct + '%';
  }

  // ── Inventory Panel ───────────────────────────────────
  let inventoryOpen = false;
  let hoveredItem   = null;

  function toggleInventory(player) {
    inventoryOpen = !inventoryOpen;
    const panel = document.getElementById('inventory-panel');
    if (inventoryOpen) {
      panel.classList.remove('hidden');
      renderInventory(player);
    } else {
      panel.classList.add('hidden');
    }
  }

  function renderInventory(player) {
    // Equipped slots
    ['weapon','armor','offhand'].forEach(slot => {
      const el = document.getElementById(`slot-${slot}`);
      if (!el) return;
      const id   = player.equipped[slot];
      const item = id ? ITEMS.find(i => i.id === id) : null;
      el.textContent = item ? item.emoji : '';
      el.className   = 'slot-item' + (item ? ' has-item' : '');
      el.title       = item ? item.name : slot;
      el.onclick = () => {
        if (item) showTooltip(item, el);
      };
    });

    // Bag
    const grid = document.getElementById('bag-grid');
    grid.innerHTML = '';
    for (let i = 0; i < 20; i++) {
      const slot = document.createElement('div');
      slot.className = 'bag-slot';
      const itemId = player.bag[i];
      if (itemId) {
        const item = ITEMS.find(it => it.id === itemId);
        if (item) {
          slot.textContent = item.emoji;
          slot.classList.add('has-item');
          const tier = document.createElement('span');
          tier.className   = 'item-tier';
          tier.textContent = TIER_NAMES[item.tier][0];
          tier.style.color = TIER_COLORS[item.tier];
          slot.appendChild(tier);
          slot.addEventListener('mouseenter', e => showTooltip(item, e.target));
          slot.addEventListener('mouseleave', hideTooltip);
          slot.addEventListener('click', () => {
            player.equipItem(itemId);
            renderInventory(player);
          });
        }
      }
      grid.appendChild(slot);
    }
  }

  function showTooltip(item, anchor) {
    const tt = document.getElementById('item-tooltip');
    tt.classList.remove('hidden');
    tt.innerHTML =
      `<div class="tooltip-name" style="color:${TIER_COLORS[item.tier]}">${item.emoji} ${item.name}</div>` +
      `<div class="tooltip-tier">${TIER_NAMES[item.tier]} · ${item.slot}</div>` +
      `<div class="tooltip-stat">ATK +${item.stats.atk || 0} &nbsp; DEF +${item.stats.def || 0}</div>` +
      `<div class="tooltip-desc">${item.desc}</div>`;
    const rect = anchor.getBoundingClientRect();
    tt.style.left = Math.max(4, rect.left - 270) + 'px';
    tt.style.top  = rect.top + 'px';
  }

  function hideTooltip() {
    document.getElementById('item-tooltip').classList.add('hidden');
  }

  // ── Message Log ───────────────────────────────────────
  const messages = [];
  function addMessage(text, type) {
    const log = document.getElementById('message-log');
    const div = document.createElement('div');
    div.className = `log-msg ${type || ''}`;
    div.textContent = text;
    log.appendChild(div);
    messages.push(div);
    if (messages.length > 8) {
      const old = messages.shift();
      old.remove();
    }
    setTimeout(() => { div.remove(); }, 4200);
  }

  // ── Death Screen ──────────────────────────────────────
  function showDeath(player, time) {
    document.getElementById('death-stats').textContent =
      `${player.name} the ${player.className} — survived ${Math.floor(time)}s · Level ${player.level}`;
    showScreen('screen-death');
  }

  function showVictory(zoneName) {
    document.getElementById('victory-msg').textContent = `${zoneName} has been cleared!`;
    showScreen('screen-victory');
  }

  return {
    showScreen,
    initCreate,
    getCreateData,
    updateHUD,
    updateBossBar,
    toggleInventory,
    renderInventory,
    addMessage,
    showDeath,
    showVictory,
    get inventoryOpen() { return inventoryOpen; },
  };
})();
