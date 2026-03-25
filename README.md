# Ashenwild

**Genre:** 3-player co-op action RPG with long-term progression  
**Platform:** Desktop (browser-based)

## ▶ Play the Game

Open `index.html` in any modern browser to play.

## How to Play

| Action | Control |
|--------|---------|
| Move | WASD or Arrow keys |
| Basic attack | Left click |
| Abilities | 1 – 5 keys |
| Inventory | I key or GEAR button |

### Game Loop

1. **Create your character** — pick a race (Human, Sylvan, Stoneborn, Ashen, Umbral) and a class (Vanguard, Ranger, Arcanist, Forgemaster, Nightblade)
2. **Explore zones** — fight enemies, level your skills, collect loot
3. **Kill the boss** — each zone has a powerful boss guarding the way forward
4. **Progress** — better gear drops from stronger enemies; skills level up as you fight and move
5. **Conquer all 4 zones** — Frontier Forest → Ironvein Quarry → Floodfen → Sunken Shrine

### Zones

| # | Zone | Boss |
|---|------|------|
| 1 | Frontier Forest | Alpha Wolf |
| 2 | Ironvein Quarry | Ore Golem |
| 3 | Floodfen | Fen Colossus |
| 4 | Sunken Shrine | Eclipse Lord |

### Gear Tiers

Frontier → Hardened → Runic → Mythic → Ascendant

## Core Fantasy

You and up to two other players enter a brutal fantasy frontier where civilization is half-built, ancient powers are waking up, and the strongest gear in the world must be crafted from the land and taken from monsters strong enough to kill you.

This is not a casual loot game. The point is mastery:

- Master the combat
- Master your class
- Master your build
- Master gathering and crafting
- Master boss mechanics
- Master long-term progression

## Design Documentation

- [Game Pillars](docs/game-pillars.md)
- [Classes, Races & Talent System](docs/classes-races-talents.md)
- [Skill System](docs/skill-system.md)
- [Gear & Reward Ladder](docs/gear-reward-ladder.md)
- [Art Direction](docs/art-direction.md)
- [Game Loop & Tick System](docs/game-loop.md)

## Technical

Built with vanilla HTML5 Canvas + JavaScript — no dependencies, no build step required.

```
index.html        ← Open this to play
css/style.css     ← Styling and HUD layout
js/config.js      ← Game constants (tick rate, colours, etc.)
js/data.js        ← Classes, races, items, enemies, loot tables
js/input.js       ← Keyboard / mouse input
js/skills.js      ← Skill XP and levelling system
js/world.js       ← Procedural tile map generator
js/entities.js    ← Player, Enemy, Projectile, LootDrop, FloatText
js/combat.js      ← Combat resolution (200ms tick system)
js/ui.js          ← HUD, character creation, inventory panel
js/game.js        ← Main game loop and state management
js/main.js        ← Entry point, event wiring
```
