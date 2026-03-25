// Quest definitions for The Outbreak RPG
// Storyline: An ancient evil dragon has caused "The Outbreak" - spreading monsters across the land.

export const QUEST_STATUS = {
  LOCKED: 'locked',
  AVAILABLE: 'available',
  ACTIVE: 'active',
  COMPLETED: 'completed'
};

export const OBJECTIVE_TYPE = {
  KILL: 'kill',
  COLLECT: 'collect',
  TALK: 'talk',
  REACH: 'reach',
  SURVIVE: 'survive'
};

export const QUESTS = {
  awakening: {
    id: 'awakening',
    name: 'Awakening',
    chapter: 1,
    description: 'You wake in the town of Thornhaven. An old Elder approaches you with worry in his eyes. Strange creatures have begun appearing near the town.',
    lore: 'The ancient prophecy speaks of a hero who will rise when the darkness spreads. Are you that hero?',
    giver: 'elder_merin',
    prerequisites: [],
    objectives: [
      { type: OBJECTIVE_TYPE.TALK, target: 'elder_merin', count: 1, current: 0, description: 'Speak with Elder Merin' },
      { type: OBJECTIVE_TYPE.KILL, target: 'slime', count: 5, current: 0, description: 'Slay 5 Slimes near the town' }
    ],
    rewards: {
      xp: 100,
      gold: 50,
      items: [{ id: 'health_potion', qty: 3 }, { id: 'elder_scroll', qty: 1 }]
    },
    nextQuest: 'skeleton_threat'
  },

  skeleton_threat: {
    id: 'skeleton_threat',
    name: 'The Skeleton Threat',
    chapter: 1,
    description: 'Skeletons have been rising from the old dungeon beneath Thornhaven. Captain Aldric needs someone brave enough to venture into the dungeon and clear them out.',
    lore: 'The undead rise whenever the Outbreak spreads. Ancient magic reanimates long-dead warriors.',
    giver: 'captain_aldric',
    prerequisites: ['awakening'],
    objectives: [
      { type: OBJECTIVE_TYPE.KILL, target: 'skeleton', count: 10, current: 0, description: 'Kill 10 Skeletons in the dungeon' },
      { type: OBJECTIVE_TYPE.KILL, target: 'skeleton_archer', count: 5, current: 0, description: 'Kill 5 Skeleton Archers' },
      { type: OBJECTIVE_TYPE.TALK, target: 'captain_aldric', count: 1, current: 0, description: 'Report back to Captain Aldric' }
    ],
    rewards: {
      xp: 250,
      gold: 120,
      items: [{ id: 'iron_sword', qty: 1 }, { id: 'chain_mail', qty: 1 }]
    },
    nextQuest: 'orc_warlord'
  },

  orc_warlord: {
    id: 'orc_warlord',
    name: 'The Orc Warlord',
    chapter: 2,
    description: 'An orc horde led by a fearsome Warlord is marching on Thornhaven. You must venture to the Orc Stronghold and defeat their leader before the town is overrun.',
    lore: 'The orcs have been corrupted by The Outbreak\'s dark magic. Their Warlord is no ordinary orc - he channels dark energy.',
    giver: 'captain_aldric',
    prerequisites: ['skeleton_threat'],
    objectives: [
      { type: OBJECTIVE_TYPE.KILL, target: 'orc', count: 15, current: 0, description: 'Defeat 15 Orc Warriors' },
      { type: OBJECTIVE_TYPE.KILL, target: 'orc_warlord', count: 1, current: 0, description: 'Slay the Orc Warlord (Boss)' },
      { type: OBJECTIVE_TYPE.COLLECT, target: 'warlord_head', count: 1, current: 0, description: "Return the Warlord's Head as proof" }
    ],
    rewards: {
      xp: 600,
      gold: 300,
      items: [{ id: 'plate_armor', qty: 1 }, { id: 'health_potion_large', qty: 3 }]
    },
    nextQuest: 'ancient_magic'
  },

  ancient_magic: {
    id: 'ancient_magic',
    name: 'Ancient Magic',
    chapter: 2,
    description: 'The Wizard Zara has been researching The Outbreak. She believes Magic Crystals hold the key to breaking the dragon\'s curse. Collect 3 from the dungeon\'s depths.',
    lore: 'Magic Crystals are crystallized arcane energy. In ancient times, they were used to seal powerful demons. Perhaps they can seal the dragon too.',
    giver: 'wizard_zara',
    prerequisites: ['orc_warlord'],
    objectives: [
      { type: OBJECTIVE_TYPE.COLLECT, target: 'magic_crystal', count: 3, current: 0, description: 'Collect 3 Magic Crystals' },
      { type: OBJECTIVE_TYPE.KILL, target: 'mage_enemy', count: 5, current: 0, description: 'Defeat 5 Dark Mages guarding the crystals' },
      { type: OBJECTIVE_TYPE.TALK, target: 'wizard_zara', count: 1, current: 0, description: 'Return the crystals to Wizard Zara' }
    ],
    rewards: {
      xp: 800,
      gold: 400,
      items: [{ id: 'arcane_staff', qty: 1 }, { id: 'mana_potion', qty: 5 }]
    },
    nextQuest: 'dragons_lair'
  },

  dragons_lair: {
    id: 'dragons_lair',
    name: "The Dragon's Lair",
    chapter: 3,
    description: 'The source of The Outbreak has been revealed - an Ancient Dragon sleeping deep within the mountain. With the crystals empowered by Zara\'s magic, you have the power to challenge it. This is your destiny.',
    lore: 'The Ancient Dragon awoke from a thousand-year slumber and spread its corruption across the land. Only a true hero wielding the Crystal Seal can end The Outbreak forever.',
    giver: 'wizard_zara',
    prerequisites: ['ancient_magic'],
    objectives: [
      { type: OBJECTIVE_TYPE.REACH, target: 'dragon_lair', count: 1, current: 0, description: "Enter the Dragon's Lair" },
      { type: OBJECTIVE_TYPE.KILL, target: 'dragon_boss', count: 1, current: 0, description: 'Defeat the Ancient Dragon' }
    ],
    rewards: {
      xp: 5000,
      gold: 2000,
      items: [{ id: 'dragonslayer', qty: 1 }, { id: 'dragon_scale', qty: 5 }, { id: 'revival_scroll', qty: 3 }]
    },
    nextQuest: null,
    isFinale: true
  }
};

export default QUESTS;
