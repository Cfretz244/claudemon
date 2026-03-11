import { ALL_MAPS } from './data/maps';
import { TileType, MapData, WarpPoint } from './types/map.types';

// ─── Tile color map (primary fill color for each tile type) ───
const TILE_COLORS: Record<number, string> = {
  [TileType.GRASS]: '#88c070',
  [TileType.PATH]: '#d8c078',
  [TileType.WALL]: '#a08858',
  [TileType.WATER]: '#3890f8',
  [TileType.TREE]: '#408040',
  [TileType.TALL_GRASS]: '#409030',
  [TileType.BUILDING]: '#e0d0b0',
  [TileType.DOOR]: '#805028',
  [TileType.SIGN]: '#d0c080',
  [TileType.LEDGE]: '#507850',
  [TileType.FENCE]: '#d0b880',
  [TileType.FLOWER]: '#88c070',
  [TileType.INDOOR_FLOOR]: '#f8f0d0',
  [TileType.COUNTER]: '#b08840',
  [TileType.PC]: '#80c0e0',
  [TileType.MART_SHELF]: '#a08040',
  [TileType.CARPET]: '#c04040',
  [TileType.SAND]: '#e8d898',
  [TileType.CAVE_FLOOR]: '#a09080',
  [TileType.CAVE_WALL]: '#706050',
  [TileType.CUT_TREE]: '#60a050',
  [TileType.BOULDER]: '#808070',
  [TileType.SPIN_TILE]: '#f8f0d0',
  [TileType.STOP_TILE]: '#f8f0d0',
  [TileType.TELEPORT_PAD]: '#40c0e0',
  [TileType.ROOF]: '#c05050',
  [TileType.FOUNTAIN]: '#4090d0',
  [TileType.COBBLESTONE]: '#b8b0a0',
  [TileType.DOORMAT]: '#9b7340',
  [TileType.CAVE_ENTRANCE]: '#504030',
};

// ─── Map region grouping ───
interface MapGroup {
  name: string;
  maps: string[];
}

function categorizeMap(mapId: string): string {
  // Silph Co
  if (mapId.startsWith('silph_co')) return 'Silph Co.';
  // Pokemon Tower
  if (mapId.startsWith('pokemon_tower')) return 'Pokemon Tower';
  // Safari Zone
  if (mapId.startsWith('safari_zone')) return 'Safari Zone';
  // Mt. Moon
  if (mapId.startsWith('mt_moon')) return 'Mt. Moon';
  // SS Anne
  if (mapId.startsWith('ss_anne')) return 'SS Anne';
  // Victory Road
  if (mapId.startsWith('victory_road')) return 'Victory Road';
  // Power Plant
  if (mapId.startsWith('power_plant')) return 'Power Plant';
  // Pokemon Mansion
  if (mapId.startsWith('pokemon_mansion')) return 'Pokemon Mansion';
  // Seafoam
  if (mapId.startsWith('seafoam')) return 'Seafoam Islands';
  // Rock Tunnel
  if (mapId.startsWith('rock_tunnel')) return 'Rock Tunnel';

  // Location-based grouping for towns/cities
  const cityPatterns: [RegExp, string][] = [
    [/^(pallet|player_house|rival_house|oaks_lab)/, 'Pallet Town'],
    [/^(route1)$/, 'Routes (South)'],
    [/^(viridian|oaks_aide)/, 'Viridian City'],
    [/^(route2)$/, 'Routes (South)'],
    [/^viridian_forest$/, 'Viridian Forest'],
    [/^(pewter|pokemon_center_pewter|pokemart_pewter)/, 'Pewter City'],
    [/^(route3|pokemon_center_route3)$/, 'Routes (South)'],
    [/^(route4|route24|route25)/, 'Routes (Central)'],
    [/^(cerulean|pokemon_center_cerulean|pokemart_cerulean|cerulean_gym|bike_shop|cerulean_house)/, 'Cerulean City'],
    [/^(route5|route6|route7|route8|route9|route10|route11|route12|route13|route14|route15)/, 'Routes (Central)'],
    [/^(vermilion|pokemon_center_vermilion|pokemart_vermilion|vermilion_gym|fan_club)/, 'Vermilion City'],
    [/^(lavender|pokemon_center_lavender|pokemart_lavender|lavender_house|volunteer_house|name_rater)/, 'Lavender Town'],
    [/^(celadon|pokemon_center_celadon|celadon_mart|celadon_gym|game_corner|rocket_hideout|celadon_mansion|celadon_restaurant|celadon_hotel|celadon_house|prize_exchange)/, 'Celadon City'],
    [/^(saffron|pokemon_center_saffron|pokemart_saffron|saffron_gym|fighting_dojo|saffron_house|copycat_house)/, 'Saffron City'],
    [/^(fuchsia|pokemon_center_fuchsia|pokemart_fuchsia|fuchsia_gym|warden_house|fuchsia_house)/, 'Fuchsia City'],
    [/^(cycling_road|route16|route17|route18|route19|route20|route21)/, 'Routes (South)'],
    [/^(cinnabar|pokemon_center_cinnabar|pokemart_cinnabar|cinnabar_gym|cinnabar_lab)/, 'Cinnabar Island'],
    [/^(route22|route23)/, 'Routes (West)'],
    [/^(indigo_plateau|elite_four|pokemon_center_indigo)/, 'Indigo Plateau'],
    [/^(pokemon_center|pokemart)$/, 'Viridian City'],
    [/^(viridian_gym)$/, 'Viridian City'],
    [/^(pewter_gym|pewter_museum|pewter_house)$/, 'Pewter City'],
    [/^(gate|underground|diglett)/, 'Gates & Tunnels'],
    [/^route/, 'Routes (Other)'],
  ];

  for (const [pattern, group] of cityPatterns) {
    if (pattern.test(mapId)) return group;
  }

  return 'Other';
}

