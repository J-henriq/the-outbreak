/**
 * Arcane Engineers - Leaderboard System
 * Tracks and displays high scores, fastest clears, and achievements
 */

class LeaderboardSystem {
  constructor() {
    this.storageKey = 'arcaneEngineers_leaderboard';
    this.data = this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // Storage not available
    }
    return {
      fastestClears: [],
      highScores: [],
      rareFinds: [],
      bestTeamCombos: []
    };
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      // Storage not available
    }
  }

  submitRun(runData) {
    const entry = {
      playerName: runData.playerName || 'Unknown',
      playerClass: runData.playerClass,
      level: runData.level,
      dungeonLevel: runData.dungeonLevel,
      time: runData.time,
      score: runData.score,
      kills: runData.kills,
      teamSize: runData.teamSize || 1,
      timestamp: Date.now()
    };

    // Fastest clears
    this.data.fastestClears.push(entry);
    this.data.fastestClears.sort((a, b) => a.time - b.time);
    this.data.fastestClears = this.data.fastestClears.slice(0, 10);

    // High scores
    this.data.highScores.push(entry);
    this.data.highScores.sort((a, b) => b.score - a.score);
    this.data.highScores = this.data.highScores.slice(0, 10);

    this.save();
    return this.getRank(entry);
  }

  getRank(entry) {
    const scoreRank = this.data.highScores.findIndex(e => e.timestamp === entry.timestamp) + 1;
    const timeRank = this.data.fastestClears.findIndex(e => e.timestamp === entry.timestamp) + 1;
    return { scoreRank, timeRank };
  }

  addRareFind(playerName, itemName, rarity, dungeonLevel) {
    this.data.rareFinds.push({
      playerName,
      itemName,
      rarity,
      dungeonLevel,
      timestamp: Date.now()
    });
    this.data.rareFinds.sort((a, b) => {
      const rarityOrder = { LEGENDARY: 0, EPIC: 1, RARE: 2, UNCOMMON: 3, COMMON: 4 };
      const aOrder = rarityOrder[a.rarity] !== undefined ? rarityOrder[a.rarity] : 4;
      const bOrder = rarityOrder[b.rarity] !== undefined ? rarityOrder[b.rarity] : 4;
      return aOrder - bOrder;
    });
    this.data.rareFinds = this.data.rareFinds.slice(0, 10);
    this.save();
  }

  getFormattedTime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  clear() {
    this.data = { fastestClears: [], highScores: [], rareFinds: [], bestTeamCombos: [] };
    this.save();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LeaderboardSystem;
}
