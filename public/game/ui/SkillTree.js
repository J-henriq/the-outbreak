// Skill tree UI rendered on a canvas

import { SKILLS, SKILL_TYPE } from '../data/skills.js';

export class SkillTreeUI {
  constructor(game) {
    this.game = game;
    this.currentTree = 'warrior';
    this.canvas = null;
    this.ctx = null;
  }

  setTree(tree) {
    this.currentTree = tree;
    if (this.game.skill && this.game.player) {
      this.refresh(this.game.skill, this.game.player);
    }
  }

  refresh(skillSystem, player) {
    this.canvas = document.getElementById('skill-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this._render(skillSystem, player);
    this._bindClicks(skillSystem, player);

    const ptsEl = document.getElementById('skill-pts');
    if (ptsEl && player) ptsEl.textContent = player.skillPoints;
  }

  _render(skillSystem, player) {
    const ctx = this.ctx;
    const w = this.canvas.width, h = this.canvas.height;
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, w, h);

    // Draw tree title
    const treeNames = { warrior: '⚔ WARRIOR TREE', archer: '🏹 ARCHER TREE', mage: '✦ MAGE TREE' };
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 14px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText(treeNames[this.currentTree] || '', w / 2, 24);
    ctx.textAlign = 'left';

    // Get skills for current tree
    const treeSkills = Object.values(SKILLS).filter(s => s.tree === this.currentTree);

    // Draw connection lines first
    ctx.strokeStyle = '#2a2a4a';
    ctx.lineWidth = 2;
    for (const skill of treeSkills) {
      if (skill.requires) {
        const parent = SKILLS[skill.requires];
        if (parent && parent.tree === this.currentTree) {
          ctx.beginPath();
          ctx.moveTo(parent.position.x + 40, parent.position.y + 40);
          ctx.lineTo(skill.position.x + 40, skill.position.y + 40);
          ctx.stroke();
        }
      }
    }

    // Draw skill nodes
    for (const skill of treeSkills) {
      this._drawSkillNode(ctx, skill, skillSystem, player);
    }
  }

  _drawSkillNode(ctx, skill, skillSystem, player) {
    const { x, y } = skill.position;
    const level = skillSystem.getSkillLevel(skill.id);
    const canLearn = skillSystem.canLearn(skill.id);
    const maxed = level >= skill.maxLevel;
    const size = 80;

    // Background
    ctx.fillStyle = maxed ? '#2a1a0a' : (level > 0 ? '#1a2a1a' : '#0d0d1a');
    ctx.fillRect(x, y, size, size);

    // Border
    ctx.strokeStyle = maxed ? '#ff8800' : (level > 0 ? '#44aa44' : (canLearn ? '#6666cc' : '#2a2a4a'));
    ctx.lineWidth = maxed ? 2.5 : (level > 0 ? 2 : 1.5);
    ctx.strokeRect(x, y, size, size);

    // Skill icon (colored circle)
    ctx.fillStyle = skill.icon_color;
    ctx.globalAlpha = level > 0 ? 1.0 : 0.4;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + 22, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Type badge
    ctx.fillStyle = skill.type === SKILL_TYPE.PASSIVE ? '#334488' : '#883344';
    ctx.fillRect(x + 2, y + 2, skill.type === SKILL_TYPE.PASSIVE ? 44 : 36, 12);
    ctx.fillStyle = '#aaa';
    ctx.font = '8px "Courier New"';
    ctx.fillText(skill.type === SKILL_TYPE.PASSIVE ? 'PASSIVE' : 'ACTIVE', x + 4, y + 11);

    // Name
    ctx.fillStyle = level > 0 ? '#fff' : '#888';
    ctx.font = `bold 9px "Courier New"`;
    ctx.textAlign = 'center';
    const words = skill.name.split(' ');
    let line = '';
    let lineY = y + 46;
    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > size - 6 && line) {
        ctx.fillText(line.trim(), x + size / 2, lineY);
        line = word + ' ';
        lineY += 11;
      } else line = test;
    }
    if (line) ctx.fillText(line.trim(), x + size / 2, lineY);
    ctx.textAlign = 'left';

    // Level display
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 10px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText(`${level}/${skill.maxLevel}`, x + size / 2, y + size - 6);
    ctx.textAlign = 'left';

    // Mana cost for active skills
    if (skill.type === SKILL_TYPE.ACTIVE && skill.manaCost) {
      ctx.fillStyle = '#4488ff';
      ctx.font = '8px "Courier New"';
      ctx.textAlign = 'right';
      ctx.fillText(`${skill.manaCost}MP`, x + size - 3, y + size - 6);
      ctx.textAlign = 'left';
    }

    // Can learn indicator
    if (canLearn) {
      ctx.fillStyle = 'rgba(100,200,100,0.15)';
      ctx.fillRect(x, y, size, size);
    }

    // Store position for click detection
    skill._renderBounds = { x, y, w: size, h: size };
  }

  _bindClicks(skillSystem, player) {
    if (!this.canvas) return;
    const handler = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const treeSkills = Object.values(SKILLS).filter(s => s.tree === this.currentTree);
      for (const skill of treeSkills) {
        if (!skill._renderBounds) continue;
        const { x, y, w, h } = skill._renderBounds;
        if (mx >= x && mx <= x + w && my >= y && my <= y + h) {
          if (skillSystem.canLearn(skill.id)) {
            skillSystem.learnSkill(skill.id);
            this.game.audio.playLevelUp();
            this.refresh(skillSystem, player);
          } else if (skillSystem.getSkillLevel(skill.id) > 0) {
            // Already learned - show description
          }
          break;
        }
      }
    };
    this.canvas.removeEventListener('click', this._clickHandler);
    this._clickHandler = handler;
    this.canvas.addEventListener('click', this._clickHandler);
  }
}

export default SkillTreeUI;
