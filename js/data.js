// ─────────────────────────────────────────────────────────
//  ASHENWILD  –  Game Data  (classes, races, items, enemies)
// ─────────────────────────────────────────────────────────

// ── Races ────────────────────────────────────────────────
const RACES = {
  Human: {
    name: 'Human',
    emoji: '🧑',
    color: '#d4a870',
    desc: 'Adaptive and versatile. Gains +3% skill XP until level 50 in each skill.',
    passives: ['Adaptive Growth: +3% all-skill XP (to lv 50)', 'Steady Hands: +5% tool efficiency'],
    bonuses: { allXP: 0.03, toolSpeed: 0.05 },
    stats: { hp: 0, atk: 0, def: 0, spd: 0 },
  },
  Sylvan: {
    name: 'Sylvan',
    emoji: '🌿',
    color: '#70c870',
    desc: 'Forest-born. Bonus agility and ranged XP, lower detection radius in nature.',
    passives: ['Wild Affinity: +10% Agility XP', 'Whisperstep: -20% enemy detection'],
    bonuses: { agilityXP: 0.10, detectReduce: 0.20 },
    stats: { hp: -5, atk: 0, def: -2, spd: 2 },
  },
  Stoneborn: {
    name: 'Stoneborn',
    emoji: '🪨',
    color: '#a09080',
    desc: 'Built from the earth. Higher stagger resistance and physical defense.',
    passives: ['Earthblood: +10% Strength XP', 'Iron Frame: +15% physical defense'],
    bonuses: { strXP: 0.10, physDef: 0.15 },
    stats: { hp: 20, atk: 2, def: 5, spd: -1 },
  },
  Ashen: {
    name: 'Ashen',
    emoji: '🔥',
    color: '#e08050',
    desc: 'Born from ember and curse. Fire resistance and extended prayer effects.',
    passives: ['Cinder Soul: fire/curse resistance', 'Ember Memory: +20% prayer duration'],
    bonuses: { fireRes: 0.20, prayerDur: 0.20 },
    stats: { hp: 0, atk: 3, def: 0, spd: 0 },
  },
  Umbral: {
    name: 'Umbral',
    emoji: '🌑',
    color: '#9060c0',
    desc: 'Born in shadow. Bonus crit chance on unaware enemies and trap evasion.',
    passives: ['Veilwalker: +10% Thieving XP', 'Night Instinct: +15% weak-point dmg'],
    bonuses: { thievingXP: 0.10, critBonus: 0.15 },
    stats: { hp: -10, atk: 5, def: -2, spd: 3 },
  },
};

