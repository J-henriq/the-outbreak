// Inventory screen UI

import { RARITY_COLORS } from '../data/items.js';

export class InventoryUI {
  constructor(game) {
    this.game = game;
    this.tooltip = document.getElementById('item-tooltip');
    this._bound = false;
  }

  refresh(inventorySystem, player) {
    if (!inventorySystem || !player) return;
    this._renderGrid(inventorySystem, player);
    this._renderEquipped(player);
    const goldEl = document.getElementById('gold-inv-val');
    if (goldEl) goldEl.textContent = player.gold;
    const countEl = document.getElementById('inv-count');
    if (countEl) countEl.textContent = `${inventorySystem.usedSlots}/40`;
  }

  _renderGrid(inv, player) {
    const grid = document.getElementById('inv-grid');
    if (!grid) return;
    grid.innerHTML = '';

    for (let i = 0; i < inv.MAX_SLOTS; i++) {
      const item = inv.slots[i];
      const slot = document.createElement('div');
      slot.className = 'inv-slot' + (item ? ` occupied rarity-${item.rarity || 'common'}` : '');
      slot.setAttribute('data-index', i);

      if (item) {
        // Draw item canvas
        const canvas = document.createElement('canvas');
        canvas.width = 36; canvas.height = 36;
        canvas.className = 'item-icon';
        const ctx = canvas.getContext('2d');
        inv.renderItemIcon(ctx, item, 0, 0, 36);
        slot.appendChild(canvas);

        if (item.stackable && item.quantity > 1) {
          const qty = document.createElement('span');
          qty.className = 'item-qty';
          qty.textContent = item.quantity;
          slot.appendChild(qty);
        }

        // Tooltip events
        slot.addEventListener('mouseenter', (e) => this._showTooltip(item, e));
        slot.addEventListener('mouseleave', () => this._hideTooltip());

        // Double-click to use/equip
        slot.addEventListener('dblclick', () => {
          if (this.game.inventory) {
            this.game.inventory.useItemAtIndex(i, player);
            this.game.audio.playPickup();
            this.refresh(this.game.inventory, player);
          }
        });
      }
      grid.appendChild(slot);
    }
  }

  _renderEquipped(player) {
    const slots = ['weapon', 'armor', 'helmet', 'boots', 'ring', 'amulet'];
    for (const slot of slots) {
      const item = player.equipped[slot];
      const nameEl = document.getElementById(`eq-${slot}-name`);
      const iconEl = document.getElementById(`eq-${slot}-icon`);

      if (nameEl) nameEl.textContent = item ? item.name : slot.charAt(0).toUpperCase() + slot.slice(1);
      if (nameEl) nameEl.style.color = item ? RARITY_COLORS[item.rarity] || '#fff' : '#666';

      if (iconEl) {
        iconEl.innerHTML = '';
        if (item && this.game.inventory) {
          const canvas = document.createElement('canvas');
          canvas.width = 32; canvas.height = 32;
          const ctx = canvas.getContext('2d');
          this.game.inventory.renderItemIcon(ctx, item, 0, 0, 32);
          iconEl.appendChild(canvas);

          iconEl.addEventListener('mouseenter', (e) => this._showTooltip(item, e));
          iconEl.addEventListener('mouseleave', () => this._hideTooltip());
          iconEl.addEventListener('dblclick', () => {
            this.game.inventory.unequip(slot);
            this.game.audio.playPickup();
            this.refresh(this.game.inventory, player);
          });
        }
      }
    }
  }

  _showTooltip(item, e) {
    if (!this.tooltip) return;
    const rarityColor = RARITY_COLORS[item.rarity] || '#888';
    let stats = '';
    if (item.damage) stats += `<div class="tt-stat">⚔ Damage: +${item.damage}</div>`;
    if (item.defense) stats += `<div class="tt-stat">🛡 Defense: +${item.defense}</div>`;
    if (item.strBonus) stats += `<div class="tt-stat">💪 Strength: +${item.strBonus}</div>`;
    if (item.agiBonus) stats += `<div class="tt-stat">🏃 Agility: +${item.agiBonus}</div>`;
    if (item.magicBonus) stats += `<div class="tt-stat">✨ Magic: +${item.magicBonus}</div>`;
    if (item.endBonus) stats += `<div class="tt-stat">❤ Endurance: +${item.endBonus}</div>`;
    if (item.luckBonus) stats += `<div class="tt-stat">🍀 Luck: +${item.luckBonus}</div>`;
    if (item.manaBonus) stats += `<div class="tt-stat">💧 Mana: +${item.manaBonus}</div>`;
    if (item.heal) stats += `<div class="tt-stat">💊 Restores: ${item.heal} HP</div>`;
    if (item.mana) stats += `<div class="tt-stat">💙 Restores: ${item.mana} MP</div>`;

    this.tooltip.innerHTML = `
      <div class="tt-name" style="color:${rarityColor}">${item.name}</div>
      <div class="tt-type">${item.rarity?.toUpperCase()} ${item.type?.toUpperCase()}${item.subtype ? ' · ' + item.subtype.toUpperCase() : ''}</div>
      ${stats}
      <div class="tt-desc">${item.desc || ''}</div>
      <div style="color:#ffcc44;font-size:10px;margin-top:4px;">Value: ${item.value}g</div>
    `;
    this.tooltip.style.display = 'block';
    const rect = e.target.getBoundingClientRect();
    const container = document.getElementById('game-container').getBoundingClientRect();
    let tx = rect.right - container.left + 6;
    let ty = rect.top - container.top;
    if (tx + 180 > 800) tx = rect.left - container.left - 186;
    this.tooltip.style.left = tx + 'px';
    this.tooltip.style.top = ty + 'px';
  }

  _hideTooltip() {
    if (this.tooltip) this.tooltip.style.display = 'none';
  }
}

export default InventoryUI;
