import XLSX from 'xlsx-js-style';

export interface Snapshot {
  id: string;
  ts: number;          // Unix ms
  label: string;       // human-readable timestamp
  // Risk indices
  riskAsia: number;
  riskME: number;
  riskAfrica: number;
  riskAmericas: number;
  riskOceania: number;
  // Delay indices
  delaySea: number;
  delayAir: number;
  delayRail: number;
  delayRiver: number;
  // Commodities
  commAutos: number;
  commRaw: number;
  commGas: number;
  commFuel: number;
  commGoods: number;
  commAgri: number;
  // Carrier averages
  carrierAvgDelay: number;
  carrierAvgCap: number;
  // Chokepoint summary (highest risk)
  topChokepoint: string;
  topChokepointRisk: string;
}

const STORAGE_KEY = 'sci_terminal_history';
const MAX_SNAPSHOTS = 200;

export function buildSnapshot(data: any): Snapshot {
  const now = Date.now();
  const d = new Date(now);
  const label = d.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  const carriers: any[] = data.comps || [];
  const avgDelay = carriers.length ? carriers.reduce((s: number, c: any) => s + c.delay, 0) / carriers.length : 0;
  const avgCap   = carriers.length ? carriers.reduce((s: number, c: any) => s + c.cap,   0) / carriers.length : 0;

  const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  const chokes: any[] = data.chokepoints || [];
  const topCP = chokes.slice().sort((a: any, b: any) => (riskOrder[b.riskLevel as keyof typeof riskOrder] || 0) - (riskOrder[a.riskLevel as keyof typeof riskOrder] || 0))[0];

  return {
    id: `${now}-${Math.random().toString(36).slice(2, 7)}`,
    ts: now,
    label,
    riskAsia:     data.risks?.asia     ?? 0,
    riskME:       data.risks?.me       ?? 0,
    riskAfrica:   data.risks?.africa   ?? 0,
    riskAmericas: data.risks?.americas ?? 0,
    riskOceania:  data.risks?.oceania  ?? 0,
    delaySea:   data.delayIdx?.sea   ?? 0,
    delayAir:   data.delayIdx?.air   ?? 0,
    delayRail:  data.delayIdx?.rail  ?? 0,
    delayRiver: data.delayIdx?.river ?? 0,
    commAutos: data.commod?.autos ?? 0,
    commRaw:   data.commod?.raw   ?? 0,
    commGas:   data.commod?.gas   ?? 0,
    commFuel:  data.commod?.fuel  ?? 0,
    commGoods: data.commod?.goods ?? 0,
    commAgri:  data.commod?.agri  ?? 0,
    carrierAvgDelay: parseFloat(avgDelay.toFixed(1)),
    carrierAvgCap:   parseFloat(avgCap.toFixed(1)),
    topChokepoint:     topCP?.name      ?? '—',
    topChokepointRisk: topCP?.riskLevel ?? '—',
  };
}

export function loadHistory(): Snapshot[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveSnapshot(snap: Snapshot): Snapshot[] {
  const history = loadHistory();
  history.unshift(snap); // newest first
  const trimmed = history.slice(0, MAX_SNAPSHOTS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // storage quota exceeded — drop oldest and retry
    const shorter = trimmed.slice(0, Math.floor(MAX_SNAPSHOTS / 2));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shorter));
  }
  return trimmed;
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Flat row for export ────────────────────────────────────────────────────

function toRows(history: Snapshot[]) {
  return history.map(s => ({
    'Timestamp':            s.label,
    'Risk — Asia-Pacific':  s.riskAsia,
    'Risk — Middle East':   s.riskME,
    'Risk — Africa':        s.riskAfrica,
    'Risk — Americas':      s.riskAmericas,
    'Risk — Oceania':       s.riskOceania,
    'Delay — Ocean':        s.delaySea,
    'Delay — Air':          s.delayAir,
    'Delay — Rail':         s.delayRail,
    'Delay — River':        s.delayRiver,
    'Commodity — Autos':    s.commAutos,
    'Commodity — Raw Mat.': s.commRaw,
    'Commodity — Nat. Gas': s.commGas,
    'Commodity — Fossil Fuels': s.commFuel,
    'Commodity — Consumer': s.commGoods,
    'Commodity — Agri':     s.commAgri,
    'Carrier Avg Delay (d)':    s.carrierAvgDelay,
    'Carrier Avg Capacity (%)': s.carrierAvgCap,
    'Top Chokepoint':       s.topChokepoint,
    'Top Chokepoint Risk':  s.topChokepointRisk,
  }));
}

