// Tile map constants and generation helpers

export const TILE = {
  VOID: 0,
  GRASS: 1,
  STONE_FLOOR: 2,
  WALL: 3,
  WATER: 4,
  SAND: 5,
  DUNGEON_FLOOR: 6,
  DUNGEON_WALL: 7,
  TREE: 8,
  TREE_DARK: 9,
  DOOR: 10,
  CHEST: 11,
  PORTAL: 12
};

// Which tiles block movement
export const SOLID_TILES = new Set([TILE.VOID, TILE.WALL, TILE.WATER, TILE.TREE, TILE.TREE_DARK, TILE.DUNGEON_WALL]);

export class TileMap {
  constructor(width, height, defaultTile = TILE.GRASS) {
    this.width = width;
    this.height = height;
    this.data = [];
    for (let r = 0; r < height; r++) {
      this.data.push(new Array(width).fill(defaultTile));
    }
  }

  get(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return TILE.VOID;
    return this.data[y][x];
  }

  set(x, y, tile) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    this.data[y][x] = tile;
  }

  isSolid(x, y) {
    return SOLID_TILES.has(this.get(x, y));
  }

  fill(x, y, w, h, tile) {
    for (let r = y; r < y + h; r++) {
      for (let c = x; c < x + w; c++) {
        this.set(c, r, tile);
      }
    }
  }

  border(x, y, w, h, wallTile, floorTile) {
    this.fill(x, y, w, h, wallTile);
    this.fill(x + 1, y + 1, w - 2, h - 2, floorTile);
  }

  // Generate overworld map (100x100)
  static generateOverworld(width = 100, height = 100) {
    const map = new TileMap(width, height, TILE.GRASS);

    // Fill with grass base
    map.fill(0, 0, width, height, TILE.GRASS);

    // Add scattered trees (random forest areas)
    for (let i = 0; i < 6; i++) {
      const fx = 5 + Math.floor(Math.random() * 80);
      const fy = 5 + Math.floor(Math.random() * 40);
      const fw = 8 + Math.floor(Math.random() * 12);
      const fh = 8 + Math.floor(Math.random() * 12);
      for (let r = fy; r < fy + fh; r++) {
        for (let c = fx; c < fx + fw; c++) {
          if (Math.random() < 0.65) map.set(c, r, Math.random() < 0.6 ? TILE.TREE : TILE.TREE_DARK);
        }
      }
    }

    // More forests in lower half
    for (let i = 0; i < 4; i++) {
      const fx = 5 + Math.floor(Math.random() * 80);
      const fy = 55 + Math.floor(Math.random() * 30);
      const fw = 10 + Math.floor(Math.random() * 15);
      const fh = 10 + Math.floor(Math.random() * 12);
      for (let r = fy; r < Math.min(fy + fh, height - 2); r++) {
        for (let c = fx; c < Math.min(fx + fw, width - 2); c++) {
          if (Math.random() < 0.6) map.set(c, r, TILE.TREE);
        }
      }
    }

    // River running through
    let rx = 15, ry = 0;
    for (let step = 0; step < 80; step++) {
      for (let w = 0; w < 3; w++) map.set(rx + w, ry + step, TILE.WATER);
      if (Math.random() < 0.25) rx += Math.random() < 0.5 ? 1 : -1;
      rx = Math.max(2, Math.min(width - 5, rx));
    }

    // Lake
    const lx = 75, ly = 30;
    for (let r = ly; r < ly + 10; r++) {
      for (let c = lx; c < lx + 14; c++) {
        const dx = c - (lx + 7), dy = r - (ly + 5);
        if (dx * dx / 49 + dy * dy / 25 < 1) map.set(c, r, TILE.WATER);
      }
    }

    // Horizontal path through town
    for (let c = 20; c < 80; c++) map.set(c, 50, TILE.SAND);
    for (let c = 20; c < 80; c++) map.set(c, 51, TILE.SAND);
    // Vertical path to dungeon
    for (let r = 48; r < 70; r++) map.set(50, r, TILE.SAND);
    for (let r = 48; r < 70; r++) map.set(51, r, TILE.SAND);

    // Town area (center ~50,50): stone floors and buildings
    const townX = 42, townY = 42, townW = 18, townH = 14;
    map.fill(townX, townY, townW, townH, TILE.STONE_FLOOR);

    // Buildings in town
    const buildings = [
      { x: 43, y: 43, w: 5, h: 4 }, // house 1
      { x: 50, y: 43, w: 6, h: 4 }, // house 2
      { x: 43, y: 49, w: 4, h: 4 }, // house 3
      { x: 52, y: 49, w: 5, h: 5 }, // wizard tower
    ];
    for (const b of buildings) {
      map.fill(b.x, b.y, b.w, b.h, TILE.WALL);
      map.fill(b.x + 1, b.y + 1, b.w - 2, b.h - 2, TILE.STONE_FLOOR);
      map.set(b.x + Math.floor(b.w / 2), b.y + b.h - 1, TILE.DOOR);
    }

    // Dungeon portal (south of town)
    map.set(50, 68, TILE.PORTAL);
    map.set(50, 67, TILE.PORTAL);
    // Clear path to portal
    for (let r = 54; r < 68; r++) {
      map.set(50, r, TILE.STONE_FLOOR);
      map.set(51, r, TILE.STONE_FLOOR);
    }

    // Border walls
    for (let c = 0; c < width; c++) { map.set(c, 0, TILE.WALL); map.set(c, height - 1, TILE.WALL); }
    for (let r = 0; r < height; r++) { map.set(0, r, TILE.WALL); map.set(width - 1, r, TILE.WALL); }

    return map;
  }

  // Generate dungeon (60x60) using room placement
  static generateDungeon(width = 60, height = 60) {
    const map = new TileMap(width, height, TILE.DUNGEON_WALL);

    const rooms = [];
    const MIN_ROOM = 5, MAX_ROOM = 11;
    const ATTEMPTS = 40;

    for (let a = 0; a < ATTEMPTS; a++) {
      const rw = MIN_ROOM + Math.floor(Math.random() * (MAX_ROOM - MIN_ROOM));
      const rh = MIN_ROOM + Math.floor(Math.random() * (MAX_ROOM - MIN_ROOM));
      const rx = 2 + Math.floor(Math.random() * (width - rw - 4));
      const ry = 2 + Math.floor(Math.random() * (height - rh - 4));
      // Check overlap
      let overlaps = false;
      for (const room of rooms) {
        if (rx < room.x + room.w + 2 && rx + rw + 2 > room.x &&
            ry < room.y + room.h + 2 && ry + rh + 2 > room.y) {
          overlaps = true; break;
        }
      }
      if (!overlaps) {
        rooms.push({ x: rx, y: ry, w: rw, h: rh });
        map.fill(rx, ry, rw, rh, TILE.DUNGEON_FLOOR);
      }
      if (rooms.length >= 10) break;
    }

    // Connect rooms with L-shaped corridors
    for (let i = 1; i < rooms.length; i++) {
      const a = rooms[i - 1], b = rooms[i];
      const ax = Math.floor(a.x + a.w / 2), ay = Math.floor(a.y + a.h / 2);
      const bx = Math.floor(b.x + b.w / 2), by = Math.floor(b.y + b.h / 2);
      const midX = ax, midY = by;
      const minX = Math.min(ax, midX), maxX = Math.max(ax, midX);
      const minY = Math.min(ay, midY), maxY = Math.max(ay, midY);
      for (let c = minX; c <= maxX; c++) { map.set(c, ay, TILE.DUNGEON_FLOOR); map.set(c, ay + 1, TILE.DUNGEON_FLOOR); }
      for (let r = minY; r <= maxY; r++) { map.set(midX, r, TILE.DUNGEON_FLOOR); map.set(midX + 1, r, TILE.DUNGEON_FLOOR); }
      const minX2 = Math.min(midX, bx), maxX2 = Math.max(midX, bx);
      for (let c = minX2; c <= maxX2; c++) { map.set(c, by, TILE.DUNGEON_FLOOR); map.set(c, by + 1, TILE.DUNGEON_FLOOR); }
    }

    // Entrance portal from overworld
    map.fill(28, 2, 4, 4, TILE.DUNGEON_FLOOR);
    map.set(30, 2, TILE.PORTAL);

    // Exit portal to dragon lair (in deepest room)
    if (rooms.length > 0) {
      const lastRoom = rooms[rooms.length - 1];
      const exitX = Math.floor(lastRoom.x + lastRoom.w / 2);
      const exitY = Math.floor(lastRoom.y + lastRoom.h / 2);
      map.set(exitX, exitY, TILE.PORTAL);
      // Guaranteed accessible portal position
      map.set(30, 56, TILE.PORTAL);
      map.fill(28, 54, 4, 4, TILE.DUNGEON_FLOOR);
    }

    // Chests in some rooms
    for (let i = 2; i < rooms.length; i += 3) {
      const r = rooms[i];
      map.set(r.x + 1, r.y + 1, TILE.CHEST);
    }

    // Border
    for (let c = 0; c < width; c++) { map.set(c, 0, TILE.DUNGEON_WALL); map.set(c, height - 1, TILE.DUNGEON_WALL); }
    for (let r = 0; r < height; r++) { map.set(0, r, TILE.DUNGEON_WALL); map.set(width - 1, r, TILE.DUNGEON_WALL); }

    map.rooms = rooms;
    return map;
  }

  // Generate dragon lair (40x40)
  static generateDragonLair(width = 40, height = 40) {
    const map = new TileMap(width, height, TILE.DUNGEON_WALL);
    // Large central arena
    map.fill(4, 4, 32, 32, TILE.DUNGEON_FLOOR);
    // Pillars
    const pillars = [[6,6],[33,6],[6,33],[33,33],[12,12],[27,12],[12,27],[27,27]];
    for (const [px, py] of pillars) { map.fill(px, py, 3, 3, TILE.WALL); }
    // Entrance portal
    map.set(20, 2, TILE.PORTAL);
    map.fill(18, 2, 4, 4, TILE.DUNGEON_FLOOR);
    // Lava border effect (water tiles as lava proxy)
    for (let c = 1; c < 39; c++) { map.set(c, 1, TILE.WATER); map.set(c, 38, TILE.WATER); }
    for (let r = 1; r < 39; r++) { map.set(1, r, TILE.WATER); map.set(38, r, TILE.WATER); }
    return map;
  }
}

export default TileMap;
