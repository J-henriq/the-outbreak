// ─────────────────────────────────────────────────────────
//  ASHENWILD  –  Skill System
// ─────────────────────────────────────────────────────────

class Skills {
  constructor(raceBonuses) {
    this.race = raceBonuses || {};

    // Each skill: level 1-99, current XP in this level
    const make = () => ({ lv: 1, xp: 0 });
    this.attack   = make();
    this.strength = make();
    this.agility  = make();
    this.prayer   = make();

    // Listeners for level-up events
    this._onLevelUp = null;
  }

  onLevelUp(fn) { this._onLevelUp = fn; }

  // Add XP to a skill; returns true if leveled up
  addXP(skillName, amount) {
    const sk = this[skillName];
    if (!sk) return false;
    if (sk.lv >= CFG.SKILL_MAX_LV) return false;

    // Apply race bonuses
    let mult = 1;
    if (skillName === 'agility'  && this.race.agilityXP) mult += this.race.agilityXP;
    if (skillName === 'strength' && this.race.strXP)     mult += this.race.strXP;
    if (this.race.allXP && sk.lv < 50) mult += this.race.allXP;

    sk.xp += Math.ceil(amount * mult);
    let leveled = false;

    while (sk.lv < CFG.SKILL_MAX_LV && sk.xp >= xpForLevel(sk.lv)) {
      sk.xp -= xpForLevel(sk.lv);
      sk.lv++;
      leveled = true;
      if (this._onLevelUp) this._onLevelUp(skillName, sk.lv);
    }
    return leveled;
  }

  // Progress 0..1 within current level
  progress(skillName) {
    const sk = this[skillName];
    if (!sk) return 0;
    if (sk.lv >= CFG.SKILL_MAX_LV) return 1;
    const needed = xpForLevel(sk.lv);
    return needed > 0 ? Math.min(sk.xp / needed, 1) : 0;
  }

  // Combat stat bonuses from skills
  atkBonus()   { return (this.attack.lv   - 1) * 0.5; }
  dmgBonus()   { return (this.strength.lv - 1) * 0.6; }
  spdBonus()   { return (this.agility.lv  - 1) * 0.04; }
  prayerLv()   { return this.prayer.lv; }
}
