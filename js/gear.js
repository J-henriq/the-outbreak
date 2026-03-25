/**
 * Arcane Engineers - Gear System
 * Handles gear generation, crafting, and management
 */

class GearSystem {
  constructor() {
    this.nextId = 1;
  }

  generateGear(level = 1, forceRarity = null, forceSlot = null) {
    const slot = forceSlot || this.randomSlot();
    const rarity = forceRarity || this.rollRarity(level);
    const template = this.getTemplate(slot);
    const rarityData = CONFIG.RARITY[rarity];

    const gear = {
      id: this.nextId++,
      name: this.generateName(template, rarity),
      slot,
      rarity,
      rarityColor: rarityData.color,
      level,
      statBonuses: this.generateStatBonuses(slot, level, rarityData.multiplier),
      description: '',
      setName: null
    };

    // Chance to be part of a set
    if (rarity === 'RARE' || rarity === 'EPIC' || rarity === 'LEGENDARY') {
      const setRoll = Math.random();
      if (setRoll < 0.25) {
        this.assignToSet(gear);
      }
    }

    gear.description = this.buildDescription(gear);
    return gear;
  }

  rollRarity(level) {
    const r = Math.random();
    const levelBonus = Math.min(level * 0.005, 0.15);
    if (r < 0.55 - levelBonus) return 'COMMON';
    if (r < 0.80 - levelBonus * 0.5) return 'UNCOMMON';
    if (r < 0.93) return 'RARE';
    if (r < 0.99) return 'EPIC';
    return 'LEGENDARY';
  }

  randomSlot() {
    const slots = CONFIG.GEAR_SLOTS;
    return slots[Math.floor(Math.random() * slots.length)];
  }

  getTemplate(slot) {
    const templates = {
      helmet: { names: ['Helm', 'Crown', 'Circlet', 'Visor', 'Hood'], primaryStats: ['endurance', 'magic'] },
      chest: { names: ['Plate', 'Robe', 'Vest', 'Armor', 'Cuirass'], primaryStats: ['endurance', 'engineering'] },
      gloves: { names: ['Gauntlets', 'Gloves', 'Grips', 'Wraps', 'Bracers'], primaryStats: ['dexterity', 'engineering'] },
      boots: { names: ['Boots', 'Greaves', 'Treads', 'Stompers', 'Walkers'], primaryStats: ['dexterity', 'endurance'] },
      weapon: { names: ['Wrench', 'Staff', 'Wand', 'Cannon', 'Blade'], primaryStats: ['engineering', 'magic'] },
      offhand: { names: ['Shield', 'Tome', 'Orb', 'Condenser', 'Catalyst'], primaryStats: ['magic', 'endurance'] },
      relic: { names: ['Relic', 'Amulet', 'Talisman', 'Idol', 'Charm'], primaryStats: ['magic', 'engineering'] }
    };
    return templates[slot] || templates.relic;
  }

  generateName(template, rarity) {
    const prefixes = {
      COMMON: ['Iron', 'Stone', 'Basic', 'Simple'],
      UNCOMMON: ['Reinforced', 'Arcane', 'Enhanced', 'Improved'],
      RARE: ['Mystical', 'Enchanted', 'Runic', 'Ancient'],
      EPIC: ['Void', 'Celestial', 'Legendary', 'Primordial'],
      LEGENDARY: ['Titan', 'Eternal', 'Ascended', 'Divine']
    };
    const prefix = prefixes[rarity][Math.floor(Math.random() * prefixes[rarity].length)];
    const base = template.names[Math.floor(Math.random() * template.names.length)];
    return `${prefix} ${base}`;
  }

  generateStatBonuses(slot, level, multiplier) {
    const template = this.getTemplate(slot);
    const bonuses = {};
    const baseAmount = Math.floor((2 + level * 0.8) * multiplier);

    template.primaryStats.forEach((stat, i) => {
      bonuses[stat] = Math.max(1, Math.floor(baseAmount * (i === 0 ? 1 : 0.6) + Math.random() * baseAmount * 0.4));
    });

    // Chance for bonus stat
    if (Math.random() < 0.4) {
      const allStats = Object.values(CONFIG.STATS);
      const bonusStat = allStats[Math.floor(Math.random() * allStats.length)];
      if (!bonuses[bonusStat]) {
        bonuses[bonusStat] = Math.max(1, Math.floor(baseAmount * 0.3 + Math.random() * baseAmount * 0.2));
      }
    }

    return bonuses;
  }

  assignToSet(gear) {
    const sets = Object.entries(CONFIG.SETS);
    const slotSets = sets.filter(([, s]) => {
      // Check if this slot type could belong to a set piece
      return s.pieces.some(p => p.toLowerCase().includes(gear.slot) ||
        (gear.slot === 'helmet' && p.includes('Helmet')) ||
        (gear.slot === 'helmet' && p.includes('Crown')) ||
        (gear.slot === 'chest' && p.includes('Chest')) ||
        (gear.slot === 'chest' && p.includes('Robes')) ||
        (gear.slot === 'boots' && p.includes('Boots')) ||
        (gear.slot === 'weapon' && p.includes('Wand'))
      );
    });

    if (slotSets.length > 0) {
      const [setKey, setData] = slotSets[Math.floor(Math.random() * slotSets.length)];
      const slotPieces = setData.pieces.filter(p =>
        (gear.slot === 'helmet' && (p.includes('Helmet') || p.includes('Crown'))) ||
        (gear.slot === 'chest' && (p.includes('Chest') || p.includes('Robes'))) ||
        (gear.slot === 'boots' && p.includes('Boots')) ||
        (gear.slot === 'weapon' && p.includes('Wand'))
      );
      if (slotPieces.length > 0) {
        gear.name = slotPieces[0];
        gear.setName = setKey;
      }
    }
  }

  buildDescription(gear) {
    const bonusLines = Object.entries(gear.statBonuses)
      .map(([stat, val]) => `+${val} ${stat.charAt(0).toUpperCase() + stat.slice(1)}`);
    if (gear.setName) {
      bonusLines.push(`Set: ${CONFIG.SETS[gear.setName].name}`);
    }
    return bonusLines.join('\n');
  }

  craftGear(materials, targetSlot, playerLevel) {
    const rarityMap = {
      1: 'COMMON',
      2: 'UNCOMMON',
      3: 'RARE',
      5: 'EPIC',
      8: 'LEGENDARY'
    };
    const count = materials.length;
    let rarity = 'COMMON';
    Object.entries(rarityMap).forEach(([req, r]) => {
      if (count >= parseInt(req)) rarity = r;
    });
    return this.generateGear(playerLevel, rarity, targetSlot);
  }

  compareGear(equipped, candidate) {
    if (!equipped) return 1; // candidate is better (no current gear)
    const equippedTotal = Object.values(equipped.statBonuses).reduce((a, b) => a + b, 0);
    const candidateTotal = Object.values(candidate.statBonuses).reduce((a, b) => a + b, 0);
    return candidateTotal - equippedTotal;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GearSystem;
}
