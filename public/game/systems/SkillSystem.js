// Skill tree management and active skill activation
import { SKILLS, SKILL_TYPE } from '../data/skills.js';

export class SkillSystem {
  constructor() {
    this.learnedSkills = {}; // id -> level
    this.player = null;
    this.activeEffects = {}; // id -> { remaining, data }
  }

  init(player) {
    this.player = player;
    this.learnedSkills = {};
    this.activeEffects = {};
  }

  canLearn(skillId) {
    const def = SKILLS[skillId];
    if (!def) return false;
    const currentLevel = this.learnedSkills[skillId] || 0;
    if (currentLevel >= def.maxLevel) return false;
    if (!this.player || this.player.skillPoints < def.cost) return false;
    if (def.requires && !this.learnedSkills[def.requires]) return false;
    return true;
  }

  learnSkill(skillId) {
    if (!this.canLearn(skillId)) return false;
    const def = SKILLS[skillId];
    const prev = this.learnedSkills[skillId] || 0;
    this.learnedSkills[skillId] = prev + 1;
    this.player.skillPoints -= def.cost;
    this._applyPassiveBonuses();
    return true;
  }

  _applyPassiveBonuses() {
    if (!this.player) return;
    const bonuses = {
      meleeDamageBonus: 0, rangedDamageBonus: 0, magicDamageBonus: 0,
      damageReduction: 0, cooldownReduction: 0, critBonus: 0,
      maxHPBonus: 0, maxManaBonus: 0, manaCostReduction: 0
    };

    for (const [id, level] of Object.entries(this.learnedSkills)) {
      const def = SKILLS[id];
      if (!def || def.type !== SKILL_TYPE.PASSIVE) continue;
      const effects = def.effects(level);
      for (const [key, val] of Object.entries(effects)) {
        if (bonuses[key] !== undefined) bonuses[key] += val;
      }
    }

    this.player.applySkillBonuses(bonuses);
  }

  // Activate an active skill
  activateSkill(skillId, player, enemies, projectiles, combat, audio) {
    const def = SKILLS[skillId];
    if (!def || def.type !== SKILL_TYPE.ACTIVE) return null;
    if (!this.learnedSkills[skillId]) return null;

    if (!player.useMana(def.manaCost || 0)) return null;

    const results = [];

    if (skillId === 'berserker_rage') {
      player.statusEffects.berserker = { duration: def.duration / 1000, damageMultiplier: 1.5 };
      if (audio) audio.playMagic();
    } else if (skillId === 'war_cry') {
      for (const e of enemies) {
        if (player.distanceTo(e) < (def.aoe || 128)) {
          e.applyStun(2.0);
          results.push({ damage: 0, x: e.x, y: e.y, color: '#ffff88' });
        }
      }
      if (audio) audio.playMagic();
    } else if (skillId === 'rain_of_arrows') {
      if (player.useMana && combat) {
        for (const e of enemies) {
          const dmg = Math.floor(player.rangedDamage * (1 + player.skillBonuses.rangedDamageBonus));
          const actual = e.takeDamage(dmg);
          results.push({ damage: actual, x: e.x, y: e.y, killed: e.hp <= 0 ? e : null, enemy: e, color: '#88ff44' });
        }
      }
      if (audio) audio.playArrow();
    } else if (skillId === 'shadow_step') {
      player.iframes = 0.5;
      if (audio) audio.playMagic();
    } else if (skillId === 'arcane_nova') {
      if (combat) {
        for (const e of enemies) {
          if (player.distanceTo(e) < (def.aoe || 200)) {
            const dmg = Math.floor(player.magicDamage * 3 * (1 + player.skillBonuses.magicDamageBonus));
            const actual = e.takeDamage(dmg);
            results.push({ damage: actual, x: e.x, y: e.y, killed: e.hp <= 0 ? e : null, enemy: e, color: '#aa22ff' });
          }
        }
      }
      if (audio) audio.playMagic();
    } else if (skillId === 'time_warp') {
      for (const e of enemies) {
        e.applySlow(0.5, def.duration || 5000);
      }
      if (audio) audio.playMagic();
    }

    return results.length > 0 ? results : null;
  }

  getSkillLevel(id) { return this.learnedSkills[id] || 0; }

  getSerializable() {
    return Object.entries(this.learnedSkills).map(([id, level]) => ({ id, level }));
  }

  loadFromData(data) {
    this.learnedSkills = {};
    for (const s of data) this.learnedSkills[s.id] = s.level;
    this._applyPassiveBonuses();
  }
}

export default SkillSystem;
