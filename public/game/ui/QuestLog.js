// Quest log UI

import { QUEST_STATUS } from '../data/quests.js';

export class QuestLogUI {
  constructor(game) {
    this.game = game;
    this.selectedQuest = null;
  }

  refresh(questSystem) {
    if (!questSystem) return;
    this._renderList(questSystem);
  }

  _renderList(questSystem) {
    const activeContainer = document.getElementById('quest-list-active');
    const completedContainer = document.getElementById('quest-list-completed');
    if (!activeContainer || !completedContainer) return;

    activeContainer.innerHTML = '';
    completedContainer.innerHTML = '';

    const active = questSystem.getActiveQuests();
    const completed = questSystem.getCompletedQuests();
    const available = questSystem.getAvailableQuests();

    // Available quests (show as available, not active)
    for (const q of available) {
      const el = this._createQuestItem(q, 'available');
      el.addEventListener('click', () => this._showDetail(q));
      activeContainer.appendChild(el);
    }

    // Active quests
    for (const q of active) {
      const el = this._createQuestItem(q, 'active-quest');
      el.addEventListener('click', () => this._showDetail(q));
      activeContainer.appendChild(el);
    }

    if (activeContainer.children.length === 0) {
      activeContainer.innerHTML = '<div style="color:#444;font-size:11px;padding:8px;">No active quests</div>';
    }

    // Completed quests
    for (const q of completed) {
      const el = this._createQuestItem(q, 'completed-quest');
      el.addEventListener('click', () => this._showDetail(q));
      completedContainer.appendChild(el);
    }

    if (completedContainer.children.length === 0) {
      completedContainer.innerHTML = '<div style="color:#444;font-size:11px;padding:8px;">None completed</div>';
    }
  }

  _createQuestItem(q, extraClass = '') {
    const el = document.createElement('div');
    el.className = `quest-item ${extraClass}`;
    const status = q.status === QUEST_STATUS.COMPLETED ? '✓ ' : (q.status === QUEST_STATUS.ACTIVE ? '▶ ' : '○ ');
    el.innerHTML = `<div class="quest-name">${status}${q.def.name}</div><div class="quest-desc">Chapter ${q.def.chapter}</div>`;
    return el;
  }

  _showDetail(q) {
    const detail = document.getElementById('quest-detail');
    if (!detail) return;

    const statusColor = { active: '#ffcc44', completed: '#44cc44', available: '#8888ff', locked: '#666' };
    const sc = statusColor[q.status] || '#fff';

    let objectivesHTML = '';
    for (const obj of q.objectives) {
      const done = obj.current >= obj.count;
      const prog = q.status === QUEST_STATUS.ACTIVE ? ` (${obj.current}/${obj.count})` : '';
      objectivesHTML += `<div class="quest-objective" style="color:${done ? '#44cc44' : '#aabb88'}">${done ? '✓' : '○'} ${obj.description}${prog}</div>`;
    }

    const rewards = q.def.rewards;
    let rewardsHTML = `<span style="color:#ffcc44">+${rewards.xp} XP</span>  <span style="color:#ffcc44">+${rewards.gold} Gold</span>`;
    if (rewards.items?.length) {
      rewardsHTML += ' · Items: ' + rewards.items.map(r => r.id.replace(/_/g, ' ')).join(', ');
    }

    detail.innerHTML = `
      <div style="color:${sc};font-size:14px;font-weight:bold;margin-bottom:8px;">
        ${q.def.name} <span style="font-size:10px;color:#888;">· Chapter ${q.def.chapter}</span>
      </div>
      <div style="color:#888;font-size:11px;font-style:italic;margin-bottom:10px;">"${q.def.lore}"</div>
      <div style="color:#ccc;font-size:11px;margin-bottom:12px;">${q.def.description}</div>
      <div style="font-size:11px;color:#aaa;margin-bottom:6px;">OBJECTIVES:</div>
      ${objectivesHTML}
      <div style="font-size:11px;color:#aaa;margin-top:12px;margin-bottom:4px;">REWARDS:</div>
      <div class="quest-reward">${rewardsHTML}</div>
    `;
  }
}

export default QuestLogUI;
