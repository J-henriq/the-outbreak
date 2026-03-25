// Character sheet UI - stats display with stat point allocation

export class CharacterSheetUI {
  constructor(game) {
    this.game = game;
  }

  refresh(player) {
    if (!player) return;
    const s = player.stats;

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    set('stat-str', s.strength);
    set('stat-agi', s.agility);
    set('stat-mag', s.magic);
    set('stat-end', s.endurance);
    set('stat-lck', s.luck);
    set('stat-pts', player.statPoints);

    set('cs-level', s.level);
    set('cs-hp', player.maxHP);
    set('cs-mana', player.maxMana);
    set('cs-atk', Math.floor(player.meleeDamage));
    set('cs-def', Math.floor(player.defense));
    set('cs-crit', Math.round(player.critChance * 100) + '%');
    set('cs-class', player.class.charAt(0).toUpperCase() + player.class.slice(1));

    const pt = this.game.playTime || 0;
    const mins = Math.floor(pt / 60), hours = Math.floor(mins / 60);
    set('cs-time', hours > 0 ? `${hours}h ${mins % 60}m` : `${mins}m`);

    // Dim stat-up buttons if no points
    document.querySelectorAll('.stat-up-btn').forEach(btn => {
      btn.disabled = player.statPoints <= 0;
      btn.style.opacity = player.statPoints > 0 ? '1' : '0.3';
    });
  }
}

export default CharacterSheetUI;