// ── Classes ──────────────────────────────────────────────
const CLASSES = {
  Vanguard: {
    name: 'Vanguard',
    emoji: '🛡',
    color: '#5080e0',
    desc: 'Frontline bruiser/tank. Hold aggro, survive mechanics, protect allies.',
    resource: 'Rage',
    stats: { hp: 120, atk: 8, def: 10, spd: 3, range: 'melee' },
    abilities: [
      { name: 'Shield Slam',    emoji: '🛡', cd: 8,  dmgMult: 1.5, stun: 1.2, desc: 'Slam with shield, stunning the target briefly.' },
      { name: 'Cleaving Strike',emoji: '⚔', cd: 5,  dmgMult: 1.2, aoe: true, desc: 'Wide swing hitting all nearby enemies.' },
      { name: 'Rally Cry',      emoji: '📯', cd: 15, heal: 30,     buff: true, desc: 'Shout that restores 30 HP and boosts defense.' },
      { name: 'Intercept',      emoji: '🏃', cd: 10, dash: true,   desc: 'Dash toward target to close distance fast.' },
      { name: 'Guard Stance',   emoji: '🔰', cd: 20, defBuff: 0.5, desc: 'Raise guard, reducing damage taken by 50% briefly.' },
    ],
  },
  Ranger: {
    name: 'Ranger',
    emoji: '🏹',
    color: '#50c050',
    desc: 'Precision ranged damage dealer. Mark targets, exploit weak points.',
    resource: 'Focus',
    stats: { hp: 80, atk: 10, def: 4, spd: 5, range: 'ranged' },
    abilities: [
      { name: 'Quickshot',      emoji: '🏹', cd: 3,  dmgMult: 1.0, proj: true, desc: 'Fire a rapid arrow at the target.' },
      { name: 'Piercing Arrow', emoji: '↗', cd: 7,  dmgMult: 1.8, pierce: true, desc: 'Powerful arrow that pierces through enemies.' },
      { name: 'Mark Prey',      emoji: '🎯', cd: 12, mark: true,   desc: 'Mark target, increasing all damage they take by 25%.' },
      { name: 'Snare Trap',     emoji: '🕷', cd: 10, trap: true,   desc: 'Place a trap that roots enemies for 2 seconds.' },
      { name: 'Rollstep',       emoji: '↩', cd: 6,  dash: true,   desc: 'Evasive roll to reposition quickly.' },
    ],
  },
  Arcanist: {
    name: 'Arcanist',
    emoji: '🔮',
    color: '#9060e0',
    desc: 'Magic damage and control. Elemental bursts, battlefield denial.',
    resource: 'Mana',
    stats: { hp: 70, atk: 12, def: 3, spd: 4, range: 'ranged' },
    abilities: [
      { name: 'Arc Bolt',       emoji: '⚡', cd: 2,  dmgMult: 1.0, proj: true, desc: 'Quick lightning bolt at the enemy.' },
      { name: 'Flame Sigil',    emoji: '🔥', cd: 8,  dmgMult: 1.5, aoe: true,  dot: true, desc: 'Burning zone that damages all enemies inside.' },
      { name: 'Frost Bind',     emoji: '❄', cd: 10, dmgMult: 0.8, slow: true, desc: 'Freezing ray that slows enemies to a crawl.' },
      { name: 'Arc Ward',       emoji: '🌀', cd: 18, shield: 25,   desc: 'Arcane barrier absorbing 25 points of damage.' },
      { name: 'Blink',          emoji: '✨', cd: 8,  blink: true,  desc: 'Teleport a short distance in any direction.' },
    ],
  },
  Forgemaster: {
    name: 'Forgemaster',
    emoji: '⚙',
    color: '#e0a030',
    desc: 'Combat engineer. Deploy turrets, repair, and amplify your gear.',
    resource: 'Heat',
    stats: { hp: 100, atk: 9, def: 7, spd: 3, range: 'melee' },
    abilities: [
      { name: 'Auto-Turret',    emoji: '🔩', cd: 20, turret: true, desc: 'Deploy a turret that attacks nearby enemies.' },
      { name: 'Shock Mine',     emoji: '💥', cd: 8,  trap: true,   stun: true, desc: 'Plant a mine that stuns and damages enemies.' },
      { name: 'Grapple Line',   emoji: '🪝', cd: 10, pull: true,   desc: 'Grapple an enemy pulling them toward you.' },
      { name: 'Repair Pulse',   emoji: '🔧', cd: 15, heal: 40,     desc: 'Repair pulse restoring 40 HP.' },
      { name: 'Reinforce Armor',emoji: '🦺', cd: 20, defBuff: 0.4, desc: 'Reinforce armor, reducing damage taken by 40%.' },
    ],
  },
  Nightblade: {
    name: 'Nightblade',
    emoji: '🗡',
    color: '#c03080',
    desc: 'High-skill assassin. Burst damage, mobility, and debuffs.',
    resource: 'Shadow',
    stats: { hp: 75, atk: 14, def: 3, spd: 7, range: 'melee' },
    abilities: [
      { name: 'Shadowstep',     emoji: '👤', cd: 6,  dash: true,   dmgMult: 1.3, desc: 'Teleport behind target and strike.' },
      { name: 'Hemorrhage',     emoji: '🩸', cd: 8,  dmgMult: 1.2, dot: true,    desc: 'Blade strike causing a powerful bleed.' },
      { name: 'Smoke Veil',     emoji: '💨', cd: 15, stealth: true,             desc: 'Vanish in smoke, becoming untargetable briefly.' },
      { name: 'Sever Tendon',   emoji: '✂', cd: 7,  dmgMult: 1.0, slow: true,  desc: 'Slash at the tendons, slowing the target.' },
      { name: 'Phantom Lunge',  emoji: '💫', cd: 5,  dash: true,   dmgMult: 1.5, desc: 'Rapid forward lunge dealing heavy damage.' },
    ],
  },
};

// ── Items ─────────────────────────────────────────────────
const ITEM_TIERS = { Frontier: 0, Hardened: 1, Runic: 2, Mythic: 3, Ascendant: 4 };
const TIER_COLORS = ['#aaaaaa', '#4db84d', '#3fa3d9', '#c050e0', '#ff9900'];
const TIER_NAMES  = ['Frontier', 'Hardened', 'Runic', 'Mythic', 'Ascendant'];

