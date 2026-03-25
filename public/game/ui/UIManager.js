// Main UI controller - coordinates all UI screens and the HUD
import { HUD } from './HUD.js';
import { InventoryUI } from './Inventory.js';
import { SkillTreeUI } from './SkillTree.js';
import { QuestLogUI } from './QuestLog.js';
import { CharacterSheetUI } from './CharacterSheet.js';
import { GAME_STATE } from '../engine/Game.js';
import { QUEST_STATUS } from '../data/quests.js';

export class UIManager {
  constructor(game) {
    this.game = game;
    this.hud = new HUD(game);
    this.inventoryUI = new InventoryUI(game);
    this.skillTreeUI = new SkillTreeUI(game);
    this.questLogUI = new QuestLogUI(game);
    this.charSheetUI = new CharacterSheetUI(game);
    this.notifications = [];
    this.dialogActive = false;
    this.chatVisible = false;
  }

  init() {
    // Close buttons
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const screenId = btn.getAttribute('data-close');
        document.getElementById(screenId).classList.remove('active');
        if (this.game.state !== GAME_STATE.PLAYING) {
          this.game.setState(GAME_STATE.PLAYING);
        }
      });
    });

    // Keyboard shortcuts for toggling panels
    window.addEventListener('keydown', (e) => this._handleKeyShortcuts(e));

    // Main menu buttons
    document.getElementById('btn-new-game')?.addEventListener('click', () => {
      this.game.audio.playMenuSelect();
      this._showCharCreation();
    });

    document.getElementById('btn-continue')?.addEventListener('click', () => {
      this.game.audio.playMenuSelect();
      if (this.game.save.hasSave()) {
        document.getElementById('menu-screen').classList.remove('active');
        this.game.loadGame();
      } else {
        this.showNotification('No save found!', '#ff4444');
      }
    });

    document.getElementById('btn-about')?.addEventListener('click', () => {
      this.game.audio.playMenuSelect();
      this.showNotification('WASD: Move | Z/Click: Attack | I: Inventory | K: Skills | J: Quests | C: Character | Enter: Chat | E: Interact', '#88aaff', 6000);
    });

    document.getElementById('btn-back-menu')?.addEventListener('click', () => {
      document.getElementById('char-create-screen').classList.remove('active');
      document.getElementById('menu-screen').classList.add('active');
    });

    // Check if save exists for continue button
    const continueBtn = document.getElementById('btn-continue');
    if (continueBtn && !this.game.save.hasSave()) {
      continueBtn.style.opacity = '0.5';
    }

    // Character creation class selection
    document.querySelectorAll('.class-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.game.audio.playMenuSelect();
      });
    });

    // Start game button
    document.getElementById('btn-start-game')?.addEventListener('click', () => {
      const name = document.getElementById('char-name').value.trim() || 'Hero';
      const selectedClass = document.querySelector('.class-card.selected')?.getAttribute('data-class') || 'warrior';
      document.getElementById('char-create-screen').classList.remove('active');
      this.game.audio.playMenuSelect();
      this.game.startGame(name, selectedClass);
    });

    // Stat up buttons
    document.querySelectorAll('.stat-up-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const stat = btn.getAttribute('data-stat');
        if (this.game.player && this.game.player.spendStatPoint(stat)) {
          this.game.audio.playPickup();
          this.charSheetUI.refresh(this.game.player);
        }
      });
    });

    // Chat
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Enter') {
        if (!this.chatVisible) {
          this._showChatInput();
          e.preventDefault();
        }
      }
    });

    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => {
        if (e.code === 'Enter') {
          const msg = chatInput.value.trim();
          if (msg) {
            this.game.network.sendChat(msg);
            chatInput.value = '';
          }
          this._hideChatInput();
          e.preventDefault();
        }
        if (e.code === 'Escape') {
          chatInput.value = '';
          this._hideChatInput();
        }
      });
    }

    // Quest system callbacks
    if (this.game.quest) {
      this.game.quest.onCallback((type, data) => {
        if (type === 'complete') {
          this.game.audio.playQuestComplete();
          const q = this.game.quest.getQuest(data.questId);
          this.showNotification(`Quest Complete: "${q.def.name}"! XP: ${data.rewards.xp}, Gold: ${data.rewards.gold}`, '#ffcc00', 5000);
          this.questLogUI.refresh(this.game.quest);
        } else if (type === 'progress') {
          this.questLogUI.refresh(this.game.quest);
        }
      });
    }

    // Skill tree tabs
    document.querySelectorAll('#skill-tree-tabs .btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#skill-tree-tabs .btn').forEach(b => b.classList.remove('active-tab'));
        btn.classList.add('active-tab');
        const tree = btn.getAttribute('data-tree');
        if (this.skillTreeUI) this.skillTreeUI.setTree(tree);
        this.game.audio.playMenuSelect();
      });
    });
  }

  _handleKeyShortcuts(e) {
    if (e.target.tagName === 'INPUT') return;
    if (!this.game.player) return;

    switch (e.code) {
      case 'KeyI':
        this._toggleScreen('inventory-screen', GAME_STATE.INVENTORY);
        this.inventoryUI.refresh(this.game.inventory, this.game.player);
        break;
      case 'KeyK':
        this._toggleScreen('skill-tree-screen', GAME_STATE.SKILL_TREE);
        this.skillTreeUI.refresh(this.game.skill, this.game.player);
        break;
      case 'KeyJ':
        this._toggleScreen('quest-log-screen', GAME_STATE.QUEST_LOG);
        this.questLogUI.refresh(this.game.quest);
        break;
      case 'KeyC':
        this._toggleScreen('character-screen', GAME_STATE.CHARACTER_SHEET);
        this.charSheetUI.refresh(this.game.player);
        break;
      case 'Escape':
        this._closeAllScreens();
        break;
    }
  }

  _toggleScreen(id, state) {
    const el = document.getElementById(id);
    if (!el) return;
    const isOpen = el.classList.contains('active');
    this._closeAllScreens();
    if (!isOpen) {
      el.classList.add('active');
      this.game.setState(state);
      this.game.audio.playMenuSelect();
    }
  }

  _closeAllScreens() {
    ['inventory-screen', 'skill-tree-screen', 'quest-log-screen', 'character-screen'].forEach(id => {
      document.getElementById(id)?.classList.remove('active');
    });
    if ([GAME_STATE.INVENTORY, GAME_STATE.SKILL_TREE, GAME_STATE.QUEST_LOG, GAME_STATE.CHARACTER_SHEET].includes(this.game.state)) {
      this.game.setState(GAME_STATE.PLAYING);
    }
  }

  _showCharCreation() {
    document.getElementById('menu-screen').classList.remove('active');
    document.getElementById('char-create-screen').classList.add('active');
  }

  showGame() {
    document.getElementById('menu-screen')?.classList.remove('active');
    document.getElementById('char-create-screen')?.classList.remove('active');
    document.getElementById('hud').style.display = '';
    document.getElementById('action-bar').style.display = '';
    document.getElementById('chat-box').style.display = '';
  }

  updateHUD(player) {
    this.hud.update(player);
    // Update action bar
    this._updateActionBar(player);
    // Update notification timers
    this._tickNotifications();
  }

  _updateActionBar(player) {
    for (let i = 0; i < 8; i++) {
      const slot = document.getElementById(`slot-${i + 1}`);
      if (!slot) continue;
      const data = player.actionBar[i];
      // Clear slot visual
      const canvas = slot.querySelector('canvas') || document.createElement('canvas');
      canvas.width = 36; canvas.height = 36;
      canvas.style.cssText = 'position:absolute;top:4px;left:4px;';
      if (!slot.querySelector('canvas')) slot.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 36, 36);

      if (data && data.type === 'spell') {
        const spellColors = { fireball: '#ff6600', ice_lance: '#88ccff', heal: '#44ff88', lightning_bolt: '#ffff44' };
        ctx.fillStyle = spellColors[data.id] || '#8844ff';
        ctx.beginPath(); ctx.arc(18, 18, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = '8px Courier New'; ctx.textAlign = 'center';
        ctx.fillText(data.id.split('_')[0].substr(0, 4), 18, 21);
        ctx.textAlign = 'left';
      }
    }
  }

  showNPCDialog(npc, questSystem, player) {
    if (this.dialogActive) return;
    this.dialogActive = true;

    // Update quest states
    npc.updateQuestState(questSystem);

    const line = npc.getNextDialog();
    this.showNotification(`[${npc.name}]: "${line}"`, '#ffcc88', 4000);

    // Quest interaction
    if (npc.hasQuest && npc.questId) {
      questSystem.activateQuest(npc.questId);
      questSystem.onNPCTalked(npc.type);
      this.showNotification(`New Quest: "${questSystem.getQuest(npc.questId).def.name}"`, '#ffcc00', 3000);
    } else if (npc.questComplete && npc.questId) {
      questSystem.completeQuest(npc.questId, this.game.inventory);
    }

    setTimeout(() => { this.dialogActive = false; }, 1000);
  }

  showNotification(text, color = '#ffffff', duration = 2500) {
    const container = document.getElementById('notifications');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'notif';
    el.style.color = color;
    el.textContent = text;
    container.appendChild(el);
    this.notifications.push({ el, timer: duration / 1000 });
  }

  _tickNotifications() {
    const dt = 1 / 60;
    for (let i = this.notifications.length - 1; i >= 0; i--) {
      const n = this.notifications[i];
      n.timer -= dt;
      if (n.timer <= 0) {
        n.el.remove();
        this.notifications.splice(i, 1);
      } else if (n.timer < 0.5) {
        n.el.style.opacity = (n.timer / 0.5).toString();
      }
    }
  }

  addChatMessage(name, message, isSystem = false) {
    const box = document.getElementById('chat-box');
    if (!box) return;
    const div = document.createElement('div');
    div.className = 'chat-msg';
    if (isSystem) {
      div.innerHTML = `<span class="chat-system">${message}</span>`;
    } else {
      div.innerHTML = `<span class="chat-name">${name}:</span> ${message}`;
    }
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
    // Limit chat history
    while (box.children.length > 50) box.removeChild(box.firstChild);
  }

  _showChatInput() {
    const wrap = document.getElementById('chat-input-wrap');
    const input = document.getElementById('chat-input');
    if (wrap && input) {
      this.chatVisible = true;
      wrap.style.display = 'block';
      input.focus();
    }
  }

  _hideChatInput() {
    const wrap = document.getElementById('chat-input-wrap');
    if (wrap) { wrap.style.display = 'none'; this.chatVisible = false; }
  }
}

export default UIManager;
