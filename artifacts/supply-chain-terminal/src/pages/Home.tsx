import { useState, useEffect, useRef } from "react";
import { drawMap } from "@/lib/mapRenderer";
import { generateSimulatedData, getRiskColor, getTrendColor } from "@/lib/simulation";
import { generateMockPortDetail, generateMockThreatDetail } from "@/lib/mockData";
import { PORTS, ROUTES, CHOKE_POINTS, REGIONS, LAND, LAKES } from "@/data/geo";
import { Loader2, RefreshCw, TerminalSquare, AlertTriangle, Radio, Activity, Clock, ShieldAlert, Navigation } from "lucide-react";

export default function Home() {
  const [phase, setPhase] = useState("loading");
  const [prog, setProg] = useState(0);
  const [pLabel, setPLabel] = useState("Initializing global deep scan...");
  const [scanLog, setScanLog] = useState<string[]>([]);
  const [clock, setClock] = useState("");
  const [lastScan, setLastScan] = useState("");
  
  const [data, setData] = useState<any>(null);
  
  const [tickerItems, setTickerItems] = useState<{t: string, c: string, txt: string}[]>([]);
  const [selRoute, setSelRoute] = useState<string | null>(null);
  const [portInfo, setPortInfo] = useState<any>(null);
  const [portDetail, setPortDetail] = useState<any>(null);
  const [loadingPort, setLoadingPort] = useState(false);
  const [threatInfo, setThreatInfo] = useState<any>(null);
  const [threatDetail, setThreatDetail] = useState<any>(null);
  const [loadingThreat, setLoadingThreat] = useState(false);
  
  const [timelineDay, setTimelineDay] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState("matrix");
  const [newsFilter, setNewsFilter] = useState("all");
  const [zoomRegion, setZoomRegion] = useState<any>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const srRef = useRef<string | null>(null);
  const tlRef = useRef<number>(0);
  const zoomRef = useRef<any>(null);

  useEffect(() => { srRef.current = selRoute; }, [selRoute]);
  useEffect(() => { tlRef.current = timelineDay; }, [timelineDay]);
  useEffect(() => { zoomRef.current = zoomRegion ? zoomRegion.box : null; }, [zoomRegion]);

  useEffect(() => {
    const c = canvasRef.current;
    const setSize = () => {
      if (!c) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = (c.clientWidth || 800) * dpr;
      c.height = (c.clientHeight || 360) * dpr;
    };
    setSize();
    
    const frame = () => {
      const cv = canvasRef.current;
      if (cv) drawMap(cv, Date.now(), srRef.current, tlRef.current, zoomRef.current, LAND, LAKES);
      animRef.current = requestAnimationFrame(frame);
    };
    animRef.current = requestAnimationFrame(frame);
    window.addEventListener('resize', setSize);
    return () => { 
      if (animRef.current) cancelAnimationFrame(animRef.current); 
      window.removeEventListener('resize', setSize); 
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setClock(new Date().toUTCString().slice(5, 25)), 1000);
    setClock(new Date().toUTCString().slice(5, 25));
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!playing || !selRoute) return;
    const id = setInterval(() => {
      setTimelineDay(d => {
        const route = ROUTES.find((r: any) => r.id === selRoute);
        const tr = route?.d || 10;
        const total = tr + Math.round(tr * 0.4);
        if (d >= total) { setPlaying(false); return total; }
        return +(d + Math.max(tr / 40, 0.2)).toFixed(2);
      });
    }, 120);
    return () => clearInterval(id);
  }, [playing, selRoute]);

  useEffect(() => {
    setTimelineDay(0);
    setPlaying(false);
  }, [selRoute]);

  const log = (m: string) => setScanLog(p => [...p.slice(-10), `[${new Date().toUTCString().slice(17, 25)}] ${m}`]);

  const gather = async () => {
    setPhase('loading');
    setProg(0);
    setScanLog([]);
    setPLabel('Scanning all regions: Asia, Middle East, Africa, Americas, Oceania...');
    
    log('Initiating global multi-region intelligence sweep...');
    await new Promise(r => setTimeout(r, 400));
    setProg(25);
    log('Querying chokepoints: Suez, Hormuz, Panama, Malacca, Mississippi...');
    
    await new Promise(r => setTimeout(r, 400));
    setProg(50);
    log('Analyzing commodities, carriers & premium freight cost trends...');
    
    await new Promise(r => setTimeout(r, 400));
    setProg(75);
    log('Integrating weather, strategic transfers & JIT delay model...');
    
    await new Promise(r => setTimeout(r, 400));
    setProg(92);
    setPLabel('Finalizing synthesis & validating data streams...');
    log('All streams synchronized. Distribution network model ready.');
    
    await new Promise(r => setTimeout(r, 400));
    
    const simData = generateSimulatedData();
    setData(simData);
    
    const items: any[] = [];
    simData.news.slice(0, 7).forEach(n => items.push({ t: (n.impact || '').toUpperCase(), c: getRiskColor(n.impact), txt: `${n.region}: ${n.title}` }));
    simData.strategic.slice(0, 4).forEach(f => {
      const tc = { medical: '#4ade80', humanitarian: '#5ab0ff', military: '#ff5a3c' }[f.type as string] || '#ff9020';
      items.push({ t: (f.type || '').toUpperCase(), c: tc, txt: `${f.origin} → ${f.destination}` });
    });
    simData.chokepoints.forEach(c => items.push({ t: 'CORRIDOR', c: getRiskColor(c.riskLevel), txt: `${c.name} — ${(c.riskLevel || '').toUpperCase()}${c.addedDelayDays ? ` (+${c.addedDelayDays}d)` : ''}` }));
    setTickerItems(items);

    setProg(100);
    setLastScan(new Date().toUTCString().slice(5, 25));
    setPhase('ready');
  };

  useEffect(() => { gather(); }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current; 
    if (!c) return;
    
    const rect = c.getBoundingClientRect();
    const sx = c.width / rect.width, sy = c.height / rect.height;
    const cx = (e.clientX - rect.left) * sx, cy = (e.clientY - rect.top) * sy;
    const box = zoomRef.current;
    
    // Simplistic projection logic replicated for click hit test
    const makeProjLocal = (w: number, h: number, b: number[] | null) => {
      if (!b) return (lon: number, lat: number) => ({ x: ((lon + 180) / 360) * w, y: ((90 - lat) / 180) * h });
      const [loMin, loMax, laMin, laMax] = b;
      return (lon: number, lat: number) => ({ x: ((lon - loMin) / (loMax - loMin)) * w, y: ((laMax - lat) / (laMax - laMin)) * h });
    };
    
    const proj = makeProjLocal(c.width, c.height, box);
    
    let cHit: any = null, cMinD = (box ? 28 : 22) * sx;
    CHOKE_POINTS.forEach(cz => {
      const p = proj(cz.lon, cz.lat);
      const d = Math.hypot(p.x - cx, p.y - cy);
      if (d < cMinD) { cMinD = d; cHit = cz; }
    });
    
    if (cHit) {
      setThreatInfo(cHit); setPortInfo(null); setPortDetail(null);
      setLoadingThreat(true);
      setTimeout(() => {
        setThreatDetail(generateMockThreatDetail(cHit.l, cHit.risk));
        setLoadingThreat(false);
      }, 600);
      return;
    }
    
    let closest: any = null, minD = (box ? 30 : 24) * sx;
    Object.entries(PORTS).forEach(([id, port]) => {
      const p = proj(port.lon, port.lat);
      const d = Math.hypot(p.x - cx, p.y - cy);
      if (d < minD) { minD = d; closest = { id, ...port }; }
    });
    
    if (closest) {
      setPortInfo(closest); setThreatInfo(null); setThreatDetail(null);
      setLoadingPort(true);
      setTimeout(() => {
        setPortDetail(generateMockPortDetail(closest.n));
        setLoadingPort(false);
      }, 600);
    }
  };

  const getModeColor = (m: string) => { return { sea: '#ff9020', air: '#ffd24a', rail: '#ff6a3a', river: '#ffb84d', road: '#ff8a4a' }[m] || '#ff9020'; }

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0602] flex flex-col items-center justify-center relative overflow-hidden font-mono text-primary">
        <div className="absolute inset-0 radial-gradient-mask opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 45%, var(--color-primary), transparent 65%)' }} />
        <div className="z-10 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <div className="text-[10px] text-primary/60 tracking-[0.3em]">SUPPLY CHAIN INTELLIGENCE FRAMEWORK</div>
          </div>
          <div className="text-xl tracking-[0.2em] font-bold text-primary-foreground bg-primary px-3 py-1 mb-2 glow-box">◈ GLOBAL DISTRIBUTION SCAN</div>
          <div className="text-[10px] text-primary/70 tracking-[0.2em] mb-10">SEA · AIR · RAIL · RIVER · INTERSTATE</div>
          
          <div className="w-[500px] max-w-[90vw] h-2 bg-black border border-primary/30 rounded overflow-hidden mb-3">
            <div className="h-full bg-primary transition-all duration-700 ease-out" style={{ width: `${prog}%` }} />
          </div>
          
          <div className="text-[11px] text-primary/80 mb-6 h-5">{pLabel}</div>
          
          <div className="flex gap-4 mb-8 text-[10px] text-primary/60">
            <span>{prog}% COMPLETE</span>
            <span>|</span>
            <span>{scanLog.length} OPS LOGGED</span>
            <span>|</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary animate-pulse"/> 14 STREAMS</span>
          </div>
          
          <div className="w-[500px] max-w-[90vw] h-[180px] bg-black/50 border border-primary/20 rounded p-4 overflow-y-auto text-[10px] font-mono text-primary/50 text-left">
            {scanLog.map((l, i) => (
              <div key={i} className={`mb-1 ${i === scanLog.length - 1 ? 'text-primary' : ''}`}>
                {i === scanLog.length - 1 ? '▶' : ' '} {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground font-mono overflow-hidden scanline">
      {/* Header */}
      <header className="h-[40px] flex-none bg-[#110a05] border-b border-primary/20 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <TerminalSquare className="w-4 h-4 text-primary" />
          <span className="font-bold text-xs tracking-widest text-primary glow-text">GLOBAL SUPPLY CHAIN INTELLIGENCE</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[10px] text-primary/60">
            <Clock className="w-3 h-3" />
            <span>{clock}</span>
          </div>
          {lastScan && (
            <div className="flex items-center gap-2 text-[10px] text-primary/50">
              <span>LAST SCAN: {lastScan}</span>
            </div>
          )}
          <button 
            onClick={gather}
            className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/40 text-primary px-3 py-1 rounded text-[10px] tracking-wider transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> DEEP SCAN
          </button>
        </div>
      </header>

      {/* Ticker */}
      <div className="h-[24px] flex-none bg-black border-b border-primary/10 flex items-center overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-primary text-black text-[9px] font-bold flex items-center justify-center tracking-widest z-10">
          ● LIVE
        </div>
        <div className="flex whitespace-nowrap pl-28 animate-[ticker_60s_linear_infinite]">
          {([...tickerItems, ...tickerItems]).map((it, i) => (
            <div key={i} className="flex items-center gap-2 mx-4 text-[10px]">
              <span className="border border-current px-1 rounded-sm text-[9px]" style={{color: it.c}}>{it.t}</span>
              <span className="text-primary/80">{it.txt}</span>
              <span className="text-primary/30 ml-2">◈</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-[260px_1fr_300px] gap-[1px] bg-primary/20">
        
        {/* Left Col: Risk & Delay */}
        <div className="bg-background flex flex-col overflow-hidden">
          <div className="h-8 flex-none bg-[#110a05] border-b border-primary/10 flex items-center px-3 text-[10px] font-bold text-primary tracking-widest uppercase">
            ▸ Regional Risk Index
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 scrollbar-none">
            
            <div className="space-y-3">
              {[
                { l: 'Asia-Pacific', v: data.risks.asia },
                { l: 'Middle East', v: data.risks.me },
                { l: 'Africa', v: data.risks.africa },
                { l: 'Americas', v: data.risks.americas },
                { l: 'Oceania', v: data.risks.oceania }
              ].map(r => (
                <div key={r.l}>
                  <div className="flex justify-between items-end mb-1 text-[10px]">
                    <span className="text-primary/70">{r.l}</span>
                    <span className="font-bold text-[12px]" style={{color: getRiskColor(r.v)}}>{r.v}<span className="text-[9px] text-primary/40 font-normal">/100</span></span>
                  </div>
                  <div className="h-1.5 bg-black rounded-full overflow-hidden border border-primary/10">
                    <div className="h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_currentcolor]" style={{ width: `${r.v}%`, backgroundColor: getRiskColor(r.v) }} />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-3 border-t border-primary/10 space-y-2">
              <div className="text-[10px] font-bold text-primary/80 tracking-widest mb-3 uppercase">▸ Chokepoint Status</div>
              {data.chokepoints.map((cp: any, i: number) => (
                <div key={i} className="p-2 rounded bg-black/40 border-l-2" style={{ borderColor: getRiskColor(cp.riskLevel) }}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-primary/90">{cp.name}</span>
                    <span className="text-[9px] font-bold" style={{color: getRiskColor(cp.riskLevel)}}>{cp.riskLevel.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] text-primary/60 max-w-[70%]">{cp.notes}</span>
                    {cp.addedDelayDays > 0 && <span className="text-[10px] font-bold text-[#ff9020]">+{cp.addedDelayDays}d</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-primary/10 space-y-2 pb-2">
              <div className="text-[10px] font-bold text-primary/80 tracking-widest mb-2 uppercase">▸ Delay Index (Mode)</div>
              {[
                { l: 'Ocean', v: data.delayIdx.sea },
                { l: 'Air', v: data.delayIdx.air },
                { l: 'Rail', v: data.delayIdx.rail },
                { l: 'River (MS)', v: data.delayIdx.river }
              ].map(d => (
                <div key={d.l} className="flex justify-between items-center bg-black/20 p-1.5 rounded border border-primary/5">
                  <span className="text-[10px] text-primary/70">{d.l}</span>
                  <span className="text-[11px] font-bold" style={{color: getRiskColor(d.v)}}>{d.v}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Center: Map */}
        <div className="bg-background flex flex-col relative overflow-hidden group">
          <div className="h-8 flex-none bg-[#110a05] border-b border-primary/10 flex items-center justify-between px-3 text-[10px] font-bold text-primary tracking-widest uppercase">
            <span>▸ Global Network — Live Overlay {zoomRegion ? `— ${zoomRegion.n}` : ''}</span>
            <span className="text-[9px] text-primary/50 font-normal normal-case flex items-center gap-2"><Navigation className="w-3 h-3"/> Click nodes & ⚠ threats</span>
          </div>
          
          <div className="absolute top-10 left-3 right-3 flex justify-between items-start z-10 pointer-events-none">
            <div className="flex gap-1 bg-black/60 backdrop-blur p-1 rounded border border-primary/20 pointer-events-auto">
              <span className="text-[9px] text-primary/50 px-2 py-1 flex items-center">ZOOM:</span>
              <button onClick={() => setZoomRegion(null)} className={`px-2 py-1 rounded text-[9px] transition-colors ${!zoomRegion ? 'bg-primary text-black font-bold' : 'text-primary/70 hover:bg-primary/20'}`}>WORLD</button>
              {REGIONS.map((rg: any) => (
                <button key={rg.id} onClick={() => setZoomRegion(zoomRegion?.id === rg.id ? null : rg)} className={`px-2 py-1 rounded text-[9px] transition-colors ${zoomRegion?.id === rg.id ? 'bg-primary text-black font-bold' : 'text-primary/70 hover:bg-primary/20'}`}>
                  {rg.n}
                </button>
              ))}
            </div>
          </div>

          <canvas ref={canvasRef} onClick={handleCanvasClick} className="w-full flex-1 block cursor-crosshair" />

          {/* Threat Popup */}
          {threatInfo && (
            <div className="absolute top-20 left-4 w-72 bg-black/95 border rounded-md shadow-2xl z-20 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" style={{ borderColor: getRiskColor(threatInfo.risk) }}>
              <div className="p-3 border-b flex justify-between items-start" style={{ borderColor: getRiskColor(threatInfo.risk) + '40', backgroundColor: getRiskColor(threatInfo.risk) + '15' }}>
                <div>
                  <div className="text-[11px] font-bold flex items-center gap-2" style={{ color: getRiskColor(threatInfo.risk) }}><ShieldAlert className="w-4 h-4"/> ⚠ {threatInfo.l}</div>
                  <div className="text-[9px] text-primary/50 mt-1 uppercase tracking-wider">Threat Assessment</div>
                </div>
                <button onClick={() => { setThreatInfo(null); setThreatDetail(null); }} className="text-primary/50 hover:text-primary p-1">✕</button>
              </div>
              <div className="p-3 max-h-[300px] overflow-y-auto">
                {loadingThreat ? (
                  <div className="py-8 text-center text-[10px] text-primary flex flex-col items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin"/>
                    Analyzing threat intelligence...
                  </div>
                ) : threatDetail ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold text-black" style={{ backgroundColor: getRiskColor(threatDetail.threatLevel) }}>
                        {(threatDetail.threatLevel || '').toUpperCase()}
                      </span>
                      {threatDetail.addedDelayDays > 0 && <span className="text-[10px] font-bold text-[#ff9020]">+{threatDetail.addedDelayDays}d Delay</span>}
                    </div>
                    {threatDetail.headline && <div className="text-[11px] font-bold text-primary/90">{threatDetail.headline}</div>}
                    
                    <div>
                      <div className="text-[9px] text-primary/50 tracking-wider mb-1 uppercase">▸ Why this threat level</div>
                      {threatDetail.reasons.map((rsn: string, i: number) => (
                        <div key={i} className="flex gap-2 mb-1 text-[10px]">
                          <span style={{ color: getRiskColor(threatDetail.threatLevel) }}>▪</span>
                          <span className="text-primary/80">{rsn}</span>
                        </div>
                      ))}
                    </div>

                    {threatDetail.impact && (
                      <div className="pt-2 border-t border-primary/20">
                        <div className="text-[9px] text-primary/50 tracking-wider mb-1 uppercase">Supply Chain Impact</div>
                        <div className="text-[10px] text-primary/80">{threatDetail.impact}</div>
                      </div>
                    )}

                    {threatDetail.affectedCommodities?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {threatDetail.affectedCommodities.map((cm: string, i: number) => (
                          <span key={i} className="bg-primary/10 border border-primary/30 text-primary/80 text-[9px] px-1.5 py-0.5 rounded">{cm}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Port Popup */}
          {portInfo && (
            <div className="absolute top-20 right-4 w-72 bg-black/95 border rounded-md shadow-2xl z-20 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" style={{ borderColor: getModeColor(portInfo.t) }}>
              <div className="p-3 border-b flex justify-between items-start" style={{ borderColor: getModeColor(portInfo.t) + '40', backgroundColor: getModeColor(portInfo.t) + '15' }}>
                <div>
                  <div className="text-[11px] font-bold flex items-center gap-2" style={{ color: getModeColor(portInfo.t) }}><Radio className="w-4 h-4"/> ◉ {portInfo.n}</div>
                  <div className="text-[9px] text-primary/50 mt-1 uppercase tracking-wider">{(portInfo.t || '').toUpperCase()} NODE · Intelligence</div>
                </div>
                <button onClick={() => { setPortInfo(null); setPortDetail(null); }} className="text-primary/50 hover:text-primary p-1">✕</button>
              </div>
              <div className="p-3 max-h-[300px] overflow-y-auto">
                {loadingPort ? (
                  <div className="py-8 text-center text-[10px] text-primary flex flex-col items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin"/>
                    Querying live data & sources...
                  </div>
                ) : portDetail ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { l: 'Congestion', v: (portDetail.congestion || '—').toUpperCase(), c: ({ LOW: '#ffd24a', MODERATE: '#ffb020', HIGH: '#ff7a1a', SEVERE: '#ff3b30' } as Record<string, string>)[(portDetail.congestion || '').toUpperCase()] || '#c0a070' },
                        { l: 'Capacity', v: typeof portDetail.capacityPct === 'number' ? `${portDetail.capacityPct}%` : '—', c: getRiskColor(typeof portDetail.capacityPct === 'number' ? portDetail.capacityPct : 50) },
                        { l: 'Avg Dwell', v: portDetail.avgDwellDays != null ? `${portDetail.avgDwellDays}d` : '—', c: '#e0c088' },
                        { l: 'In Queue', v: portDetail.vesselsWaiting ?? '—', c: '#e0c088' }
                      ].map(row => (
                        <div key={row.l} className="bg-black/40 rounded p-2 border border-primary/10">
                          <div className="text-[9px] text-primary/50 mb-1 uppercase">{row.l}</div>
                          <div className="font-bold text-[13px]" style={{ color: row.c }}>{row.v}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2 text-[10px] bg-black/30 p-2 rounded">
                      <span className="text-primary/60 uppercase">Throughput:</span>
                      <span className="font-bold" style={{ color: getTrendColor(portDetail.throughputTrend) }}>
                        {portDetail.throughputTrend === 'up' ? '↑ RISING' : portDetail.throughputTrend === 'down' ? '↓ FALLING' : '→ STABLE'}
                      </span>
                    </div>

                    <div className="text-[10px] text-primary/80 leading-relaxed border-l-2 border-primary/30 pl-2 py-1">
                      {portDetail.summary}
                    </div>

                    <div className="pt-2">
                      <div className="text-[9px] text-[#ff9020] uppercase tracking-wider flex items-center gap-1 mb-1"><AlertTriangle className="w-3 h-3"/> Key Risk</div>
                      <div className="text-[10px] text-primary/70">{portDetail.keyRisk}</div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Timeline Panel */}
          {selRoute && (() => {
            const r: any = ROUTES.find((x: any) => x.id === selRoute);
            if (!r || !r.ports) return null;
            const transitDays = r.d; 
            const totalDays = transitDays + Math.round(transitDays * 0.4);
            const isPast = timelineDay <= transitDays;
            const phaseLbl = timelineDay <= 0.1 ? 'AT ORIGIN' : timelineDay >= totalDays ? 'ARRIVED' : isPast ? 'IN TRANSIT' : 'FORECAST DELAY';
            const stops = r.ports.map((p: string, i: number) => ({ n: (PORTS as any)[p]?.n || p, day: (i / Math.max(r.ports.length - 1, 1)) * transitDays }));
            
            return (
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-primary/30 p-3 z-10">
                <div className="flex items-center gap-3 mb-2 text-[10px] uppercase">
                  <button onClick={() => { if (timelineDay >= totalDays) setTimelineDay(0); setPlaying(p => !p); }} 
                    className={`w-6 h-6 flex items-center justify-center rounded border transition-colors ${playing ? 'border-[#4ade80] text-[#4ade80] bg-[#4ade80]/10' : 'border-primary text-primary bg-primary/10 hover:bg-primary/20'}`}>
                    {playing ? '❚❚' : '▶'}
                  </button>
                  <span className="font-bold text-primary tracking-widest">⏱ Shipment Timeline</span>
                  <span className={`font-bold ${isPast ? 'text-[#ff9020]' : 'text-destructive'}`}>{phaseLbl}</span>
                  <span className="text-primary/60 ml-auto">
                    Day {Math.floor(timelineDay)} / {totalDays} 
                    {!isPast && <span className="text-destructive ml-1">(+{Math.ceil(timelineDay - transitDays)}d)</span>}
                  </span>
                  <button onClick={() => { setTimelineDay(0); setPlaying(false); }} className="text-[9px] text-primary/50 hover:text-primary border border-primary/30 px-2 py-0.5 rounded">RESET</button>
                </div>
                
                <div className="relative h-6 mt-1">
                  {/* Base track */}
                  <div className="absolute top-2.5 left-0 right-0 h-1 rounded flex overflow-hidden">
                    <div style={{ width: `${(transitDays / totalDays) * 100}%` }} className="bg-gradient-to-r from-primary/30 to-primary/80" />
                    <div style={{ width: `${((totalDays - transitDays) / totalDays) * 100}%` }} className="bg-[repeating-linear-gradient(45deg,var(--color-primary)_0,var(--color-primary)_2px,transparent_2px,transparent_6px)] opacity-20" />
                  </div>
                  {/* Progress fill */}
                  <div className="absolute top-2.5 left-0 h-1 rounded transition-all duration-75" 
                    style={{ width: `${(timelineDay / totalDays) * 100}%`, backgroundColor: isPast ? '#ff9020' : '#ff3b30', boxShadow: '0 0 8px currentColor' }} />
                  
                  {/* Stops */}
                  {stops.map((s: any, i: number) => (
                    <div key={i} title={s.n} className="absolute top-1.5 -translate-x-1/2" style={{ left: `${(s.day / totalDays) * 100}%` }}>
                      <div className={`w-3 h-3 rounded-full border-2 ${timelineDay >= s.day ? 'bg-[#ffce4a] border-white shadow-[0_0_8px_#ffce4a]' : 'bg-black border-primary/60'}`} />
                    </div>
                  ))}
                  
                  {/* Delay divider */}
                  <div className="absolute top-1 w-[2px] h-4 bg-destructive -translate-x-1/2" style={{ left: `${(transitDays / totalDays) * 100}%` }} />
                  
                  <input type="range" min={0} max={totalDays} step={0.25} value={timelineDay} onChange={e => { setTimelineDay(parseFloat(e.target.value)); setPlaying(false); }} 
                    className="absolute top-1 -left-[2px] w-[calc(100%+4px)] h-4 m-0 opacity-0 cursor-pointer z-10" />
                </div>
                <div className="flex justify-between text-[9px] text-primary/60 mt-1 uppercase tracking-wider">
                  <span>◉ {stops[0].n}</span>
                  <span className="text-primary/40">ETA Day {transitDays} ▲</span>
                  <span>{stops[stops.length-1].n} ◉</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right: News */}
        <div className="bg-background flex flex-col overflow-hidden">
          <div className="h-8 flex-none bg-[#110a05] border-b border-primary/10 flex items-center px-3 text-[10px] font-bold text-primary tracking-widest uppercase">
            <Activity className="w-4 h-4 mr-2"/> Live Intelligence Feed
          </div>
          <div className="flex-none p-2 border-b border-primary/10 flex flex-wrap gap-1">
            {['all', 'Europe', 'North America', 'Asia', 'Middle East', 'Africa'].map(f => (
              <button key={f} onClick={() => setNewsFilter(f)} 
                className={`px-2 py-0.5 rounded text-[9px] uppercase transition-colors ${newsFilter === f ? 'bg-primary text-black font-bold' : 'border border-primary/20 text-primary/60 hover:text-primary'}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-none">
            {data.news.filter((it: any) => newsFilter === 'all' || it.region === newsFilter).map((item: any, i: number) => {
              const Wrap: any = item.url ? 'a' : 'div';
              const wp = item.url ? { href: item.url, target: '_blank', rel: 'noopener noreferrer' } : {};
              const impactCol = getRiskColor(item.impact);
              return (
                <Wrap key={i} {...wp} className="block p-3 rounded bg-black/40 border-l-2 hover:bg-black/60 transition-colors cursor-pointer group" style={{ borderColor: impactCol }}>
                  <div className="flex justify-between mb-1.5 items-center">
                    <span className="text-[9px] font-bold tracking-wider px-1 rounded bg-current/10" style={{ color: impactCol }}>
                      {(item.impact || '').toUpperCase()} · {item.mode ? item.mode.toUpperCase() : ''}
                    </span>
                    <span className="text-[9px] text-primary/50 uppercase">{item.region}</span>
                  </div>
                  <div className="text-[11px] font-bold text-primary/90 leading-snug mb-1 group-hover:text-primary transition-colors">{item.title}</div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] text-primary/60">{item.source} · {item.commodity}</span>
                    <span className="text-[9px] text-[#4ade80] opacity-0 group-hover:opacity-100 transition-opacity">↗ READ</span>
                  </div>
                  <div className="text-[10px] text-primary/50 leading-relaxed line-clamp-2">{item.summary}</div>
                </Wrap>
              );
            })}
          </div>
        </div>

      </div>

      {/* Bottom Panel */}
      <div className="h-[260px] flex-none grid grid-cols-[1fr_1.2fr_1fr] gap-[1px] bg-primary/20 border-t border-primary/30">
        
        {/* Bottom Left: Tabs */}
        <div className="bg-background flex flex-col overflow-hidden">
          <div className="h-8 flex-none bg-[#110a05] border-b border-primary/10 flex items-center px-2 gap-1 overflow-x-auto scrollbar-none">
            {[
              ['matrix', 'COMMODITY'],
              ['freight', 'FREIGHT'],
              ['strategic', 'STRATEGIC'],
              ['weather', 'WEATHER']
            ].map(([k, lbl]) => (
              <button key={k} onClick={() => setActiveTab(k)} 
                className={`px-3 py-1 text-[10px] tracking-widest uppercase transition-colors ${activeTab === k ? 'text-primary font-bold border-b-2 border-primary' : 'text-primary/50 hover:text-primary/80 border-b-2 border-transparent'}`}>
                {lbl}
              </button>
            ))}
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 scrollbar-none">
            {activeTab === 'matrix' && (
              <div className="grid grid-cols-2 gap-2 h-full content-start">
                {[
                  { l: 'Automotive', v: data.commod.autos, icon: '🚗', k: 'autos' },
                  { l: 'Raw Materials', v: data.commod.raw, icon: '⛏', k: 'raw' },
                  { l: 'Natural Gas', v: data.commod.gas, icon: '🔥', k: 'gas' },
                  { l: 'Fossil Fuels', v: data.commod.fuel, icon: '🛢', k: 'fuel' },
                  { l: 'Consumer Goods', v: data.commod.goods, icon: '📦', k: 'goods' },
                  { l: 'Agriculture', v: data.commod.agri, icon: '🌾', k: 'agri' }
                ].map(c => {
                  const m = data.commodMeta[c.k] || {};
                  const tr = m.trend;
                  return (
                    <div key={c.l} className="p-2 bg-black/40 rounded border border-primary/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-primary/70 flex items-center gap-1.5 opacity-80">{c.icon} {c.l}</span>
                        <span className="flex items-center gap-1 text-[12px] font-bold" style={{ color: getRiskColor(c.v) }}>
                          {tr && <span className="text-[9px]" style={{ color: tr === 'up' ? '#ff5a3c' : tr === 'down' ? '#4ade80' : '#a07a48' }}>{tr === 'up' ? '▲' : tr === 'down' ? '▼' : '■'}</span>}
                          {c.v}
                        </span>
                      </div>
                      <div className="h-1 bg-black rounded-full overflow-hidden border border-primary/5">
                        <div className="h-full transition-all duration-1000" style={{ width: `${c.v}%`, backgroundColor: getRiskColor(c.v) }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {activeTab === 'freight' && (
              <div className="space-y-1">
                {data.freight.map((f: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-black/30 rounded hover:bg-black/50 transition-colors">
                    <div className="text-[10px] font-bold text-primary/80 truncate pr-2">{f.mode}</div>
                    <div className="flex-none text-right w-24">
                      <div className="text-[11px] font-bold text-primary">${(typeof f.cost === 'number' ? f.cost : 0).toLocaleString()}<span className="text-[9px] text-primary/50 ml-1">{f.unit}</span></div>
                    </div>
                    <div className="flex-none text-right w-16">
                      <span className="text-[10px] font-bold" style={{ color: getTrendColor(f.trend) }}>
                        {f.trend === 'up' ? '▲' : f.trend === 'down' ? '▼' : '■'} {f.chg}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'strategic' && (
              <div className="space-y-2">
                {data.strategic.map((f: any, i: number) => {
                  const tc = { medical: '#4ade80', humanitarian: '#5ab0ff', military: '#ff5a3c' }[f.type as string] || '#ff9020';
                  const ic = { medical: '⚕', humanitarian: '🤝', military: '⚔' }[f.type as string] || '◆';
                  return (
                    <div key={i} className="p-2 bg-black/40 rounded border-l-2" style={{ borderColor: tc }}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-bold tracking-widest uppercase flex items-center gap-1" style={{ color: tc }}>{ic} {f.type}</span>
                        <span className="text-[9px] font-bold uppercase" style={{ color: f.status === 'delayed' ? '#ff5a3c' : f.status === 'active' ? '#4ade80' : '#a07a48' }}>{f.status}</span>
                      </div>
                      <div className="text-[10px] text-primary/90 mb-1">{f.origin} → {f.destination}</div>
                      <div className="text-[9px] text-primary/60">{f.description}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'weather' && (
              <div className="space-y-2">
                {data.weather.map((wx: any, i: number) => (
                  <div key={i} className="p-2 bg-black/40 rounded border-l-2" style={{ borderColor: getRiskColor(wx.severity) }}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-primary/90">🌊 {wx.location}</span>
                      {wx.estimatedDelayDays > 0 && <span className="text-[10px] font-bold text-[#ff9020]">+{wx.estimatedDelayDays}d Delay</span>}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: getRiskColor(wx.severity) }}>
                      {wx.type} · {wx.severity}
                    </div>
                    <div className="text-[10px] text-primary/60">{wx.portImpact}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Center: Carrier Tracker */}
        <div className="bg-background flex flex-col overflow-hidden">
          <div className="h-8 flex-none bg-[#110a05] border-b border-primary/10 flex items-center px-3 text-[10px] font-bold text-primary tracking-widest uppercase">
            ▸ Carrier & Freight Tracker
          </div>
          <div className="flex-1 overflow-y-auto p-3 scrollbar-none">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[9px] text-primary/50 uppercase tracking-widest border-b border-primary/20">
                  <th className="pb-2 font-normal">Carrier</th>
                  <th className="pb-2 font-normal text-right">Delay</th>
                  <th className="pb-2 font-normal text-right">Capacity</th>
                  <th className="pb-2 font-normal text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="text-[10px]">
                {data.comps.map((c: any) => (
                  <tr key={c.name} className="border-b border-primary/5 hover:bg-white/5 transition-colors group">
                    <td className="py-2 text-primary/90 font-bold group-hover:text-primary">{c.name}</td>
                    <td className="py-2 text-right" style={{ color: c.delay > 4 ? '#ff5a3c' : c.delay > 2 ? '#ffb020' : '#4ade80' }}>+{c.delay}d</td>
                    <td className="py-2 text-right" style={{ color: c.cap > 88 ? '#ff5a3c' : c.cap > 75 ? '#ffb020' : '#4ade80' }}>{c.cap}%</td>
                    <td className="py-2 text-right font-bold text-[12px]" style={{ color: getTrendColor(c.st) }}>
                      {c.st === 'improving' ? '↑' : c.st === 'worsening' ? '↓' : '→'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 pt-3 border-t border-primary/20 grid grid-cols-2 gap-4">
              <div className="bg-black/30 p-2 rounded flex justify-between items-center">
                <span className="text-[9px] text-primary/50 uppercase tracking-widest">Avg Delay</span>
                <span className="text-[12px] font-bold text-[#ff9020]">
                  +{(data.comps.reduce((a: number, c: any) => a + c.delay, 0) / data.comps.length).toFixed(1)}d
                </span>
              </div>
              <div className="bg-black/30 p-2 rounded flex justify-between items-center">
                <span className="text-[9px] text-primary/50 uppercase tracking-widest">Avg Util</span>
                <span className="text-[12px] font-bold" style={{ color: getRiskColor(data.comps.reduce((a: number, c: any) => a + c.cap, 0) / data.comps.length) }}>
                  {(data.comps.reduce((a: number, c: any) => a + c.cap, 0) / data.comps.length).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Right: JIT Alerts */}
        <div className="bg-background flex flex-col overflow-hidden">
          <div className="h-8 flex-none bg-[#110a05] border-b border-primary/10 flex items-center px-3 text-[10px] font-bold text-primary tracking-widest uppercase">
            ▸ JIT Logistics Risk Alerts
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-none">
            {data.jitAlerts.map((a: any, i: number) => (
              <div key={i} className="p-2 bg-black/40 rounded border-l-2" style={{ borderColor: getRiskColor(a.severity) }}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: getRiskColor(a.severity) }}>
                    {a.severity} · {a.region}
                  </span>
                  <span className="text-[10px] font-bold text-[#ff9020]">+{a.estimatedDelayDays}d</span>
                </div>
                <div className="text-[9px] text-primary/70 mb-1">
                  {a.commodity} {a.mode ? `· ${a.mode}` : ''} · {a.impact}
                </div>
                <div className="text-[9px] text-[#4ade80] flex items-start gap-1">
                  <span className="mt-0.5">▸</span> <span>{a.recommendedAction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
