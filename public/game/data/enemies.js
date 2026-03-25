// Enemy definitions for The Outbreak RPG

export const ENEMY_TYPES = {
  SLIME: 'slime',
  SKELETON: 'skeleton',
  ORC: 'orc',
  MAGE_ENEMY: 'mage_enemy',
  ORC_WARLORD: 'orc_warlord',
  DRAGON_BOSS: 'dragon_boss',
  SKELETON_ARCHER: 'skeleton_archer',
  CAVE_BAT: 'cave_bat',
  STONE_GOLEM: 'stone_golem'
};

export const ENEMY_AI = {
  IDLE: 'idle',
  CHASE: 'chase',
  ATTACK: 'attack',
  FLEE: 'flee',
  PATROL: 'patrol'
};

export const ENEMIES = {
  slime: {
    id: 'slime', name: 'Slime', type: ENEMY_TYPES.SLIME,
    hp: 30, maxHP: 30, damage: 5, defense: 0,
    xpReward: 10, goldDrop: [0, 3],
    speed: 48, aggroRange: 96, attackRange: 32, attackCooldown: 1.5,
    color: '#44cc44', size: 24,
    drops: [
      { itemId: 'green_goo', chance: 0.8, qty: [1, 3] },
      { itemId: 'health_potion_small', chance: 0.15, qty: [1, 1] }
    ],
    ai: ENEMY_AI.CHASE,
    description: 'A gooey green slime. Slow but persistent.',
    isBoss: false
  },
  skeleton: {
    id: 'skeleton', name: 'Skeleton', type: ENEMY_TYPES.SKELETON,
    hp: 55, maxHP: 55, damage: 12, defense: 3,
    xpReward: 25, goldDrop: [2, 8],
    speed: 64, aggroRange: 128, attackRange: 40, attackCooldown: 1.2,
    color: '#ddddcc', size: 28,
    drops: [
      { itemId: 'bone', chance: 0.9, qty: [1, 3] },
      { itemId: 'arrows', chance: 0.5, qty: [3, 8] },
      { itemId: 'iron_sword', chance: 0.05, qty: [1, 1] }
    ],
    ai: ENEMY_AI.CHASE,
    description: 'An undead skeleton warrior.',
    isBoss: false
  },
  skeleton_archer: {
    id: 'skeleton_archer', name: 'Skeleton Archer', type: ENEMY_TYPES.SKELETON_ARCHER,
    hp: 40, maxHP: 40, damage: 14, defense: 1,
    xpReward: 30, goldDrop: [3, 10],
    speed: 56, aggroRange: 200, attackRange: 192, attackCooldown: 2.0,
    color: '#ccccbb', size: 26,
    drops: [
      { itemId: 'bone', chance: 0.8, qty: [1, 2] },
      { itemId: 'arrows', chance: 0.9, qty: [5, 15] },
      { itemId: 'short_bow', chance: 0.06, qty: [1, 1] }
    ],
    ai: ENEMY_AI.CHASE,
    ranged: true,
    description: 'A skeleton that attacks from range.',
    isBoss: false
  },
  cave_bat: {
    id: 'cave_bat', name: 'Cave Bat', type: ENEMY_TYPES.CAVE_BAT,
    hp: 20, maxHP: 20, damage: 8, defense: 0,
    xpReward: 8, goldDrop: [0, 2],
    speed: 120, aggroRange: 150, attackRange: 28, attackCooldown: 0.8,
    color: '#553366', size: 18,
    drops: [
      { itemId: 'health_potion_small', chance: 0.1, qty: [1, 1] }
    ],
    ai: ENEMY_AI.CHASE,
    description: 'A swift cave bat. Hard to hit.',
    isBoss: false
  },
  orc: {
    id: 'orc', name: 'Orc Warrior', type: ENEMY_TYPES.ORC,
    hp: 100, maxHP: 100, damage: 20, defense: 6,
    xpReward: 45, goldDrop: [5, 20],
    speed: 56, aggroRange: 112, attackRange: 44, attackCooldown: 1.6,
    color: '#558844', size: 32,
    drops: [
      { itemId: 'orc_hide', chance: 0.85, qty: [1, 3] },
      { itemId: 'orcish_axe', chance: 0.08, qty: [1, 1] },
      { itemId: 'health_potion', chance: 0.12, qty: [1, 1] }
    ],
    ai: ENEMY_AI.CHASE,
    description: 'A brutal orc warrior.',
    isBoss: false
  },
  stone_golem: {
    id: 'stone_golem', name: 'Stone Golem', type: ENEMY_TYPES.STONE_GOLEM,
    hp: 200, maxHP: 200, damage: 28, defense: 15,
    xpReward: 80, goldDrop: [10, 30],
    speed: 36, aggroRange: 80, attackRange: 48, attackCooldown: 2.5,
    color: '#887766', size: 40,
    drops: [
      { itemId: 'iron_ore', chance: 0.9, qty: [2, 5] },
      { itemId: 'chain_mail', chance: 0.06, qty: [1, 1] }
    ],
    ai: ENEMY_AI.CHASE,
    description: 'A massive golem made of stone.',
    isBoss: false
  },
  mage_enemy: {
    id: 'mage_enemy', name: 'Dark Mage', type: ENEMY_TYPES.MAGE_ENEMY,
    hp: 70, maxHP: 70, damage: 25, defense: 2,
    xpReward: 55, goldDrop: [8, 25],
    speed: 52, aggroRange: 220, attackRange: 180, attackCooldown: 2.2,
    color: '#5544aa', size: 28,
    ranged: true, magic: true,
    drops: [
      { itemId: 'magic_crystal', chance: 0.3, qty: [1, 2] },
      { itemId: 'mana_potion', chance: 0.4, qty: [1, 2] },
      { itemId: 'apprentice_staff', chance: 0.07, qty: [1, 1] }
    ],
    ai: ENEMY_AI.CHASE,
    description: 'A dark mage that throws fireballs.',
    isBoss: false
  },
  orc_warlord: {
    id: 'orc_warlord', name: 'Orc Warlord', type: ENEMY_TYPES.ORC_WARLORD,
    hp: 500, maxHP: 500, damage: 40, defense: 15,
    xpReward: 300, goldDrop: [50, 150],
    speed: 60, aggroRange: 160, attackRange: 52, attackCooldown: 1.2,
    color: '#336622', size: 48,
    drops: [
      { itemId: 'warlord_head', chance: 1.0, qty: [1, 1] },
      { itemId: 'orcish_axe', chance: 1.0, qty: [1, 1] },
      { itemId: 'orc_hide', chance: 1.0, qty: [3, 6] },
      { itemId: 'health_potion_large', chance: 0.8, qty: [1, 2] },
      { itemId: 'chain_mail', chance: 0.4, qty: [1, 1] }
    ],
    ai: ENEMY_AI.CHASE,
    description: 'The fearsome Orc Warlord. Leader of the orc horde.',
    isBoss: true
  },
  dragon_boss: {
    id: 'dragon_boss', name: 'Ancient Dragon', type: ENEMY_TYPES.DRAGON_BOSS,
    hp: 2000, maxHP: 2000, damage: 80, defense: 30,
    xpReward: 1500, goldDrop: [200, 600],
    speed: 70, aggroRange: 350, attackRange: 300, attackCooldown: 1.5,
    color: '#cc2200', size: 64,
    ranged: true, fireBreath: true,
    drops: [
      { itemId: 'dragon_scale', chance: 1.0, qty: [3, 6] },
      { itemId: 'dragonslayer', chance: 0.5, qty: [1, 1] },
      { itemId: 'arcane_staff', chance: 0.3, qty: [1, 1] },
      { itemId: 'health_potion_large', chance: 1.0, qty: [3, 5] },
      { itemId: 'revival_scroll', chance: 0.7, qty: [1, 2] }
    ],
    ai: ENEMY_AI.CHASE,
    description: 'The Ancient Dragon, source of The Outbreak. Final boss.',
    isBoss: true
  }
};

export default ENEMIES;
