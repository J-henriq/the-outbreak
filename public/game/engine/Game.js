// Main game state machine and loop
import { Renderer } from './Renderer.js';
import { Input } from './Input.js';
import { Audio } from './Audio.js';
import { Network } from './Network.js';
import { World } from '../world/World.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { NPC } from '../entities/NPC.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { InventorySystem } from '../systems/InventorySystem.js';
import { QuestSystem } from '../systems/QuestSystem.js';
import { SkillSystem } from '../systems/SkillSystem.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { UIManager } from '../ui/UIManager.js';
import { createItem } from '../data/items.js';

export const GAME_STATE = {
  LOADING: 'loading',
  MENU: 'menu',
  CHARACTER_CREATION: 'character_creation',
  PLAYING: 'playing',
  PAUSED: 'paused',
  INVENTORY: 'inventory',
  SKILL_TREE: 'skill_tree',
  QUEST_LOG: 'quest_log',
  CHARACTER_SHEET: 'character_sheet'
};

export class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.renderer = new Renderer(this.canvas);
    this.input = new Input(this.canvas);
    this.audio = new Audio();
    this.network = new Network();
    this.world = new World();
    this.state = GAME_STATE.LOADING;
    this.player = null;
    this.enemies = [];
    this.npcs = [];
    this.projectiles = [];
    this.remotePlayers = new Map();
    this.combat = null;
    this.inventory = null;
    this.quest = null;
    this.skill = null;
    this.save = null;
    this.ui = null;
    this.lastTime = 0;
    this.playTime = 0;
    this.autoSaveTimer = 0;
    this.AUTO_SAVE_INTERVAL = 60;
    this.footstepTimer = 0;
    this.zoneTransitionAlpha = 0;
    this.isTransitioning = false;
    this.pendingZone = null;
  }

  async init() {
    this.input.init();
    this.audio.init();

    // Show loading
    this._setLoading(0, 'Initializing engine...');
    await this._delay(100);

    this._setLoading(20, 'Generating world...');
    this.world.generate();
    await this._delay(200);

    this._setLoading(40, 'Loading assets...');
    this.save = new SaveSystem();
    this.inventory = new InventorySystem();
    this.quest = new QuestSystem();
    this.skill = new SkillSystem();
    await this._delay(100);

    this._setLoading(60, 'Setting up systems...');
    this.ui = new UIManager(this);
    this.ui.init();
    await this._delay(100);

    this._setLoading(80, 'Connecting to server...');
    this.network.connect();
    this._setupNetworkHandlers();
    await this._delay(300);

    this._setLoading(100, 'Ready!');
    await this._delay(400);

    // Hide loading, show menu
    document.getElementById('loading-screen').classList.remove('active');
    this.setState(GAME_STATE.MENU);

    // Start game loop
    requestAnimationFrame((t) => this.loop(t));
  }

  _delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  _setLoading(pct, msg) {
    const bar = document.getElementById('loading-bar-inner');
    const tip = document.getElementById('loading-tip');
    if (bar) bar.style.width = pct + '%';
    if (tip) tip.textContent = msg;
  }

  setState(newState) {
    this.state = newState;
    // Show/hide the correct overlay screen based on state
    const screens = {
      [GAME_STATE.MENU]: 'menu-screen',
      [GAME_STATE.CHARACTER_CREATION]: 'char-create-screen'
    };
    // Hide all named screens first (except inventory/skill/quest/char which are toggled separately)
    ['menu-screen', 'char-create-screen'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });
    if (screens[newState]) {
      const el = document.getElementById(screens[newState]);
      if (el) el.classList.add('active');
    }
  }

  startGame(name, cls) {
    this.player = new Player({ name, class: cls });

    // Spawn in town center
    const spawn = this.world.getSpawnPoint('overworld');
    this.player.x = spawn.x;
    this.player.y = spawn.y;

    // Initialize all systems with player
    this.combat = new CombatSystem(this.player, this.audio);
    this.inventory.init(this.player);
    this.quest.init(this.player);
    this.skill.init(this.player);
    // Wire inventory reference to player for arrow consumption
    this.player._inventory = this.inventory;

    // Give starting items based on class
    this._giveStartingItems();

    // Spawn world entities
    this._spawnEntities('overworld');

    // Camera follows player
    this.renderer.setCameraTarget(this.player);
    this.renderer.setWorldBounds(this.world.currentMap[0].length, this.world.currentMap.length);
    this.input.setCamera(this.renderer.camera);

    // Start quest
    this.quest.activateQuest('awakening');

    // Network: join game
    this.network.joinGame({
      name: this.player.name,
      class: this.player.class,
      x: this.player.x,
      y: this.player.y,
      level: this.player.stats.level,
      hp: this.player.hp,
      maxHP: this.player.maxHP,
      zone: 'overworld'
    });

    this.setState(GAME_STATE.PLAYING);
    this.ui.showGame();
    this.audio.playPortal();
  }

  loadGame() {
    const data = this.save.load();
    if (!data) return false;
    this.player = new Player({ name: data.character.name, class: data.character.class });
    Object.assign(this.player.stats, data.character.stats);
    this.player.statPoints = data.character.statPoints || 0;
    this.player.skillPoints = data.character.skillPoints || 0;
    this.player.gold = data.gold || 50;
    this.playTime = data.playTime || 0;
    this.player.hp = data.character.hp || this.player.maxHP;
    this.player.mana = data.character.mana || this.player.maxMana;

    const zone = (data.position && data.position.zone) || 'overworld';
    const pos = data.position || this.world.getSpawnPoint(zone);
    this.player.x = pos.x;
    this.player.y = pos.y;

    this.combat = new CombatSystem(this.player, this.audio);
    this.inventory.init(this.player);
    this.quest.init(this.player);
    this.skill.init(this.player);
    this.player._inventory = this.inventory;

    if (data.inventory) this.inventory.loadFromData(data.inventory);
    if (data.equipped) this.inventory.loadEquipped(data.equipped);
    if (data.quests) this.quest.loadFromData(data.quests);
    if (data.skills) this.skill.loadFromData(data.skills);

    this._spawnEntities(zone);
    this.renderer.setCameraTarget(this.player);
    this.renderer.setWorldBounds(this.world.currentMap[0].length, this.world.currentMap.length);
    this.input.setCamera(this.renderer.camera);

    this.setState(GAME_STATE.PLAYING);
    this.ui.showGame();
    return true;
  }

  _giveStartingItems() {
    this.inventory.addItem(createItem('health_potion_small', 5));
    this.inventory.addItem(createItem('arrows', 30));

    const classWeapons = {
      warrior: 'rusty_sword',
      mage: 'apprentice_staff',
      archer: 'short_bow'
    };
    const weapon = createItem(classWeapons[this.player.class] || 'rusty_sword');
    this.inventory.addItem(weapon);
    this.inventory.equip(weapon, 'weapon');

    const startArmor = createItem('leather_armor');
    this.inventory.addItem(startArmor);
    this.inventory.equip(startArmor, 'armor');

    // Set up default action bar spells based on class
    const classSpells = {
      mage: [
        { type: 'spell', id: 'fireball' },
        { type: 'spell', id: 'ice_lance' },
        { type: 'spell', id: 'heal' },
        { type: 'spell', id: 'lightning_bolt' }
      ],
      archer: [
        { type: 'spell', id: 'heal' }
      ],
      warrior: [
        { type: 'spell', id: 'heal' }
      ]
    };
    const spells = classSpells[this.player.class] || [];
    spells.forEach((s, i) => this.player.setActionBar(i, s));
  }

  _spawnEntities(zone) {
    this.enemies = [];
    this.npcs = [];
    const spawnData = this.world.getEntitySpawns(zone);
    for (const s of spawnData.enemies) {
      this.enemies.push(new Enemy(s.type, s.x, s.y));
    }
    for (const n of spawnData.npcs) {
      this.npcs.push(new NPC(n.type, n.x, n.y, n.name));
    }
  }

  _setupNetworkHandlers() {
    this.network.on('players:current', (players) => {
      for (const p of players) this.remotePlayers.set(p.id, p);
    });
    this.network.on('player:joined', (p) => {
      this.remotePlayers.set(p.id, p);
      this.ui.addChatMessage('SYSTEM', `${p.name} joined the game`, true);
    });
    this.network.on('player:moved', (data) => {
      const p = this.remotePlayers.get(data.id);
      if (p) { p.x = data.x; p.y = data.y; }
    });
    this.network.on('player:updated', (data) => {
      const p = this.remotePlayers.get(data.id);
      if (p) Object.assign(p, data);
    });
    this.network.on('player:left', (data) => {
      const p = this.remotePlayers.get(data.id);
      if (p) this.ui.addChatMessage('SYSTEM', `${p.name} left the game`, true);
      this.remotePlayers.delete(data.id);
    });
    this.network.on('pvp:hit', (data) => {
      if (this.player) {
        this.player.takeDamage(data.damage);
        this.renderer.screenFlash('rgb(255,0,0)', 0.15);
        this.audio.playHit();
      }
    });
    this.network.on('chat:message', (data) => {
      this.ui.addChatMessage(data.name, data.message, false);
    });
  }

  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05); // cap at 50ms
    this.lastTime = timestamp;

    this.input.update();

    if (this.state === GAME_STATE.PLAYING) {
      this.update(dt);
    }

    this.render(dt);
    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    if (!this.player) return;

    this.playTime += dt;
    this.autoSaveTimer += dt;

    if (this.autoSaveTimer >= this.AUTO_SAVE_INTERVAL) {
      this.autoSaveTimer = 0;
      this.saveGame();
    }

    // Player update
    const moved = this.player.update(dt, this.input, this.world);

    // Footstep sounds
    if (moved) {
      this.footstepTimer -= dt;
      if (this.footstepTimer <= 0) {
        this.footstepTimer = 0.35;
        this.audio.playFootstep();
      }
    }

    // Network: send position
    if (moved) {
      this.network.sendMove(this.player.x, this.player.y, this.world.currentZone);
    }

    // Camera
    this.renderer.updateCamera();

    // Player combat input
    this._handleCombatInput(dt);

    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(dt, this.player, this.world);

      // Enemy attacks player
      if (this.combat) {
        this.combat.checkEnemyAttack(enemy, this.player, this.renderer);
        // Ranged enemy shoot
        if (enemy._wantsToShoot && enemy._shootTarget) {
          enemy._wantsToShoot = false;
          const dx = enemy._shootTarget.x - (enemy.x + enemy.size / 2);
          const dy = enemy._shootTarget.y - (enemy.y + enemy.size / 2);
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const speed = enemy.isMagic ? 260 : 340;
          this.projectiles.push({
            x: enemy.x + enemy.size / 2, y: enemy.y + enemy.size / 2,
            vx: (dx / len) * speed, vy: (dy / len) * speed,
            type: enemy.isMagic ? 'magic_bolt' : (enemy.isFireBreath ? 'fire_breath' : 'arrow'),
            damage: enemy.damage, fromPlayer: false, life: 2.0,
            color: enemy.isMagic ? '#aa44ff' : '#ccaa44',
            angle: Math.atan2(dy, dx)
          });
        }
      }
    }

    // Update projectiles
    this._updateProjectiles(dt);

    // Particle update
    this.renderer.updateParticles(dt);

    // Zone transition check
    this._checkZoneTransition();

    // NPC interaction
    this._handleNPCInteraction();

    // Quest update
    if (this.quest) this.quest.update(this.player, this.enemies);

    // UI update
    if (this.ui) this.ui.updateHUD(this.player);

    // Respawn enemies periodically
    this._checkEnemyRespawn(dt);

    // Remove dead enemies (with delay for death anim)
    this.enemies = this.enemies.filter(e => {
      if (e.hp <= 0) {
        if (!e._deathTimer) e._deathTimer = 0.8;
        e._deathTimer -= dt;
        e.deathAnim = Math.max(0, e._deathTimer / 0.8);
        return e._deathTimer > 0;
      }
      return true;
    });

    // Zone transition
    if (this.isTransitioning) {
      this.zoneTransitionAlpha += dt * 2;
      if (this.zoneTransitionAlpha >= 1 && this.pendingZone) {
        this._doZoneTransition(this.pendingZone);
      }
    } else if (this.zoneTransitionAlpha > 0) {
      this.zoneTransitionAlpha -= dt * 2;
    }
  }

  _handleCombatInput(dt) {
    if (!this.combat || !this.player) return;

    const wm = this.input.getWorldMouse();

    // Left click or Z: basic attack
    if (this.input.mouse.leftJustPressed || this.input.wasPressed('KeyZ')) {
      const result = this.combat.playerAttack(this.enemies, wm, this.projectiles, 'basic');
      if (result) this._processCombatResult(result);
    }

    // Action bar skills (1-8)
    for (let i = 1; i <= 8; i++) {
      if (this.input.wasPressed(`Digit${i}`)) {
        this._useActionSlot(i - 1, wm);
      }
    }
  }

  _useActionSlot(idx, target) {
    if (!this.player) return;
    const slot = this.player.actionBar[idx];
    if (!slot) return;

    if (slot.type === 'spell') {
      const result = this.combat.castSpell(slot.id, this.enemies, target, this.projectiles);
      if (result) this._processCombatResult(result);
    } else if (slot.type === 'skill') {
      const result = this.skill.activateSkill(slot.id, this.player, this.enemies, this.projectiles, this.combat, this.audio);
      if (result) this._processCombatResult(result);
    } else if (slot.type === 'item') {
      this.inventory.useItem(slot.itemId, this.player);
      this.audio.playPickup();
    }
  }

  _processCombatResult(results) {
    if (!Array.isArray(results)) results = [results];
    for (const r of results) {
      if (!r) continue;
      if (r.damage !== undefined) {
        this.renderer.addDamageNumber(r.x, r.y, r.damage, r.isCrit);
        if (r.isCrit) this.audio.playCritical(); else this.audio.playHit();
        this.renderer.spawnHitParticles(r.x, r.y, r.color || '#ff4444');
      }
      if (r.killed) {
        this._onEnemyKilled(r.enemy);
      }
      if (r.heal !== undefined) {
        this.renderer.addDamageNumber(r.x, r.y, r.heal, false, true);
      }
    }
  }

  _onEnemyKilled(enemy) {
    this.audio.playEnemyDie();
    this.renderer.spawnExplosion(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, enemy.color || '#cc4422');

    // XP
    const xpGained = enemy.stats.xpReward;
    const leveledUp = this.player.addXP(xpGained);
    this.renderer.addDamageNumber(enemy.x, enemy.y - 20, xpGained, false, false);

    if (leveledUp) {
      this.audio.playLevelUp();
      this.renderer.screenFlash('rgb(255,255,0)', 0.4);
      this.renderer.spawnExplosion(this.player.x + 14, this.player.y + 16, '#ffff00', 20, 60);
      this.ui.showNotification(`LEVEL UP! Now level ${this.player.stats.level}`, '#ffcc00');
    }

    // Gold
    const gold = enemy.getGoldDrop();
    this.player.gold += gold;
    if (gold > 0) this.ui.showNotification(`+${gold} gold`, '#ffcc44');

    // Loot
    const drops = enemy.getLoot(this.player.stats.luck);
    for (const drop of drops) {
      this.inventory.addItem(drop);
      this.audio.playPickup();
      this.ui.showNotification(`Found: ${drop.name}`, this._rarityColor(drop.rarity));
      // Quest: item collection tracking
      this.quest.onItemCollected(drop.id);
    }

    // Quest update
    this.quest.onEnemyKilled(enemy.type, this.player);
  }

  _rarityColor(rarity) {
    const map = { common: '#aaa', uncommon: '#22cc22', rare: '#4488ff', epic: '#cc44ff', legendary: '#ff8800' };
    return map[rarity] || '#fff';
  }

  _updateProjectiles(dt) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.life -= dt;

      if (proj.life <= 0) { this.projectiles.splice(i, 1); continue; }

      // Check collision with world
      if (this.world.isSolid(Math.floor((proj.x) / 32), Math.floor((proj.y) / 32))) {
        if (proj.type === 'fireball') {
          this.renderer.spawnExplosion(proj.x, proj.y, '#ff6600', 8, 30);
          this.audio.playFireball();
        }
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check collision with enemies (player projectiles)
      if (proj.fromPlayer) {
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const e = this.enemies[j];
          if (e.hp <= 0) continue;
          if (this._projHitsEntity(proj, e)) {
            const results = this.combat.applyProjectileDamage(proj, e);
            this._processCombatResult(results);
            if (proj.type !== 'lightning' || !proj.chained) {
              this.projectiles.splice(i, 1);
            }
            break;
          }
        }
      }

      // Enemy projectiles hit player
      if (!proj.fromPlayer && this.player) {
        if (this._projHitsEntity(proj, this.player)) {
          const dmg = proj.damage || 5;
          const actualDmg = this.player.takeDamage(dmg);
          this.renderer.addDamageNumber(this.player.x, this.player.y - 20, actualDmg);
          this.renderer.screenFlash('rgb(255,0,0)', 0.1);
          this.audio.playHit();
          this.projectiles.splice(i, 1);
          if (this.player.hp <= 0) this._onPlayerDeath();
        }
      }
    }
  }

  _projHitsEntity(proj, entity) {
    const ex = entity.x, ey = entity.y;
    const ew = entity.width || entity.size || 28;
    const eh = entity.height || entity.size || 32;
    return proj.x > ex && proj.x < ex + ew && proj.y > ey && proj.y < ey + eh;
  }

  _checkZoneTransition() {
    if (!this.player || this.isTransitioning) return;
    const tile = this.world.getTileAt(Math.floor(this.player.x / 32), Math.floor(this.player.y / 32));

    if (tile === 12) { // portal tile
      const portalData = this.world.getPortalAt(Math.floor(this.player.x / 32), Math.floor(this.player.y / 32));
      if (portalData && portalData.target !== this.world.currentZone) {
        this.isTransitioning = true;
        this.pendingZone = portalData.target;
        this.audio.playPortal();
      }
    }
  }

  _doZoneTransition(zone) {
    this.pendingZone = null;
    this.world.changeZone(zone);
    this._spawnEntities(zone);
    const spawn = this.world.getSpawnPoint(zone);
    this.player.x = spawn.x;
    this.player.y = spawn.y;
    this.renderer.setWorldBounds(this.world.currentMap[0].length, this.world.currentMap.length);
    this.isTransitioning = false;

    // Quest: check zone arrival
    this.quest.onZoneReached(zone, this.player);
    this.saveGame();
  }

  _handleNPCInteraction() {
    if (!this.input.wasPressed('KeyE') && !this.input.wasPressed('Space')) return;
    for (const npc of this.npcs) {
      const dx = Math.abs(this.player.x - npc.x);
      const dy = Math.abs(this.player.y - npc.y);
      if (dx < 48 && dy < 48) {
        this.ui.showNPCDialog(npc, this.quest, this.player);
        break;
      }
    }
  }

  _onPlayerDeath() {
    this.audio.playDeath();
    this.renderer.screenFlash('rgb(200,0,0)', 1.0);
    // Check for revival scroll
    const scroll = this.inventory.hasItem('revival_scroll');
    if (scroll) {
      this.inventory.removeItem('revival_scroll', 1);
      this.player.hp = Math.floor(this.player.maxHP * 0.5);
      this.player.iframes = 3.0;
      this.ui.showNotification('Revival Scroll used! Revived!', '#ffaa22');
    } else {
      this.player.hp = Math.floor(this.player.maxHP * 0.3);
      this.player.mana = Math.floor(this.player.maxMana * 0.5);
      this.player.iframes = 3.0;
      // Respawn at town
      const spawn = this.world.getSpawnPoint('overworld');
      if (this.world.currentZone !== 'overworld') {
        this._doZoneTransition('overworld');
      } else {
        this.player.x = spawn.x; this.player.y = spawn.y;
      }
      this.player.gold = Math.floor(this.player.gold * 0.9);
      this.ui.showNotification('You died! Respawned in town. -10% gold.', '#ff4444');
    }
  }

  _checkEnemyRespawn(dt) {
    if (!this._respawnTimer) this._respawnTimer = 0;
    this._respawnTimer += dt;
    if (this._respawnTimer < 30) return;
    this._respawnTimer = 0;
    const spawns = this.world.getEntitySpawns(this.world.currentZone);
    const maxEnemies = spawns.enemies.length;
    if (this.enemies.length < maxEnemies * 0.5) {
      const toSpawn = spawns.enemies.slice(0, Math.ceil(maxEnemies * 0.3));
      for (const s of toSpawn) {
        if (Math.random() < 0.4) this.enemies.push(new Enemy(s.type, s.x + (Math.random() - 0.5) * 128, s.y + (Math.random() - 0.5) * 128));
      }
    }
  }

  saveGame() {
    if (!this.player || !this.save) return;
    this.save.save({
      character: {
        name: this.player.name, class: this.player.class,
        stats: this.player.stats, statPoints: this.player.statPoints,
        skillPoints: this.player.skillPoints, hp: this.player.hp, mana: this.player.mana
      },
      inventory: this.inventory.getSerializable(),
      equipped: this.inventory.getEquippedSerializable(),
      quests: this.quest.getSerializable(),
      skills: this.skill.getSerializable(),
      position: { x: this.player.x, y: this.player.y, zone: this.world.currentZone },
      gold: this.player.gold,
      playTime: this.playTime
    });
  }

  render(dt) {
    this.renderer.clear();

    if (this.state === GAME_STATE.PLAYING || this.state === GAME_STATE.INVENTORY ||
        this.state === GAME_STATE.SKILL_TREE || this.state === GAME_STATE.QUEST_LOG ||
        this.state === GAME_STATE.CHARACTER_SHEET) {
      if (!this.player) return;

      // World tiles
      this.renderer.drawTileMap(this.world.currentMap);

      // NPCs
      for (const npc of this.npcs) this.renderer.drawNPC(npc);

      // Enemies
      for (const enemy of this.enemies) this.renderer.drawEnemy(enemy);

      // Projectiles
      for (const proj of this.projectiles) this.renderer.drawProjectile(proj);

      // Remote players
      for (const [, rp] of this.remotePlayers) {
        if (rp.zone === this.world.currentZone) this.renderer.drawPlayer(rp, false);
      }

      // Local player
      this.renderer.drawPlayer(this.player, true);

      // Particles
      this.renderer.drawParticles();
      this.renderer.drawDamageNumbers();

      // Lighting in dungeon
      if (this.world.currentZone === 'dungeon') {
        const lights = [{ x: this.player.x + 14, y: this.player.y + 16, radius: 180, color: 'rgba(255,200,100,0.2)' }];
        this.renderer.drawLighting(lights, 0.7);
      }

      // Screen flash
      this.renderer.drawScreenFlash(dt);

      // Zone fade
      if (this.zoneTransitionAlpha > 0) this.renderer.drawFade(Math.min(1, this.zoneTransitionAlpha));

      // Minimap
      const minimapCanvas = document.getElementById('minimap');
      if (minimapCanvas) {
        this.renderer.drawMinimap(minimapCanvas, this.world.currentMap, this.player, this.enemies, this.npcs);
      }
    }
  }
}

export default Game;
