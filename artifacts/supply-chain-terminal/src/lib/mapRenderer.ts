import { PORTS, ROUTES, CHOKE_POINTS, REGIONS } from '@/data/geo';

// World-view center longitude (°). 120 = SE Asia / Australia in the middle.
const WORLD_CENTER_LON = 120;

function makeProj(w: number, h: number, box: number[] | null) {
  // World view: centered on WORLD_CENTER_LON using modulo so the projection
  // wraps cleanly. Nudged down slightly so content isn't crowded at the top
  // now that Antarctica's empty southern band is gone.
  if (!box) return (lon: number, lat: number) => ({
    x: ((lon - WORLD_CENTER_LON + 180 + 360) % 360) / 360 * w,
    y: ((90 - lat) / 180) * h + h * 0.07
  });
  const [loMin, loMax, laMin, laMax] = box;
  return (lon: number, lat: number) => ({ x: ((lon - loMin) / (loMax - loMin)) * w, y: ((laMax - lat) / (laMax - laMin)) * h });
}

function rc(r: string) { return { critical: '#ff3b30', high: '#ff7a1a', medium: '#ffb020', low: '#ffd24a' }[r as string] || '#c98a3a'; }
function modeColor(m: string) { return { sea: '#ff9020', air: '#ffd24a', rail: '#ff6a3a', river: '#ffb84d', road: '#ff8a4a' }[m as string] || '#ff9020'; }

// Chaikin corner-cutting: rounds a coarse polygon into a smooth, high-resolution curve
// by iteratively replacing each vertex with two points closer to its neighbors.
function chaikinSmooth(pts: {x: number, y: number}[], iterations: number) {
  let cur = pts;
  const n0 = cur.length;
  for (let it = 0; it < iterations; it++) {
    const next: {x: number, y: number}[] = [];
    const n = cur.length;
    for (let i = 0; i < n; i++) {
      const p0 = cur[i], p1 = cur[(i + 1) % n];
      next.push({ x: p0.x * 0.75 + p1.x * 0.25, y: p0.y * 0.75 + p1.y * 0.25 });
      next.push({ x: p0.x * 0.25 + p1.x * 0.75, y: p0.y * 0.25 + p1.y * 0.75 });
    }
    cur = next;
  }
  return n0 < 3 ? pts : cur;
}

// Guards against degenerate polygons (near-zero area, e.g. antimeridian slivers from
// coastline data export) that would otherwise draw as stray lines across the map.
function isDegenerateRing(pts: {x: number, y: number}[]) {
  if (pts.length < 3) return true;
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[i], p1 = pts[(i + 1) % pts.length];
    area += p0.x * p1.y - p1.x * p0.y;
  }
  return Math.abs(area / 2) < 0.5;
}

// Split projected points into segments wherever consecutive x-values jump more than
// half the canvas width — that signals an antimeridian crossing in the shifted projection.
function splitAtWrap(pts: {x: number, y: number}[], w: number): {x: number, y: number}[][] {
  const segs: {x: number, y: number}[][] = [];
  let seg: {x: number, y: number}[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (Math.abs(pts[i].x - pts[i - 1].x) > w / 2) {
      if (seg.length > 1) segs.push(seg);
      seg = [pts[i]];
    } else {
      seg.push(pts[i]);
    }
  }
  if (seg.length > 1) segs.push(seg);
  return segs;
}

