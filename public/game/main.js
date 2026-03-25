// Entry point - initializes and starts The Outbreak RPG

import { Game } from './engine/Game.js';

// Initialize game when DOM is ready
const game = new Game();

window.addEventListener('DOMContentLoaded', () => {
  game.init().catch(err => {
    console.error('Game initialization failed:', err);
    const tip = document.getElementById('loading-tip');
    if (tip) tip.textContent = 'Error loading game. Please refresh.';
  });
});

// Expose game instance for debugging
window.game = game;
