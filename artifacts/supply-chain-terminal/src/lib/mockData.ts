export const FALLBACK_NEWS = [
  { title: 'Mississippi River low water tightens grain barge capacity again', source: 'Reuters', url: '#', region: 'North America', commodity: 'Agriculture', mode: 'river', impact: 'high', summary: 'Draft restrictions force lighter loads, raising per-ton barge costs as harvest exports peak.' },
  { title: 'Panama Canal eases draft limits as reservoir levels recover', source: 'gCaptain', url: '#', region: 'North America', commodity: 'Consumer Goods', mode: 'sea', impact: 'medium', summary: 'Transit slots increase but operators keep contingency routings via Suez and US land bridge.' },
  { title: 'Australia iron ore exports steady despite cyclone season risks', source: 'Bloomberg', url: '#', region: 'Oceania', commodity: 'Raw Materials', mode: 'sea', impact: 'low', summary: 'Pilbara loadings on schedule; weather windows monitored across northwest shipping lanes.' },
  { title: 'US air cargo demand climbs as shippers bypass ocean delays', source: 'FreightWaves', url: '#', region: 'North America', commodity: 'Electronics', mode: 'air', impact: 'medium', summary: 'Express belly and freighter capacity tightens on transpacific lanes; rates trend upward.' },
  { title: 'Brazil soy logistics strained at Santos amid record volumes', source: 'Financial Times', url: '#', region: 'South America', commodity: 'Agriculture', mode: 'sea', impact: 'medium', summary: 'Truck queues and berth waits lengthen as export season overwhelms northern arc ports.' },
  { title: 'Red Sea diversions keep Asia-Europe transit times elevated', source: 'Al Jazeera', url: '#', region: 'Middle East', commodity: 'Consumer Goods', mode: 'sea', impact: 'critical', summary: 'Carriers maintain Cape routing, adding roughly two weeks and elevated fuel surcharges.' },
  // Middle East
  { title: 'Houthi drone strikes force Bab-el-Mandeb night transit ban', source: 'Arab News', url: '#', region: 'Middle East', commodity: 'Fossil Fuels', mode: 'sea', impact: 'critical', summary: 'Multiple carriers suspend southbound night passages; naval escorts overwhelmed as diversion queue lengthens.' },
  { title: 'Jebel Ali throughput slips as Red Sea rerouting bloats transhipment queues', source: 'Gulf News', url: '#', region: 'Middle East', commodity: 'Consumer Goods', mode: 'sea', impact: 'high', summary: 'DP World reports 22% increase in container dwell time; feeder connections to East Africa and Indian subcontinent delayed.' },
  { title: 'Iran Strait of Hormuz posturing raises tanker war-risk premium again', source: 'Middle East Eye', url: '#', region: 'Middle East', commodity: 'Fossil Fuels', mode: 'sea', impact: 'high', summary: 'IRGC naval exercises cited by insurers; VLCC spot war-risk add-ons double in 48 hours for Gulf liftings.' },
  { title: 'Saudi Aramco pipeline diversions reroute crude away from Red Sea terminals', source: 'Energy Intelligence', url: '#', region: 'Middle East', commodity: 'Fossil Fuels', mode: 'sea', impact: 'medium', summary: 'East-West Pipeline capacity maxed out; Yanbu exports rise while Ras Tanura handles overflow VLCC liftings.' },
  { title: 'Aqaba port emerges as Red Sea bypass hub for Jordan and Iraq cargo', source: 'Jordan Times', url: '#', region: 'Middle East', commodity: 'Consumer Goods', mode: 'sea', impact: 'low', summary: 'Container volumes at Aqaba up 34% year-on-year as shippers reroute via land bridge to avoid Suez uncertainty.' },
  { title: 'Qatar LNG exports hold steady despite Gulf security tensions', source: 'The Peninsula Qatar', url: '#', region: 'Middle East', commodity: 'Fossil Fuels', mode: 'sea', impact: 'low', summary: 'QatarEnergy fleet maintains schedule; escorts and Q-flex vessel tracking heightened through Strait of Hormuz.' },
  { title: 'Turkish straits throughput rises as Black Sea grain exporters seek alternatives', source: 'Hurriyet Daily News', url: '#', region: 'Middle East', commodity: 'Agriculture', mode: 'sea', impact: 'medium', summary: 'Bosporus and Dardanelles traffic surges; Turkish port Mersin logs record transhipment volumes for grain and steel.' },
  { title: 'Oman port of Duqm positions as Indian Ocean logistics hub amid regional uncertainty', source: 'Oman Observer', url: '#', region: 'Middle East', commodity: 'Raw Materials', mode: 'sea', impact: 'low', summary: 'SEZ Duqm signs three new terminal operator agreements; bulk mineral exports from landlocked Central Asia routed via Muscat.' },
  { title: 'Iraq crude exports disrupted as Basra terminal weather window closes', source: 'Iraq Oil Report', url: '#', region: 'Middle East', commodity: 'Fossil Fuels', mode: 'sea', impact: 'medium', summary: 'Shamal winds halt offshore SPM loading for third time this quarter; 1.2m barrels per day of liftings suspended.' },
  { title: 'UAE air cargo growth accelerates as Gulf hubs absorb India-Europe rerouting', source: 'Arabian Business', url: '#', region: 'Middle East', commodity: 'Electronics', mode: 'air', impact: 'low', summary: 'Dubai and Abu Dhabi freighter movements up 19%; Emirates SkyCargo and flydubai add transpacific capacity.' },
  { title: 'Israel Haifa port volumes hit multi-year low amid regional conflict impact', source: 'Haaretz', url: '#', region: 'Middle East', commodity: 'Consumer Goods', mode: 'sea', impact: 'high', summary: 'Shipping lines skip Haifa and Ashdod calls; Israeli importers airfreighting critical goods at significant cost premium.' },
  // Asia
  { title: 'Shanghai port congestion worsens as export surge strains berths', source: 'Caixin Global', url: '#', region: 'Asia', commodity: 'Electronics', mode: 'sea', impact: 'high', summary: 'Container dwell times at Yangshan up 38%; downstream delays ripple across transpacific and Europe lanes.' },
  { title: 'Shenzhen electronics exports surge on AI hardware demand', source: 'South China Morning Post', url: '#', region: 'Asia', commodity: 'Electronics', mode: 'sea', impact: 'medium', summary: 'GPU and server component shipments from Pearl River Delta factories at multi-year highs; capacity tightens.' },
  { title: 'Strait of Malacca piracy advisory upgraded after two incidents', source: 'ReCAAP ISC', url: '#', region: 'Asia', commodity: 'Fossil Fuels', mode: 'sea', impact: 'high', summary: 'Tanker boardings reported south of Singapore; naval patrols increased and insurers raise war-risk premiums.' },
  { title: 'India rail freight network bottleneck slows automotive exports', source: 'The Hindu BusinessLine', url: '#', region: 'Asia', commodity: 'Automotive', mode: 'rail', impact: 'medium', summary: 'Dedicated freight corridor congestion near Nhava Sheva adds 4-6 days to vehicle compound dwell times.' },
  { title: 'Vietnam textile factories shift to air freight amid vessel delays', source: 'VnExpress International', url: '#', region: 'Asia', commodity: 'Consumer Goods', mode: 'air', impact: 'medium', summary: 'Fast-fashion retailers absorbing higher air costs to protect seasonal delivery windows from Ho Chi Minh City.' },
  { title: 'Bangladesh garment sector faces port backup after monsoon flooding', source: 'Dhaka Tribune', url: '#', region: 'Asia', commodity: 'Consumer Goods', mode: 'sea', impact: 'high', summary: 'Chittagong Port road access disrupted; truck queues extend 12km as warehouses near capacity.' },
  { title: 'China-Europe rail freight volumes climb as sea rates stay elevated', source: 'Railway Gazette', url: '#', region: 'Asia', commodity: 'Consumer Goods', mode: 'rail', impact: 'low', summary: 'Yiwu-Madrid and Chengdu-Rotterdam services running near capacity; transit time competitive with Cape routing.' },
  { title: 'South Korea semiconductor plants flag argon gas supply tightening', source: 'Korea JoongAng Daily', url: '#', region: 'Asia', commodity: 'Electronics', mode: 'air', impact: 'high', summary: 'Industrial gas sourcing disruptions in Eastern Europe reducing specialty gas availability for chip fabs.' },
  { title: 'Philippines typhoon season disrupts Mindanao agricultural exports', source: 'BusinessWorld Philippines', url: '#', region: 'Asia', commodity: 'Agriculture', mode: 'sea', impact: 'medium', summary: 'Banana and pineapple shipments from General Santos delayed; reefer vessel repositioning underway.' },
  { title: 'Japan auto parts exporters face freight rate shock on spot market', source: 'Nikkei Asia', url: '#', region: 'Asia', commodity: 'Automotive', mode: 'sea', impact: 'medium', summary: 'RORO vessel scarcity on Japan-Europe lanes pushing spot rates to 18-month highs amid persistent Red Sea diversions.' },
  // Africa
  { title: 'Durban port strike threat looms as workers reject wage offer', source: 'Business Day SA', url: '#', region: 'Africa', commodity: 'Raw Materials', mode: 'sea', impact: 'high', summary: 'SACU container gateway faces potential 72-hour work stoppage; miners accelerating pre-strike shipments.' },
  { title: 'Cape of Good Hope routing strains South African terminal capacity', source: 'Lloyd\'s List Africa', url: '#', region: 'Africa', commodity: 'Consumer Goods', mode: 'sea', impact: 'high', summary: 'Red Sea-diverted vessels adding unexpected calls at Cape Town and Ngqura, overwhelming yard capacity.' },
  { title: 'East African rail corridor upgrade accelerates Uganda copper exports', source: 'The EastAfrican', url: '#', region: 'Africa', commodity: 'Raw Materials', mode: 'rail', impact: 'low', summary: 'Standard gauge rail extension from Kampala to Mombasa cuts transit time 40%; mining firms sign capacity deals.' },
  { title: 'Nigerian crude loading delays mount at Bonny and Forcados terminals', source: 'Energy Voice Africa', url: '#', region: 'Africa', commodity: 'Fossil Fuels', mode: 'sea', impact: 'high', summary: 'Pipeline maintenance and community tensions cut export nominations; tanker queues build offshore Port Harcourt.' },
  { title: 'Djibouti throughput record set as Horn of Africa trade rebounds', source: 'Port Strategy', url: '#', region: 'Africa', commodity: 'Consumer Goods', mode: 'sea', impact: 'low', summary: 'Doraleh Multipurpose Port logs highest monthly volume; Ethiopia and landlocked Sahel imports via road corridor up 22%.' },
  { title: 'Kenyan flower exporters face cold-chain collapse after power outages', source: 'Daily Nation Kenya', url: '#', region: 'Africa', commodity: 'Agriculture', mode: 'air', impact: 'high', summary: 'Nairobi airport cargo cold-rooms offline for 14 hours; up to 600 tonnes of cut flowers declared total loss.' },
  { title: 'Morocco automotive export hub cements Europe supply chain role', source: 'Jeune Afrique Économie', url: '#', region: 'Africa', commodity: 'Automotive', mode: 'sea', impact: 'low', summary: 'Tanger Med handles record RORO volumes as European OEMs near-shore assembly to North Africa to cut transit risk.' },
  { title: 'Mozambique LNG project restarts limited exports after force majeure', source: 'Reuters Africa', url: '#', region: 'Africa', commodity: 'Fossil Fuels', mode: 'sea', impact: 'medium', summary: 'Coral Sul FLNG resumes cargo operations; security situation in Cabo Delgado still constrains onshore expansion.' },
  { title: 'Ghana cocoa mid-crop estimate cut on drought, raising chocolate supply fears', source: 'Cocoa Post', url: '#', region: 'Africa', commodity: 'Agriculture', mode: 'sea', impact: 'medium', summary: 'Tema port cocoa exports forecast down 18%; processors in Europe and Asia accelerating spot purchases.' },
  { title: 'South Africa power cuts force mining output curtailments', source: 'Mining Weekly', url: '#', region: 'Africa', commodity: 'Raw Materials', mode: 'rail', impact: 'high', summary: 'Load-shedding at Stage 5 reduces platinum and manganese mine output; Transnet Freight Rail volumes soften.' },
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
