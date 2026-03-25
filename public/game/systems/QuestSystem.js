// Quest tracking and progression system
import { QUESTS, QUEST_STATUS, OBJECTIVE_TYPE } from '../data/quests.js';

export class QuestSystem {
  constructor() {
    this.quests = {};
    this.player = null;
    this._callbacks = [];
  }

  init(player) {
    this.player = player;
    // Initialize all quests
    for (const [id, def] of Object.entries(QUESTS)) {
      this.quests[id] = {
        id, status: QUEST_STATUS.LOCKED,
        objectives: def.objectives.map(o => ({ ...o, current: 0 })),
        def
      };
    }
    // First quest always available
    this.quests['awakening'].status = QUEST_STATUS.AVAILABLE;
  }

  activateQuest(id) {
    const q = this.quests[id];
    if (!q || q.status === QUEST_STATUS.ACTIVE || q.status === QUEST_STATUS.COMPLETED) return false;
    q.status = QUEST_STATUS.ACTIVE;
    return true;
  }

  getQuest(id) { return this.quests[id] || null; }

  getActiveQuests() {
    return Object.values(this.quests).filter(q => q.status === QUEST_STATUS.ACTIVE);
  }

  getCompletedQuests() {
    return Object.values(this.quests).filter(q => q.status === QUEST_STATUS.COMPLETED);
  }

  getAvailableQuests() {
    return Object.values(this.quests).filter(q => q.status === QUEST_STATUS.AVAILABLE);
  }

  canComplete(id) {
    const q = this.quests[id];
    if (!q || q.status !== QUEST_STATUS.ACTIVE) return false;
    return q.objectives.every(o => o.current >= o.count);
  }

  completeQuest(id, inventory) {
    if (!this.canComplete(id)) return false;
    const q = this.quests[id];
    q.status = QUEST_STATUS.COMPLETED;

    // Give rewards
    const rewards = q.def.rewards;
    if (rewards.xp && this.player) this.player.addXP(rewards.xp);
    if (rewards.gold && this.player) this.player.gold += rewards.gold;
    if (rewards.items && inventory) {
      for (const r of rewards.items) {
        const item = { id: r.id, quantity: r.qty };
        inventory.addItem(item);
      }
    }

    // Unlock next quest
    if (q.def.nextQuest) {
      const next = this.quests[q.def.nextQuest];
      if (next) next.status = QUEST_STATUS.AVAILABLE;
    }

    this._fireCallbacks('complete', { questId: id, rewards });
    return true;
  }

  onEnemyKilled(enemyType, player) {
    for (const q of this.getActiveQuests()) {
      for (const obj of q.objectives) {
        if (obj.type === OBJECTIVE_TYPE.KILL && obj.target === enemyType && obj.current < obj.count) {
          obj.current++;
          this._fireCallbacks('progress', { questId: q.id, objective: obj });
        }
      }
    }
  }

  onItemCollected(itemId) {
    for (const q of this.getActiveQuests()) {
      for (const obj of q.objectives) {
        if (obj.type === OBJECTIVE_TYPE.COLLECT && obj.target === itemId && obj.current < obj.count) {
          obj.current++;
          this._fireCallbacks('progress', { questId: q.id, objective: obj });
        }
      }
    }
  }

  onNPCTalked(npcType) {
    for (const q of this.getActiveQuests()) {
      for (const obj of q.objectives) {
        if (obj.type === OBJECTIVE_TYPE.TALK && obj.target === npcType && obj.current < obj.count) {
          obj.current = 1;
          this._fireCallbacks('progress', { questId: q.id, objective: obj });
        }
      }
    }
  }

  onZoneReached(zone) {
    for (const q of this.getActiveQuests()) {
      for (const obj of q.objectives) {
        if (obj.type === OBJECTIVE_TYPE.REACH && obj.target === zone && obj.current < obj.count) {
          obj.current = 1;
          this._fireCallbacks('progress', { questId: q.id, objective: obj });
        }
      }
    }
  }

  update(player, enemies) {
    // Auto-check collect objectives via player inventory is handled externally
  }

  onCallback(fn) { this._callbacks.push(fn); }
  _fireCallbacks(type, data) { this._callbacks.forEach(fn => fn(type, data)); }

  getSerializable() {
    const result = { active: [], completed: [] };
    for (const [id, q] of Object.entries(this.quests)) {
      if (q.status === QUEST_STATUS.ACTIVE) {
        result.active.push({ id, objectives: q.objectives.map(o => ({ current: o.current })) });
      } else if (q.status === QUEST_STATUS.COMPLETED) {
        result.completed.push(id);
      }
    }
    return result;
  }

  loadFromData(data) {
    if (data.completed) {
      for (const id of data.completed) {
        if (this.quests[id]) this.quests[id].status = QUEST_STATUS.COMPLETED;
      }
    }
    if (data.active) {
      for (const aq of data.active) {
        const q = this.quests[aq.id];
        if (q) {
          q.status = QUEST_STATUS.ACTIVE;
          for (let i = 0; i < q.objectives.length; i++) {
            if (aq.objectives[i]) q.objectives[i].current = aq.objectives[i].current;
          }
        }
      }
    }
    // Unlock available quests
    for (const [id, q] of Object.entries(this.quests)) {
      if (q.status === QUEST_STATUS.COMPLETED && q.def.nextQuest) {
        const next = this.quests[q.def.nextQuest];
        if (next && next.status === QUEST_STATUS.LOCKED) next.status = QUEST_STATUS.AVAILABLE;
      }
    }
  }
}

export default QuestSystem;
