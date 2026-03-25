// Zone definitions and portal/spawn configurations

export const ZONES = {
  overworld: {
    id: 'overworld',
    name: 'Thornhaven Region',
    width: 100,
    height: 100,
    ambientLight: 0.2,
    music: 'overworld',
    portals: [
      { tileX: 50, tileY: 68, target: 'dungeon', label: 'Dungeon Entrance' },
      { tileX: 50, tileY: 67, target: 'dungeon', label: 'Dungeon Entrance' }
    ],
    spawnPoint: { x: 50 * 32, y: 50 * 32 },
    enemySpawns: [
      { type: 'slime', count: 8, region: { x: 20, y: 20, w: 60, h: 20 } },
      { type: 'slime', count: 6, region: { x: 60, y: 60, w: 30, h: 25 } },
      { type: 'skeleton', count: 5, region: { x: 10, y: 60, w: 30, h: 25 } },
      { type: 'orc', count: 4, region: { x: 70, y: 20, w: 25, h: 30 } },
      { type: 'cave_bat', count: 6, region: { x: 80, y: 70, w: 15, h: 20 } }
    ],
    npcSpawns: [
      { type: 'elder', name: 'Elder Merin', tileX: 50, tileY: 46 },
      { type: 'guard', name: 'Captain Aldric', tileX: 47, tileY: 50 },
      { type: 'wizard', name: 'Wizard Zara', tileX: 53, tileY: 48 },
      { type: 'merchant', name: 'Trader Finn', tileX: 52, tileY: 52 }
    ]
  },
  dungeon: {
    id: 'dungeon',
    name: 'The Corrupted Depths',
    width: 60,
    height: 60,
    ambientLight: 0.7,
    music: 'dungeon',
    portals: [
      { tileX: 30, tileY: 2, target: 'overworld', label: 'Exit Dungeon' },
      { tileX: 30, tileY: 56, target: 'dragon_lair', label: "Dragon's Lair" }
    ],
    spawnPoint: { x: 30 * 32, y: 4 * 32 },
    enemySpawns: [
      { type: 'skeleton', count: 8, region: { x: 5, y: 5, w: 50, h: 25 } },
      { type: 'skeleton_archer', count: 5, region: { x: 10, y: 30, w: 40, h: 20 } },
      { type: 'cave_bat', count: 6, region: { x: 5, y: 5, w: 50, h: 50 } },
      { type: 'orc', count: 4, region: { x: 10, y: 35, w: 40, h: 20 } },
      { type: 'mage_enemy', count: 3, region: { x: 15, y: 40, w: 30, h: 15 } },
      { type: 'stone_golem', count: 2, region: { x: 20, y: 45, w: 20, h: 10 } },
      { type: 'orc_warlord', count: 1, region: { x: 25, y: 48, w: 10, h: 6 } }
    ],
    npcSpawns: []
  },
  dragon_lair: {
    id: 'dragon_lair',
    name: "The Dragon's Lair",
    width: 40,
    height: 40,
    ambientLight: 0.8,
    music: 'boss',
    portals: [
      { tileX: 20, tileY: 2, target: 'dungeon', label: 'Flee!' }
    ],
    spawnPoint: { x: 20 * 32, y: 5 * 32 },
    enemySpawns: [
      { type: 'dragon_boss', count: 1, region: { x: 15, y: 25, w: 10, h: 10 } },
      { type: 'mage_enemy', count: 4, region: { x: 5, y: 10, w: 30, h: 20 } }
    ],
    npcSpawns: []
  }
};

export default ZONES;
