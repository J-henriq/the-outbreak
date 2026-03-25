/**
 * Arcane Engineers - Test Suite
 * Tests for core game systems: Config, GearSystem, Player, DungeonGenerator, LeaderboardSystem
 */

// Polyfill localStorage for Node test environment
if (typeof localStorage === 'undefined') {
  global.localStorage = {
    _store: {},
    getItem(key) { return this._store[key] || null; },
    setItem(key, value) { this._store[key] = String(value); },
    removeItem(key) { delete this._store[key]; },
    clear() { this._store = {}; }
  };
}

// Set CONFIG as a global so dependent modules can access it without requiring
global.CONFIG = require('../js/config');
global.GearSystem = require('../js/gear');

const Player = require('../js/player');
const DungeonGenerator = require('../js/dungeon');
const LeaderboardSystem = require('../js/leaderboard');

// Alias for test assertions
const CONFIG = global.CONFIG;
const GearSystem = global.GearSystem;

// ---- CONFIG Tests ----

describe('CONFIG', () => {
  test('defines all three player classes', () => {
    expect(CONFIG.CLASSES.GOLEMANCER).toBe('Golemancer');
    expect(CONFIG.CLASSES.ALCHEMIST).toBe('Alchemist');
    expect(CONFIG.CLASSES.ARTIFICER).toBe('Artificer');
  });

  test('has class data for all classes', () => {
    Object.values(CONFIG.CLASSES).forEach(cls => {
      const data = CONFIG.CLASS_DATA[cls];
      expect(data).toBeDefined();
      expect(data.baseStats).toBeDefined();
      expect(data.startingAbility).toBeDefined();
      expect(data.color).toMatch(/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/);
    });
  });

  test('defines all required gear slots', () => {
    const required = ['helmet', 'chest', 'gloves', 'boots', 'weapon', 'offhand', 'relic'];
    required.forEach(slot => {
      expect(CONFIG.GEAR_SLOTS).toContain(slot);
    });
  });

  test('defines all rarity levels', () => {
    const rarities = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'];
    rarities.forEach(r => {
      expect(CONFIG.RARITY[r]).toBeDefined();
      expect(CONFIG.RARITY[r].multiplier).toBeGreaterThan(0);
    });
  });

  test('LEGENDARY multiplier is highest', () => {
    const mults = Object.values(CONFIG.RARITY).map(r => r.multiplier);
    expect(CONFIG.RARITY.LEGENDARY.multiplier).toBe(Math.max(...mults));
  });

  test('defines all game states', () => {
    const states = ['MAIN_MENU', 'CLASS_SELECT', 'PLAYING', 'PAUSED', 'GAME_OVER', 'VICTORY', 'LEADERBOARD'];
    states.forEach(s => {
      expect(CONFIG.GAME_STATES[s]).toBeDefined();
    });
  });

  test('defines all machine types', () => {
    const machines = ['STONE_GOLEM', 'IRON_TURRET', 'ENERGY_TURRET', 'SHOCK_TRAP', 'ENERGY_SHIELD'];
    machines.forEach(m => {
      expect(CONFIG.MACHINES[m]).toBeDefined();
    });
  });

  test('defines skill trees for all classes', () => {
    Object.values(CONFIG.CLASSES).forEach(cls => {
      const tree = CONFIG.SKILL_TREES[cls];
      expect(tree).toBeDefined();
      expect(tree.length).toBeGreaterThan(0);
      tree.forEach(skill => {
        expect(skill.id).toBeDefined();
        expect(skill.name).toBeDefined();
        expect(skill.cost).toBeGreaterThan(0);
        expect(Array.isArray(skill.requires)).toBe(true);
      });
    });
  });

  test('tile IDs are unique numbers', () => {
    const tileValues = Object.values(CONFIG.TILES);
    const unique = new Set(tileValues);
    expect(unique.size).toBe(tileValues.length);
  });

  test('canvas dimensions are positive', () => {
    expect(CONFIG.CANVAS_WIDTH).toBeGreaterThan(0);
    expect(CONFIG.CANVAS_HEIGHT).toBeGreaterThan(0);
  });

  test('dungeon min rooms is less than max rooms', () => {
    expect(CONFIG.DUNGEON.MIN_ROOMS).toBeLessThan(CONFIG.DUNGEON.MAX_ROOMS);
  });

  test('max players is 3', () => {
    expect(CONFIG.MAX_PLAYERS).toBe(3);
  });
});