function buildMapGroups(): MapGroup[] {
  const groupMap = new Map<string, string[]>();

  for (const mapId of Object.keys(ALL_MAPS)) {
    const group = categorizeMap(mapId);
    if (!groupMap.has(group)) groupMap.set(group, []);
    groupMap.get(group)!.push(mapId);
  }

  // Define desired order
  const order = [
    'Pallet Town', 'Viridian City', 'Viridian Forest', 'Pewter City',
    'Mt. Moon', 'Cerulean City', 'Vermilion City', 'SS Anne',
    'Rock Tunnel', 'Lavender Town', 'Pokemon Tower',
    'Celadon City', 'Saffron City', 'Silph Co.',
    'Fuchsia City', 'Safari Zone',
    'Cinnabar Island', 'Pokemon Mansion', 'Seafoam Islands',
    'Power Plant', 'Victory Road', 'Indigo Plateau',
    'Routes (South)', 'Routes (Central)', 'Routes (West)', 'Routes (Other)',
    'Gates & Tunnels', 'Other',
  ];

  const result: MapGroup[] = [];
  const used = new Set<string>();

  for (const name of order) {
    if (groupMap.has(name)) {
      result.push({ name, maps: groupMap.get(name)! });
      used.add(name);
    }
  }

  // Add any remaining groups
  for (const [name, maps] of groupMap) {
    if (!used.has(name)) {
      result.push({ name, maps });
    }
  }

  return result;
}

// ─── Determine if warp is internal or external ───
function isInternalWarp(sourceMapId: string, targetMapId: string): boolean {
  // Same location prefix = internal (floor transitions, etc.)
  const getLocationBase = (id: string): string => {
    // Strip floor suffixes like _1f, _2f, _b1f, _b2f, etc.
    const stripped = id.replace(/_(b?\d+f|basement)$/, '');
    return stripped;
  };

  const sourceBase = getLocationBase(sourceMapId);
  const targetBase = getLocationBase(targetMapId);

  if (sourceBase === targetBase && sourceMapId !== targetMapId) return true;

  // Special cases: pokemon center variants, pokemart variants are exits
  // Rock tunnel floors
  if (sourceMapId.startsWith('rock_tunnel') && targetMapId.startsWith('rock_tunnel')) return true;
  // Pokemon mansion floors
  if (sourceMapId.startsWith('pokemon_mansion') && targetMapId.startsWith('pokemon_mansion')) return true;
  // Seafoam floors
  if (sourceMapId.startsWith('seafoam') && targetMapId.startsWith('seafoam')) return true;
  // Victory road floors
  if (sourceMapId.startsWith('victory_road') && targetMapId.startsWith('victory_road')) return true;
  // Rocket hideout floors
  if (sourceMapId.startsWith('rocket_hideout') && targetMapId.startsWith('rocket_hideout')) return true;

  return false;
}