const ITEMS = [
  // ─ Weapons ─
  { id:'frontier_blade',    name:'Frontier Blade',      emoji:'⚔',  tier:0, slot:'weapon', stats:{atk:6,  def:0}, desc:'A rough iron blade of a frontier settler.' },
  { id:'ash_recurve',       name:'Ash Recurve',         emoji:'🏹', tier:0, slot:'weapon', stats:{atk:7,  def:0}, desc:'Bow carved from ash wood. Light and quick.' },
  { id:'emberwood_staff',   name:'Emberwood Staff',     emoji:'🪄', tier:0, slot:'weapon', stats:{atk:8,  def:0}, desc:'Staff cut from ember-touched wood.' },
  { id:'fangsplitter_axe',  name:'Fangsplitter Axe',    emoji:'🪓', tier:1, slot:'weapon', stats:{atk:14, def:0}, desc:'Forged from alpha beast fangs. Causes bleed.' },
  { id:'hunters_longbow',   name:"Hunter's Longbow",    emoji:'🏹', tier:1, slot:'weapon', stats:{atk:16, def:0}, desc:'Long-range bow with improved crit chance.' },
  { id:'graveglass_wand',   name:'Graveglass Wand',     emoji:'🪄', tier:1, slot:'weapon', stats:{atk:18, def:0}, desc:'Wand of grave glass that amplifies magic.' },
  { id:'runesever',         name:'Runesever Greatblade',emoji:'⚔',  tier:2, slot:'weapon', stats:{atk:24, def:2}, desc:'Runic blade that severs magical buffs.' },
  { id:'stormbinder_bow',   name:'Stormbinder Bow',     emoji:'🏹', tier:2, slot:'weapon', stats:{atk:28, def:0}, desc:'Bow infused with storm energy.' },
  { id:'frostlit_focus',    name:'Frostlit Focus',      emoji:'❄',  tier:2, slot:'weapon', stats:{atk:30, def:0}, desc:'Icy focus that amplifies all spells.' },
  { id:'heartforge_hammer', name:'Heartforge Hammer',   emoji:'🔨', tier:3, slot:'weapon', stats:{atk:40, def:4}, desc:'Hammer forged from a boss heart-core.' },
  { id:'skypiercer_bow',    name:'Skypiercer Bow',      emoji:'🏹', tier:3, slot:'weapon', stats:{atk:46, def:0}, desc:'Bow of storm yew. Arrows pierce the sky.' },
  { id:'soulflame_rod',     name:'Soulflame Rod',       emoji:'🔥', tier:3, slot:'weapon', stats:{atk:50, def:0}, desc:'A rod ablaze with captive soul-fire.' },

  // ─ Armor ─
  { id:'scout_leathers',    name:'Scout Leathers',      emoji:'🥋', tier:0, slot:'armor',  stats:{atk:0,  def:6},  desc:'Light leather worn by frontier scouts.' },
  { id:'ironbound_vest',    name:'Ironbound Vest',      emoji:'🛡', tier:0, slot:'armor',  stats:{atk:0,  def:8},  desc:'Vest reinforced with iron rings.' },
  { id:'hardened_brigandine',name:'Hardened Brigandine',emoji:'🛡', tier:1, slot:'armor',  stats:{atk:0,  def:16}, desc:'Layers of hardened steel plates.' },
  { id:'bastion_shield',    name:'Bastion Kite Shield', emoji:'🔰', tier:1, slot:'offhand',stats:{atk:0,  def:14}, desc:'Large kite shield from the Bastion order.' },
  { id:'wardenplate',       name:'Wardenplate Harness', emoji:'⚔',  tier:2, slot:'armor',  stats:{atk:2,  def:26}, desc:'Warden armor of the shrine guardians.' },
  { id:'titanbone_cuirass', name:'Titanbone Cuirass',   emoji:'🛡', tier:3, slot:'armor',  stats:{atk:0,  def:38}, desc:'Cuirass reinforced with titan bones.' },

  // ─ Off-hand ─
  { id:'relicforged_gauntlets',name:'Relicforged Gauntlets',emoji:'🥊',tier:1,slot:'offhand',stats:{atk:5,def:6},desc:'Gauntlets with relic cores embedded.' },
  { id:'arcane_tome',       name:'Arcane Tome',         emoji:'📖', tier:2, slot:'offhand',stats:{atk:8,  def:0}, desc:'Tome amplifying all arcane abilities.' },
];