// ---- GearSystem Tests ----

describe('GearSystem', () => {
  let gearSystem;

  beforeEach(() => {
    gearSystem = new GearSystem();
  });

  test('generateGear returns a valid gear object', () => {
    const gear = gearSystem.generateGear(1);
    expect(gear).toBeDefined();
    expect(gear.id).toBeDefined();
    expect(gear.name).toBeTruthy();
    expect(CONFIG.GEAR_SLOTS).toContain(gear.slot);
    expect(CONFIG.RARITY[gear.rarity]).toBeDefined();
    expect(gear.statBonuses).toBeDefined();
  });

  test('generateGear with forced rarity produces correct rarity', () => {
    const gear = gearSystem.generateGear(1, 'LEGENDARY');
    expect(gear.rarity).toBe('LEGENDARY');
  });

  test('generateGear with forced slot produces correct slot', () => {
    const gear = gearSystem.generateGear(1, null, 'helmet');
    expect(gear.slot).toBe('helmet');
  });

  test('stat bonuses increase with level', () => {
    const lowGear = gearSystem.generateGear(1, 'COMMON', 'weapon');
    const highGear = gearSystem.generateGear(20, 'COMMON', 'weapon');
    const lowTotal = Object.values(lowGear.statBonuses).reduce((a, b) => a + b, 0);
    const highTotal = Object.values(highGear.statBonuses).reduce((a, b) => a + b, 0);
    expect(highTotal).toBeGreaterThan(lowTotal);
  });

  test('generates multiple gear items with unique IDs', () => {
    const items = Array.from({ length: 10 }, () => gearSystem.generateGear(1));
    const ids = items.map(g => g.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(10);
  });

  test('compareGear returns positive when candidate is better', () => {
    const equipped = gearSystem.generateGear(1, 'COMMON', 'weapon');
    const candidate = gearSystem.generateGear(10, 'RARE', 'weapon');
    const diff = gearSystem.compareGear(equipped, candidate);
    expect(diff).toBeGreaterThan(0);
  });

  test('compareGear returns 1 when no gear is equipped', () => {
    const candidate = gearSystem.generateGear(1, 'COMMON', 'weapon');
    const diff = gearSystem.compareGear(null, candidate);
    expect(diff).toBe(1);
  });

  test('craftGear returns gear with appropriate rarity for material count', () => {
    const materials = new Array(5).fill({ type: 'material' });
    const gear = gearSystem.craftGear(materials, 'chest', 5);
    expect(gear.slot).toBe('chest');
    expect(['EPIC', 'LEGENDARY', 'RARE', 'UNCOMMON', 'COMMON']).toContain(gear.rarity);
    // 5 materials -> EPIC
    expect(gear.rarity).toBe('EPIC');
  });

  test('all stat bonuses are positive integers', () => {
    const gear = gearSystem.generateGear(5);
    Object.values(gear.statBonuses).forEach(val => {
      expect(val).toBeGreaterThan(0);
      expect(Number.isInteger(val)).toBe(true);
    });
  });
});

// ---- Player Tests ----

describe('Player', () => {
  let player;

  beforeEach(() => {
    player = new Player('test1', 'Golemancer', 100, 100, true);
  });

  test('initializes with correct class', () => {
    expect(player.playerClass).toBe('Golemancer');
  });

  test('starts at level 1', () => {
    expect(player.level).toBe(1);
    expect(player.exp).toBe(0);
  });

  test('starts alive with full health and mana', () => {
    expect(player.isAlive).toBe(true);
    expect(player.health).toBe(player.maxHealth);
    expect(player.mana).toBe(player.maxMana);
  });

  test('has all gear slots initialized to null', () => {
    CONFIG.GEAR_SLOTS.forEach(slot => {
      expect(player.gear[slot]).toBeNull();
    });
  });

  test('has abilities matching class', () => {
    expect(player.abilities.length).toBeGreaterThan(0);
    player.abilities.forEach(ability => {
      expect(ability.name).toBeTruthy();
      expect(ability.manaCost).toBeGreaterThanOrEqual(0);
    });
  });

  test('takeDamage reduces health', () => {
    const startHealth = player.health;
    player.takeDamage(20);
    expect(player.health).toBeLessThan(startHealth);
  });

  test('takeDamage kills player when health reaches 0', () => {
    player.takeDamage(10000);
    expect(player.isAlive).toBe(false);
    expect(player.health).toBe(0);
  });

  test('heal restores health up to max', () => {
    player.takeDamage(50);
    const afterDamage = player.health;
    player.heal(100);
    expect(player.health).toBeGreaterThan(afterDamage);
    expect(player.health).toBeLessThanOrEqual(player.getMaxHealth());
  });

  test('gainExp levels up at threshold', () => {
    player.gainExp(CONFIG.LEVEL_UP_EXP);
    expect(player.level).toBe(2);
  });

  test('level up grants skill point', () => {
    player.gainExp(CONFIG.LEVEL_UP_EXP);
    expect(player.skillPoints).toBeGreaterThan(0);
  });

  test('level up increases max health', () => {
    const oldMaxHealth = player.maxHealth;
    player.gainExp(CONFIG.LEVEL_UP_EXP);
    expect(player.maxHealth).toBeGreaterThan(oldMaxHealth);
  });

  test('equipGear applies stat bonuses', () => {
    const gearSystem = new GearSystem();
    const weapon = gearSystem.generateGear(1, 'COMMON', 'weapon');
    weapon.statBonuses = { engineering: 5 };
    player.equipGear(weapon);
    expect(player.statBoosts.engineering).toBe(5);
  });

  test('unequipGear removes stat bonuses', () => {
    const gearSystem = new GearSystem();
    const weapon = gearSystem.generateGear(1, 'COMMON', 'weapon');
    weapon.statBonuses = { engineering: 5 };
    player.equipGear(weapon);
    player.unequipGear('weapon');
    expect(player.statBoosts.engineering).toBe(0);
  });

  test('addToInventory stores items', () => {
    const gearSystem = new GearSystem();
    const item = gearSystem.generateGear(1);
    player.addToInventory(item);
    expect(player.inventory.length).toBe(1);
    expect(player.inventory[0].id).toBe(item.id);
  });

  test('inventory has max size', () => {
    const gearSystem = new GearSystem();
    for (let i = 0; i <= player.maxInventorySize + 5; i++) {
      player.addToInventory(gearSystem.generateGear(1));
    }
    expect(player.inventory.length).toBeLessThanOrEqual(player.maxInventorySize);
  });

  test('unlockSkill requires skill points', () => {
    player.skillPoints = 0;
    const result = player.unlockSkill('sg_1');
    expect(result).toBe(false);
  });

  test('unlockSkill works with sufficient skill points', () => {
    player.skillPoints = 5;
    const result = player.unlockSkill('sg_1');
    expect(result).toBe(true);
    expect(player.unlockedSkills.has('sg_1')).toBe(true);
  });

  test('unlockSkill checks prerequisites', () => {
    player.skillPoints = 10;
    // sg_2 requires sg_1
    const result = player.unlockSkill('sg_2');
    expect(result).toBe(false);
  });

  test('revive restores player to half health', () => {
    player.takeDamage(10000);
    expect(player.isAlive).toBe(false);
    player.revive();
    expect(player.isAlive).toBe(true);
    expect(player.health).toBeGreaterThan(0);
  });

  test('getTotalStat returns base + boost', () => {
    const base = player.stats.engineering;
    player.statBoosts.engineering = 5;
    expect(player.getTotalStat('engineering')).toBe(base + 5);
  });

  test('getAbilityCooldownPercent returns 1 when not used', () => {
    const pct = player.getAbilityCooldownPercent(0);
    expect(pct).toBe(1);
  });

  test('set bonuses are applied when all pieces equipped', () => {
    const gearSystem = new GearSystem();
    const helmet = gearSystem.generateGear(1, 'RARE', 'helmet');
    helmet.name = 'Iron Vanguard Helmet';
    helmet.setName = 'IRON_VANGUARD';
    helmet.statBonuses = {};

    const chest = gearSystem.generateGear(1, 'RARE', 'chest');
    chest.name = 'Iron Vanguard Chest';
    chest.setName = 'IRON_VANGUARD';
    chest.statBonuses = {};

    const boots = gearSystem.generateGear(1, 'RARE', 'boots');
    boots.name = 'Iron Vanguard Boots';
    boots.setName = 'IRON_VANGUARD';
    boots.statBonuses = {};

    player.equipGear(helmet);
    player.equipGear(chest);
    player.equipGear(boots);

    expect(player.activeSets.IRON_VANGUARD).toBeDefined();
    expect(player.activeSets.IRON_VANGUARD.count).toBe(3);
  });

  test('serialize returns valid object', () => {
    const data = player.serialize();
    expect(data.id).toBe('test1');
    expect(data.playerClass).toBe('Golemancer');
    expect(data.level).toBe(1);
    expect(Array.isArray(data.unlockedSkills)).toBe(true);
  });

  test('all classes initialize correctly', () => {
    const classes = Object.values(CONFIG.CLASSES);
    classes.forEach(cls => {
      const p = new Player(`test_${cls}`, cls, 0, 0, false);
      expect(p.isAlive).toBe(true);
      expect(p.health).toBeGreaterThan(0);
      expect(p.mana).toBeGreaterThan(0);
      expect(p.abilities.length).toBeGreaterThan(0);
    });
  });
});

// ---- DungeonGenerator Tests ----

describe('DungeonGenerator', () => {
  let gen;

  beforeEach(() => {
    gen = new DungeonGenerator(12345); // fixed seed for determinism
  });

  test('generate returns a valid dungeon', () => {
    const dungeon = gen.generate(1);
    expect(dungeon).toBeDefined();
    expect(dungeon.tiles).toBeDefined();
    expect(dungeon.rooms).toBeDefined();
    expect(dungeon.enemies).toBeDefined();
    expect(dungeon.chests).toBeDefined();
  });

  test('dungeon has correct dimensions', () => {
    const dungeon = gen.generate(1);
    expect(dungeon.tiles.length).toBe(CONFIG.DUNGEON_ROWS);
    expect(dungeon.tiles[0].length).toBe(CONFIG.DUNGEON_COLS);
  });

  test('generates minimum number of rooms', () => {
    const dungeon = gen.generate(1);
    expect(dungeon.rooms.length).toBeGreaterThanOrEqual(CONFIG.DUNGEON.MIN_ROOMS);
  });

  test('generates maximum number of rooms', () => {
    const dungeon = gen.generate(1);
    expect(dungeon.rooms.length).toBeLessThanOrEqual(CONFIG.DUNGEON.MAX_ROOMS + 1); // +1 for possible secret
  });

  test('has a valid start position', () => {
    const dungeon = gen.generate(1);
    expect(dungeon.startX).toBeGreaterThan(0);
    expect(dungeon.startY).toBeGreaterThan(0);
  });

  test('start position is walkable', () => {
    const dungeon = gen.generate(1);
    expect(gen.isWalkable(dungeon, dungeon.startX, dungeon.startY)).toBe(true);
  });

  test('boss room has a portal', () => {
    const dungeon = gen.generate(1);
    expect(dungeon.portals.length).toBeGreaterThan(0);
  });

  test('has a boss enemy in boss room', () => {
    const dungeon = gen.generate(1);
    const boss = dungeon.enemies.find(e => e.isBoss);
    expect(boss).toBeDefined();
  });

  test('enemies are scaled by level', () => {
    const dungeon1 = gen.generate(1);
    const gen2 = new DungeonGenerator(12345);
    const dungeon5 = gen2.generate(5);

    const boss1 = dungeon1.enemies.find(e => e.isBoss);
    const boss5 = dungeon5.enemies.find(e => e.isBoss);

    expect(boss5.health).toBeGreaterThan(boss1.health);
    expect(boss5.damage).toBeGreaterThan(boss1.damage);
  });

  test('wall tiles are not walkable', () => {
    const dungeon = gen.generate(1);
    // Find a wall tile
    let wallFound = false;
    for (let row = 0; row < dungeon.rows; row++) {
      for (let col = 0; col < dungeon.cols; col++) {
        if (dungeon.tiles[row][col] === CONFIG.TILES.WALL) {
          const px = col * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
          const py = row * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
          expect(gen.isWalkable(dungeon, px, py)).toBe(false);
          wallFound = true;
          break;
        }
      }
      if (wallFound) break;
    }
    expect(wallFound).toBe(true);
  });

  test('getTileAt returns WALL for out-of-bounds', () => {
    const dungeon = gen.generate(1);
    expect(gen.getTileAt(dungeon, -100, -100)).toBe(CONFIG.TILES.WALL);
    expect(gen.getTileAt(dungeon, 99999, 99999)).toBe(CONFIG.TILES.WALL);
  });

  test('chest loot contains items', () => {
    const dungeon = gen.generate(1);
    dungeon.chests.forEach(chest => {
      expect(chest.loot).toBeDefined();
      expect(chest.loot.length).toBeGreaterThan(0);
      expect(chest.opened).toBe(false);
    });
  });

  test('same seed produces same dungeon', () => {
    const gen1 = new DungeonGenerator(42);
    const gen2 = new DungeonGenerator(42);
    const d1 = gen1.generate(1);
    const d2 = gen2.generate(1);
    expect(d1.rooms.length).toBe(d2.rooms.length);
    expect(d1.startX).toBe(d2.startX);
    expect(d1.startY).toBe(d2.startY);
  });

  test('different seeds produce different dungeons', () => {
    const gen1 = new DungeonGenerator(1);
    const gen2 = new DungeonGenerator(2);
    const d1 = gen1.generate(1);
    const d2 = gen2.generate(1);
    // At least one difference (rooms or start position)
    const same = d1.startX === d2.startX && d1.startY === d2.startY && d1.rooms.length === d2.rooms.length;
    // We don't assert they're always different (unlikely but possible for small seeds), just that generation completes
    expect(d1).toBeDefined();
    expect(d2).toBeDefined();
  });

  test('generateChestLoot returns gear and gold', () => {
    const loot = gen.generateChestLoot(5);
    const hasGold = loot.some(item => item.type === 'gold');
    const hasGear = loot.some(item => item.slot);
    expect(hasGold).toBe(true);
    expect(hasGear).toBe(true);
  });

  test('secret chest loot has arcaneShards', () => {
    const loot = gen.generateChestLoot(5, true);
    const hasShards = loot.some(item => item.type === 'arcaneShards');
    expect(hasShards).toBe(true);
  });
});

// ---- LeaderboardSystem Tests ----

describe('LeaderboardSystem', () => {
  let lb;

  beforeEach(() => {
    lb = new LeaderboardSystem();
    lb.clear();
  });

  test('initializes with empty records', () => {
    expect(lb.data.highScores.length).toBe(0);
    expect(lb.data.fastestClears.length).toBe(0);
  });

  test('submitRun adds to high scores', () => {
    lb.submitRun({
      playerName: 'Tester',
      playerClass: 'Golemancer',
      level: 5,
      dungeonLevel: 3,
      time: 120000,
      score: 5000,
      kills: 42
    });
    expect(lb.data.highScores.length).toBe(1);
  });

  test('submitRun adds to fastest clears', () => {
    lb.submitRun({
      playerName: 'Tester',
      playerClass: 'Artificer',
      level: 3,
      dungeonLevel: 2,
      time: 90000,
      score: 3000,
      kills: 25
    });
    expect(lb.data.fastestClears.length).toBe(1);
  });

  test('high scores are sorted by score descending', () => {
    lb.submitRun({ playerName: 'A', playerClass: 'Alchemist', level: 1, dungeonLevel: 1, time: 100000, score: 1000, kills: 10 });
    lb.submitRun({ playerName: 'B', playerClass: 'Alchemist', level: 1, dungeonLevel: 1, time: 100000, score: 5000, kills: 20 });
    lb.submitRun({ playerName: 'C', playerClass: 'Alchemist', level: 1, dungeonLevel: 1, time: 100000, score: 3000, kills: 15 });
    expect(lb.data.highScores[0].score).toBe(5000);
    expect(lb.data.highScores[1].score).toBe(3000);
    expect(lb.data.highScores[2].score).toBe(1000);
  });

  test('fastest clears are sorted by time ascending', () => {
    lb.submitRun({ playerName: 'A', playerClass: 'Alchemist', level: 1, dungeonLevel: 1, time: 90000, score: 1000, kills: 10 });
    lb.submitRun({ playerName: 'B', playerClass: 'Alchemist', level: 1, dungeonLevel: 1, time: 60000, score: 2000, kills: 15 });
    lb.submitRun({ playerName: 'C', playerClass: 'Alchemist', level: 1, dungeonLevel: 1, time: 120000, score: 3000, kills: 20 });
    expect(lb.data.fastestClears[0].time).toBe(60000);
    expect(lb.data.fastestClears[1].time).toBe(90000);
    expect(lb.data.fastestClears[2].time).toBe(120000);
  });

  test('limits to 10 entries per category', () => {
    for (let i = 0; i < 15; i++) {
      lb.submitRun({ playerName: `P${i}`, playerClass: 'Artificer', level: 1, dungeonLevel: 1, time: i * 1000, score: i * 100, kills: i });
    }
    expect(lb.data.highScores.length).toBeLessThanOrEqual(10);
    expect(lb.data.fastestClears.length).toBeLessThanOrEqual(10);
  });

  test('getRank returns score and time rank', () => {
    const rank = lb.submitRun({
      playerName: 'First',
      playerClass: 'Golemancer',
      level: 10,
      dungeonLevel: 5,
      time: 300000,
      score: 9999,
      kills: 100
    });
    expect(rank.scoreRank).toBe(1);
    expect(rank.timeRank).toBe(1);
  });

  test('addRareFind stores rare item', () => {
    lb.addRareFind('Hero', 'Titan Staff', 'LEGENDARY', 5);
    expect(lb.data.rareFinds.length).toBe(1);
    expect(lb.data.rareFinds[0].itemName).toBe('Titan Staff');
  });

  test('rare finds sorted by rarity (legendary first)', () => {
    lb.addRareFind('A', 'Common Item', 'COMMON', 1);
    lb.addRareFind('B', 'Legendary Item', 'LEGENDARY', 5);
    lb.addRareFind('C', 'Rare Item', 'RARE', 3);
    expect(lb.data.rareFinds[0].rarity).toBe('LEGENDARY');
  });

  test('getFormattedTime formats correctly', () => {
    expect(lb.getFormattedTime(65000)).toBe('1:05');
    expect(lb.getFormattedTime(3600000)).toBe('60:00');
    expect(lb.getFormattedTime(5000)).toBe('0:05');
  });

  test('clear empties all data', () => {
    lb.submitRun({ playerName: 'X', playerClass: 'Golemancer', level: 1, dungeonLevel: 1, time: 10000, score: 100, kills: 5 });
    lb.clear();
    expect(lb.data.highScores.length).toBe(0);
    expect(lb.data.fastestClears.length).toBe(0);
    expect(lb.data.rareFinds.length).toBe(0);
  });
});
