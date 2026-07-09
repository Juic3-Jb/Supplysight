export const FALLBACK_NEWS = [
  { title: 'Mississippi River low water tightens grain barge capacity again', source: 'Reuters', url: '#', region: 'North America', commodity: 'Agriculture', mode: 'river', impact: 'high', summary: 'Draft restrictions force lighter loads, raising per-ton barge costs as harvest exports peak.' },
  { title: 'Panama Canal eases draft limits as reservoir levels recover', source: 'gCaptain', url: '#', region: 'North America', commodity: 'Consumer Goods', mode: 'sea', impact: 'medium', summary: 'Transit slots increase but operators keep contingency routings via Suez and US land bridge.' },
  { title: 'Australia iron ore exports steady despite cyclone season risks', source: 'Bloomberg', url: '#', region: 'Oceania', commodity: 'Raw Materials', mode: 'sea', impact: 'low', summary: 'Pilbara loadings on schedule; weather windows monitored across northwest shipping lanes.' },
  { title: 'US air cargo demand climbs as shippers bypass ocean delays', source: 'FreightWaves', url: '#', region: 'North America', commodity: 'Electronics', mode: 'air', impact: 'medium', summary: 'Express belly and freighter capacity tightens on transpacific lanes; rates trend upward.' },
  { title: 'Brazil soy logistics strained at Santos amid record volumes', source: 'Financial Times', url: '#', region: 'South America', commodity: 'Agriculture', mode: 'sea', impact: 'medium', summary: 'Truck queues and berth waits lengthen as export season overwhelms northern arc ports.' },
  { title: 'Red Sea diversions keep Asia-Europe transit times elevated', source: 'Al Jazeera', url: '#', region: 'Middle East', commodity: 'Consumer Goods', mode: 'sea', impact: 'critical', summary: 'Carriers maintain Cape routing, adding roughly two weeks and elevated fuel surcharges.' },
];

export const FALLBACK_CHOKE = [
  { name: 'Suez Canal', riskLevel: 'high', addedDelayDays: 4, notes: 'Red Sea diversion ongoing' },
  { name: 'Strait of Hormuz', riskLevel: 'high', addedDelayDays: 2, notes: 'Elevated Gulf tension' },
  { name: 'Bab-el-Mandeb', riskLevel: 'critical', addedDelayDays: 14, notes: 'Most carriers avoiding' },
  { name: 'Panama Canal', riskLevel: 'high', addedDelayDays: 5, notes: 'Draft restrictions; slot limits' },
  { name: 'Strait of Malacca', riskLevel: 'medium', addedDelayDays: 1, notes: 'Congestion, monsoon' },
  { name: 'Mississippi River', riskLevel: 'medium', addedDelayDays: 3, notes: 'Low water; reduced barge drafts' },
];

export const FALLBACK_JIT = [
  { severity: 'critical', region: 'Red Sea / Suez', commodity: 'Consumer Goods', mode: 'sea', estimatedDelayDays: 14, impact: 'Retail & auto JIT severely disrupted', recommendedAction: 'Hold Cape routing; build buffer stock' },
  { severity: 'high', region: 'Mississippi River', commodity: 'Grain / Agri', mode: 'river', estimatedDelayDays: 6, impact: 'US export grain throughput constrained', recommendedAction: 'Shift volume to rail intermodal' },
  { severity: 'high', region: 'Panama Canal', commodity: 'Consumer Goods', mode: 'sea', estimatedDelayDays: 5, impact: 'Transpacific-to-Gulf transit slowed', recommendedAction: 'Use US West Coast land bridge' },
  { severity: 'medium', region: 'Transpacific Air', commodity: 'Electronics', mode: 'air', estimatedDelayDays: 2, impact: 'Express capacity tightening, rates up', recommendedAction: 'Pre-book peak-season air blocks' },
];

