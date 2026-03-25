// ─────────────────────────────────────────────────────────
//  ASHENWILD  –  Entry Point
// ─────────────────────────────────────────────────────────

(function () {
  const game = new Game();

  // ── Title Screen ──────────────────────────────────────
  document.getElementById('btn-start').addEventListener('click', () => {
    UI.showScreen('screen-create');
    UI.initCreate();
  });

  // ── Character Creation ────────────────────────────────
  document.getElementById('btn-back-title').addEventListener('click', () => {
    UI.showScreen('screen-title');
  });

  document.getElementById('btn-play').addEventListener('click', () => {
    const data = UI.getCreateData();
    game.startGame(data);
  });

  // ── Inventory toggle button ───────────────────────────
  document.getElementById('btn-inventory').addEventListener('click', () => {
    UI.toggleInventory(game.player);
  });

  // ── Death Screen ──────────────────────────────────────
  document.getElementById('btn-respawn').addEventListener('click', () => {
    game.respawn();
  });
  document.getElementById('btn-main-menu').addEventListener('click', () => {
    game.backToTitle();
  });

  // ── Victory Screen ────────────────────────────────────
  document.getElementById('btn-continue').addEventListener('click', () => {
    game.nextZone();
  });

  // Show title on load
  UI.showScreen('screen-title');
})();
