# Arcane Engineers

> A co-op action-strategy RPG where magic and machinery intertwine.

## Overview

**Arcane Engineers** is a browser-based, co-op action-strategy RPG for 1–3 players. Team up as arcane engineers in a mysterious world and master complex machines, strategize in real-time PvM battles, and customize gear and abilities to overcome deep, evolving challenges.

## Features

- **3 Unique Classes**: Golemancer (Tank/Summoner), Alchemist (Mage/Support), Artificer (DPS/Engineer)
- **Deep Stats System**: Engineering, Magic, Dexterity, and Endurance
- **Gear & Set Bonuses**: Collect and craft gear with unique stats; equip set pieces for powerful bonuses
- **Procedural Dungeons**: Randomized rooms, secret areas, chests, and boss encounters every run
- **Machine Deployment**: Build turrets, summon golems, place traps, and raise energy shields
- **Skill Trees**: Three discipline-specific trees with unlockable passives and abilities
- **Leaderboards**: Track fastest clears, highest scores, and rarest item finds
- **Cosmetics**: Skins, machine skins, pets, and trails (no pay-to-win)

## Getting Started

### Play in browser

Open `index.html` directly in a modern browser, or serve it locally:

```bash
npm install
npm start
```

Then open `http://localhost:3000` in your browser.

### Controls

| Key | Action |
|---|---|
| `WASD` / Arrow Keys | Move |
| Left Click | Basic attack |
| `1` / `2` / `3` | Use ability |
| `E` | Interact (chests, portals) |
| `I` | Open inventory |
| `K` | Open skill tree |
| `P` / `ESC` | Pause |

## Development

### Run tests

```bash
npm test
```

### Lint

```bash
npm run lint
```

## Project Structure

```
the-outbreak/
├── index.html          # Game entry point
├── css/
│   └── style.css       # Styles
├── js/
│   ├── config.js       # Game constants & configuration
│   ├── gear.js         # Gear generation & crafting
│   ├── player.js       # Player classes, stats, abilities
│   ├── dungeon.js      # Procedural dungeon generation
│   ├── entities.js     # Enemies, machines, projectiles
│   ├── leaderboard.js  # Score tracking
│   ├── ui.js           # HUD, menus, overlays
│   └── game.js         # Main game loop & engine
└── tests/
    └── game.test.js    # Unit tests
```

## License

Apache 2.0 — see [LICENSE](LICENSE).

