// Skill tree definitions for The Outbreak RPG

export const SKILL_TYPE = {
  PASSIVE: 'passive',
  ACTIVE: 'active'
};

export const SKILL_TREE = {
  WARRIOR: 'warrior',
  ARCHER: 'archer',
  MAGE: 'mage'
};

export const SKILLS = {
  // ══ WARRIOR TREE ══════════════════════════════
  power_strike: {
    id: 'power_strike', name: 'Power Strike', tree: SKILL_TREE.WARRIOR,
    type: SKILL_TYPE.PASSIVE, maxLevel: 3,
    description: 'Increases melee damage by 10% per level.',
    icon_color: '#cc4422',
    effects: (level) => ({ meleeDamageBonus: level * 0.10 }),
    cost: 1, requires: null, position: { x: 100, y: 80 }
  },
  shield_mastery: {
    id: 'shield_mastery', name: 'Shield Mastery', tree: SKILL_TREE.WARRIOR,
    type: SKILL_TYPE.PASSIVE, maxLevel: 3,
    description: 'Reduces incoming damage by 5% per level.',
    icon_color: '#8888aa',
    effects: (level) => ({ damageReduction: level * 0.05 }),
    cost: 1, requires: 'power_strike', position: { x: 100, y: 170 }
  },
  berserker_rage: {
    id: 'berserker_rage', name: 'Berserker Rage', tree: SKILL_TREE.WARRIOR,
    type: SKILL_TYPE.ACTIVE, maxLevel: 1,
    description: 'Increases all damage by 50% for 10 seconds. Costs 20 mana.',
    icon_color: '#ff2200',
    manaCost: 20, duration: 10000,
    effects: () => ({ damageMultiplier: 1.5 }),
    cost: 2, requires: 'shield_mastery', position: { x: 100, y: 260 }
  },
  iron_will: {
    id: 'iron_will', name: 'Iron Will', tree: SKILL_TREE.WARRIOR,
    type: SKILL_TYPE.PASSIVE, maxLevel: 3,
    description: 'Increases max HP by 15 per level.',
    icon_color: '#cc8844',
    effects: (level) => ({ maxHPBonus: level * 15 }),
    cost: 1, requires: null, position: { x: 260, y: 80 }
  },
  war_cry: {
    id: 'war_cry', name: 'War Cry', tree: SKILL_TREE.WARRIOR,
    type: SKILL_TYPE.ACTIVE, maxLevel: 1,
    description: 'Stuns all nearby enemies for 2 seconds. Costs 25 mana.',
    icon_color: '#ff6600',
    manaCost: 25, duration: 2000, aoe: 128,
    effects: () => ({ stun: true }),
    cost: 2, requires: 'iron_will', position: { x: 260, y: 170 }
  },

  // ══ ARCHER TREE ══════════════════════════════
  eagle_eye: {
    id: 'eagle_eye', name: 'Eagle Eye', tree: SKILL_TREE.ARCHER,
    type: SKILL_TYPE.PASSIVE, maxLevel: 3,
    description: 'Increases ranged damage by 10% per level.',
    icon_color: '#44aa44',
    effects: (level) => ({ rangedDamageBonus: level * 0.10 }),
    cost: 1, requires: null, position: { x: 100, y: 80 }
  },
  quick_draw: {
    id: 'quick_draw', name: 'Quick Draw', tree: SKILL_TREE.ARCHER,
    type: SKILL_TYPE.PASSIVE, maxLevel: 3,
    description: 'Reduces attack cooldown by 10% per level.',
    icon_color: '#88dd44',
    effects: (level) => ({ cooldownReduction: level * 0.10 }),
    cost: 1, requires: 'eagle_eye', position: { x: 100, y: 170 }
  },
  rain_of_arrows: {
    id: 'rain_of_arrows', name: 'Rain of Arrows', tree: SKILL_TREE.ARCHER,
    type: SKILL_TYPE.ACTIVE, maxLevel: 1,
    description: 'Launches arrows hitting all enemies on screen. Costs 30 mana, uses 10 arrows.',
    icon_color: '#66ff44',
    manaCost: 30, arrowCost: 10,
    effects: () => ({ aoe: true, targets: 'all' }),
    cost: 2, requires: 'quick_draw', position: { x: 100, y: 260 }
  },
  precise_shot: {
    id: 'precise_shot', name: 'Precise Shot', tree: SKILL_TREE.ARCHER,
    type: SKILL_TYPE.PASSIVE, maxLevel: 3,
    description: 'Increases critical hit chance by 5% per level.',
    icon_color: '#aaff44',
    effects: (level) => ({ critBonus: level * 0.05 }),
    cost: 1, requires: null, position: { x: 260, y: 80 }
  },
  shadow_step: {
    id: 'shadow_step', name: 'Shadow Step', tree: SKILL_TREE.ARCHER,
    type: SKILL_TYPE.ACTIVE, maxLevel: 1,
    description: 'Dash in movement direction, evading attacks for 0.5s. Costs 15 mana.',
    icon_color: '#22cc88',
    manaCost: 15, duration: 500,
    effects: () => ({ dash: true }),
    cost: 2, requires: 'precise_shot', position: { x: 260, y: 170 }
  },

  // ══ MAGE TREE ══════════════════════════════
  arcane_power: {
    id: 'arcane_power', name: 'Arcane Power', tree: SKILL_TREE.MAGE,
    type: SKILL_TYPE.PASSIVE, maxLevel: 3,
    description: 'Increases magic damage by 10% per level.',
    icon_color: '#6644ff',
    effects: (level) => ({ magicDamageBonus: level * 0.10 }),
    cost: 1, requires: null, position: { x: 100, y: 80 }
  },
  mana_efficiency: {
    id: 'mana_efficiency', name: 'Mana Efficiency', tree: SKILL_TREE.MAGE,
    type: SKILL_TYPE.PASSIVE, maxLevel: 3,
    description: 'Reduces mana cost of spells by 10% per level.',
    icon_color: '#4488ff',
    effects: (level) => ({ manaCostReduction: level * 0.10 }),
    cost: 1, requires: 'arcane_power', position: { x: 100, y: 170 }
  },
  arcane_nova: {
    id: 'arcane_nova', name: 'Arcane Nova', tree: SKILL_TREE.MAGE,
    type: SKILL_TYPE.ACTIVE, maxLevel: 1,
    description: 'Massive AoE arcane explosion. Costs 50 mana.',
    icon_color: '#aa22ff',
    manaCost: 50, aoe: 200,
    effects: () => ({ aoe: true, multiplier: 3.0 }),
    cost: 2, requires: 'mana_efficiency', position: { x: 100, y: 260 }
  },
  spell_mastery: {
    id: 'spell_mastery', name: 'Spell Mastery', tree: SKILL_TREE.MAGE,
    type: SKILL_TYPE.PASSIVE, maxLevel: 3,
    description: 'Increases max mana by 20 per level.',
    icon_color: '#44aaff',
    effects: (level) => ({ maxManaBonus: level * 20 }),
    cost: 1, requires: null, position: { x: 260, y: 80 }
  },
  time_warp: {
    id: 'time_warp', name: 'Time Warp', tree: SKILL_TREE.MAGE,
    type: SKILL_TYPE.ACTIVE, maxLevel: 1,
    description: 'Slows all enemies by 50% for 5 seconds. Costs 35 mana.',
    icon_color: '#88aaff',
    manaCost: 35, duration: 5000,
    effects: () => ({ slow: 0.5 }),
    cost: 2, requires: 'spell_mastery', position: { x: 260, y: 170 }
  }
};

// Spell definitions (used by CombatSystem)
export const SPELLS = {
  fireball: {
    id: 'fireball', name: 'Fireball',
    manaCost: 15, damage: (magic) => magic * 3,
    aoe: 64, color: '#ff6600', speed: 300,
    description: 'Launches a ball of fire that explodes on impact.'
  },
  ice_lance: {
    id: 'ice_lance', name: 'Ice Lance',
    manaCost: 12, damage: (magic) => magic * 2,
    slow: 0.4, slowDuration: 3000, color: '#88ccff', speed: 400,
    description: 'A piercing lance of ice that slows enemies.'
  },
  heal: {
    id: 'heal', name: 'Heal',
    manaCost: 20, heal: (magic) => magic * 3,
    color: '#44ff88', selfOnly: true,
    description: 'Restores HP based on magic stat.'
  },
  lightning_bolt: {
    id: 'lightning_bolt', name: 'Lightning Bolt',
    manaCost: 25, damage: (magic) => magic * 4,
    chain: 2, color: '#ffff44', speed: 600,
    description: 'Calls down lightning that can chain to nearby enemies.'
  }
};

export default SKILLS;
