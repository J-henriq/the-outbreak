/**
 * Arcane Engineers - Game Configuration
 * Central configuration for all game constants and settings
 */

const CONFIG = {
  // Canvas dimensions
  CANVAS_WIDTH: 960,
  CANVAS_HEIGHT: 640,

  // Tile system
  TILE_SIZE: 32,
  DUNGEON_COLS: 60,
  DUNGEON_ROWS: 40,

  // Player settings
  MAX_PLAYERS: 3,
  PLAYER_SPEED: 3,
  PLAYER_SIZE: 28,
  BASE_HEALTH: 100,
  BASE_MANA: 100,
  LEVEL_UP_EXP: 100,
  EXP_SCALE: 1.5,
  MAX_LEVEL: 50,

  // Stats
  STATS: {
    ENGINEERING: 'engineering',
    MAGIC: 'magic',
    DEXTERITY: 'dexterity',
    ENDURANCE: 'endurance'
  },

  // Player classes
  CLASSES: {
    GOLEMANCER: 'Golemancer',
    ALCHEMIST: 'Alchemist',
    ARTIFICER: 'Artificer'
  },

  // Class descriptions and base stats
  CLASS_DATA: {
    Golemancer: {
      description: 'Masters of magical constructs who command powerful golems in battle.',
      role: 'Tank/Summoner',
      color: '#4a90d9',
      baseStats: { engineering: 8, magic: 6, dexterity: 3, endurance: 8 },
      startingAbility: 'Summon Stone Golem',
      startingMachine: 'Iron Golem Blueprint',
      healthBonus: 50,
      manaBonus: 20
    },
    Alchemist: {
      description: 'Potion brewers and explosive experts who control the battlefield with chemistry.',
      role: 'Mage/Support',
      color: '#7ed321',
      baseStats: { engineering: 5, magic: 10, dexterity: 5, endurance: 5 },
      startingAbility: 'Alchemical Blast',
      startingMachine: 'Auto-Turret Mk.I',
      healthBonus: 0,
      manaBonus: 50
    },
    Artificer: {
      description: 'Mechanical genius who builds deadly traps and energy weapons.',
      role: 'DPS/Engineer',
      color: '#f5a623',
      baseStats: { engineering: 10, magic: 4, dexterity: 8, endurance: 3 },
      startingAbility: 'Deploy Shock Trap',
      startingMachine: 'Energy Turret Blueprint',
      healthBonus: 20,
      manaBonus: 0
    }
  },

  // Tile types
  TILES: {
    WALL: 0,
    FLOOR: 1,
    DOOR: 2,
    CHEST: 3,
    TRAP: 4,
    PORTAL: 5,
    SECRET: 6,
    MACHINE_SLOT: 7
  },

  // Entity types
  ENTITY_TYPES: {
    PLAYER: 'player',
    ENEMY: 'enemy',
    GOLEM: 'golem',
    TURRET: 'turret',
    TRAP: 'trap',
    PROJECTILE: 'projectile',
    CHEST: 'chest',
    PORTAL: 'portal'
  },

  // Enemy types
  ENEMIES: {
    SHADOW_CRAWLER: {
      name: 'Shadow Crawler',
      health: 30,
      damage: 8,
      speed: 1.5,
      exp: 15,
      color: '#8b0000',
      size: 20,
      attackRange: 30,
      attackCooldown: 1000
    },
    IRON_SENTINEL: {
      name: 'Iron Sentinel',
      health: 80,
      damage: 15,
      speed: 0.8,
      exp: 40,
      color: '#555',
      size: 28,
      attackRange: 35,
      attackCooldown: 1500
    },
    ARCANE_WRAITH: {
      name: 'Arcane Wraith',
      health: 50,
      damage: 20,
      speed: 2.0,
      exp: 35,
      color: '#9b59b6',
      size: 22,
      attackRange: 120,
      attackCooldown: 2000
    },
    CHAOS_GOLEM: {
      name: 'Chaos Golem',
      health: 200,
      damage: 30,
      speed: 0.6,
      exp: 100,
      color: '#e74c3c',
      size: 36,
      attackRange: 40,
      attackCooldown: 2000,
      isBoss: true
    },
    VOID_ARCHON: {
      name: 'Void Archon',
      health: 500,
      damage: 50,
      speed: 1.2,
      exp: 300,
      color: '#2c3e50',
      size: 48,
      attackRange: 180,
      attackCooldown: 1800,
      isBoss: true
    }
  },

  // Gear rarity
  RARITY: {
    COMMON: { name: 'Common', color: '#aaa', multiplier: 1.0 },
    UNCOMMON: { name: 'Uncommon', color: '#1eff00', multiplier: 1.3 },
    RARE: { name: 'Rare', color: '#0070dd', multiplier: 1.7 },
    EPIC: { name: 'Epic', color: '#a335ee', multiplier: 2.2 },
    LEGENDARY: { name: 'Legendary', color: '#ff8000', multiplier: 3.0 }
  },

  // Gear slots
  GEAR_SLOTS: ['helmet', 'chest', 'gloves', 'boots', 'weapon', 'offhand', 'relic'],

  // Set bonuses (collections of gear that provide bonuses when equipped together)
  SETS: {
    IRON_VANGUARD: {
      name: "Iron Vanguard Set",
      pieces: ['Iron Vanguard Helmet', 'Iron Vanguard Chest', 'Iron Vanguard Boots'],
      bonuses: {
        2: { endurance: 5, description: '+5 Endurance' },
        3: { endurance: 10, health: 50, description: '+10 Endurance, +50 Max HP' }
      }
    },
    ARCANE_SCHOLAR: {
      name: "Arcane Scholar Set",
      pieces: ['Scholar\'s Crown', 'Scholar\'s Robes', 'Scholar\'s Wand'],
      bonuses: {
        2: { magic: 8, description: '+8 Magic' },
        3: { magic: 15, mana: 50, description: '+15 Magic, +50 Max Mana' }
      }
    },
    ARTIFICER_ELITE: {
      name: "Artificer Elite Set",
      pieces: ['Artificer Goggles', 'Artificer Vest', 'Artificer Gauntlets'],
      bonuses: {
        2: { engineering: 8, description: '+8 Engineering' },
        3: { engineering: 15, machineCooldown: 0.8, description: '+15 Engineering, -20% Machine Cooldown' }
      }
    }
  },

  // Machine types (deployable)
  MACHINES: {
    STONE_GOLEM: {
      name: 'Stone Golem',
      type: 'golem',
      cost: 40,
      health: 150,
      damage: 25,
      range: 160,
      cooldown: 30000,
      color: '#7f8c8d',
      size: 32,
      duration: 60000
    },
    IRON_TURRET: {
      name: 'Iron Turret',
      type: 'turret',
      cost: 20,
      damage: 12,
      range: 200,
      fireRate: 1000,
      cooldown: 10000,
      color: '#e67e22',
      size: 24,
      duration: 45000
    },
    ENERGY_TURRET: {
      name: 'Energy Turret',
      type: 'turret',
      cost: 35,
      damage: 22,
      range: 250,
      fireRate: 1500,
      cooldown: 15000,
      color: '#3498db',
      size: 24,
      duration: 45000
    },
    SHOCK_TRAP: {
      name: 'Shock Trap',
      type: 'trap',
      cost: 15,
      damage: 45,
      range: 50,
      cooldown: 5000,
      color: '#f1c40f',
      size: 16,
      duration: 120000,
      triggerRadius: 40
    },
    ENERGY_SHIELD: {
      name: 'Energy Shield',
      type: 'shield',
      cost: 30,
      shieldAmount: 80,
      range: 100,
      cooldown: 20000,
      color: '#1abc9c',
      size: 20,
      duration: 20000
    }
  },

  // Ability definitions
  ABILITIES: {
    SUMMON_STONE_GOLEM: {
      name: 'Summon Stone Golem',
      manaCost: 40,
      cooldown: 30000,
      description: 'Summons a powerful stone golem to fight for you.',
      type: 'summon',
      machine: 'STONE_GOLEM'
    },
    ALCHEMICAL_BLAST: {
      name: 'Alchemical Blast',
      manaCost: 25,
      cooldown: 3000,
      damage: 45,
      range: 220,
      radius: 60,
      description: 'Hurls a volatile alchemical bomb that explodes on impact.',
      type: 'projectile',
      color: '#7ed321'
    },
    DEPLOY_SHOCK_TRAP: {
      name: 'Deploy Shock Trap',
      manaCost: 15,
      cooldown: 5000,
      description: 'Places a hidden shock trap that stuns and damages enemies.',
      type: 'deploy',
      machine: 'SHOCK_TRAP'
    },
    ARCANE_STRIKE: {
      name: 'Arcane Strike',
      manaCost: 10,
      cooldown: 800,
      damage: 30,
      range: 200,
      description: 'A focused beam of arcane energy.',
      type: 'projectile',
      color: '#9b59b6'
    },
    ENGINEER_TURRET: {
      name: 'Deploy Turret',
      manaCost: 20,
      cooldown: 10000,
      description: 'Deploys an auto-targeting turret.',
      type: 'deploy',
      machine: 'IRON_TURRET'
    },
    ENERGY_SHIELD: {
      name: 'Energy Shield',
      manaCost: 30,
      cooldown: 20000,
      description: 'Deploys a protective energy shield.',
      type: 'deploy',
      machine: 'ENERGY_SHIELD'
    }
  },

  // Dungeon generation settings
  DUNGEON: {
    MIN_ROOMS: 8,
    MAX_ROOMS: 16,
    MIN_ROOM_SIZE: 5,
    MAX_ROOM_SIZE: 12,
    CHEST_CHANCE: 0.3,
    SECRET_ROOM_CHANCE: 0.15,
    ENEMY_DENSITY: 0.04,
    BOSS_ROOM: true
  },

  // UI Colors
  UI: {
    BG_DARK: '#0a0a1a',
    BG_MID: '#12122a',
    BG_LIGHT: '#1a1a3a',
    ACCENT_BLUE: '#4a90d9',
    ACCENT_GOLD: '#f5a623',
    ACCENT_GREEN: '#7ed321',
    ACCENT_PURPLE: '#9b59b6',
    TEXT_PRIMARY: '#e8e8f0',
    TEXT_SECONDARY: '#8888aa',
    HEALTH_BAR: '#e74c3c',
    MANA_BAR: '#3498db',
    EXP_BAR: '#f1c40f',
    BORDER: '#2a2a5a'
  },

  // Audio settings
  AUDIO: {
    MASTER_VOLUME: 0.7,
    MUSIC_VOLUME: 0.4,
    SFX_VOLUME: 0.8
  },

  // Game states
  GAME_STATES: {
    MAIN_MENU: 'main_menu',
    CLASS_SELECT: 'class_select',
    LOBBY: 'lobby',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over',
    VICTORY: 'victory',
    LEADERBOARD: 'leaderboard',
    INVENTORY: 'inventory',
    SKILL_TREE: 'skill_tree'
  },

  // Skill tree data
  SKILL_TREES: {
    Golemancer: [
      { id: 'sg_1', name: 'Iron Will', row: 0, col: 1, cost: 1, description: '+20 Max HP', statBonus: { endurance: 2 }, requires: [] },
      { id: 'sg_2', name: 'Golem Mastery', row: 1, col: 1, cost: 2, description: 'Golems deal 25% more damage', requires: ['sg_1'] },
      { id: 'sg_3', name: 'Arcane Binding', row: 2, col: 0, cost: 2, description: 'Golems last 50% longer', requires: ['sg_2'] },
      { id: 'sg_4', name: 'Stone Skin', row: 2, col: 2, cost: 2, description: 'Reduce damage taken by 15%', requires: ['sg_2'] },
      { id: 'sg_5', name: 'Titan Golem', row: 3, col: 1, cost: 3, description: 'Unlock the powerful Titan Golem', requires: ['sg_3', 'sg_4'] }
    ],
    Alchemist: [
      { id: 'al_1', name: 'Volatile Mixture', row: 0, col: 1, cost: 1, description: '+15% Explosion radius', statBonus: { magic: 2 }, requires: [] },
      { id: 'al_2', name: 'Catalysis', row: 1, col: 1, cost: 2, description: '+20% Ability damage', requires: ['al_1'] },
      { id: 'al_3', name: 'Healing Vapors', row: 2, col: 0, cost: 2, description: 'Explosions leave healing zones', requires: ['al_2'] },
      { id: 'al_4', name: 'Chain Reaction', row: 2, col: 2, cost: 2, description: 'Explosions can chain to nearby enemies', requires: ['al_2'] },
      { id: 'al_5', name: 'Grand Elixir', row: 3, col: 1, cost: 3, description: 'Unlock the Grand Elixir ability', requires: ['al_3', 'al_4'] }
    ],
    Artificer: [
      { id: 'ar_1', name: 'Quick Assembly', row: 0, col: 1, cost: 1, description: '-20% Machine deploy cooldown', statBonus: { engineering: 2 }, requires: [] },
      { id: 'ar_2', name: 'Overclock', row: 1, col: 1, cost: 2, description: 'Turrets fire 30% faster', requires: ['ar_1'] },
      { id: 'ar_3', name: 'Trap Mastery', row: 2, col: 0, cost: 2, description: 'Traps deal 40% more damage', requires: ['ar_2'] },
      { id: 'ar_4', name: 'Dual Deploy', row: 2, col: 2, cost: 2, description: 'Can deploy 2 machines simultaneously', requires: ['ar_2'] },
      { id: 'ar_5', name: 'Masterwork', row: 3, col: 1, cost: 3, description: 'All machines gain double stats', requires: ['ar_3', 'ar_4'] }
    ]
  }
};

// Make available globally
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
