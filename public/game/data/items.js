// Item definitions for The Outbreak RPG
// Rarity: COMMON, UNCOMMON, RARE, EPIC, LEGENDARY
// Type: WEAPON, ARMOR, CONSUMABLE, QUEST_ITEM, MATERIAL
// Subtype for weapons: SWORD, BOW, STAFF, DAGGER, AXE

export const RARITY = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
};

export const ITEM_TYPE = {
  WEAPON: 'weapon',
  ARMOR: 'armor',
  HELMET: 'helmet',
  BOOTS: 'boots',
  RING: 'ring',
  AMULET: 'amulet',
  CONSUMABLE: 'consumable',
  QUEST_ITEM: 'quest_item',
  MATERIAL: 'material'
};

export const WEAPON_SUBTYPE = {
  SWORD: 'sword',
  BOW: 'bow',
  STAFF: 'staff',
  DAGGER: 'dagger',
  AXE: 'axe'
};

// Color codes for rendering item icons
export const RARITY_COLORS = {
  common: '#888888',
  uncommon: '#22aa22',
  rare: '#2255dd',
  epic: '#9922dd',
  legendary: '#ff8800'
};

export const ITEMS = {
  // ── WEAPONS ──────────────────────────────
  rusty_sword: {
    id: 'rusty_sword', name: 'Rusty Sword', type: ITEM_TYPE.WEAPON, subtype: WEAPON_SUBTYPE.SWORD,
    rarity: RARITY.COMMON, damage: 8, strBonus: 1,
    icon_color: '#8b7355', desc: 'A worn sword, better than nothing.', value: 5, stackable: false
  },
  iron_sword: {
    id: 'iron_sword', name: 'Iron Sword', type: ITEM_TYPE.WEAPON, subtype: WEAPON_SUBTYPE.SWORD,
    rarity: RARITY.UNCOMMON, damage: 15, strBonus: 2,
    icon_color: '#aaaaaa', desc: 'A reliable iron sword.', value: 30, stackable: false
  },
  steel_sword: {
    id: 'steel_sword', name: 'Steel Sword', type: ITEM_TYPE.WEAPON, subtype: WEAPON_SUBTYPE.SWORD,
    rarity: RARITY.RARE, damage: 25, strBonus: 4,
    icon_color: '#ccddee', desc: 'A finely crafted steel blade.', value: 120, stackable: false
  },
  shadow_blade: {
    id: 'shadow_blade', name: 'Shadow Blade', type: ITEM_TYPE.WEAPON, subtype: WEAPON_SUBTYPE.DAGGER,
    rarity: RARITY.EPIC, damage: 30, strBonus: 3, agiBonus: 5, luckBonus: 3,
    icon_color: '#552288', desc: 'A blade forged in darkness. Grants lifesteal.', value: 500, stackable: false, lifesteal: 0.1
  },
  dragonslayer: {
    id: 'dragonslayer', name: "Dragonslayer", type: ITEM_TYPE.WEAPON, subtype: WEAPON_SUBTYPE.SWORD,
    rarity: RARITY.LEGENDARY, damage: 60, strBonus: 10, endBonus: 5,
    icon_color: '#ff6600', desc: 'A legendary sword said to have slain a hundred dragons.', value: 5000, stackable: false
  },
  short_bow: {
    id: 'short_bow', name: 'Short Bow', type: ITEM_TYPE.WEAPON, subtype: WEAPON_SUBTYPE.BOW,
    rarity: RARITY.COMMON, damage: 10, agiBonus: 1,
    icon_color: '#8b6914', desc: 'A simple wooden bow.', value: 15, stackable: false
  },
  long_bow: {
    id: 'long_bow', name: 'Long Bow', type: ITEM_TYPE.WEAPON, subtype: WEAPON_SUBTYPE.BOW,
    rarity: RARITY.UNCOMMON, damage: 20, agiBonus: 3,
    icon_color: '#5c3d11', desc: 'A powerful longbow with greater range.', value: 60, stackable: false
  },
  elven_bow: {
    id: 'elven_bow', name: 'Elven Bow', type: ITEM_TYPE.WEAPON, subtype: WEAPON_SUBTYPE.BOW,
    rarity: RARITY.RARE, damage: 32, agiBonus: 6, luckBonus: 2,
    icon_color: '#228844', desc: 'Crafted by elven hands, whisper-silent.', value: 200, stackable: false
  },
  apprentice_staff: {
    id: 'apprentice_staff', name: "Apprentice Staff", type: ITEM_TYPE.WEAPON, subtype: WEAPON_SUBTYPE.STAFF,
    rarity: RARITY.COMMON, damage: 6, magicBonus: 2, manaBonus: 10,
    icon_color: '#5566cc', desc: 'A basic mage staff.', value: 20, stackable: false
  },
  mage_staff: {
    id: 'mage_staff', name: 'Mage Staff', type: ITEM_TYPE.WEAPON, subtype: WEAPON_SUBTYPE.STAFF,
    rarity: RARITY.UNCOMMON, damage: 12, magicBonus: 5, manaBonus: 25,
    icon_color: '#4444ff', desc: 'A powerful staff for channeling magic.', value: 80, stackable: false
  },
  arcane_staff: {
    id: 'arcane_staff', name: 'Arcane Staff of Eternity', type: ITEM_TYPE.WEAPON, subtype: WEAPON_SUBTYPE.STAFF,
    rarity: RARITY.LEGENDARY, damage: 20, magicBonus: 18, manaBonus: 80,
    icon_color: '#aa22ff', desc: 'Pulsing with ancient arcane energy.', value: 4000, stackable: false
  },
  orcish_axe: {
    id: 'orcish_axe', name: 'Orcish Battle Axe', type: ITEM_TYPE.WEAPON, subtype: WEAPON_SUBTYPE.AXE,
    rarity: RARITY.UNCOMMON, damage: 22, strBonus: 3,
    icon_color: '#664422', desc: 'A brutal axe looted from an orc warlord.', value: 70, stackable: false
  },

  // ── ARMOR ──────────────────────────────
  leather_armor: {
    id: 'leather_armor', name: 'Leather Armor', type: ITEM_TYPE.ARMOR,
    rarity: RARITY.COMMON, defense: 5, endBonus: 1,
    icon_color: '#8b6914', desc: 'Light leather armor.', value: 20, stackable: false
  },
  chain_mail: {
    id: 'chain_mail', name: 'Chain Mail', type: ITEM_TYPE.ARMOR,
    rarity: RARITY.UNCOMMON, defense: 12, endBonus: 2, strBonus: 1,
    icon_color: '#777777', desc: 'Interlocked metal rings provide solid protection.', value: 80, stackable: false
  },
  plate_armor: {
    id: 'plate_armor', name: 'Plate Armor', type: ITEM_TYPE.ARMOR,
    rarity: RARITY.RARE, defense: 22, endBonus: 5,
    icon_color: '#aabbcc', desc: 'Heavy plate armor, nearly impenetrable.', value: 300, stackable: false
  },
  mage_robe: {
    id: 'mage_robe', name: 'Mage Robe', type: ITEM_TYPE.ARMOR,
    rarity: RARITY.UNCOMMON, defense: 4, magicBonus: 4, manaBonus: 30,
    icon_color: '#224466', desc: 'Enchanted robes amplify magical power.', value: 75, stackable: false
  },
  shadow_cloak: {
    id: 'shadow_cloak', name: 'Shadow Cloak', type: ITEM_TYPE.ARMOR,
    rarity: RARITY.EPIC, defense: 14, agiBonus: 6, luckBonus: 4,
    icon_color: '#221133', desc: 'A cloak woven from shadows, grants evasion.', value: 600, stackable: false
  },

  // ── HELMETS ──────────────────────────────
  iron_helm: {
    id: 'iron_helm', name: 'Iron Helm', type: ITEM_TYPE.HELMET,
    rarity: RARITY.COMMON, defense: 4, endBonus: 1,
    icon_color: '#888888', desc: 'A sturdy iron helmet.', value: 25, stackable: false
  },
  mage_hat: {
    id: 'mage_hat', name: "Mage's Hat", type: ITEM_TYPE.HELMET,
    rarity: RARITY.UNCOMMON, defense: 2, magicBonus: 3, manaBonus: 15,
    icon_color: '#334488', desc: 'A pointy hat that amplifies magic.', value: 60, stackable: false
  },

  // ── CONSUMABLES ──────────────────────────────
  health_potion_small: {
    id: 'health_potion_small', name: 'Small Health Potion', type: ITEM_TYPE.CONSUMABLE,
    rarity: RARITY.COMMON, heal: 30,
    icon_color: '#cc2222', desc: 'Restores 30 HP.', value: 10, stackable: true, maxStack: 20
  },
  health_potion: {
    id: 'health_potion', name: 'Health Potion', type: ITEM_TYPE.CONSUMABLE,
    rarity: RARITY.COMMON, heal: 60,
    icon_color: '#dd3333', desc: 'Restores 60 HP.', value: 25, stackable: true, maxStack: 20
  },
  health_potion_large: {
    id: 'health_potion_large', name: 'Large Health Potion', type: ITEM_TYPE.CONSUMABLE,
    rarity: RARITY.UNCOMMON, heal: 120,
    icon_color: '#ff4444', desc: 'Restores 120 HP.', value: 60, stackable: true, maxStack: 10
  },
  mana_potion: {
    id: 'mana_potion', name: 'Mana Potion', type: ITEM_TYPE.CONSUMABLE,
    rarity: RARITY.COMMON, mana: 40,
    icon_color: '#2244cc', desc: 'Restores 40 Mana.', value: 20, stackable: true, maxStack: 20
  },
  antidote: {
    id: 'antidote', name: 'Antidote', type: ITEM_TYPE.CONSUMABLE,
    rarity: RARITY.COMMON, curesPoison: true,
    icon_color: '#22bb44', desc: 'Cures poison effects.', value: 15, stackable: true, maxStack: 10
  },
  revival_scroll: {
    id: 'revival_scroll', name: 'Revival Scroll', type: ITEM_TYPE.CONSUMABLE,
    rarity: RARITY.RARE, revive: true, healPercent: 0.5,
    icon_color: '#ffaa22', desc: 'Brings you back from death with 50% HP.', value: 200, stackable: true, maxStack: 3
  },
  arrows: {
    id: 'arrows', name: 'Arrows', type: ITEM_TYPE.CONSUMABLE,
    rarity: RARITY.COMMON, isArrows: true,
    icon_color: '#8b6914', desc: 'Standard arrows for bows.', value: 1, stackable: true, maxStack: 200
  },

  // ── ACCESSORIES ──────────────────────────────
  ring_of_strength: {
    id: 'ring_of_strength', name: 'Ring of Strength', type: ITEM_TYPE.RING,
    rarity: RARITY.UNCOMMON, strBonus: 3,
    icon_color: '#cc8800', desc: 'A ring that enhances physical power.', value: 100, stackable: false
  },
  amulet_of_magic: {
    id: 'amulet_of_magic', name: 'Amulet of Magic', type: ITEM_TYPE.AMULET,
    rarity: RARITY.RARE, magicBonus: 5, manaBonus: 20,
    icon_color: '#6644aa', desc: 'An amulet crackling with magical energy.', value: 250, stackable: false
  },
  lucky_charm: {
    id: 'lucky_charm', name: 'Lucky Charm', type: ITEM_TYPE.AMULET,
    rarity: RARITY.UNCOMMON, luckBonus: 5,
    icon_color: '#44aacc', desc: 'May the odds be in your favor.', value: 120, stackable: false
  },

  // ── MATERIALS ──────────────────────────────
  orc_hide: {
    id: 'orc_hide', name: 'Orc Hide', type: ITEM_TYPE.MATERIAL,
    rarity: RARITY.COMMON, icon_color: '#668844',
    desc: 'Tough hide from an orc. Used in crafting.', value: 8, stackable: true, maxStack: 50
  },
  dragon_scale: {
    id: 'dragon_scale', name: 'Dragon Scale', type: ITEM_TYPE.MATERIAL,
    rarity: RARITY.LEGENDARY, icon_color: '#ff6600',
    desc: 'An impossibly hard scale from a dragon.', value: 1000, stackable: true, maxStack: 10
  },
  magic_crystal: {
    id: 'magic_crystal', name: 'Magic Crystal', type: ITEM_TYPE.MATERIAL,
    rarity: RARITY.RARE, icon_color: '#aa44ff',
    desc: 'A crystal pulsing with magical energy.', value: 100, stackable: true, maxStack: 20
  },
  iron_ore: {
    id: 'iron_ore', name: 'Iron Ore', type: ITEM_TYPE.MATERIAL,
    rarity: RARITY.COMMON, icon_color: '#666688',
    desc: 'Raw iron ore from a mine.', value: 5, stackable: true, maxStack: 50
  },
  bone: {
    id: 'bone', name: 'Bone Fragment', type: ITEM_TYPE.MATERIAL,
    rarity: RARITY.COMMON, icon_color: '#ddddbb',
    desc: 'A bone from a defeated skeleton.', value: 3, stackable: true, maxStack: 50
  },
  green_goo: {
    id: 'green_goo', name: 'Slime Goo', type: ITEM_TYPE.MATERIAL,
    rarity: RARITY.COMMON, icon_color: '#44cc44',
    desc: 'Green goo from a slime. Used in potions.', value: 4, stackable: true, maxStack: 50
  },

  // ── BOOTS ──────────────────────────────
  leather_boots: {
    id: 'leather_boots', name: 'Leather Boots', type: ITEM_TYPE.BOOTS,
    rarity: RARITY.COMMON, defense: 2, agiBonus: 1,
    icon_color: '#8b6914', desc: 'Light boots for quick movement.', value: 18, stackable: false
  },
  iron_boots: {
    id: 'iron_boots', name: 'Iron Boots', type: ITEM_TYPE.BOOTS,
    rarity: RARITY.UNCOMMON, defense: 6, endBonus: 1,
    icon_color: '#888888', desc: 'Heavy boots with solid protection.', value: 55, stackable: false
  },

  // ── QUEST ITEMS ──────────────────────────────
  elder_scroll: {
    id: 'elder_scroll', name: "Elder's Scroll", type: ITEM_TYPE.QUEST_ITEM,
    rarity: RARITY.UNCOMMON, icon_color: '#ccaa44',
    desc: 'An ancient scroll given by the Elder. Contains warnings about The Outbreak.', value: 0, stackable: false
  },
  warlord_head: {
    id: 'warlord_head', name: "Warlord's Head", type: ITEM_TYPE.QUEST_ITEM,
    rarity: RARITY.RARE, icon_color: '#886644',
    desc: 'Proof of the Orc Warlord\'s defeat.', value: 0, stackable: false
  }
};

// Helper to create item instance (with quantity)
export function createItem(id, quantity = 1) {
  const template = ITEMS[id];
  if (!template) return null;
  return { ...template, quantity: template.stackable ? quantity : 1, instanceId: Math.random().toString(36).substr(2, 9) };
}

export default ITEMS;
