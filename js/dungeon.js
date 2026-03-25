/**
 * Arcane Engineers - Dungeon Generator
 * Procedurally generates dungeons with rooms, corridors, secrets, and hazards
 */

class DungeonGenerator {
  constructor(seed = null) {
    this.seed = seed || Math.floor(Math.random() * 999999);
    this.rng = this.createRng(this.seed);
    this.gearSystem = new GearSystem();
  }

  createRng(seed) {
    let s = seed;
    return () => {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      return (s >>> 0) / 0xffffffff;
    };
  }

  generate(level = 1) {
    const cols = CONFIG.DUNGEON_COLS;
    const rows = CONFIG.DUNGEON_ROWS;

    // Initialize all walls
    const tiles = Array.from({ length: rows }, () => Array(cols).fill(CONFIG.TILES.WALL));
    const rooms = [];
    const enemies = [];
    const chests = [];
    const machines = [];
    const portals = [];

    // Generate rooms
    const numRooms = Math.floor(this.rng() * (CONFIG.DUNGEON.MAX_ROOMS - CONFIG.DUNGEON.MIN_ROOMS)) + CONFIG.DUNGEON.MIN_ROOMS;

    for (let attempt = 0; attempt < numRooms * 20 && rooms.length < numRooms; attempt++) {
      const w = Math.floor(this.rng() * (CONFIG.DUNGEON.MAX_ROOM_SIZE - CONFIG.DUNGEON.MIN_ROOM_SIZE)) + CONFIG.DUNGEON.MIN_ROOM_SIZE;
      const h = Math.floor(this.rng() * (CONFIG.DUNGEON.MAX_ROOM_SIZE - CONFIG.DUNGEON.MIN_ROOM_SIZE)) + CONFIG.DUNGEON.MIN_ROOM_SIZE;
      const x = Math.floor(this.rng() * (cols - w - 2)) + 1;
      const y = Math.floor(this.rng() * (rows - h - 2)) + 1;

      const newRoom = { x, y, w, h };
      if (!rooms.some(r => this.roomsOverlap(r, newRoom, 1))) {
        rooms.push(newRoom);
        this.carveRoom(tiles, newRoom);
      }
    }

    // Connect rooms with corridors
    for (let i = 1; i < rooms.length; i++) {
      this.connectRooms(tiles, rooms[i - 1], rooms[i]);
    }

    // Place special tiles
    rooms.forEach((room, idx) => {
      const cx = Math.floor(room.x + room.w / 2);
      const cy = Math.floor(room.y + room.h / 2);

      // Boss room (last room)
      if (idx === rooms.length - 1) {
        room.isBossRoom = true;
        // Place portal back/exit
        tiles[cy][cx] = CONFIG.TILES.PORTAL;
        portals.push({ x: cx * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2, y: cy * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2 });
        // Spawn boss
        const bossTypes = Object.entries(CONFIG.ENEMIES).filter(([, e]) => e.isBoss);
        const [, bossData] = bossTypes[Math.floor(this.rng() * bossTypes.length)];
        enemies.push(this.createEnemy(bossData, cx * CONFIG.TILE_SIZE, cy * CONFIG.TILE_SIZE - 64, level));
      }

      // Chest placement
      if (idx > 0 && this.rng() < CONFIG.DUNGEON.CHEST_CHANCE) {
        const chestX = (room.x + 1) * CONFIG.TILE_SIZE;
        const chestY = (room.y + 1) * CONFIG.TILE_SIZE;
        tiles[room.y + 1][room.x + 1] = CONFIG.TILES.CHEST;
        chests.push({
          x: chestX,
          y: chestY,
          opened: false,
          loot: this.generateChestLoot(level)
        });
      }

      // Enemy placement in non-start rooms
      if (idx > 0 && !room.isBossRoom) {
        const enemyCount = Math.floor(room.w * room.h * CONFIG.DUNGEON.ENEMY_DENSITY) + 1;
        const enemyTypes = Object.values(CONFIG.ENEMIES).filter(e => !e.isBoss);
        for (let e = 0; e < enemyCount; e++) {
          const ex = (room.x + 1 + Math.floor(this.rng() * (room.w - 2))) * CONFIG.TILE_SIZE;
          const ey = (room.y + 1 + Math.floor(this.rng() * (room.h - 2))) * CONFIG.TILE_SIZE;
          const etype = enemyTypes[Math.floor(this.rng() * enemyTypes.length)];
          enemies.push(this.createEnemy(etype, ex, ey, level));
        }
      }

      // Machine slot placement
      if (idx > 0 && this.rng() < 0.3) {
        const mx = (room.x + Math.floor(room.w / 2)) * CONFIG.TILE_SIZE;
        const my = (room.y + Math.floor(room.h / 2)) * CONFIG.TILE_SIZE;
        machines.push({ x: mx, y: my, type: 'slot', active: false });
      }
    });

    // Secret rooms
    if (this.rng() < CONFIG.DUNGEON.SECRET_ROOM_CHANCE) {
      const secretRoom = this.addSecretRoom(tiles, rooms);
      if (secretRoom) {
        rooms.push({ ...secretRoom, isSecret: true });
        // Extra loot in secret room
        chests.push({
          x: (secretRoom.x + 1) * CONFIG.TILE_SIZE,
          y: (secretRoom.y + 1) * CONFIG.TILE_SIZE,
          opened: false,
          loot: this.generateChestLoot(level, true)
        });
      }
    }

    const startRoom = rooms[0];
    const startX = Math.floor(startRoom.x + startRoom.w / 2) * CONFIG.TILE_SIZE;
    const startY = Math.floor(startRoom.y + startRoom.h / 2) * CONFIG.TILE_SIZE;

    return {
      tiles,
      rooms,
      enemies,
      chests,
      machines,
      portals,
      startX,
      startY,
      cols,
      rows,
      level,
      seed: this.seed
    };
  }