function dateStamp(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function downloadCSV(history: Snapshot[]): void {
  if (!history.length) return;
  const rows = toRows(history);
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => JSON.stringify((r as any)[h] ?? '')).join(','))
  ].join('\n');
  trigger(new Blob([csv], { type: 'text/csv' }), `Supplyside(${dateStamp()}).csv`);
}

// ─── XLSX conditional-format helpers ────────────────────────────────────────

/** 0-100 risk / delay index: ≤40 green, 41-70 amber, 71-85 orange, >85 red */
function numericRGB(v: number): string {
  if (v <= 40) return '2E7D32'; // dark green
  if (v <= 70) return 'F9A825'; // amber
  if (v <= 85) return 'E65100'; // deep orange
  return 'B71C1C';              // dark red
}

/** Capacity %: high utilisation = bad (opposite of risk) */
function capacityRGB(v: number): string {
  if (v <= 70) return '2E7D32';
  if (v <= 85) return 'F9A825';
  return 'B71C1C';
}

/** Carrier avg delay days: 0 = fine, 1-3 = watch, >3 = bad */
function delayDaysRGB(v: number): string {
  if (v <= 0) return '2E7D32';
  if (v <= 3) return 'F9A825';
  return 'B71C1C';
}

/** Text risk level (low / medium / high / critical) */
function riskTextRGB(s: string): string {
  switch (s.toLowerCase()) {
    case 'low':      return '2E7D32';
    case 'medium':   return 'F9A825';
    case 'high':     return 'E65100';
    case 'critical': return 'B71C1C';
    default:         return '616161';
  }
}

function makeCell(value: unknown): XLSX.CellObject {
  if (typeof value === 'number') return { t: 'n', v: value };
  return { t: 's', v: String(value ?? '') };
}

function solidFill(rgb: string) {
  return { fill: { patternType: 'solid' as const, fgColor: { rgb } } };
}

// ─── Worksheet builders ──────────────────────────────────────────────────────

const SPARK_CHARS = '▁▂▃▄▅▆▇█';

function sparkline(vals: number[]): string {
  const mn = Math.min(...vals), mx = Math.max(...vals), rng = mx - mn || 1;
  return vals.map(v => SPARK_CHARS[Math.min(7, Math.floor(((v - mn) / rng) * 8))]).join('');
}

/** Simple linear regression → slope + intercept */
function linReg(vals: number[]): { slope: number; intercept: number } {
  const n = vals.length;
  const xMean = (n - 1) / 2;
  const yMean = vals.reduce((a, b) => a + b, 0) / n;
  const num = vals.reduce((s, y, x) => s + (x - xMean) * (y - yMean), 0);
  const den = vals.reduce((s, _, x) => s + (x - xMean) ** 2, 0) || 1;
  const slope = num / den;
  return { slope, intercept: yMean - slope * xMean };
}

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

function hdr(v: string, bgRgb = '1A1208', fgRgb = 'FFC107'): XLSX.CellObject {
  return { t: 's', v, s: { fill: { patternType: 'solid', fgColor: { rgb: bgRgb } }, font: { bold: true, color: { rgb: fgRgb } } } };
}

function numCell(v: number, rgb?: string): XLSX.CellObject {
  const s = rgb ? { fill: { patternType: 'solid' as const, fgColor: { rgb } }, font: { bold: true, color: { rgb: 'FFFFFF' } } } : undefined;
  return { t: 'n', v, ...(s ? { s } : {}) };
}

