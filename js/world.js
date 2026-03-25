// ─────────────────────────────────────────────────────────
//  ASHENWILD  –  World / Tilemap Generator
// ─────────────────────────────────────────────────────────

// Tile types
const T = {
  GRASS:1, GRASS_D:2, DIRT:3, STONE:4, WALL:5,
  WATER:6, TREE:7, ORE_NODE:8, DEEP:9
};

// Zone-specific tile colour palettes
const ZONE_PALETTES = [
  // 0 Frontier Forest
  { floor: T.GRASS, alt: T.GRASS_D, accent: T.TREE,  water: T.WATER, wall: T.WALL, name: 'Frontier Forest' },
  // 1 Ironvein Quarry
  { floor: T.STONE, alt: T.DIRT,   accent: T.ORE_NODE, water: T.DEEP, wall: T.WALL, name: 'Ironvein Quarry' },
  // 2 Floodfen
  { floor: T.GRASS_D, alt: T.DIRT, accent: T.TREE,   water: T.WATER, wall: T.WALL, name: 'Floodfen' },
  // 3 Sunken Shrine
  { floor: T.STONE, alt: T.STONE,  accent: T.ORE_NODE, water: T.DEEP, wall: T.WALL, name: 'Sunken Shrine' },
];

class World {
  constructor(zoneIndex) {
    this.zoneIndex = zoneIndex;
    this.palette = ZONE_PALETTES[zoneIndex];

    this.W = 48;  // map width in tiles
    this.H = 36;  // map height in tiles

    this.tiles   = [];   // 2D array [y][x]
    this.blocked = [];   // 2D boolean array (collision)

    this._generate();
  }

