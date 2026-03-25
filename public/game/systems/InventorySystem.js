// Inventory, equipment, and loot management
import { ITEM_TYPE, RARITY_COLORS, createItem } from '../data/items.js';

export class InventorySystem {
  constructor() {
    this.slots = new Array(40).fill(null);
    this.player = null;
    this.MAX_SLOTS = 40;
  }

  init(player) {
    this.player = player;
    this.slots = new Array(this.MAX_SLOTS).fill(null);
  }

  addItem(item) {
    if (!item) return false;

    // Try to stack
    if (item.stackable) {
      for (let i = 0; i < this.MAX_SLOTS; i++) {
        const slot = this.slots[i];
        if (slot && slot.id === item.id && slot.quantity < (slot.maxStack || 20)) {
          const canAdd = (slot.maxStack || 20) - slot.quantity;
          const adding = Math.min(canAdd, item.quantity || 1);
          slot.quantity += adding;
          item.quantity -= adding;
          if (item.quantity <= 0) return true;
        }
      }
    }

    // Find empty slot
    const emptyIdx = this.slots.findIndex(s => s === null);
    if (emptyIdx === -1) return false; // inventory full
    this.slots[emptyIdx] = { ...item };
    return true;
  }

  removeItem(itemId, qty = 1) {
    for (let i = this.MAX_SLOTS - 1; i >= 0; i--) {
      const slot = this.slots[i];
      if (slot && slot.id === itemId) {
        if (slot.stackable && slot.quantity > qty) {
          slot.quantity -= qty;
          return true;
        } else {
          this.slots[i] = null;
          return true;
        }
      }
    }
    return false;
  }

  removeAtIndex(idx) {
    const item = this.slots[idx];
    this.slots[idx] = null;
    return item;
  }

  hasItem(itemId, qty = 1) {
    let count = 0;
    for (const slot of this.slots) {
      if (slot && slot.id === itemId) count += slot.quantity || 1;
    }
    return count >= qty;
  }

  getItemCount(itemId) {
    let count = 0;
    for (const slot of this.slots) {
      if (slot && slot.id === itemId) count += slot.quantity || 1;
    }
    return count;
  }

  equip(item, slot) {
    if (!this.player) return false;
    // Determine correct slot from item type
    const slotMap = {
      weapon: 'weapon', armor: 'armor', helmet: 'helmet',
      boots: 'boots', ring: 'ring', amulet: 'amulet'
    };
    const targetSlot = slot || slotMap[item.type];
    if (!targetSlot) return false;

    // Unequip existing
    const existing = this.player.equipped[targetSlot];
    if (existing) {
      this.addItem(existing);
    }

    // Remove item from inventory
    const idx = this.slots.findIndex(s => s && s.instanceId === item.instanceId);
    if (idx !== -1) this.slots[idx] = null;

    this.player.equipItem(item, targetSlot);
    return true;
  }

  unequip(slot) {
    if (!this.player) return false;
    const item = this.player.unequipItem(slot);
    if (item) { this.addItem(item); return true; }
    return false;
  }

  useItem(itemId, player) {
    const idx = this.slots.findIndex(s => s && s.id === itemId);
    if (idx === -1) return false;
    const item = this.slots[idx];
    return this._applyItem(item, player, idx);
  }

  useItemAtIndex(idx, player) {
    const item = this.slots[idx];
    if (!item || item.type !== ITEM_TYPE.CONSUMABLE) return false;
    return this._applyItem(item, player, idx);
  }

  _applyItem(item, player, idx) {
    if (item.type !== ITEM_TYPE.CONSUMABLE) {
      // If it's equipment, try to equip
      if ([ITEM_TYPE.WEAPON, ITEM_TYPE.ARMOR, ITEM_TYPE.HELMET, ITEM_TYPE.BOOTS, ITEM_TYPE.RING, ITEM_TYPE.AMULET].includes(item.type)) {
        return this.equip(item, item.type);
      }
      return false;
    }
    if (item.heal) player.hp = Math.min(player.maxHP, player.hp + item.heal);
    if (item.mana) player.mana = Math.min(player.maxMana, player.mana + item.mana);
    // Consume
    if (item.stackable && item.quantity > 1) {
      item.quantity--;
    } else {
      this.slots[idx] = null;
    }
    return true;
  }

  getFilledSlots() {
    return this.slots.filter(s => s !== null);
  }

  getItemsOfType(type) {
    return this.slots.filter(s => s && s.type === type);
  }

  getSerializable() {
    return this.slots.map(s => s ? { ...s } : null);
  }

  getEquippedSerializable() {
    if (!this.player) return {};
    const result = {};
    for (const [slot, item] of Object.entries(this.player.equipped)) {
      result[slot] = item ? { ...item } : null;
    }
    return result;
  }

  loadFromData(data) {
    this.slots = new Array(this.MAX_SLOTS).fill(null);
    for (let i = 0; i < Math.min(data.length, this.MAX_SLOTS); i++) {
      this.slots[i] = data[i];
    }
  }

  loadEquipped(data) {
    if (!this.player) return;
    for (const [slot, item] of Object.entries(data)) {
      if (item) this.player.equipItem(item, slot);
    }
  }

  // Count non-null slots
  get usedSlots() {
    return this.slots.filter(s => s !== null).length;
  }

  renderItemIcon(ctx, item, x, y, size = 36) {
    if (!item) return;
    const half = size / 2;
    ctx.fillStyle = item.icon_color || '#888';

    if (item.type === ITEM_TYPE.WEAPON) {
      if (item.subtype === 'bow') {
        ctx.strokeStyle = item.icon_color || '#8b6914';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + half, y + half, half - 4, -Math.PI * 0.7, Math.PI * 0.7);
        ctx.stroke();
        ctx.strokeStyle = '#ccaa44';
        ctx.beginPath();
        ctx.moveTo(x + half + 8, y + 4);
        ctx.lineTo(x + half + 8, y + size - 4);
        ctx.stroke();
      } else if (item.subtype === 'staff') {
        ctx.fillStyle = item.icon_color;
        ctx.fillRect(x + half - 2, y + 4, 4, size - 8);
        ctx.fillStyle = '#aa44ff';
        ctx.beginPath();
        ctx.arc(x + half, y + 6, 5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(x + half - 3, y + 4, 6, size - 10);
        ctx.fillRect(x + half - 6, y + 6, 12, 4);
      }
    } else if (item.type === ITEM_TYPE.CONSUMABLE) {
      ctx.beginPath();
      ctx.arc(x + half, y + half, half - 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(x + half - 4, y + half - 4, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
    }

    // Rarity border color
    ctx.strokeStyle = RARITY_COLORS[item.rarity] || '#888';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
  }
}

export default InventorySystem;