function txtCell(v: string, rgb?: string, italic = false): XLSX.CellObject {
  const s = rgb ? { fill: { patternType: 'solid' as const, fgColor: { rgb } }, font: { bold: !italic, italic, color: { rgb: 'FFFFFF' } } } : undefined;
  return { t: 's', v, ...(s ? { s } : {}) };
}

/** Sheet 2 — metric sparklines + linear-regression forecasts */
function buildTrendsSheet(history: Snapshot[], wb: XLSX.WorkBook): void {
  if (history.length < 2) return;

  const METRICS: { key: keyof Snapshot; label: string; maxVal: number; colorFn: (v: number) => string }[] = [
    { key: 'riskAsia',       label: 'Risk — Asia-Pacific',      maxVal: 100, colorFn: numericRGB },
    { key: 'riskME',         label: 'Risk — Middle East',       maxVal: 100, colorFn: numericRGB },
    { key: 'riskAfrica',     label: 'Risk — Africa',            maxVal: 100, colorFn: numericRGB },
    { key: 'riskAmericas',   label: 'Risk — Americas',          maxVal: 100, colorFn: numericRGB },
    { key: 'riskOceania',    label: 'Risk — Oceania',           maxVal: 100, colorFn: numericRGB },
    { key: 'delaySea',       label: 'Delay Index — Ocean',      maxVal: 100, colorFn: numericRGB },
    { key: 'delayAir',       label: 'Delay Index — Air',        maxVal: 100, colorFn: numericRGB },
    { key: 'delayRail',      label: 'Delay Index — Rail',       maxVal: 100, colorFn: numericRGB },
    { key: 'delayRiver',     label: 'Delay Index — River',      maxVal: 100, colorFn: numericRGB },
    { key: 'commAutos',      label: 'Commodity — Autos',        maxVal: 100, colorFn: numericRGB },
    { key: 'commRaw',        label: 'Commodity — Raw Materials',maxVal: 100, colorFn: numericRGB },
    { key: 'commGas',        label: 'Commodity — Nat. Gas',     maxVal: 100, colorFn: numericRGB },
    { key: 'commFuel',       label: 'Commodity — Fossil Fuels', maxVal: 100, colorFn: numericRGB },
    { key: 'commGoods',      label: 'Commodity — Consumer',     maxVal: 100, colorFn: numericRGB },
    { key: 'commAgri',       label: 'Commodity — Agriculture',  maxVal: 100, colorFn: numericRGB },
    { key: 'carrierAvgCap',  label: 'Carrier Avg Capacity %',   maxVal: 100, colorFn: capacityRGB },
    { key: 'carrierAvgDelay',label: 'Carrier Avg Delay (days)', maxVal: 30,  colorFn: delayDaysRGB },
  ];

  const ws: XLSX.WorkSheet = {};
  const cols = ['Metric', 'Trend (oldest → newest)', 'Latest', 'Min', 'Max', 'Avg', 'Direction', 'Forecast +3', 'Forecast +7'];

  // Title
  ws[XLSX.utils.encode_cell({ r: 0, c: 0 })] = hdr('📊  Risk & Metric Trends', '0D0A04', 'FFC107');
  ws[XLSX.utils.encode_cell({ r: 0, c: 1 })] = { t: 's', v: `Linear regression over last ${Math.min(history.length, 20)} snapshots · italic = projected`, s: { font: { italic: true, color: { rgb: '888866' } } } };

  // Column headers
  cols.forEach((c, ci) => { ws[XLSX.utils.encode_cell({ r: 1, c: ci })] = hdr(c, '2C1C08'); });

  // Data
  const recent = history.slice(0, Math.min(history.length, 20)).reverse(); // oldest→newest

  METRICS.forEach((m, i) => {
    const vals = recent.map(s => s[m.key] as number);
    const latest = vals[vals.length - 1];
    const mn = Math.min(...vals), mx = Math.max(...vals);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    const { slope, intercept } = linReg(vals);
    const n = vals.length;
    const fc3 = parseFloat(clamp(intercept + slope * (n + 2), 0, m.maxVal).toFixed(1));
    const fc7 = parseFloat(clamp(intercept + slope * (n + 6), 0, m.maxVal).toFixed(1));
    const dir = slope >  0.8 ? '↑ Rising' : slope < -0.8 ? '↓ Falling' : '→ Stable';
    const dirRGB = slope >  0.8 ? 'B71C1C' : slope < -0.8 ? '2E7D32' : 'F9A825';

    const r = i + 2;
    ws[XLSX.utils.encode_cell({ r, c: 0 })] = { t: 's', v: m.label, s: { font: { bold: true } } };
    ws[XLSX.utils.encode_cell({ r, c: 1 })] = { t: 's', v: sparkline(vals), s: { font: { name: 'Consolas', sz: 9 } } };
    ws[XLSX.utils.encode_cell({ r, c: 2 })] = numCell(latest, m.colorFn(latest));
    ws[XLSX.utils.encode_cell({ r, c: 3 })] = numCell(parseFloat(mn.toFixed(1)));
    ws[XLSX.utils.encode_cell({ r, c: 4 })] = numCell(parseFloat(mx.toFixed(1)));
    ws[XLSX.utils.encode_cell({ r, c: 5 })] = numCell(parseFloat(avg.toFixed(1)));
    ws[XLSX.utils.encode_cell({ r, c: 6 })] = txtCell(dir, dirRGB);
    ws[XLSX.utils.encode_cell({ r, c: 7 })] = { t: 'n', v: fc3, s: { fill: { patternType: 'solid', fgColor: { rgb: m.colorFn(fc3) } }, font: { italic: true, color: { rgb: 'FFFFFF' } } } };
    ws[XLSX.utils.encode_cell({ r, c: 8 })] = { t: 'n', v: fc7, s: { fill: { patternType: 'solid', fgColor: { rgb: m.colorFn(fc7) } }, font: { italic: true, color: { rgb: 'FFFFFF' } } } };
  });

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: METRICS.length + 1, c: cols.length - 1 } });
  ws['!cols'] = [{ wch: 30 }, { wch: 22 }, { wch: 8 }, { wch: 7 }, { wch: 7 }, { wch: 7 }, { wch: 12 }, { wch: 14 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Risk Trends');
}

/** Sheet 3 — event counts, risk-level distribution, chokepoint frequency */
function buildEventSheet(history: Snapshot[], wb: XLSX.WorkBook): void {
  if (!history.length) return;

  const ws: XLSX.WorkSheet = {};
  let row = 0;

  const setCell = (r: number, c: number, cell: XLSX.CellObject) => {
    ws[XLSX.utils.encode_cell({ r, c })] = cell;
  };

  // ── Section 1: Risk-level distribution by region ───────────────────────────
  setCell(row, 0, hdr('📋  Risk-Level Event Distribution', '0D0A04', 'FFC107'));
  setCell(row, 1, { t: 's', v: `${history.length} total snapshots`, s: { font: { italic: true, color: { rgb: '888866' } } } });
  row += 2;

  const distCols = ['Region', 'LOW  (≤ 40)', 'MEDIUM (41-70)', 'HIGH  (71-85)', 'CRITICAL (> 85)', '% High/Critical', 'Bar'];
  distCols.forEach((h, ci) => setCell(row, ci, hdr(h, '2C1C08')));
  row++;

  const REGIONS = [
    { key: 'riskAsia',     label: 'Asia-Pacific' },
    { key: 'riskME',       label: 'Middle East' },
    { key: 'riskAfrica',   label: 'Africa' },
    { key: 'riskAmericas', label: 'Americas' },
    { key: 'riskOceania',  label: 'Oceania' },
  ] as const;

  REGIONS.forEach(reg => {
    const vals = history.map(s => s[reg.key as keyof Snapshot] as number);
    const low    = vals.filter(v => v <= 40).length;
    const medium = vals.filter(v => v > 40 && v <= 70).length;
    const high   = vals.filter(v => v > 70 && v <= 85).length;
    const crit   = vals.filter(v => v > 85).length;
    const pct    = parseFloat(((high + crit) / vals.length * 100).toFixed(1));
    const pctRgb = pct > 50 ? 'B71C1C' : pct > 25 ? 'E65100' : pct > 10 ? 'F9A825' : '2E7D32';
    const barLen = Math.round(pct / 5); // 0-20 blocks
    const bar    = '█'.repeat(barLen) + '░'.repeat(20 - barLen);

    setCell(row, 0, { t: 's', v: reg.label, s: { font: { bold: true } } });
    setCell(row, 1, numCell(low,    '2E7D32'));
    setCell(row, 2, numCell(medium, 'F9A825'));
    setCell(row, 3, numCell(high,   'E65100'));
    setCell(row, 4, numCell(crit,   'B71C1C'));
    setCell(row, 5, { t: 'n', v: pct,  s: { ...solidFill(pctRgb), font: { bold: true, color: { rgb: 'FFFFFF' } } } });
    setCell(row, 6, { t: 's', v: bar,  s: { font: { name: 'Consolas', sz: 9, color: { rgb: pctRgb } } } });
    row++;
  });

  row += 2;

  // ── Section 2: Chokepoint frequency ───────────────────────────────────────
  setCell(row, 0, hdr('🔴  Top Chokepoint Frequency', '0D0A04', 'FFC107'));
  row++;

  const cpCols = ['Chokepoint', 'Times #1 Risk', '% of Snapshots', 'Bar'];
  cpCols.forEach((h, ci) => setCell(row, ci, hdr(h, '2C1C08')));
  row++;

  const cpCounts: Record<string, number> = {};
  history.forEach(s => { cpCounts[s.topChokepoint] = (cpCounts[s.topChokepoint] || 0) + 1; });
  Object.entries(cpCounts)
    .sort(([, a], [, b]) => b - a)
    .forEach(([cp, count]) => {
      const pct    = parseFloat((count / history.length * 100).toFixed(1));
      const rgb    = pct > 50 ? 'B71C1C' : pct > 25 ? 'E65100' : pct > 10 ? 'F9A825' : '2E7D32';
      const barLen = Math.round(pct / 5);
      const bar    = '█'.repeat(barLen) + '░'.repeat(20 - barLen);

      setCell(row, 0, { t: 's', v: cp });
      setCell(row, 1, numCell(count, rgb));
      setCell(row, 2, { t: 'n', v: pct, s: { ...solidFill(rgb), font: { color: { rgb: 'FFFFFF' } } } });
      setCell(row, 3, { t: 's', v: bar, s: { font: { name: 'Consolas', sz: 9, color: { rgb: rgb } } } });
      row++;
    });

  row += 2;

  // ── Section 3: Top-risk snapshots (worst 10 moments) ──────────────────────
  setCell(row, 0, hdr('⚠️  Top 10 Highest-Risk Snapshots', '0D0A04', 'FFC107'));
  row++;

  const worstCols = ['Timestamp', 'Avg Risk Index', 'Worst Region', 'Worst Value', 'Top Chokepoint'];
  worstCols.forEach((h, ci) => setCell(row, ci, hdr(h, '2C1C08')));
  row++;

  const regionKeys: (keyof Snapshot)[] = ['riskAsia', 'riskME', 'riskAfrica', 'riskAmericas', 'riskOceania'];
  const regionLabels: Record<string, string> = {
    riskAsia: 'Asia-Pac', riskME: 'M. East', riskAfrica: 'Africa', riskAmericas: 'Americas', riskOceania: 'Oceania',
  };

  history.slice()
    .map(s => {
      const riskVals = regionKeys.map(k => s[k] as number);
      const avgRisk  = riskVals.reduce((a, b) => a + b, 0) / riskVals.length;
      const maxIdx   = riskVals.indexOf(Math.max(...riskVals));
      return { s, avgRisk, worstKey: regionKeys[maxIdx], worstVal: riskVals[maxIdx] };
    })
    .sort((a, b) => b.avgRisk - a.avgRisk)
    .slice(0, 10)
    .forEach(({ s, avgRisk, worstKey, worstVal }) => {
      const rgb = numericRGB(avgRisk);
      setCell(row, 0, { t: 's', v: s.label });
      setCell(row, 1, numCell(parseFloat(avgRisk.toFixed(1)), rgb));
      setCell(row, 2, { t: 's', v: regionLabels[worstKey as string] });
      setCell(row, 3, numCell(worstVal, numericRGB(worstVal)));
      setCell(row, 4, { t: 's', v: s.topChokepoint });
      row++;
    });

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: row, c: 6 } });
  ws['!cols'] = [{ wch: 26 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Event Summary');
}

export function downloadXLSX(history: Snapshot[]): void {
  if (!history.length) return;
  const rows = toRows(history);
  const headers = Object.keys(rows[0]) as (keyof ReturnType<typeof toRows>[0])[];

  // Column-type map: which style function applies to each column
  const NUM_RISK_COLS = new Set([
    'Risk — Asia-Pacific', 'Risk — Middle East', 'Risk — Africa',
    'Risk — Americas', 'Risk — Oceania',
    'Delay — Ocean', 'Delay — Air', 'Delay — Rail', 'Delay — River',
    'Commodity — Autos', 'Commodity — Raw Mat.', 'Commodity — Nat. Gas',
    'Commodity — Fossil Fuels', 'Commodity — Consumer', 'Commodity — Agri',
  ]);

  // Build worksheet manually so we can attach cell.s styles
  const wsData: { [addr: string]: XLSX.CellObject } = {};

  // Header row (row 0)
  headers.forEach((h, ci) => {
    const addr = XLSX.utils.encode_cell({ r: 0, c: ci });
    wsData[addr] = {
      t: 's', v: h,
      s: {
        fill: { patternType: 'solid', fgColor: { rgb: '1A1208' } },
        font: { bold: true, color: { rgb: 'FFC107' } },
        alignment: { wrapText: true },
      },
    };
  });

  // Data rows
  rows.forEach((row, ri) => {
    headers.forEach((col, ci) => {
      const addr = XLSX.utils.encode_cell({ r: ri + 1, c: ci });
      const val = (row as Record<string, unknown>)[col];
      const cell = makeCell(val);

      const evenRow = ri % 2 === 1;
      const baseBg = evenRow ? 'F5F0E8' : 'FFFFFF';

      if (NUM_RISK_COLS.has(col) && typeof val === 'number') {
        const rgb = numericRGB(val);
        cell.s = { ...solidFill(rgb), font: { bold: true, color: { rgb: 'FFFFFF' } } };
      } else if (col === 'Carrier Avg Capacity (%)' && typeof val === 'number') {
        const rgb = capacityRGB(val);
        cell.s = { ...solidFill(rgb), font: { bold: true, color: { rgb: 'FFFFFF' } } };
      } else if (col === 'Carrier Avg Delay (d)' && typeof val === 'number') {
        const rgb = delayDaysRGB(val);
        cell.s = { ...solidFill(rgb), font: { bold: true, color: { rgb: 'FFFFFF' } } };
      } else if (col === 'Top Chokepoint Risk') {
        const rgb = riskTextRGB(String(val));
        cell.s = { ...solidFill(rgb), font: { bold: true, color: { rgb: 'FFFFFF' } } };
      } else {
        cell.s = { fill: { patternType: 'solid', fgColor: { rgb: baseBg } } };
      }

      wsData[addr] = cell;
    });
  });

  // Sheet range
  const ref = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: rows.length, c: headers.length - 1 },
  });
  const ws: XLSX.WorkSheet = { ...wsData, '!ref': ref };
  ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 2, 14) }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'SCI History');
  buildTrendsSheet(history, wb);
  buildEventSheet(history, wb);
  XLSX.writeFile(wb, `Supplyside(${dateStamp()}).xlsx`, { cellStyles: true });
}

function trigger(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
