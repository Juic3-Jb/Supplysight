import * as XLSX from 'xlsx';

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

export function downloadCSV(history: Snapshot[]): void {
  if (!history.length) return;
  const rows = toRows(history);
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => JSON.stringify((r as any)[h] ?? '')).join(','))
  ].join('\n');
  trigger(new Blob([csv], { type: 'text/csv' }), 'sci-terminal-history.csv');
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
  XLSX.writeFile(wb, 'sci-terminal-history.xlsx', { cellStyles: true });
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
