// Heads-up display (HP, MP, XP bars, gold, level)

export class HUD {
  constructor(game) {
    this.game = game;
    this._hpBar = document.getElementById('hp-bar-inner');
    this._hpText = document.getElementById('hp-text');
    this._manaBar = document.getElementById('mana-bar-inner');
    this._manaText = document.getElementById('mana-text');
    this._xpBar = document.getElementById('xp-bar-inner');
    this._xpText = document.getElementById('xp-text');
    this._level = document.getElementById('level-display');
    this._gold = document.getElementById('gold-display');
  }

  update(player) {
    if (!player) return;

    const hpPct = Math.max(0, Math.min(100, (player.hp / player.maxHP) * 100));
    const manaPct = Math.max(0, Math.min(100, (player.mana / player.maxMana) * 100));
    const xpPct = Math.max(0, Math.min(100, (player.stats.xp / player.stats.xpToNextLevel) * 100));

    if (this._hpBar) this._hpBar.style.width = hpPct + '%';
    if (this._hpText) this._hpText.textContent = `${Math.ceil(player.hp)}/${player.maxHP}`;
    if (this._manaBar) this._manaBar.style.width = manaPct + '%';
    if (this._manaText) this._manaText.textContent = `${Math.ceil(player.mana)}/${player.maxMana}`;
    if (this._xpBar) this._xpBar.style.width = xpPct + '%';
    if (this._xpText) this._xpText.textContent = `${player.stats.xp}/${player.stats.xpToNextLevel}`;
    if (this._level) this._level.textContent = `Lv.${player.stats.level}`;
    if (this._gold) this._gold.textContent = `🪙 ${player.gold}`;
  }
}

export default HUD;