  _generate() {
    const { W, H } = this;
    const pal = this.palette;

    // Fill with floor tiles
    for (let y = 0; y < H; y++) {
      this.tiles[y]   = [];
      this.blocked[y] = [];
      for (let x = 0; x < W; x++) {
        this.tiles[y][x]   = Math.random() < 0.15 ? pal.alt : pal.floor;
        this.blocked[y][x] = false;
      }
    }

    // Solid border walls
    for (let x = 0; x < W; x++) {
      this.tiles[0][x]   = pal.wall;
      this.tiles[H-1][x] = pal.wall;
      this.blocked[0][x]   = true;
      this.blocked[H-1][x] = true;
    }
    for (let y = 0; y < H; y++) {
      this.tiles[y][0]   = pal.wall;
      this.tiles[y][W-1] = pal.wall;
      this.blocked[y][0]   = true;
      this.blocked[y][W-1] = true;
    }

    // Scatter accent tiles (trees / ore nodes) – avoiding centre spawn
    const centreX = W / 2, centreY = H / 2;
    for (let i = 0; i < 60; i++) {
      const x = 2 + Math.floor(Math.random() * (W - 4));
      const y = 2 + Math.floor(Math.random() * (H - 4));
      if (Math.abs(x - centreX) < 5 && Math.abs(y - centreY) < 5) continue;
      this.tiles[y][x]   = pal.accent;
      this.blocked[y][x] = true;
    }

    // Water / deep pools
    const numPools = 3 + Math.floor(Math.random() * 3);
    for (let p = 0; p < numPools; p++) {
      const px = 4 + Math.floor(Math.random() * (W - 8));
      const py = 4 + Math.floor(Math.random() * (H - 8));
      if (Math.abs(px - centreX) < 6 && Math.abs(py - centreY) < 6) continue;
      const r = 2 + Math.floor(Math.random() * 2);
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (dx*dx + dy*dy <= r*r) {
            const tx = px + dx, ty = py + dy;
            if (tx > 1 && tx < W-2 && ty > 1 && ty < H-2) {
              this.tiles[ty][tx]   = pal.water;
              this.blocked[ty][tx] = true;
            }
          }
        }
      }
    }

    // Corridor walls – gives rooms/ruins feel
    const numWallSegs = 4 + Math.floor(Math.random() * 4);
    for (let s = 0; s < numWallSegs; s++) {
      const sx = 4 + Math.floor(Math.random() * (W - 8));
      const sy = 4 + Math.floor(Math.random() * (H - 8));
      if (Math.abs(sx - centreX) < 6 && Math.abs(sy - centreY) < 6) continue;
      const len = 4 + Math.floor(Math.random() * 6);
      const horiz = Math.random() < 0.5;
      for (let i = 0; i < len; i++) {
        const tx = horiz ? sx + i : sx;
        const ty = horiz ? sy     : sy + i;
        if (tx > 1 && tx < W-2 && ty > 1 && ty < H-2) {
          this.tiles[ty][tx]   = pal.wall;
          this.blocked[ty][tx] = true;
        }
      }
    }
  }

  // Is tile (tx,ty) blocked?
  isBlocked(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= this.W || ty >= this.H) return true;
    return this.blocked[ty][tx];
  }

  // Is pixel position blocked?
  isBlockedPx(px, py) {
    return this.isBlocked(Math.floor(px / CFG.TILE), Math.floor(py / CFG.TILE));
  }

  // Tile colour lookup for canvas rendering
  tileColor(t) {
    const C = CFG.C;
    switch (t) {
      case T.GRASS:    return C.GRASS;
      case T.GRASS_D:  return C.GRASS_D;
      case T.DIRT:     return C.DIRT;
      case T.STONE:    return C.STONE;
      case T.WALL:     return C.WALL;
      case T.WATER:    return C.WATER;
      case T.DEEP:     return '#0e2235';
      case T.TREE:     return C.TREE;
      case T.ORE_NODE: return C.ORE;
      default:         return C.STONE_D;
    }
  }

  // Draw the visible portion of the world
  draw(ctx, camX, camY, cw, ch) {
    const T = CFG.TILE;
    const startX = Math.floor(camX / T);
    const startY = Math.floor(camY / T);
    const endX   = Math.ceil((camX + cw) / T) + 1;
    const endY   = Math.ceil((camY + ch) / T) + 1;

    for (let y = startY; y < Math.min(endY, this.H); y++) {
      for (let x = startX; x < Math.min(endX, this.W); x++) {
        if (y < 0 || x < 0) continue;
        const tile  = this.tiles[y][x];
        const color = this.tileColor(tile);
        const sx = x * T - camX;
        const sy = y * T - camY;

        ctx.fillStyle = color;
        ctx.fillRect(sx, sy, T, T);

        // Details on certain tiles
        if (tile === T.TREE) {
          // Tree trunk
          ctx.fillStyle = '#3a2010';
          ctx.fillRect(sx + 12, sy + 16, 8, 14);
          // Crown
          ctx.fillStyle = CFG.C.TREE_CROWN;
          ctx.beginPath();
          ctx.arc(sx + 16, sy + 14, 13, 0, Math.PI * 2);
          ctx.fill();
        } else if (tile === T.ORE_NODE) {
          ctx.fillStyle = CFG.C.ORE_L;
          for (let i = 0; i < 3; i++) {
            ctx.fillRect(sx + 4 + i*8, sy + 8 + (i%2)*6, 6, 6);
          }
        } else if (tile === T.WATER || tile === T.DEEP) {
          // Wave shimmer
          ctx.fillStyle = tile === T.WATER ? CFG.C.WATER_L : '#1a3050';
          ctx.fillRect(sx + 4, sy + 6, 24, 3);
          ctx.fillRect(sx + 8, sy + 16, 18, 3);
        } else if (tile === T.WALL || tile === T.STONE) {
          ctx.fillStyle = CFG.C.WALL_L;
          ctx.fillRect(sx, sy, T, 2);
          ctx.fillRect(sx, sy, 2, T);
        }
      }
    }
  }
}