  roomsOverlap(a, b, margin = 0) {
    return !(a.x + a.w + margin <= b.x ||
             b.x + b.w + margin <= a.x ||
             a.y + a.h + margin <= b.y ||
             b.y + b.h + margin <= a.y);
  }

  carveRoom(tiles, room) {
    for (let y = room.y; y < room.y + room.h; y++) {
      for (let x = room.x; x < room.x + room.w; x++) {
        if (y >= 0 && y < tiles.length && x >= 0 && x < tiles[0].length) {
          tiles[y][x] = CONFIG.TILES.FLOOR;
        }
      }
    }
  }

  connectRooms(tiles, a, b) {
    const ax = Math.floor(a.x + a.w / 2);
    const ay = Math.floor(a.y + a.h / 2);
    const bx = Math.floor(b.x + b.w / 2);
    const by = Math.floor(b.y + b.h / 2);

    // L-shaped corridor
    if (this.rng() < 0.5) {
      this.carveHCorridor(tiles, ax, bx, ay);
      this.carveVCorridor(tiles, ay, by, bx);
    } else {
      this.carveVCorridor(tiles, ay, by, ax);
      this.carveHCorridor(tiles, ax, bx, by);
    }
  }

  carveHCorridor(tiles, x1, x2, y) {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      if (y >= 0 && y < tiles.length && x >= 0 && x < tiles[0].length) {
        tiles[y][x] = CONFIG.TILES.FLOOR;
        // Widen corridor slightly
        if (y + 1 < tiles.length) tiles[y + 1][x] = CONFIG.TILES.FLOOR;
      }
    }
  }

  carveVCorridor(tiles, y1, y2, x) {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
      if (y >= 0 && y < tiles.length && x >= 0 && x < tiles[0].length) {
        tiles[y][x] = CONFIG.TILES.FLOOR;
        if (x + 1 < tiles[0].length) tiles[y][x + 1] = CONFIG.TILES.FLOOR;
      }
    }
  }

  addSecretRoom(tiles, rooms) {
    // Try to find a wall adjacent to an existing room to add a secret room
    for (let attempt = 0; attempt < 20; attempt++) {
      const baseRoom = rooms[Math.floor(this.rng() * rooms.length)];
      const w = 4;
      const h = 4;
      let sx, sy;

      const side = Math.floor(this.rng() * 4);
      switch (side) {
        case 0: sx = baseRoom.x - w - 1; sy = baseRoom.y; break;
        case 1: sx = baseRoom.x + baseRoom.w + 1; sy = baseRoom.y; break;
        case 2: sx = baseRoom.x; sy = baseRoom.y - h - 1; break;
        default: sx = baseRoom.x; sy = baseRoom.y + baseRoom.h + 1; break;
      }

      if (sx < 1 || sy < 1 || sx + w >= tiles[0].length - 1 || sy + h >= tiles.length - 1) continue;
      if (rooms.some(r => this.roomsOverlap(r, { x: sx, y: sy, w, h }, 0))) continue;

      const secretRoom = { x: sx, y: sy, w, h };
      this.carveRoom(tiles, secretRoom);
      // Connect with a narrow passage
      const doorX = side === 0 ? baseRoom.x - 1 : (side === 1 ? baseRoom.x + baseRoom.w : Math.floor(sx + w / 2));
      const doorY = side === 2 ? baseRoom.y - 1 : (side === 3 ? baseRoom.y + baseRoom.h : Math.floor(sy + h / 2));
      if (doorY >= 0 && doorY < tiles.length && doorX >= 0 && doorX < tiles[0].length) {
        tiles[doorY][doorX] = CONFIG.TILES.DOOR;
      }
      return secretRoom;
    }
    return null;
  }

  createEnemy(data, x, y, level) {
    const scaleFactor = 1 + (level - 1) * 0.15;
    return {
      id: Math.random().toString(36).substring(2, 11),
      name: data.name,
      x,
      y,
      width: data.size,
      height: data.size,
      maxHealth: Math.floor(data.health * scaleFactor),
      health: Math.floor(data.health * scaleFactor),
      damage: Math.floor(data.damage * scaleFactor),
      speed: data.speed,
      exp: Math.floor(data.exp * scaleFactor),
      color: data.color,
      size: data.size,
      attackRange: data.attackRange,
      attackCooldown: data.attackCooldown,
      lastAttack: 0,
      isBoss: data.isBoss || false,
      isAlive: true,
      target: null,
      aggro: false,
      aggroRange: data.isBoss ? 400 : 200,
      vx: 0,
      vy: 0,
      animFrame: 0,
      animTimer: 0,
      level
    };
  }

  generateChestLoot(level, isSecret = false) {
    const loot = [];
    const numItems = isSecret ? Math.floor(Math.random() * 2) + 2 : Math.floor(Math.random() * 2) + 1;

    for (let i = 0; i < numItems; i++) {
      const forceRarity = isSecret ? (Math.random() < 0.5 ? 'RARE' : 'UNCOMMON') : null;
      loot.push(this.gearSystem.generateGear(level, forceRarity));
    }

    // Chance for gold/currency
    loot.push({
      type: 'gold',
      amount: Math.floor((isSecret ? 50 : 20) + Math.random() * (level * 15))
    });

    if (isSecret) {
      loot.push({
        type: 'arcaneShards',
        amount: Math.floor(5 + Math.random() * 10)
      });
    }

    return loot;
  }

  getTileAt(dungeon, pixelX, pixelY) {
    const tileX = Math.floor(pixelX / CONFIG.TILE_SIZE);
    const tileY = Math.floor(pixelY / CONFIG.TILE_SIZE);
    if (tileX < 0 || tileY < 0 || tileY >= dungeon.rows || tileX >= dungeon.cols) {
      return CONFIG.TILES.WALL;
    }
    return dungeon.tiles[tileY][tileX];
  }

  isWalkable(dungeon, pixelX, pixelY) {
    const tile = this.getTileAt(dungeon, pixelX, pixelY);
    return tile !== CONFIG.TILES.WALL;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DungeonGenerator;
}
