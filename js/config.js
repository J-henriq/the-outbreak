// ─────────────────────────────────────────────────────────
//  ASHENWILD  –  Config & Constants
// ─────────────────────────────────────────────────────────

const CFG = {
  // Canvas / viewport
  TILE:        32,
  VIEW_TILES_W: 28,
  VIEW_TILES_H: 18,

  // Tick system (200 ms per tick = 5 tps)
  TICK_MS: 200,

  // Skill XP table
  SKILL_MAX_LV: 99,

  // Combat
  BASE_ATTACK_TICKS: 4,   // 0.8 s
  PROJECTILE_SPEED:  7,
  MELEE_RANGE:       52,

  // Colours (canvas drawing)
  C: {
    // Tiles
    GRASS:       '#2d4a1e',
    GRASS_D:     '#253d18',
    DIRT:        '#5c4a2a',
    DIRT_D:      '#4a3a20',
    STONE:       '#4a4a52',
    STONE_D:     '#3a3a42',
    WATER:       '#1a3a5c',
    WATER_L:     '#1e4470',
    WALL:        '#2a2a32',
    WALL_L:      '#3a3a46',
    TREE:        '#1a3010',
    TREE_T:      '#14280c',
    TREE_CROWN:  '#2a5020',
    ORE:         '#6a5a3a',
    ORE_L:       '#8a7a52',

    // Entities
    PLAYER:      '#e0c060',
    PLAYER_SH:   '#a08030',
    SHADOW:      'rgba(0,0,0,0.35)',
    ENEMY_BASE:  '#c04030',
    ENEMY_DARK:  '#8a2c20',
    BOSS_BASE:   '#7030a0',
    BOSS_DARK:   '#50208a',
    PROJ_PLAYER: '#f0e060',
    PROJ_ENEMY:  '#ff4020',

    // UI on canvas
    HP_BAR_BG:   'rgba(0,0,0,0.5)',
    HP_BAR:      '#e03030',
    HP_BAR_BOSS: '#c030a0',
    EXP_BAR:     '#30c080',
    WHITE:       '#ffffff',
    GOLD:        '#c8a84b',
    DMG_PLAYER:  '#ffdd44',
    DMG_ENEMY:   '#ff5533',
    DMG_CRIT:    '#ff8800',
    HEAL:        '#44ff88',
  },

  // Zones
  ZONES: ['Frontier Forest', 'Ironvein Quarry', 'Floodfen', 'Sunken Shrine'],
};