// ── Enemies ───────────────────────────────────────────────
const ENEMY_DEFS = [
  // Zone 0 – Frontier Forest
  { id:'wolf',         name:'Dire Wolf',      emoji:'🐺', color:'#888', hp:28,  atk:5,  def:1, spd:3, xp:12,  zone:0, boss:false },
  { id:'bandit',       name:'Bandit',         emoji:'🗡', color:'#a88', hp:35,  atk:7,  def:2, spd:2, xp:18,  zone:0, boss:false },
  { id:'shambler',     name:'Shambler',       emoji:'💀', color:'#888', hp:45,  atk:6,  def:3, spd:1, xp:22,  zone:0, boss:false },
  { id:'wolf_alpha',   name:'Alpha Wolf',     emoji:'🐺', color:'#655', hp:120, atk:14, def:4, spd:4, xp:80,  zone:0, boss:true,
    bossAbility: { name:'Savage Pounce', desc:'Leaps at the player dealing massive damage!' } },

  // Zone 1 – Ironvein Quarry
  { id:'ruin_guard',   name:'Ruin Guard',     emoji:'🪨', color:'#806050', hp:55,  atk:9,  def:6, spd:2, xp:30,  zone:1, boss:false },
  { id:'grave_hound',  name:'Grave Hound',    emoji:'🦴', color:'#c0b090', hp:40,  atk:11, def:2, spd:4, xp:28,  zone:1, boss:false },
  { id:'ore_golem',    name:'Ore Golem',      emoji:'⛏', color:'#706050', hp:200, atk:18, def:12,spd:1, xp:150, zone:1, boss:true,
    bossAbility: { name:'Seismic Slam', desc:'Slams the ground sending shockwaves outward!' } },

  // Zone 2 – Floodfen
  { id:'marsh_crawler',name:'Marsh Crawler',  emoji:'🦀', color:'#508050', hp:48,  atk:10, def:5, spd:2, xp:35,  zone:2, boss:false },
  { id:'bog_wraith',   name:'Bog Wraith',     emoji:'👻', color:'#50a070', hp:38,  atk:13, def:2, spd:5, xp:40,  zone:2, boss:false },
  { id:'fen_colossus', name:'Fen Colossus',   emoji:'🐊', color:'#305030', hp:320, atk:24, def:14,spd:2, xp:250, zone:2, boss:true,
    bossAbility: { name:'Swamp Surge', desc:'Surges forward covering the arena in toxic water!' } },

  // Zone 3 – Sunken Shrine
  { id:'corrupted_knight',name:'Corrupted Knight',emoji:'⚔',color:'#7050a0',hp:80, atk:16, def:8, spd:2, xp:55,  zone:3, boss:false },
  { id:'shrine_warden',name:'Shrine Warden',  emoji:'🔮', color:'#9060c0', hp:65,  atk:18, def:5, spd:3, xp:60,  zone:3, boss:false },
  { id:'eclipse_lord', name:'Eclipse Lord',   emoji:'🌑', color:'#400060', hp:500, atk:32, def:18,spd:3, xp:400, zone:3, boss:true,
    bossAbility: { name:'Eclipse Nova', desc:'Unleashes a devastating void burst that fills the arena!' } },
];

// ── Loot Tables ───────────────────────────────────────────
const LOOT_TABLES = {
  wolf:             [{ id:'frontier_blade',  w:5  }, { id:'scout_leathers', w:3  }],
  bandit:           [{ id:'frontier_blade',  w:8  }, { id:'scout_leathers', w:5  }, { id:'ironbound_vest',  w:3  }],
  shambler:         [{ id:'ironbound_vest',  w:6  }, { id:'scout_leathers', w:4  }],
  wolf_alpha:       [{ id:'fangsplitter_axe',w:10 }, { id:'hardened_brigandine',w:8 }, { id:'hunters_longbow',w:6 }],
  ruin_guard:       [{ id:'ironbound_vest',  w:5  }, { id:'hardened_brigandine',w:3 }, { id:'bastion_shield', w:4 }],
  grave_hound:      [{ id:'hunters_longbow', w:5  }, { id:'hardened_brigandine',w:4 }],
  ore_golem:        [{ id:'runesever',       w:8  }, { id:'wardenplate',      w:8 }, { id:'relicforged_gauntlets',w:6}],
  marsh_crawler:    [{ id:'graveglass_wand', w:5  }, { id:'hardened_brigandine',w:5 }],
  bog_wraith:       [{ id:'stormbinder_bow', w:4  }, { id:'relicforged_gauntlets',w:5}],
  fen_colossus:     [{ id:'stormbinder_bow', w:8  }, { id:'wardenplate',      w:8 }, { id:'arcane_tome',     w:6 }],
  corrupted_knight: [{ id:'runesever',       w:5  }, { id:'wardenplate',      w:5 }, { id:'frostlit_focus',  w:4 }],
  shrine_warden:    [{ id:'frostlit_focus',  w:6  }, { id:'arcane_tome',      w:6 }],
  eclipse_lord:     [{ id:'heartforge_hammer',w:8 }, { id:'skypiercer_bow',   w:8 }, { id:'soulflame_rod',   w:8 }, { id:'titanbone_cuirass',w:10}],
};

// ── Skill XP Table ────────────────────────────────────────
// xpForLevel[lv] = total XP needed to reach lv+1 from lv
function xpForLevel(lv) {
  if (lv < 1) return 0;
  return Math.floor(lv * 80 + Math.pow(lv, 2) * 6);
}