export const STRATEGIC_FLOWS = [
  { type: 'humanitarian', origin: 'WFP / Global', destination: 'Horn of Africa', description: 'Emergency food aid corridor via Djibouti & Mombasa', status: 'active', category: 'Food Security' },
  { type: 'medical', origin: 'WHO / Gavi', destination: 'Sub-Saharan Africa', description: 'Vaccine cold-chain airlift to regional hubs', status: 'active', category: 'Health' },
  { type: 'military', origin: 'USA / NATO', destination: 'Eastern Europe', description: 'Defense equipment & ammunition sealift/airlift', status: 'active', category: 'Defense Aid' },
  { type: 'humanitarian', origin: 'ICRC / UN', destination: 'Middle East', description: 'Relief supplies amid regional displacement', status: 'delayed', category: 'Relief' },
  { type: 'military', origin: 'Multiple', destination: 'Indo-Pacific', description: 'Tracked arms transfers & naval logistics', status: 'active', category: 'Arms Transfer' },
];

export const WEATHER_EVENTS = [
  { location: 'Mississippi River', type: 'Low water / drought', severity: 'high', portImpact: 'Barge draft cuts', estimatedDelayDays: 3 },
  { location: 'NW Pacific', type: 'Cyclone season', severity: 'medium', portImpact: 'Oceania lane risk', estimatedDelayDays: 2 },
  { location: 'Gulf of Mexico', type: 'Storm watch', severity: 'medium', portImpact: 'Houston/NOLA delays', estimatedDelayDays: 2 },
  { location: 'Indian Ocean', type: 'Monsoon surge', severity: 'low', portImpact: 'Malacca visibility', estimatedDelayDays: 1 }
];

export const generateMockPortDetail = (portName: string) => {
  const congestions = ['low', 'moderate', 'high', 'severe'];
  const trends = ['up', 'stable', 'down'];
  return {
    congestion: congestions[Math.floor(Math.random() * congestions.length)],
    avgDwellDays: Math.floor(Math.random() * 10) + 1,
    vesselsWaiting: Math.floor(Math.random() * 40),
    throughputTrend: trends[Math.floor(Math.random() * trends.length)],
    capacityPct: Math.floor(Math.random() * 40) + 60,
    keyRisk: `Fluctuating labor availability and seasonal surges impacting ${portName}.`,
    summary: `Terminal operations at ${portName} are currently processing volumes with some intermittent backlog at main berths.`,
    articles: [
      { headline: `Throughput update at ${portName} terminal`, source: "Lloyd's List", url: '#', date: new Date().toISOString().split('T')[0] },
      { headline: `Local weather patterns threaten ${portName} schedules`, source: 'FreightWaves', url: '#', date: new Date().toISOString().split('T')[0] }
    ]
  };
};

export const generateMockThreatDetail = (chokeName: string, baseRisk: string) => {
  const levels = ['low', 'medium', 'high', 'critical'];
  const impacts = ['Minimal disruption', 'Rerouting adding transit time', 'Significant delays requiring multi-modal shift', 'Vessel diversions actively underway'];
  
  return {
    threatLevel: baseRisk,
    headline: `Active situation monitored at ${chokeName}`,
    reasons: ['Geopolitical posturing in regional waters', 'Insurance premiums elevated for specific carrier classes', 'Naval escort requirements slowing convoy transits'],
    impact: impacts[Math.floor(Math.random() * impacts.length)],
    affectedCommodities: ['Consumer Goods', 'Fossil Fuels', 'Raw Materials'].slice(0, Math.floor(Math.random() * 3) + 1),
    addedDelayDays: Math.floor(Math.random() * 12),
    alternativeRoute: `Bypass routing adds approximately ${Math.floor(Math.random() * 10) + 5} days to schedule.`,
    articles: [
      { headline: `Security advisory issued for ${chokeName} approaches`, source: 'Reuters', url: '#', date: new Date().toISOString().split('T')[0] },
      { headline: `Carriers assess ${chokeName} transit viability`, source: 'Bloomberg', url: '#', date: new Date().toISOString().split('T')[0] }
    ]
  };
};
