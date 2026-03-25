// NPC entity for quest givers

import { Entity } from './Entity.js';

const NPC_CONFIGS = {
  elder: {
    name: 'Elder Merin', color: '#ccaa44',
    questId: 'awakening',
    dialog: [
      "Ah, traveler! You've arrived just in time.",
      "Strange creatures have been emerging from the dungeon to the south.",
      "The Outbreak spreads... I fear the ancient dragon stirs once more.",
      "Please, brave hero - venture forth and protect our town!"
    ]
  },
  guard: {
    name: 'Captain Aldric', color: '#7788aa',
    questId: 'skeleton_threat',
    dialog: [
      "Halt! ...Oh, the Elder's chosen hero. Good.",
      "Skeleton warriors have been rising from the old catacombs.",
      "We need someone to venture into the dungeon and clear them out.",
      "Are you up for the task?"
    ]
  },
  wizard: {
    name: 'Wizard Zara', color: '#8844cc',
    questId: 'ancient_magic',
    dialog: [
      "Fascinating... you can actually feel the magical corruption, can't you?",
      "The Outbreak traces back to an ancient dragon deep beneath the dungeon.",
      "I've been researching ways to stop it. Magic Crystals hold the key.",
      "Bring me three crystals and I can craft a seal powerful enough to bind the beast."
    ]
  },
  merchant: {
    name: 'Trader Finn', color: '#cc8844',
    questId: null,
    dialog: [
      "Welcome, adventurer! Looking to buy or sell?",
      "I've got quality goods at reasonable prices!",
      "Stock up before heading into the dungeon - it's dangerous down there.",
      "Come back with loot and I'll give you a fair price!"
    ]
  }
};

export class NPC extends Entity {
  constructor(type, x, y, name) {
    const cfg = NPC_CONFIGS[type] || NPC_CONFIGS.merchant;
    super({ x, y, width: 28, height: 32 });
    this.type = type;
    this.name = name || cfg.name;
    this.color = cfg.color;
    this.questId = cfg.questId;
    this.dialog = cfg.dialog;
    this.dialogIndex = 0;
    this.hasQuest = !!cfg.questId;
    this.questComplete = false;
    this.isMerchant = type === 'merchant';
  }

  getNextDialog() {
    const line = this.dialog[this.dialogIndex % this.dialog.length];
    this.dialogIndex++;
    return line;
  }

  resetDialog() { this.dialogIndex = 0; }

  updateQuestState(questSystem) {
    if (!this.questId) return;
    const quest = questSystem.getQuest(this.questId);
    if (!quest) return;
    this.hasQuest = quest.status === 'available';
    this.questComplete = quest.status === 'active' && questSystem.canComplete(this.questId);
  }
}

export default NPC;