// Draw a smooth closed polygon (open=false, default) or open polyline (open=true).
function smoothPath(ctx: CanvasRenderingContext2D, rawPts: {x: number, y: number}[], open = false) {
  if (!rawPts || !rawPts.length) return;
  if (!open && isDegenerateRing(rawPts)) return;
  if (rawPts.length < 3) {
    ctx.beginPath();
    rawPts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    if (!open) ctx.closePath();
    return;
  }
  // Real coastline data already carries natural detail; a single light pass just
  // softens pixel-level jaggies without smoothing away authentic geographic shape.
  const pts = chaikinSmooth(rawPts, 1);
  ctx.beginPath();
  const n = pts.length;
  if (open) {
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < n - 1; i++) {
      const p0 = pts[i], p1 = pts[i + 1];
      ctx.quadraticCurveTo(p0.x, p0.y, (p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
    }
    ctx.lineTo(pts[n - 1].x, pts[n - 1].y);
  } else {
    ctx.moveTo((pts[n - 1].x + pts[0].x) / 2, (pts[n - 1].y + pts[0].y) / 2);
    for (let i = 0; i < n; i++) {
      const p0 = pts[i], p1 = pts[(i + 1) % n];
      ctx.quadraticCurveTo(p0.x, p0.y, (p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
    }
    ctx.closePath();
  }
}

export function drawMap(
  canvas: HTMLCanvasElement, 
  tMs: number, 
  selRoute: string | null, 
  timelineDay: number, 
  zoomBox: number[] | null,
  LAND: number[][][],
  LAKES: number[][][]
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const w = canvas.width, h = canvas.height;
  const tSec = tMs / 1000;
  const proj = makeProj(w, h, zoomBox);
  const P = (lo: number, la: number) => proj(lo, la);
  
  // Ocean
  const og = ctx.createLinearGradient(0, 0, 0, h);
  og.addColorStop(0, '#0a0602');
  og.addColorStop(0.5, '#0f0804');
  og.addColorStop(1, '#050301');
  ctx.fillStyle = og;
  ctx.fillRect(0, 0, w, h);
  
  // Bathymetric basin contours
  const basins = [[0.35, 0.45], [0.62, 0.55], [0.5, 0.78], [0.15, 0.4], [0.85, 0.42]];
  basins.forEach((b, bi) => {
    for (let ring = 0; ring < 7; ring++) {
      const rad = (ring + 1) * Math.min(w, h) * 0.05;
      ctx.strokeStyle = `rgba(180, 110, 40, ${0.045 - ring * 0.005})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.ellipse(b[0] * w, b[1] * h, rad * 1.4, rad, bi * 0.6, 0, Math.PI * 2);
      ctx.stroke();
    }
  });

  // Current flow
  ctx.globalAlpha = 0.035;
  for (let i = 0; i < 5; i++) {
    const yy = (h / 5) * i + ((tSec * 4 + i * 30) % (h / 5));
    ctx.strokeStyle = '#d08020';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, yy);
    for (let x = 0; x <= w; x += 50) ctx.lineTo(x, yy + Math.sin(x * 0.008 + tSec * 0.4 + i) * 4);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Graticule
  ctx.strokeStyle = 'rgba(210, 140, 50, 0.05)';
  ctx.lineWidth = 0.5;
  const gStep = zoomBox ? 10 : 30;
  for (let lon = -180; lon <= 180; lon += gStep) {
    const p = P(lon, 0);
    if (p.x >= 0 && p.x <= w) { ctx.beginPath(); ctx.moveTo(p.x, 0); ctx.lineTo(p.x, h); ctx.stroke(); }
  }
  for (let lat = -80; lat <= 80; lat += gStep) {
    const p = P(0, lat);
    if (p.y >= 0 && p.y <= h) { ctx.beginPath(); ctx.moveTo(0, p.y); ctx.lineTo(w, p.y); ctx.stroke(); }
  }
  
  // Helper: draw one land segment (closed or open at wrap edges) with full glow/fill/coast
  function drawLandSeg(c: CanvasRenderingContext2D, segPts: {x: number, y: number}[], open: boolean) {
    let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    segPts.forEach(p => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); });
    if (maxX < -50 || minX > w + 50 || maxY < -50 || minY > h + 50) return;

    smoothPath(c, segPts, open);
    c.save();
    c.shadowColor = 'rgba(220, 140, 50, 0.5)';
    c.shadowBlur = 7;
    c.strokeStyle = 'rgba(230, 160, 70, 0.3)';
    c.lineWidth = 3;
    c.lineJoin = 'round';
    c.stroke();
    c.restore();

    smoothPath(c, segPts, open);
    const tg = c.createLinearGradient(minX, minY, maxX, maxY);
    tg.addColorStop(0, '#1c140a');
    tg.addColorStop(0.4, '#261c10');
    tg.addColorStop(0.7, '#2f2214');
    tg.addColorStop(1, '#3a2a18');
    c.fillStyle = tg;
    c.fill();

    c.save();
    c.clip();
    const hs = c.createLinearGradient(minX, minY, maxX, maxY);
    hs.addColorStop(0, 'rgba(210, 160, 90, 0.15)');
    hs.addColorStop(0.5, 'transparent');
    hs.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    c.fillStyle = hs;
    c.fillRect(minX, minY, Math.max(maxX - minX, 1), Math.max(maxY - minY, 1));
    c.restore();

    smoothPath(c, segPts, open);
    c.strokeStyle = 'rgba(240, 190, 110, 0.4)';
    c.lineWidth = 0.7;
    c.lineJoin = 'round';
    c.stroke();
  }

  // Need a non-null ref for the nested helper and lake loops below
  const cx = ctx as CanvasRenderingContext2D;

  // Topographic land — split rings at the wrap meridian so there are no stray
  // horizontal lines across the map when using a non-zero center longitude.
  LAND.forEach(coords => {
    const pts = coords.map(([lo, la]) => P(lo, la));
    if (!zoomBox) {
      const segs = splitAtWrap(pts, w);
      const open = segs.length > 1; // ring was split → draw segments open at their ends
      segs.forEach(seg => drawLandSeg(cx, seg, open));
    } else {
      drawLandSeg(cx, pts, false);
    }
  });

  LAKES.forEach(coords => {
    const pts = coords.map(([lo, la]) => P(lo, la));
    if (!zoomBox) {
      splitAtWrap(pts, w).forEach(seg => {
        smoothPath(cx, seg, true);
        cx.fillStyle = '#0a0602';
        cx.fill();
        cx.strokeStyle = 'rgba(230, 160, 70, 0.3)';
        cx.lineWidth = 0.5;
        cx.stroke();
      });
    } else {
      smoothPath(cx, pts);
      cx.fillStyle = '#0a0602';
      cx.fill();
      cx.strokeStyle = 'rgba(230, 160, 70, 0.3)';
      cx.lineWidth = 0.5;
      cx.stroke();
    }
  });

  // Corridors
  ROUTES.forEach((route: any) => {
    if (!route.wp || route.wp.length < 2) return;
    const sel = selRoute === route.id;
    const color = modeColor(route.mode);
    const pts = route.wp.map(([lo, la]: [number, number]) => P(lo, la));
    
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = sel ? 16 : 3;
    ctx.strokeStyle = sel ? color + 'ee' : color + '44';
    ctx.lineWidth = sel ? 2.2 : 0.9;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (route.mode === 'road' || route.mode === 'rail') ctx.setLineDash([3, 3]);
    else ctx.setLineDash([7, 6]);
    ctx.lineDashOffset = -(tSec * 22 % 13);
    
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < pts.length - 1; i++) {
      // Skip segment if it crosses the wrap meridian (stray line across the map)
      if (Math.abs(pts[i + 1].x - pts[i].x) > w / 2) { ctx.moveTo(pts[i + 1].x, pts[i + 1].y); continue; }
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      const my = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    
    const segs = pts.length - 1;
    const scrubbingThis = sel && timelineDay > 0;
    const nShips = scrubbingThis ? 0 : (sel ? 3 : 1);
    
    for (let s = 0; s < nShips; s++) {
      const off = parseInt(route.id.slice(1)) * 0.17 + s * 0.33;
      const rT = (tSec * 0.02 + off) % 1;
      const absT = rT * segs;
      const seg = Math.min(Math.floor(absT), segs - 1);
      const st = absT - seg;
      if (pts[seg] && pts[seg + 1]) {
        const sx = pts[seg].x + (pts[seg + 1].x - pts[seg].x) * st;
        const sy = pts[seg].y + (pts[seg + 1].y - pts[seg].y) * st;
        const dx = pts[seg + 1].x - pts[seg].x;
        const dy = pts[seg + 1].y - pts[seg].y;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len, uy = dy / len;
        const wake = ctx.createLinearGradient(sx, sy, sx - ux * 20, sy - uy * 20);
        wake.addColorStop(0, color + 'aa');
        wake.addColorStop(1, 'transparent');
        ctx.strokeStyle = wake;
        ctx.lineWidth = sel ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - ux * 20, sy - uy * 20);
        ctx.stroke();
        
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = sel ? 14 : 7;
        ctx.fillStyle = '#fff5e0';
        ctx.beginPath();
        ctx.arc(sx, sy, sel ? 3.3 : 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(sx, sy, sel ? 1.9 : 1.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  });

  // Timeline vessel
  if (selRoute && timelineDay > 0) {
    const route: any = ROUTES.find((r: any) => r.id === selRoute);
    if (route && route.wp && route.wp.length > 1) {
      const pts = route.wp.map(([lo, la]: [number, number]) => P(lo, la));
      const transitDays = route.d;
      const totalDays = transitDays + Math.round(transitDays * 0.4);
      const frac = Math.min(timelineDay / totalDays, 1);
      const segs = pts.length - 1;
      const absT = frac * segs;
      const curSeg = Math.min(Math.floor(absT), segs - 1);
      const segFrac = absT - curSeg;
      
      ctx.save();
      ctx.shadowColor = '#ffd24a';
      ctx.shadowBlur = 6;
      ctx.strokeStyle = 'rgba(255, 210, 90, 0.95)';
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 0; i < curSeg; i++) ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
      const vx = pts[curSeg].x + (pts[curSeg + 1].x - pts[curSeg].x) * segFrac;
      const vy = pts[curSeg].y + (pts[curSeg + 1].y - pts[curSeg].y) * segFrac;
      ctx.lineTo(vx, vy);
      ctx.stroke();
      ctx.restore();
      
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 90, 60, 0.6)';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      for (let i = curSeg + 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      
      const vp = Math.sin(tSec * 4) * 0.3 + 0.7;
      ctx.save();
      ctx.translate(vx, vy);
      ctx.rotate(Math.PI / 4);
      ctx.shadowColor = '#ffd24a';
      ctx.shadowBlur = 16 * vp;
      ctx.fillStyle = '#fff5e0';
      ctx.fillRect(-4, -4, 8, 8);
      ctx.fillStyle = '#ff9020';
      ctx.fillRect(-2.5, -2.5, 5, 5);
      ctx.restore();
      
      ctx.save();
      ctx.strokeStyle = `rgba(255, 210, 90, ${0.4 * vp})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(vx, vy, 10 * vp, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Chokepoints (clickable)
  CHOKE_POINTS.forEach((cz: any) => {
    const p = P(cz.lon, cz.lat);
    if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) return;
    const col = rc(cz.risk);
    const pulse = Math.sin(tSec * 3) * 0.3 + 0.7;
    const sz = zoomBox ? 1.4 : 1;
    
    ctx.save();
    ctx.shadowColor = col;
    ctx.shadowBlur = 16 * pulse;
    ctx.strokeStyle = col + Math.round(0.55 * pulse * 255).toString(16).padStart(2, '0');
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 10 * pulse * sz, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.strokeStyle = col + 'aa';
    ctx.lineWidth = 1.2;
    for (let a = 0; a < 4; a++) {
      const ang = tSec * 1.5 + a * Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(p.x + Math.cos(ang) * 12 * sz, p.y + Math.sin(ang) * 12 * sz);
      ctx.lineTo(p.x + Math.cos(ang) * 16 * sz, p.y + Math.sin(ang) * 16 * sz);
      ctx.stroke();
    }
    
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - 4 * sz);
    ctx.lineTo(p.x + 3.5 * sz, p.y + 2.5 * sz);
    ctx.lineTo(p.x - 3.5 * sz, p.y + 2.5 * sz);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#0a0602';
    ctx.font = `bold ${5 * sz}px var(--app-font-mono)`;
    ctx.textAlign = 'center';
    ctx.fillText('!', p.x, p.y + 2.3 * sz);
    ctx.textAlign = 'left';
    
    ctx.fillStyle = col;
    ctx.font = `bold ${Math.max(7, w * 0.0072) * (zoomBox ? 1.2 : 1)}px var(--app-font-mono)`;
    ctx.fillText(cz.l, p.x + 15 * sz, p.y - 6 * sz);
    ctx.restore();
  });

  // Nodes (ports/hubs)
  Object.entries(PORTS).forEach(([, port]: [string, any]) => {
    const p = P(port.lon, port.lat);
    const color = modeColor(port.t);
    if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) return;
    const pulse = Math.sin(tSec * 2 + port.lat * 0.5) * 0.3 + 0.7;
    const sz = zoomBox ? 1.7 : 1;
    
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = color + '55';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5.5 * pulse * sz, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = '#fff5e0';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.8 * sz, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1 * sz, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    if (zoomBox) {
      ctx.fillStyle = 'rgba(240, 210, 160, 0.85)';
      ctx.font = `${Math.max(8, w * 0.011)}px var(--app-font-mono)`;
      ctx.fillText(port.n, p.x + 7 * sz, p.y + 3);
    }
  });

  if (!zoomBox) {
    ctx.fillStyle = 'rgba(210, 140, 50, 0.18)';
    ctx.font = `${Math.max(8, w * 0.0072)}px var(--app-font-mono)`;
    [-60, -30, 0, 30, 60].forEach(lat => {
      const p = P(0, lat);
      ctx.fillText(`${lat > 0 ? '+' : ''}${lat}°`, 3, p.y - 2);
    });
  }

  // Sweep scanline effect
  const sweepX = (tSec * 60) % (w + 200) - 100;
  const sw = ctx.createLinearGradient(sweepX - 40, 0, sweepX + 40, 0);
  sw.addColorStop(0, 'transparent');
  sw.addColorStop(0.5, 'rgba(255, 160, 60, 0.04)');
  sw.addColorStop(1, 'transparent');
  ctx.fillStyle = sw;
  ctx.fillRect(sweepX - 40, 0, 80, h);
  
  // Vignette
  const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.85);
  vig.addColorStop(0, 'transparent');
  vig.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}
