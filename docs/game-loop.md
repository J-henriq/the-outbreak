# Game Loop & Tick System

## Overview

The game uses a **hybrid tick-and-realtime** model.

- Movement is visually smooth in real time
- Combat windows and outcomes are authoritative in ticks
- Gathering and crafting are timed in ticks
- Boss mechanics telegraph in real time but resolve on tick windows

This creates a modern feel, readable systems, and fair multiplayer sync.

---

## Server Tick

Use a **server-authoritative simulation tick of 200 ms**.

**Why 200 ms:**
- Faster and more modern-feeling than old-style 600 ms ticks
- Still stable for co-op PvM
- Lets combat feel responsive
- Still allows clean rule-based systems

That means **5 ticks per second**.

---

## What Happens on Each Tick

- Position reconciliation
- Enemy AI decisions
- Attack windows
- DoT and HoT effects
- Prayer drains
- Buff durations
- Trap checks
- Gathering rolls
- Loot authority
- Construct updates

---

## Action Timing Reference

| Action | Ticks | Real Time |
|--------|-------|-----------|
| Basic melee swing | 4 | 0.8 s |
| Heavy hammer slam | 7 | 1.4 s |
| Quick bow shot | 3 | 0.6 s |
| Charged bow shot | 6 | 1.2 s |
| Fast spell | 3 | 0.6 s |
| Big ritual cast | 8 | 1.6 s |
| Tree chopping attempt | 5–8 | 1.0–1.6 s |
| Mining attempt | 5–9 | 1.0–1.8 s |
| Fishing catch roll | 4–7 | 0.8–1.4 s |
| Cooking (per item) | 2–4 | 0.4–0.8 s |
| Smithing craft | 4–20 | 0.8–4.0 s |

Prayer effects are checked every tick for upkeep and expiration.

This gives the game structure without making it feel slow.

---

## Core Game Loop

```
Train skills → Unlock zones → Get materials → Beat harder monsters
→ Craft better gear → Specialize your build → Chase prestige items
→ Look stronger → Tackle harder content → (repeat)
```

This loop works because it combines:
- Skill-based long-term progression
- Co-op PvM
- Premium graphics
- Class mastery
- Strong world identity

---

## Launch Scope

The best initial launch version:

| Content | Launch | Post-Launch |
|---------|--------|-------------|
| Races | 3 | Expand later |
| Classes | 4 | Add 5th after release |
| Core skills | 8 | Add 2 more if needed |
| Major regions | 5 | — |
| Dungeons | 12 | — |
| Major bosses | 8 | — |
| World boss rotation | 1 | — |
| Gear tiers | Frontier to Mythic | Ascendant as first expansion |

That is a smarter scope than trying to make 10 years of content on day one.

---

## Why This Game Could Be Commercially Strong

The loop is solid. Players will:

1. Train skills
2. Unlock zones
3. Get materials
4. Beat harder monsters
5. Craft better gear
6. Specialize their build
7. Chase prestige items
8. Look stronger
9. Tackle harder content

The game delivers if it achieves:

- Premium visual quality
- Deep build identity
- Satisfying co-op PvM
- Long-term skill progression
- Gear that is crafted from effort, not handed out
- A world that feels dangerous and worth mastering