// ─── State ───
let currentMapId: string = '';
let zoom = 3;
let panX = 0;
let panY = 0;
let showWarps = true;
let showNPCs = true;
let showGrid = false;
let showCollision = false;

// Animation
let animFrame = 0;
let animTime = 0;

const canvas = document.getElementById('map-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const canvasArea = document.getElementById('canvas-area')!;
const tooltip = document.getElementById('tooltip')!;

// ─── Render map to canvas ───
function renderMap(): void {
  if (!currentMapId || !ALL_MAPS[currentMapId]) return;

  const map = ALL_MAPS[currentMapId];
  const tileSize = zoom;
  const cw = canvasArea.clientWidth;
  const ch = canvasArea.clientHeight;

  canvas.width = cw;
  canvas.height = ch;
  canvas.style.width = cw + 'px';
  canvas.style.height = ch + 'px';

  ctx.clearRect(0, 0, cw, ch);

  // Background
  ctx.fillStyle = '#06090d';
  ctx.fillRect(0, 0, cw, ch);

  const mapPxW = map.width * tileSize;
  const mapPxH = map.height * tileSize;

  // Map offset (centered + pan)
  const ox = Math.floor((cw - mapPxW) / 2 + panX);
  const oy = Math.floor((ch - mapPxH) / 2 + panY);

  // Draw tiles
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const tile = map.tiles[y][x];
      const color = TILE_COLORS[tile] || '#ff00ff';
      ctx.fillStyle = color;
      ctx.fillRect(ox + x * tileSize, oy + y * tileSize, tileSize, tileSize);
    }
  }

  // Collision overlay
  if (showCollision) {
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (map.collision[y][x]) {
          ctx.fillStyle = 'rgba(255, 40, 40, 0.35)';
          ctx.fillRect(ox + x * tileSize, oy + y * tileSize, tileSize, tileSize);
        }
      }
    }
  }

  // Grid
  if (showGrid && tileSize >= 3) {
    ctx.strokeStyle = tileSize >= 6 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= map.width; x++) {
      ctx.beginPath();
      ctx.moveTo(ox + x * tileSize + 0.5, oy);
      ctx.lineTo(ox + x * tileSize + 0.5, oy + mapPxH);
      ctx.stroke();
    }
    for (let y = 0; y <= map.height; y++) {
      ctx.beginPath();
      ctx.moveTo(ox, oy + y * tileSize + 0.5);
      ctx.lineTo(ox + mapPxW, oy + y * tileSize + 0.5);
      ctx.stroke();
    }
  }

  // Map border glow
  ctx.strokeStyle = 'rgba(42, 154, 212, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(ox - 0.5, oy - 0.5, mapPxW + 1, mapPxH + 1);

  // Draw NPCs
  if (showNPCs) {
    for (const npc of map.npcs) {
      const nx = ox + npc.x * tileSize;
      const ny = oy + npc.y * tileSize;

      let color: string;
      let glowColor: string;
      if (npc.isItemBall) {
        color = '#f0d030';
        glowColor = 'rgba(240, 208, 48, 0.4)';
      } else if (npc.isTrainer) {
        color = '#e04848';
        glowColor = 'rgba(224, 72, 72, 0.4)';
      } else {
        color = '#d060a0';
        glowColor = 'rgba(208, 96, 160, 0.4)';
      }

      if (tileSize >= 4) {
        // Glow
        ctx.fillStyle = glowColor;
        const pad = Math.max(1, Math.floor(tileSize * 0.3));
        ctx.fillRect(nx - pad, ny - pad, tileSize + pad * 2, tileSize + pad * 2);
      }

      ctx.fillStyle = color;
      ctx.fillRect(nx, ny, tileSize, tileSize);

      // Sight range for trainers
      if (npc.isTrainer && npc.sightRange && tileSize >= 4) {
        const dir = npc.direction;
        ctx.fillStyle = 'rgba(224, 72, 72, 0.08)';
        const range = npc.sightRange;
        if (dir === 'up') {
          ctx.fillRect(nx, ny - range * tileSize, tileSize, range * tileSize);
        } else if (dir === 'down') {
          ctx.fillRect(nx, ny + tileSize, tileSize, range * tileSize);
        } else if (dir === 'left') {
          ctx.fillRect(nx - range * tileSize, ny, range * tileSize, tileSize);
        } else if (dir === 'right') {
          ctx.fillRect(nx + tileSize, ny, range * tileSize, tileSize);
        }
      }
    }
  }

  // Draw warps
  if (showWarps) {
    const pulse = 0.5 + 0.5 * Math.sin(animTime * 3);

    for (const warp of map.warps) {
      const wx = ox + warp.x * tileSize;
      const wy = oy + warp.y * tileSize;
      const internal = isInternalWarp(currentMapId, warp.targetMap);

      if (internal) {
        ctx.fillStyle = `rgba(48, 200, 152, ${0.4 + pulse * 0.4})`;
      } else {
        ctx.fillStyle = `rgba(232, 160, 32, ${0.4 + pulse * 0.4})`;
      }

      // Glow effect
      if (tileSize >= 4) {
        const glowPad = Math.max(1, Math.floor(tileSize * 0.4));
        const glowAlpha = 0.15 + pulse * 0.15;
        ctx.fillStyle = internal
          ? `rgba(48, 200, 152, ${glowAlpha})`
          : `rgba(232, 160, 32, ${glowAlpha})`;
        ctx.fillRect(wx - glowPad, wy - glowPad, tileSize + glowPad * 2, tileSize + glowPad * 2);
      }

      // Warp marker
      ctx.fillStyle = internal
        ? `rgba(48, 200, 152, ${0.6 + pulse * 0.3})`
        : `rgba(232, 160, 32, ${0.6 + pulse * 0.3})`;
      ctx.fillRect(wx, wy, tileSize, tileSize);

      // Diamond/dot center at higher zoom
      if (tileSize >= 8) {
        ctx.fillStyle = internal ? '#50e8b8' : '#f0c040';
        const cx = wx + tileSize / 2;
        const cy = wy + tileSize / 2;
        const r = Math.max(1, tileSize / 6);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

// ─── Animation loop ───
function animate(): void {
  animFrame++;
  animTime = performance.now() / 1000;
  renderMap();
  requestAnimationFrame(animate);
}

// ─── Build sidebar ───
function buildSidebar(): void {
  const groups = buildMapGroups();
  const container = document.getElementById('sidebar-list')!;
  container.innerHTML = '';

  let totalMaps = 0;

  for (const group of groups) {
    if (group.maps.length === 0) continue;
    totalMaps += group.maps.length;

    const groupEl = document.createElement('div');
    groupEl.className = 'sidebar-group';

    const header = document.createElement('div');
    header.className = 'sidebar-group-header';
    header.innerHTML = `<span class="arrow">&#9660;</span>${group.name}<span class="count">${group.maps.length}</span>`;

    const items = document.createElement('div');
    items.className = 'sidebar-group-items';

    for (const mapId of group.maps) {
      const map = ALL_MAPS[mapId];
      if (!map) continue;

      const item = document.createElement('div');
      item.className = 'map-item';
      item.dataset.mapId = mapId;

      const warpCount = map.warps.length;
      item.innerHTML = `
        <span>${map.name}</span>
        ${warpCount > 0 ? `<span class="warp-count">${warpCount}W</span>` : ''}
        <span class="map-size">${map.width}x${map.height}</span>
      `;

      item.addEventListener('click', () => selectMap(mapId));
      items.appendChild(item);
    }

    header.addEventListener('click', () => {
      const arrow = header.querySelector('.arrow')!;
      items.classList.toggle('collapsed');
      arrow.classList.toggle('collapsed');
    });

    groupEl.appendChild(header);
    groupEl.appendChild(items);
    container.appendChild(groupEl);
  }

  document.getElementById('map-total')!.textContent = String(totalMaps);
}

// ─── Select map ───
function selectMap(mapId: string): void {
  if (!ALL_MAPS[mapId]) return;

  currentMapId = mapId;
  panX = 0;
  panY = 0;

  // Update sidebar active state
  document.querySelectorAll('.map-item').forEach(el => {
    el.classList.toggle('active', (el as HTMLElement).dataset.mapId === mapId);
  });

  // Ensure the group is expanded and item is visible
  const activeItem = document.querySelector(`.map-item[data-map-id="${mapId}"]`) as HTMLElement | null;
  if (activeItem) {
    const groupItems = activeItem.parentElement;
    if (groupItems && groupItems.classList.contains('collapsed')) {
      groupItems.classList.remove('collapsed');
      const arrow = groupItems.previousElementSibling?.querySelector('.arrow');
      if (arrow) arrow.classList.remove('collapsed');
    }
    activeItem.scrollIntoView({ block: 'nearest' });
  }

  // Auto-fit zoom
  fitZoom();

  updateInfoPanel();
  renderMap();
}

function fitZoom(): void {
  const map = ALL_MAPS[currentMapId];
  if (!map) return;

  const cw = canvasArea.clientWidth;
  const ch = canvasArea.clientHeight;
  const padding = 40;

  const zoomX = (cw - padding * 2) / map.width;
  const zoomY = (ch - padding * 2) / map.height;
  zoom = Math.max(1, Math.min(32, Math.floor(Math.min(zoomX, zoomY))));
  panX = 0;
  panY = 0;

  document.getElementById('zoom-label')!.textContent = zoom + 'x';
}

// ─── Update info panel ───
function updateInfoPanel(): void {
  const map = ALL_MAPS[currentMapId];
  if (!map) return;

  document.getElementById('info-map-name')!.textContent = map.name;
  document.getElementById('info-map-id')!.textContent = currentMapId;
  document.getElementById('info-map-dims')!.innerHTML =
    `<span>${map.width}</span> x <span>${map.height}</span> tiles &middot; ${map.width * map.height} total`;

  // Stats
  const stats = document.getElementById('map-stats')!;
  const externalWarps = map.warps.filter(w => !isInternalWarp(currentMapId, w.targetMap)).length;
  const internalWarps = map.warps.filter(w => isInternalWarp(currentMapId, w.targetMap)).length;
  const trainers = map.npcs.filter(n => n.isTrainer).length;
  const items = map.npcs.filter(n => n.isItemBall).length;

  stats.innerHTML = `
    <div class="stat-box">
      <div class="stat-value" style="color:var(--warp-external)">${externalWarps}</div>
      <div class="stat-label">EXT WARPS</div>
    </div>
    <div class="stat-box">
      <div class="stat-value" style="color:var(--warp-internal)">${internalWarps}</div>
      <div class="stat-label">INT WARPS</div>
    </div>
    <div class="stat-box">
      <div class="stat-value" style="color:var(--trainer-color)">${trainers}</div>
      <div class="stat-label">TRAINERS</div>
    </div>
    <div class="stat-box">
      <div class="stat-value" style="color:#f0d030">${items}</div>
      <div class="stat-label">ITEMS</div>
    </div>
  `;

  // Warps
  const warpList = document.getElementById('warp-list')!;
  const warpCount = document.getElementById('warp-count')!;
  warpCount.textContent = String(map.warps.length);
  warpList.innerHTML = '';

  for (const warp of map.warps) {
    const internal = isInternalWarp(currentMapId, warp.targetMap);
    const targetMap = ALL_MAPS[warp.targetMap];
    const targetName = targetMap ? targetMap.name : warp.targetMap;
    const type = internal ? 'internal' : 'external';

    const entry = document.createElement('div');
    entry.className = `warp-entry ${type}`;
    entry.innerHTML = `
      <div class="warp-dot"></div>
      <div class="warp-info">
        <div class="warp-target">${targetName}</div>
        <div class="warp-coords">(${warp.x},${warp.y}) → (${warp.targetX},${warp.targetY})</div>
      </div>
      <div class="warp-arrow">→</div>
    `;

    entry.addEventListener('click', () => {
      if (ALL_MAPS[warp.targetMap]) {
        selectMap(warp.targetMap);
      }
    });

    // Hover to highlight warp on canvas
    entry.addEventListener('mouseenter', () => {
      highlightedWarp = warp;
    });
    entry.addEventListener('mouseleave', () => {
      highlightedWarp = null;
    });

    warpList.appendChild(entry);
  }

  // NPCs
  const npcList = document.getElementById('npc-list')!;
  const npcCount = document.getElementById('npc-count')!;
  npcCount.textContent = String(map.npcs.length);
  npcList.innerHTML = '';

  for (const npc of map.npcs) {
    let typeClass: string;
    let typeLabel: string;
    if (npc.isItemBall) {
      typeClass = 'item';
      typeLabel = 'ITEM';
    } else if (npc.isTrainer) {
      typeClass = 'trainer';
      typeLabel = 'TRAINER';
    } else {
      typeClass = 'normal';
      typeLabel = 'NPC';
    }

    const entry = document.createElement('div');
    entry.className = 'npc-entry';
    entry.innerHTML = `
      <div class="npc-dot ${typeClass}"></div>
      <span class="npc-id">${npc.id}</span>
      <span class="npc-type ${typeClass}">${typeLabel}</span>
    `;
    npcList.appendChild(entry);
  }
}

let highlightedWarp: WarpPoint | null = null;

// ─── Pan & zoom handling ───
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let panStartX = 0;
let panStartY = 0;

canvasArea.addEventListener('mousedown', (e) => {
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  panStartX = panX;
  panStartY = panY;
  canvasArea.style.cursor = 'grabbing';
});

window.addEventListener('mousemove', (e) => {
  if (isDragging) {
    panX = panStartX + (e.clientX - dragStartX);
    panY = panStartY + (e.clientY - dragStartY);
  }

  // Tooltip for canvas
  if (currentMapId && ALL_MAPS[currentMapId]) {
    const map = ALL_MAPS[currentMapId];
    const rect = canvasArea.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const tileSize = zoom;
    const mapPxW = map.width * tileSize;
    const mapPxH = map.height * tileSize;
    const ox = Math.floor((canvasArea.clientWidth - mapPxW) / 2 + panX);
    const oy = Math.floor((canvasArea.clientHeight - mapPxH) / 2 + panY);

    const tileX = Math.floor((mx - ox) / tileSize);
    const tileY = Math.floor((my - oy) / tileSize);

    if (tileX >= 0 && tileX < map.width && tileY >= 0 && tileY < map.height) {
      // Check if hovering over a warp
      const warp = map.warps.find(w => w.x === tileX && w.y === tileY);
      if (warp) {
        const targetMap = ALL_MAPS[warp.targetMap];
        const targetName = targetMap ? targetMap.name : warp.targetMap;
        const internal = isInternalWarp(currentMapId, warp.targetMap);
        tooltip.innerHTML = `
          <div class="tt-title" style="color:${internal ? 'var(--warp-internal-glow)' : 'var(--warp-external-glow)'}">
            ${internal ? 'INT' : 'EXT'}: ${targetName}
          </div>
          <div class="tt-sub">(${warp.x},${warp.y}) → ${warp.targetMap} (${warp.targetX},${warp.targetY})</div>
        `;
        tooltip.style.display = 'block';
        tooltip.style.left = (e.clientX + 12) + 'px';
        tooltip.style.top = (e.clientY + 12) + 'px';
        canvasArea.style.cursor = isDragging ? 'grabbing' : 'pointer';
        return;
      }

      // Check NPC
      const npc = map.npcs.find(n => n.x === tileX && n.y === tileY);
      if (npc) {
        const type = npc.isItemBall ? 'ITEM' : npc.isTrainer ? 'TRAINER' : 'NPC';
        tooltip.innerHTML = `
          <div class="tt-title">${npc.id}</div>
          <div class="tt-sub">${type} at (${npc.x},${npc.y})</div>
        `;
        tooltip.style.display = 'block';
        tooltip.style.left = (e.clientX + 12) + 'px';
        tooltip.style.top = (e.clientY + 12) + 'px';
        canvasArea.style.cursor = isDragging ? 'grabbing' : 'default';
        return;
      }

      // Show tile info
      const tileType = map.tiles[tileY][tileX];
      const tileName = TileType[tileType] || `UNKNOWN(${tileType})`;
      const blocked = map.collision[tileY][tileX];
      tooltip.innerHTML = `
        <div class="tt-title">${tileName}</div>
        <div class="tt-sub">(${tileX},${tileY}) ${blocked ? '| SOLID' : ''}</div>
      `;
      tooltip.style.display = 'block';
      tooltip.style.left = (e.clientX + 12) + 'px';
      tooltip.style.top = (e.clientY + 12) + 'px';
      canvasArea.style.cursor = isDragging ? 'grabbing' : 'crosshair';
    } else {
      tooltip.style.display = 'none';
      canvasArea.style.cursor = isDragging ? 'grabbing' : 'default';
    }
  }
});

window.addEventListener('mouseup', () => {
  isDragging = false;
  canvasArea.style.cursor = 'default';
});

// Click on warp to navigate
canvasArea.addEventListener('click', (e) => {
  if (!currentMapId || !ALL_MAPS[currentMapId]) return;

  const map = ALL_MAPS[currentMapId];
  const rect = canvasArea.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const tileSize = zoom;
  const mapPxW = map.width * tileSize;
  const mapPxH = map.height * tileSize;
  const ox = Math.floor((canvasArea.clientWidth - mapPxW) / 2 + panX);
  const oy = Math.floor((canvasArea.clientHeight - mapPxH) / 2 + panY);

  const tileX = Math.floor((mx - ox) / tileSize);
  const tileY = Math.floor((my - oy) / tileSize);

  const warp = map.warps.find(w => w.x === tileX && w.y === tileY);
  if (warp && ALL_MAPS[warp.targetMap]) {
    selectMap(warp.targetMap);
  }
});

// Mouse wheel zoom
canvasArea.addEventListener('wheel', (e) => {
  e.preventDefault();
  const oldZoom = zoom;

  if (e.deltaY < 0) {
    zoom = Math.min(32, zoom + (zoom >= 8 ? 2 : 1));
  } else {
    zoom = Math.max(1, zoom - (zoom > 8 ? 2 : 1));
  }

  if (zoom !== oldZoom) {
    // Zoom toward cursor
    const rect = canvasArea.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const cx = canvasArea.clientWidth / 2;
    const cy = canvasArea.clientHeight / 2;

    panX = panX * (zoom / oldZoom) + (mx - cx) * (1 - zoom / oldZoom);
    panY = panY * (zoom / oldZoom) + (my - cy) * (1 - zoom / oldZoom);

    document.getElementById('zoom-label')!.textContent = zoom + 'x';
  }
}, { passive: false });

// ─── Toggle buttons ───
function setupToggle(id: string, getter: () => boolean, setter: (v: boolean) => void): void {
  const btn = document.getElementById(id)!;
  btn.addEventListener('click', () => {
    setter(!getter());
    btn.classList.toggle('active');
  });
}

setupToggle('toggle-warps', () => showWarps, v => showWarps = v);
setupToggle('toggle-npcs', () => showNPCs, v => showNPCs = v);
setupToggle('toggle-grid', () => showGrid, v => showGrid = v);
setupToggle('toggle-collision', () => showCollision, v => showCollision = v);

// Zoom buttons
document.getElementById('zoom-in')!.addEventListener('click', () => {
  zoom = Math.min(32, zoom + (zoom >= 8 ? 2 : 1));
  document.getElementById('zoom-label')!.textContent = zoom + 'x';
});
document.getElementById('zoom-out')!.addEventListener('click', () => {
  zoom = Math.max(1, zoom - (zoom > 8 ? 2 : 1));
  document.getElementById('zoom-label')!.textContent = zoom + 'x';
});
document.getElementById('zoom-fit')!.addEventListener('click', () => {
  fitZoom();
});

// Search
document.getElementById('map-search')!.addEventListener('input', (e) => {
  const query = (e.target as HTMLInputElement).value.toLowerCase();
  document.querySelectorAll('.sidebar-group').forEach(group => {
    const items = group.querySelectorAll('.map-item');
    let anyVisible = false;
    items.forEach(item => {
      const el = item as HTMLElement;
      const mapId = el.dataset.mapId || '';
      const map = ALL_MAPS[mapId];
      const name = map ? map.name.toLowerCase() : '';
      const match = !query || mapId.includes(query) || name.includes(query);
      el.style.display = match ? '' : 'none';
      if (match) anyVisible = true;
    });
    (group as HTMLElement).style.display = anyVisible ? '' : 'none';
    // Expand groups with matches during search
    if (query && anyVisible) {
      const itemsContainer = group.querySelector('.sidebar-group-items');
      const arrow = group.querySelector('.arrow');
      if (itemsContainer) itemsContainer.classList.remove('collapsed');
      if (arrow) arrow.classList.remove('collapsed');
    }
  });
});

// Handle resize
window.addEventListener('resize', () => {
  if (currentMapId) renderMap();
});

// ─── Init ───
buildSidebar();

// Select first map
const firstMapId = Object.keys(ALL_MAPS)[0];
if (firstMapId) selectMap(firstMapId);

animate();
