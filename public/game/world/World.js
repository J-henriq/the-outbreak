// World manager - handles zone management, map generation, collision

import { TileMap, TILE, SOLID_TILES } from './TileMap.js';
import { ZONES } from './Zone.js';
import { ENEMIES as ENEMY_DATA } from '../data/enemies.js';

export class World {
  constructor() {
    this.zones = {};
    this.currentZone = 'overworld';
    this.currentMap = null;
    this.portals = {};
  }

  generate() {
    // Generate all zone maps
    const owMap = TileMap.generateOverworld(100, 100);
    const dungeonMap = TileMap.generateDungeon(60, 60);
    const lairMap = TileMap.generateDragonLair(40, 40);

    this.zones = {
      overworld: { map: owMap, data: ZONES.overworld },
      dungeon: { map: dungeonMap, data: ZONES.dungeon },
      dragon_lair: { map: lairMap, data: ZONES.dragon_lair }
    };

    // Build portal lookup tables
    for (const [zoneName, zone] of Object.entries(this.zones)) {
      this.portals[zoneName] = {};
      for (const portal of zone.data.portals) {
        const key = `${portal.tileX},${portal.tileY}`;
        this.portals[zoneName][key] = portal;
      }
    }

    this.currentZone = 'overworld';
    this.currentMap = this.zones.overworld.map.data;
  }

  changeZone(zoneName) {
    if (!this.zones[zoneName]) return;
    this.currentZone = zoneName;
    this.currentMap = this.zones[zoneName].map.data;
  }

  getTileAt(tileX, tileY) {
    const zone = this.zones[this.currentZone];
    if (!zone) return TILE.VOID;
    return zone.map.get(tileX, tileY);
  }

  isSolid(tileX, tileY) {
    const zone = this.zones[this.currentZone];
    if (!zone) return true;
    return zone.map.isSolid(tileX, tileY);
  }

  isSolidWorld(worldX, worldY) {
    return this.isSolid(Math.floor(worldX / 32), Math.floor(worldY / 32));
  }

  getPortalAt(tileX, tileY) {
    const portals = this.portals[this.currentZone];
    if (!portals) return null;
    return portals[`${tileX},${tileY}`] || null;
  }

  getSpawnPoint(zoneName) {
    const zone = this.zones[zoneName] || this.zones[this.currentZone];
    const sp = zone.data.spawnPoint;
    return { x: sp.x, y: sp.y };
  }

  // Returns { enemies: [{type, x, y}], npcs: [{type, name, x, y}] }
  getEntitySpawns(zoneName) {
    const zone = this.zones[zoneName];
    if (!zone) return { enemies: [], npcs: [] };

    const enemies = [];
    for (const spawn of zone.data.enemySpawns) {
      for (let i = 0; i < spawn.count; i++) {
        // Try to find valid (non-solid) position in region
        let attempts = 0, x, y;
        do {
          const tx = spawn.region.x + Math.floor(Math.random() * spawn.region.w);
          const ty = spawn.region.y + Math.floor(Math.random() * spawn.region.h);
          x = tx * 32 + 4;
          y = ty * 32 + 4;
          attempts++;
        } while (zone.map.isSolid(Math.floor(x / 32), Math.floor(y / 32)) && attempts < 20);
        if (attempts < 20) enemies.push({ type: spawn.type, x, y });
      }
    }

    const npcs = zone.data.npcSpawns.map(n => ({
      type: n.type, name: n.name, x: n.tileX * 32, y: n.tileY * 32
    }));

    return { enemies, npcs };
  }

  // Resolve entity movement with tile collision
  moveEntity(entity, dx, dy) {
    const w = entity.width || 24;
    const h = entity.height || 28;
    const margin = 4;

    // Try X movement
    const newX = entity.x + dx;
    const left = Math.floor((newX + margin) / 32);
    const right = Math.floor((newX + w - margin) / 32);
    const top = Math.floor((entity.y + margin) / 32);
    const bottom = Math.floor((entity.y + h - margin) / 32);

    if (!this.isSolid(left, top) && !this.isSolid(right, top) &&
        !this.isSolid(left, bottom) && !this.isSolid(right, bottom)) {
      entity.x = newX;
    }

    // Try Y movement
    const newY = entity.y + dy;
    const left2 = Math.floor((entity.x + margin) / 32);
    const right2 = Math.floor((entity.x + w - margin) / 32);
    const top2 = Math.floor((newY + margin) / 32);
    const bottom2 = Math.floor((newY + h - margin) / 32);

    if (!this.isSolid(left2, top2) && !this.isSolid(right2, top2) &&
        !this.isSolid(left2, bottom2) && !this.isSolid(right2, bottom2)) {
      entity.y = newY;
    }
  }

  getAmbientLight() {
    return this.zones[this.currentZone]?.data.ambientLight || 0.2;
  }
}

export default World;
