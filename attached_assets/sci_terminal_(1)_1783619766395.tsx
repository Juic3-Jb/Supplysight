import { useState, useEffect, useRef } from "react";

const API = "https://api.anthropic.com/v1/messages";

const LANGS = [
  {c:'en',l:'EN',n:'English'},{c:'ar',l:'AR',n:'العربية'},{c:'zh',l:'ZH',n:'中文'},
  {c:'es',l:'ES',n:'Español'},{c:'pt',l:'PT',n:'Português'},{c:'fr',l:'FR',n:'Français'},
  {c:'ja',l:'JA',n:'日本語'},{c:'hi',l:'HI',n:'हिंदी'},
];

const UI_EN = {
  title:'GLOBAL SUPPLY CHAIN INTELLIGENCE',
  regionalRisk:'REGIONAL RISK INDEX',chokepointStatus:'CHOKEPOINT & CORRIDOR STATUS',
  newsFeed:'LIVE INTELLIGENCE FEED',commodityMatrix:'COMMODITY RISK MATRIX',
  carrierTracker:'CARRIER & FREIGHT TRACKER',jitAlerts:'JIT LOGISTICS RISK ALERTS',
  delayIndex:'SHIPPING DELAY INDEX',worldRoutes:'GLOBAL DISTRIBUTION NETWORK — LIVE OVERLAY',
  deepScan:'DEEP SCAN',translating:'TRANSLATING',lastScan:'LAST SCAN',
  route:'CORRIDOR',risk:'RISK',estDelay:'EST. DELAY',commodity:'COMMODITY',
  carrier:'CARRIER',delay:'DELAY',capacity:'CAP%',fleet:'FLEET',trend:'TREND',
  freightCost:'EXPRESS & PREMIUM FREIGHT COST',weather:'WEATHER & ENVIRONMENTAL',
  allRegions:'ALL',portDetail:'NODE INTELLIGENCE',congestion:'Congestion',dwell:'Avg Dwell',
  waiting:'In Queue',throughput:'Throughput',keyRisk:'Key Risk',capacityUtil:'Capacity',
  loadingPort:'Querying live data & sources...',sources:'LIVE SOURCES',read:'READ',
  matrix:'COMMODITY',weatherTab:'WEATHER',freightTab:'FREIGHT',mode:'MODE',strategicTab:'STRATEGIC',
};

// ===== GLOBAL NODES: ports, airports, rail/river/interstate hubs across all regions =====
const PORTS = {
  // Asia
  singapore:{n:'Singapore',lat:1.3,lon:103.8,r:'medium',t:'sea'},
  shanghai:{n:'Shanghai',lat:31.2,lon:121.5,r:'low',t:'sea'},
  busan:{n:'Busan',lat:35.1,lon:129.0,r:'low',t:'sea'},
  klang:{n:'Port Klang',lat:3.0,lon:101.4,r:'medium',t:'sea'},
  colombo:{n:'Colombo',lat:6.9,lon:79.9,r:'medium',t:'sea'},
  hongkong:{n:'Hong Kong',lat:22.3,lon:114.2,r:'low',t:'sea'},
  // Middle East / Africa
  dubai:{n:'Jebel Ali (UAE)',lat:24.9,lon:55.0,r:'high',t:'sea'},
  bandar:{n:'Bandar Abbas',lat:27.1,lon:56.3,r:'high',t:'sea'},
  djibouti:{n:'Djibouti',lat:11.6,lon:43.1,r:'critical',t:'sea'},
  mombasa:{n:'Mombasa',lat:-4.1,lon:39.7,r:'medium',t:'sea'},
  durban:{n:'Durban',lat:-29.9,lon:31.0,r:'low',t:'sea'},
  capetown:{n:'Cape Town',lat:-33.9,lon:18.4,r:'low',t:'sea'},
  // Europe
  rotterdam:{n:'Rotterdam (NL)',lat:51.9,lon:4.5,r:'low',t:'sea'},
  hamburg:{n:'Hamburg (DE)',lat:53.5,lon:10.0,r:'low',t:'sea'},
  antwerp:{n:'Antwerp (BE)',lat:51.2,lon:4.4,r:'low',t:'sea'},
  felixstowe:{n:'Felixstowe (UK)',lat:52.0,lon:1.3,r:'low',t:'sea'},
  southampton:{n:'Southampton (UK)',lat:50.9,lon:-1.4,r:'low',t:'sea'},
  copenhagen:{n:'Copenhagen (DK)',lat:55.7,lon:12.6,r:'low',t:'sea'},
  aarhus:{n:'Aarhus (DK)',lat:56.2,lon:10.2,r:'low',t:'sea'},
  gdansk:{n:'Gdansk (PL)',lat:54.4,lon:18.7,r:'low',t:'sea'},
  piraeus:{n:'Piraeus (GR)',lat:37.9,lon:23.6,r:'medium',t:'sea'},
  valencia:{n:'Valencia (ES)',lat:39.4,lon:-0.3,r:'low',t:'sea'},
  lehavre:{n:'Le Havre (FR)',lat:49.5,lon:0.1,r:'low',t:'sea'},
  // North America
  losangeles:{n:'Los Angeles/LB',lat:33.7,lon:-118.2,r:'medium',t:'sea'},
  newyork:{n:'New York/NJ',lat:40.6,lon:-74.1,r:'low',t:'sea'},
  savannah:{n:'Savannah',lat:32.1,lon:-81.1,r:'low',t:'sea'},
  houston:{n:'Houston',lat:29.7,lon:-95.0,r:'medium',t:'sea'},
  vancouver:{n:'Vancouver',lat:49.3,lon:-123.1,r:'low',t:'sea'},
  // Mississippi river system
  neworleans:{n:'New Orleans (MS River)',lat:29.9,lon:-90.1,r:'medium',t:'river'},
  memphis:{n:'Memphis (MS River)',lat:35.1,lon:-90.0,r:'low',t:'river'},
  stlouis:{n:'St. Louis (MS River)',lat:38.6,lon:-90.2,r:'low',t:'river'},
  // US interstate / rail hubs
  chicago:{n:'Chicago (Rail/I-Hub)',lat:41.8,lon:-87.6,r:'low',t:'rail'},
  dallas:{n:'Dallas (I-35 Hub)',lat:32.8,lon:-96.8,r:'low',t:'rail'},
  atlanta:{n:'Atlanta (I-Hub)',lat:33.7,lon:-84.4,r:'low',t:'rail'},
  // Major air freight
  memphisair:{n:'Memphis Intl (Air Cargo)',lat:35.0,lon:-89.9,r:'low',t:'air'},
  anchorage:{n:'Anchorage (Air Cargo)',lat:61.2,lon:-149.9,r:'low',t:'air'},
  // South America
  santos:{n:'Santos (Brazil)',lat:-23.9,lon:-46.3,r:'medium',t:'sea'},
  cartagena:{n:'Cartagena',lat:10.4,lon:-75.5,r:'low',t:'sea'},
  callao:{n:'Callao (Peru)',lat:-12.0,lon:-77.1,r:'low',t:'sea'},
  buenosaires:{n:'Buenos Aires',lat:-34.6,lon:-58.4,r:'medium',t:'sea'},
  // Oceania
  sydney:{n:'Sydney',lat:-33.9,lon:151.2,r:'low',t:'sea'},
  melbourne:{n:'Melbourne',lat:-37.8,lon:144.9,r:'low',t:'sea'},
  brisbane:{n:'Brisbane',lat:-27.5,lon:153.0,r:'low',t:'sea'},
  auckland:{n:'Auckland (NZ)',lat:-36.8,lon:174.8,r:'low',t:'sea'},
  // Panama
  panama:{n:'Panama Canal',lat:9.1,lon:-79.7,r:'high',t:'sea'},
};

// Sea/multimodal corridors with ocean waypoints (stay in water; land hubs link by rail/road)
const ROUTES = [
  {id:'r1',n:'Asia → Europe (Suez)',r:'high',d:32,c:'Consumer Goods, Autos',mode:'sea',ports:['shanghai','singapore','colombo','dubai','rotterdam'],
   wp:[[121.5,31.2],[122.5,28],[120,24],[114,20],[107,7],[104.5,2],[103.8,1.2],[98,5],[90,6],[81,6],[79.9,6.9],[68,10],[58,14],[52,13.5],[43.4,12.6],[38,20],[33,28],[32.3,31.2],[28,33],[18,35],[10,37],[0,37],[-6,36],[-9,38],[-9.5,43],[-5,48],[1,50],[4.2,52]]},
  {id:'r2',n:'Transpacific (Asia→US West)',r:'medium',d:16,c:'Consumer Goods, Electronics',mode:'sea',ports:['shanghai','busan','losangeles'],
   wp:[[121.5,31.2],[123,32],[126,33],[129,35.1],[132,35],[140,35],[150,38],[165,42],[180,45],[-170,46],[-150,44],[-130,38],[-122,35],[-118.2,33.7]]},
  {id:'r3',n:'US Gulf → Mississippi Inland',r:'medium',d:8,c:'Grain, Petrochem, Bulk',mode:'river',ports:['neworleans','memphis','stlouis','chicago'],
   wp:[[-90.1,29.9],[-91,31],[-91,33],[-90.5,34],[-90,35.1],[-89.7,37],[-90.2,38.6],[-90.5,40],[-89,41],[-87.6,41.8]]},
  {id:'r4',n:'Transpacific (Oceania→Asia)',r:'low',d:14,c:'Raw Materials, LNG, Agri',mode:'sea',ports:['sydney','brisbane','singapore'],
   wp:[[151.2,-33.9],[153,-30],[153,-27.5],[152,-22],[147,-15],[140,-8],[131,-6],[120,-7],[110,-5],[105,-3],[103.8,1.2]]},
  {id:'r5',n:'S. America → North America',r:'medium',d:18,c:'Agri, Minerals, Oil',mode:'sea',ports:['santos','cartagena','panama','houston'],
   wp:[[-46.3,-23.9],[-44,-20],[-40,-12],[-38,-5],[-45,2],[-58,8],[-72,10],[-75.5,10.4],[-78,9.5],[-79.7,9.1],[-82,12],[-86,18],[-90,22],[-94,27],[-95,29.7]]},
  {id:'r6',n:'S. America → Europe',r:'low',d:20,c:'Soy, Coffee, Iron Ore',mode:'sea',ports:['santos','buenosaires','capetown','rotterdam'],
   wp:[[-46.3,-23.9],[-48,-30],[-55,-35],[-58.4,-34.6],[-50,-38],[-30,-38],[-10,-35],[5,-33],[15,-33],[18.4,-33.9],[16,-25],[10,-10],[2,5],[-8,20],[-12,32],[-10,40],[-9.5,43],[-5,48],[1,50],[4.2,52]]},
  {id:'r7',n:'US Interstate (LA→NY I-40/I-80)',r:'low',d:5,c:'Domestic Freight, E-comm',mode:'road',ports:['losangeles','dallas','chicago','newyork'],
   wp:[[-118.2,33.7],[-112,34],[-106,35],[-100,35],[-96.8,32.8],[-92,36],[-88,40],[-87.6,41.8],[-83,41],[-78,41],[-74.1,40.6]]},
  {id:'r8',n:'Oceania → US West',r:'low',d:22,c:'Agri, Wine, Minerals',mode:'sea',ports:['sydney','auckland','losangeles'],
   wp:[[151.2,-33.9],[160,-36],[174.8,-36.8],[180,-30],[-170,-15],[-155,0],[-140,15],[-130,25],[-122,32],[-118.2,33.7]]},
  {id:'r9',n:'N.Europe Coastal (UK-DK-NL-DE)',r:'low',d:4,c:'Intra-EU, Consumer Goods',mode:'sea',ports:['felixstowe','rotterdam','antwerp','hamburg','copenhagen'],
   wp:[[1.3,52],[2.5,52],[4.5,51.9],[4.4,51.2],[6,53],[8,54],[9,55],[10.2,56.2],[12.6,55.7]]},
  {id:'r10',n:'Asia → N.Europe (Suez→UK)',r:'high',d:34,c:'Containers, Electronics',mode:'sea',ports:['singapore','dubai','piraeus','felixstowe'],
   wp:[[103.8,1.2],[90,6],[79.9,6.9],[58,14],[43.4,12.6],[33,28],[32.3,31.2],[28,33],[23.6,37.9],[18,37],[10,38],[0,37],[-6,36],[-9,43],[-5,48],[-1.4,50.9],[1.3,52]]},
];

const COMPS_D = [
  {name:'Maersk',delay:3,cap:88,fleet:710,st:'worsening',mode:'sea'},
  {name:'MSC',delay:4,cap:92,fleet:795,st:'stable',mode:'sea'},
  {name:'CMA CGM',delay:5,cap:81,fleet:590,st:'worsening',mode:'sea'},
  {name:'Hapag-Lloyd',delay:2,cap:76,fleet:288,st:'stable',mode:'sea'},
  {name:'COSCO',delay:6,cap:84,fleet:512,st:'worsening',mode:'sea'},
  {name:'FedEx (Air)',delay:1,cap:79,fleet:710,st:'stable',mode:'air'},
  {name:'UPS (Air)',delay:1,cap:82,fleet:580,st:'improving',mode:'air'},
  {name:'BNSF (Rail)',delay:2,cap:74,fleet:8000,st:'stable',mode:'rail'},
  {name:'Ingram Barge (MS)',delay:3,cap:68,fleet:150,st:'worsening',mode:'river'},
];

const FREIGHT_D = [
  {mode:'Air Express (Intl)',unit:'/kg',cost:8.40,trend:'up',chg:'+6.2%'},
  {mode:'Air Freight (Standard)',unit:'/kg',cost:4.10,trend:'up',chg:'+3.1%'},
  {mode:'Ocean Priority (FCL)',unit:'/40ft',cost:4250,trend:'up',chg:'+18%'},
  {mode:'Ocean Standard (FCL)',unit:'/40ft',cost:2980,trend:'stable',chg:'+1.4%'},
  {mode:'US Expedited Trucking',unit:'/mi',cost:3.85,trend:'down',chg:'-2.0%'},
  {mode:'Rail Intermodal (US)',unit:'/container',cost:1840,trend:'stable',chg:'+0.8%'},
  {mode:'Barge (Mississippi)',unit:'/ton',cost:28.50,trend:'up',chg:'+9.5%'},
];

// ===== Detailed coastlines (smoothed at render) =====
const LAND = [
  [[-168,66],[-162,64],[-156,71],[-148,70],[-141,70],[-130,69],[-125,60],[-130,55],[-123,48],[-124,40],[-120,34],[-117,32],[-110,23],[-105,22],[-97,16],[-92,15],[-88,21],[-90,29],[-94,29],[-97,28],[-97,26],[-94,18],[-88,16],[-83,9],[-81,8],[-78,8],[-83,11],[-80,25],[-81,31],[-76,35],[-74,40],[-70,42],[-67,45],[-60,47],[-64,50],[-57,52],[-56,60],[-64,60],[-68,63],[-78,63],[-80,70],[-86,68],[-92,74],[-105,73],[-118,72],[-125,70],[-135,69],[-156,71],[-168,66]],
  [[-73,78],[-60,82],[-45,82],[-22,80],[-18,76],[-22,70],[-32,68],[-42,60],[-50,62],[-55,67],[-62,66],[-65,70],[-58,74],[-68,76],[-73,78]],
  [[-81,8],[-77,8],[-76,1],[-80,-3],[-78,-8],[-71,-17],[-70,-23],[-71,-30],[-73,-37],[-74,-45],[-73,-52],[-69,-55],[-65,-55],[-64,-51],[-66,-45],[-62,-40],[-58,-35],[-56,-34],[-58,-39],[-62,-48],[-58,-51],[-54,-47],[-54,-41],[-49,-33],[-48,-28],[-40,-22],[-41,-23],[-39,-15],[-35,-9],[-44,-3],[-50,0],[-50,4],[-52,5],[-60,8],[-62,11],[-70,12],[-72,12],[-77,8],[-81,8]],
  [[-9,43],[-9,38],[-6,36],[0,38],[3,42],[3,43],[-2,43],[-2,48],[-5,48],[-5,49],[1,50],[2,51],[4,52],[6,53],[8,54],[8,57],[11,59],[10,63],[14,64],[20,69],[25,71],[30,70],[28,68],[24,66],[22,60],[26,60],[30,60],[28,56],[23,54],[19,54],[14,54],[12,54],[12,50],[15,48],[19,48],[18,45],[13,45],[13,42],[16,40],[18,40],[16,38],[12,37],[9,44],[4,43],[-2,43],[-9,43]],
  [[5,58],[8,58],[11,59],[15,62],[14,65],[18,69],[23,70],[28,71],[24,71],[18,69],[12,66],[10,64],[7,63],[5,61],[5,58]],
  [[-16,28],[-16,21],[-17,15],[-12,15],[-6,5],[-8,4],[-13,9],[-16,12],[-9,4],[5,5],[9,4],[9,9],[14,12],[14,11],[10,5],[8,2],[9,-1],[13,-5],[12,-6],[18,-12],[14,-22],[12,-17],[12,-23],[15,-27],[18,-29],[20,-35],[25,-34],[27,-33],[31,-30],[33,-27],[33,-21],[35,-24],[40,-15],[41,-11],[40,-5],[42,-2],[40,4],[36,5],[33,-1],[41,1],[43,11],[51,12],[44,11],[44,8],[40,4],[36,11],[34,28],[35,32],[32,31],[30,31],[34,32],[30,32],[20,33],[11,37],[10,37],[0,36],[-6,36],[-10,36],[-16,28]],
  // Eurasia main (clean northern + Asian coast)
  [[8,57],[14,64],[20,69],[26,71],[32,70],[40,68],[55,68],[68,73],[80,74],[100,76],[113,74],[130,72],[143,72],[160,69],[170,68],[180,67],[180,62],[163,60],[158,53],[155,52],[143,49],[142,46],[135,44],[131,43],[130,38],[122,40],[121,38],[120,34],[122,31],[121,28],[110,21],[108,21],[106,16],[109,11],[105,9],[103,1],[100,6],[98,8],[94,16],[91,22],[88,22],[82,17],[80,13],[77,8],[73,18],[68,24],[66,25],[61,25],[57,25],[57,22],[51,20],[49,16],[48,30],[40,40],[36,41],[28,41],[26,40],[26,46],[31,46],[37,47],[40,44],[49,45],[52,42],[51,47],[47,47],[40,46],[38,44],[30,46],[31,52],[24,56],[20,55],[13,54],[9,54],[8,57]],
  [[95,5],[100,2],[104,1],[104,6],[100,7],[103,2],[98,6],[98,3],[95,5]],
  [[100,1],[103,1],[104,-2],[106,-3],[111,-3],[114,-6],[116,-8],[112,-8],[106,-6],[103,-1],[100,1]],
  [[108,-7],[115,-8],[124,-8],[131,-7],[128,-3],[120,-9],[114,-8],[110,-6],[108,-7]],
  [[130,1],[138,0],[141,-2],[150,-3],[151,-6],[147,-8],[140,-8],[134,-6],[132,-3],[130,1]],
  [[130,31],[131,33],[135,35],[140,37],[140,40],[142,40],[141,45],[143,44],[145,43],[140,42],[139,38],[136,35],[133,34],[131,31],[130,31]],
  [[113,-12],[122,-12],[131,-11],[137,-12],[141,-12],[143,-12],[145,-15],[147,-18],[150,-22],[153,-26],[153,-31],[151,-34],[146,-39],[143,-39],[140,-38],[138,-35],[135,-35],[129,-32],[124,-34],[118,-35],[115,-34],[114,-30],[114,-22],[122,-18],[114,-22],[112,-22],[113,-19],[127,-14],[113,-12]],
  [[166,-34],[174,-37],[178,-39],[175,-42],[173,-43],[171,-44],[167,-46],[166,-45],[171,-42],[174,-39],[170,-37],[166,-34]],
  [[44,-12],[50,-13],[50,-16],[49,-22],[47,-25],[44,-25],[43,-22],[44,-16],[43,-14],[44,-12]],
  [[-25,64],[-22,66],[-16,66],[-14,65],[-15,64],[-19,63],[-23,64],[-25,64]],
  [[-9,52],[-6,55],[-10,55],[-10,52],[-6,52],[-9,52]],
  // Arabian peninsula
  [[35,30],[40,30],[48,30],[57,25],[57,22],[52,16],[45,13],[43,13],[43,16],[39,21],[35,28],[35,30]],
  // Indian subcontinent
  [[68,24],[73,20],[73,15],[77,8],[80,13],[82,17],[88,22],[90,22],[89,26],[80,30],[74,32],[70,28],[68,24]],
  // Great Britain
  [[-5,50],[-3,51],[0,51],[1,53],[-1,54],[-2,56],[-5,58],[-6,57],[-5,55],[-5,53],[-5,50]],
  // Ireland
  [[-10,52],[-6,52],[-6,55],[-10,55],[-10,52]],
  // Denmark (Jutland)
  [[8,55],[11,55],[11,57],[10,58],[8,57],[8,55]],
  // Sri Lanka
  [[80,9],[82,8],[81,6],[80,7],[80,9]],
];
const LAKES = [
  [[-88,42],[-87,46],[-85,45],[-82,43],[-83,41],[-87,41],[-88,42]],
  [[31,0],[33,-1],[34,-3],[33,-2],[31,-1],[31,0]],
];

const CHOKE_POINTS=[
  {id:'suez',lon:32.5,lat:30,l:'SUEZ',risk:'high'},
  {id:'hormuz',lon:56.5,lat:26.6,l:'HORMUZ',risk:'high'},
  {id:'babelmandeb',lon:43.5,lat:12.5,l:'BAB-EL-MANDEB',risk:'critical'},
  {id:'malacca',lon:101,lat:2.5,l:'MALACCA',risk:'medium'},
  {id:'panama',lon:-79.7,lat:9.1,l:'PANAMA CANAL',risk:'high'},
  {id:'mississippi',lon:-91,lat:32,l:'MISSISSIPPI L.WATER',risk:'medium'},
];
const CHOKE_POS={};

// Zoomable regions: [lonMin, lonMax, latMin, latMax]
const REGIONS = [
  {id:'europe',n:'EUROPE',box:[-12,30,35,62]},
  {id:'nasia',n:'N.AMERICA',box:[-130,-60,8,55]},
  {id:'samerica',n:'S.AMERICA',box:[-82,-34,-56,14]},
  {id:'asia',n:'ASIA-PAC',box:[60,150,-12,52]},
  {id:'meast',n:'MID-EAST',box:[30,65,10,40]},
  {id:'africa',n:'AFRICA',box:[-18,52,-36,38]},
  {id:'oceania',n:'OCEANIA',box:[110,180,-48,-8]},
];

// projection that honors an optional zoom box
function makeProj(w,h,box){
  if(!box) return (lon,lat)=>({x:((lon+180)/360)*w,y:((90-lat)/180)*h});
  const [loMin,loMax,laMin,laMax]=box;
  return (lon,lat)=>({x:((lon-loMin)/(loMax-loMin))*w,y:((laMax-lat)/(laMax-laMin))*h});
}

function toXY(lon,lat,w,h){return{x:((lon+180)/360)*w,y:((90-lat)/180)*h};}
// Orange-forward palette
function rc(r){return{critical:'#ff3b30',high:'#ff7a1a',medium:'#ffb020',low:'#ffd24a'}[r]||'#c98a3a';}
function rv(r){return{critical:90,high:70,medium:45,low:20}[r]||30;}
function rC(v){return v>70?'#ff4530':v>45?'#ff9020':'#ffce4a';}
function trC(t){return t==='improving'||t==='down'?'#4ade80':t==='worsening'||t==='up'?'#ff5a3c':'#c0a070';}
function rBg(v){return v>70?'rgba(255,70,40,0.10)':v>45?'rgba(255,150,30,0.08)':'rgba(255,200,60,0.06)';}
function modeColor(m){return{sea:'#ff9020',air:'#ffd24a',rail:'#ff6a3a',river:'#ffb84d',road:'#ff8a4a'}[m]||'#ff9020';}

function smoothPath(ctx,pts){
  if(!pts||!pts.length)return;
  if(pts.length<3){ctx.beginPath();pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));ctx.closePath();return;}
  ctx.beginPath();
  const n=pts.length;
  ctx.moveTo((pts[n-1].x+pts[0].x)/2,(pts[n-1].y+pts[0].y)/2);
  for(let i=0;i<n;i++){const p0=pts[i],p1=pts[(i+1)%n];ctx.quadraticCurveTo(p0.x,p0.y,(p0.x+p1.x)/2,(p0.y+p1.y)/2);}
  ctx.closePath();
}

function drawMap(canvas,tMs,selRoute,timelineDay,zoomBox){
  const ctx=canvas.getContext('2d');
  if(!ctx)return;
  const w=canvas.width,h=canvas.height;
  const tSec=tMs/1000;
  const proj=makeProj(w,h,zoomBox);
  const P=(lo,la)=>proj(lo,la);
  // Ocean
  const og=ctx.createLinearGradient(0,0,0,h);
  og.addColorStop(0,'#1a1206');og.addColorStop(0.5,'#1f1408');og.addColorStop(1,'#150f05');
  ctx.fillStyle=og;ctx.fillRect(0,0,w,h);
  // Bathymetric basin contours
  const basins=[[0.35,0.45],[0.62,0.55],[0.5,0.78],[0.15,0.4],[0.85,0.42]];
  basins.forEach((b,bi)=>{
    for(let ring=0;ring<7;ring++){
      const rad=(ring+1)*Math.min(w,h)*0.05;
      ctx.strokeStyle=`rgba(180,110,40,${0.045-ring*0.005})`;ctx.lineWidth=0.6;
      ctx.beginPath();ctx.ellipse(b[0]*w,b[1]*h,rad*1.4,rad,bi*0.6,0,Math.PI*2);ctx.stroke();
    }
  });
  // Current flow
  ctx.globalAlpha=0.035;
  for(let i=0;i<5;i++){
    const yy=(h/5)*i+((tSec*4+i*30)%(h/5));
    ctx.strokeStyle='#d08020';ctx.lineWidth=0.5;
    ctx.beginPath();ctx.moveTo(0,yy);
    for(let x=0;x<=w;x+=50)ctx.lineTo(x,yy+Math.sin(x*0.008+tSec*0.4+i)*4);
    ctx.stroke();
  }
  ctx.globalAlpha=1;
  // Graticule
  ctx.strokeStyle='rgba(210,140,50,0.05)';ctx.lineWidth=0.5;
  const gStep=zoomBox?10:30;
  for(let lon=-180;lon<=180;lon+=gStep){const p=P(lon,0);if(p.x>=0&&p.x<=w){ctx.beginPath();ctx.moveTo(p.x,0);ctx.lineTo(p.x,h);ctx.stroke();}}
  for(let lat=-80;lat<=80;lat+=gStep){const p=P(0,lat);if(p.y>=0&&p.y<=h){ctx.beginPath();ctx.moveTo(0,p.y);ctx.lineTo(w,p.y);ctx.stroke();}}
  const eq=P(0,0);
  if(eq.y>=0&&eq.y<=h){ctx.strokeStyle='rgba(255,180,80,0.08)';ctx.lineWidth=0.8;ctx.setLineDash([2,5]);ctx.beginPath();ctx.moveTo(0,eq.y);ctx.lineTo(w,eq.y);ctx.stroke();ctx.setLineDash([]);}
  // Topographic land
  LAND.forEach((coords,idx)=>{
    const pts=coords.map(([lo,la])=>P(lo,la));
    let minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9;
    pts.forEach(p=>{minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);});
    if(maxX<-50||minX>w+50||maxY<-50||minY>h+50)return; // cull offscreen
    smoothPath(ctx,pts);
    ctx.save();ctx.shadowColor='rgba(220,140,50,0.5)';ctx.shadowBlur=7;
    ctx.strokeStyle='rgba(230,160,70,0.3)';ctx.lineWidth=3;ctx.lineJoin='round';ctx.stroke();ctx.restore();
    smoothPath(ctx,pts);
    const tg=ctx.createLinearGradient(minX,minY,maxX,maxY);
    tg.addColorStop(0,'#3a2a12');tg.addColorStop(0.4,'#43301a');tg.addColorStop(0.7,'#4a3418');tg.addColorStop(1,'#523a1c');
    ctx.fillStyle=tg;ctx.fill();
    ctx.save();ctx.clip();
    const hs=ctx.createLinearGradient(minX,minY,maxX,maxY);
    hs.addColorStop(0,'rgba(210,160,90,0.22)');hs.addColorStop(0.5,'transparent');hs.addColorStop(1,'rgba(0,0,0,0.3)');
    ctx.fillStyle=hs;ctx.fillRect(minX,minY,Math.max(maxX-minX,1),Math.max(maxY-minY,1));
    const cx=(minX+maxX)/2,cy=(minY+maxY)/2,rx=(maxX-minX)/2,ry=(maxY-minY)/2;
    for(let ring=1;ring<=4;ring++){ctx.strokeStyle=`rgba(150,100,50,${0.18-ring*0.025})`;ctx.lineWidth=0.5;ctx.beginPath();ctx.ellipse(cx,cy,Math.abs(rx*(ring/5)),Math.abs(ry*(ring/5)),idx*0.4,0,Math.PI*2);ctx.stroke();}
    ctx.restore();
    smoothPath(ctx,pts);ctx.strokeStyle='rgba(240,190,110,0.5)';ctx.lineWidth=0.7;ctx.lineJoin='round';ctx.stroke();
  });
  LAKES.forEach(coords=>{const pts=coords.map(([lo,la])=>P(lo,la));smoothPath(ctx,pts);ctx.fillStyle='#1a1206';ctx.fill();ctx.strokeStyle='rgba(230,160,70,0.4)';ctx.lineWidth=0.5;ctx.stroke();});
  // Corridors
  ROUTES.forEach(route=>{
    if(!route.wp||route.wp.length<2)return;
    const sel=selRoute===route.id;
    const color=modeColor(route.mode);
    const pts=route.wp.map(([lo,la])=>P(lo,la));
    ctx.save();ctx.shadowColor=color;ctx.shadowBlur=sel?16:3;
    ctx.strokeStyle=sel?color+'ee':color+'33';ctx.lineWidth=sel?2.2:0.9;
    ctx.lineCap='round';ctx.lineJoin='round';
    if(route.mode==='road'||route.mode==='rail')ctx.setLineDash([3,3]);else ctx.setLineDash([7,6]);
    ctx.lineDashOffset=-(tSec*22%13);
    ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);
    for(let i=0;i<pts.length-1;i++){const mx=(pts[i].x+pts[i+1].x)/2,my=(pts[i].y+pts[i+1].y)/2;ctx.quadraticCurveTo(pts[i].x,pts[i].y,mx,my);}
    ctx.lineTo(pts[pts.length-1].x,pts[pts.length-1].y);ctx.stroke();ctx.setLineDash([]);ctx.restore();
    const segs=pts.length-1;
    // While scrubbing the timeline on THIS route, freeze ambient ships (only the timeline vessel moves)
    const scrubbingThis=sel&&timelineDay>0;
    const nShips=scrubbingThis?0:(sel?3:1);
    for(let s=0;s<nShips;s++){
      const off=parseInt(route.id.slice(1))*0.17+s*0.33;
      const rT=(tSec*0.02+off)%1;const absT=rT*segs;const seg=Math.min(Math.floor(absT),segs-1);const st=absT-seg;
      if(pts[seg]&&pts[seg+1]){
        const sx=pts[seg].x+(pts[seg+1].x-pts[seg].x)*st;const sy=pts[seg].y+(pts[seg+1].y-pts[seg].y)*st;
        const dx=pts[seg+1].x-pts[seg].x,dy=pts[seg+1].y-pts[seg].y;const len=Math.hypot(dx,dy)||1;
        const ux=dx/len,uy=dy/len;
        const wake=ctx.createLinearGradient(sx,sy,sx-ux*20,sy-uy*20);wake.addColorStop(0,color+'aa');wake.addColorStop(1,'transparent');
        ctx.strokeStyle=wake;ctx.lineWidth=sel?2:1;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx-ux*20,sy-uy*20);ctx.stroke();
        ctx.save();ctx.shadowColor=color;ctx.shadowBlur=sel?14:7;
        ctx.fillStyle='#fff5e0';ctx.beginPath();ctx.arc(sx,sy,sel?3.3:2,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=color;ctx.beginPath();ctx.arc(sx,sy,sel?1.9:1.1,0,Math.PI*2);ctx.fill();ctx.restore();
      }
    }
  });
  // Timeline vessel
  if(selRoute&&timelineDay>0){
    const route=ROUTES.find(r=>r.id===selRoute);
    if(route&&route.wp&&route.wp.length>1){
      const pts=route.wp.map(([lo,la])=>P(lo,la));
      const transitDays=route.d;const totalDays=transitDays+Math.round(transitDays*0.4);
      const frac=Math.min(timelineDay/totalDays,1);const segs=pts.length-1;
      const absT=frac*segs;const curSeg=Math.min(Math.floor(absT),segs-1);const segFrac=absT-curSeg;
      ctx.save();ctx.shadowColor='#ffd24a';ctx.shadowBlur=6;
      ctx.strokeStyle='rgba(255,210,90,0.95)';ctx.lineWidth=2.6;ctx.lineCap='round';ctx.lineJoin='round';
      ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);
      for(let i=0;i<curSeg;i++)ctx.lineTo(pts[i+1].x,pts[i+1].y);
      const vx=pts[curSeg].x+(pts[curSeg+1].x-pts[curSeg].x)*segFrac;
      const vy=pts[curSeg].y+(pts[curSeg+1].y-pts[curSeg].y)*segFrac;
      ctx.lineTo(vx,vy);ctx.stroke();ctx.restore();
      ctx.save();ctx.strokeStyle='rgba(255,90,60,0.6)';ctx.lineWidth=1.4;ctx.setLineDash([4,5]);
      ctx.beginPath();ctx.moveTo(vx,vy);for(let i=curSeg+1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y);ctx.stroke();ctx.setLineDash([]);ctx.restore();
      (route.ports||[]).forEach(pid=>{const port=PORTS[pid];if(!port)return;const pp=P(port.lon,port.lat);
        ctx.save();ctx.fillStyle='rgba(255,210,90,0.9)';ctx.strokeStyle='#fff5e0';ctx.lineWidth=1;
        ctx.beginPath();ctx.arc(pp.x,pp.y,3,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();});
      const vp=Math.sin(tSec*4)*0.3+0.7;
      ctx.save();ctx.translate(vx,vy);ctx.rotate(Math.PI/4);ctx.shadowColor='#ffd24a';ctx.shadowBlur=16*vp;
      ctx.fillStyle='#fff5e0';ctx.fillRect(-4,-4,8,8);ctx.fillStyle='#ff9020';ctx.fillRect(-2.5,-2.5,5,5);ctx.restore();
      ctx.save();ctx.strokeStyle=`rgba(255,210,90,${0.4*vp})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(vx,vy,10*vp,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
  }
  // Chokepoints (clickable)
  CHOKE_POINTS.forEach(cz=>{
    const p=P(cz.lon,cz.lat);CHOKE_POS[cz.id]={x:p.x,y:p.y};
    if(p.x<-20||p.x>w+20||p.y<-20||p.y>h+20)return;
    const col=rc(cz.risk);const pulse=Math.sin(tSec*3)*0.3+0.7;
    const sz=zoomBox?1.4:1;
    ctx.save();ctx.shadowColor=col;ctx.shadowBlur=16*pulse;
    ctx.strokeStyle=col+Math.round(0.55*pulse*255).toString(16).padStart(2,'0');ctx.lineWidth=1.4;
    ctx.beginPath();ctx.arc(p.x,p.y,10*pulse*sz,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle=col+'aa';ctx.lineWidth=1.2;
    for(let a=0;a<4;a++){const ang=tSec*1.5+a*Math.PI/2;ctx.beginPath();ctx.moveTo(p.x+Math.cos(ang)*12*sz,p.y+Math.sin(ang)*12*sz);ctx.lineTo(p.x+Math.cos(ang)*16*sz,p.y+Math.sin(ang)*16*sz);ctx.stroke();}
    ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(p.x,p.y-4*sz);ctx.lineTo(p.x+3.5*sz,p.y+2.5*sz);ctx.lineTo(p.x-3.5*sz,p.y+2.5*sz);ctx.closePath();ctx.fill();
    ctx.fillStyle='#1a0f02';ctx.font=`bold ${5*sz}px monospace`;ctx.textAlign='center';ctx.fillText('!',p.x,p.y+2.3*sz);ctx.textAlign='left';
    ctx.fillStyle=col;ctx.font=`bold ${Math.max(7,w*0.0072)*(zoomBox?1.2:1)}px monospace`;ctx.fillText(cz.l,p.x+15*sz,p.y-6*sz);ctx.restore();
  });
  // Nodes (ports/hubs)
  Object.entries(PORTS).forEach(([,port])=>{
    const p=P(port.lon,port.lat);const color=modeColor(port.t);
    if(p.x<-20||p.x>w+20||p.y<-20||p.y>h+20)return;
    const pulse=Math.sin(tSec*2+port.lat*0.5)*0.3+0.7;
    const sz=zoomBox?1.7:1;
    ctx.save();ctx.shadowColor=color;ctx.shadowBlur=8;
    ctx.strokeStyle=color+'55';ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,5.5*pulse*sz,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#fff5e0';ctx.beginPath();ctx.arc(p.x,p.y,1.8*sz,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=color;ctx.beginPath();ctx.arc(p.x,p.y,1*sz,0,Math.PI*2);ctx.fill();ctx.restore();
    // Labels when zoomed
    if(zoomBox){ctx.fillStyle='rgba(240,210,160,0.85)';ctx.font=`${Math.max(8,w*0.011)}px monospace`;ctx.fillText(port.n,p.x+7*sz,p.y+3);}
  });
  // Lat labels (world only)
  if(!zoomBox){
    ctx.fillStyle='rgba(210,140,50,0.18)';ctx.font=`${Math.max(8,w*0.0072)}px monospace`;
    [-60,-30,0,30,60].forEach(lat=>{const p=P(0,lat);ctx.fillText(`${lat>0?'+':''}${lat}°`,3,p.y-2);});
  }
  // Sweep
  const sweepX=(tSec*60)%(w+200)-100;
  const sw=ctx.createLinearGradient(sweepX-40,0,sweepX+40,0);
  sw.addColorStop(0,'transparent');sw.addColorStop(0.5,'rgba(255,160,60,0.04)');sw.addColorStop(1,'transparent');
  ctx.fillStyle=sw;ctx.fillRect(sweepX-40,0,80,h);
  const vig=ctx.createRadialGradient(w/2,h/2,h*0.2,w/2,h/2,h*0.85);
  vig.addColorStop(0,'transparent');vig.addColorStop(1,'rgba(0,0,0,0.5)');
  ctx.fillStyle=vig;ctx.fillRect(0,0,w,h);
}

async function callClaude(prompt,search=false){
  try{
    const body={model:'claude-sonnet-4-6',max_tokens:1200,
      system:'You are an expert global supply chain and logistics intelligence analyst covering maritime, air freight, rail, inland waterway (Mississippi), and interstate trucking across all world regions including Oceania and the Americas. When asked for article links, always provide the FULL direct URL to the specific article, never just a homepage. Always respond ONLY with valid JSON. No markdown fences. No preamble.',
      messages:[{role:'user',content:prompt}]};
    if(search)body.tools=[{type:'web_search_20250305',name:'web_search'}];
    const res=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const data=await res.json();
    const text=(data.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('');
    if(!text)return null;
    return JSON.parse(text.replace(/```json\n?|```\n?/g,'').trim());
  }catch(e){console.warn('API:',e.message);return null;}
}

export default function SCITerminal(){
  const [phase,setPhase]=useState('loading');
  const [prog,setProg]=useState(0);
  const [pLabel,setPLabel]=useState('Initializing global deep scan...');
  const [scanLog,setScanLog]=useState([]);
  const [lang,setLang]=useState('en');
  const [uiStr,setUiStr]=useState(UI_EN);
  const t9nRef=useRef({en:UI_EN});
  const [translating,setTranslating]=useState(false);
  const [news,setNews]=useState([]);
  const [risks,setRisks]=useState({asia:38,me:55,africa:50,americas:35,oceania:25});
  const [chokepoints,setChokepoints]=useState([]);
  const [comps,setComps]=useState(COMPS_D);
  const [freight,setFreight]=useState(FREIGHT_D);
  const [jitAlerts,setJitAlerts]=useState([]);
  const [commod,setCommod]=useState({autos:35,raw:48,gas:60,fuel:55,goods:40,agri:42});
  const [commodMeta,setCommodMeta]=useState({});
  const [delayIdx,setDelayIdx]=useState({sea:45,air:30,rail:25,river:50});
  const [weather,setWeather]=useState([]);
  const [strategic,setStrategic]=useState([]);
  const [tickerItems,setTickerItems]=useState([]);
  const [selRoute,setSelRoute]=useState(null);
  const [portInfo,setPortInfo]=useState(null);
  const [portDetail,setPortDetail]=useState(null);
  const [loadingPort,setLoadingPort]=useState(false);
  const [threatInfo,setThreatInfo]=useState(null);
  const [threatDetail,setThreatDetail]=useState(null);
  const [loadingThreat,setLoadingThreat]=useState(false);
  const [timelineDay,setTimelineDay]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [activeTab,setActiveTab]=useState('matrix');
  const [newsFilter,setNewsFilter]=useState('all');
  const [zoomRegion,setZoomRegion]=useState(null);
  const [forecastOpen,setForecastOpen]=useState(false);
  const [fcQuery,setFcQuery]=useState('');
  const [fcLoading,setFcLoading]=useState(false);
  const [fcResult,setFcResult]=useState(null);
  const [clock,setClock]=useState('');
  const [lastScan,setLastScan]=useState('');
  const canvasRef=useRef(null);
  const animRef=useRef(null);
  const srRef=useRef(null);
  const tlRef=useRef(0);
  const zoomRef=useRef(null);

  useEffect(()=>{srRef.current=selRoute;},[selRoute]);
  useEffect(()=>{tlRef.current=timelineDay;},[timelineDay]);
  useEffect(()=>{zoomRef.current=zoomRegion?zoomRegion.box:null;},[zoomRegion]);

  useEffect(()=>{
    const c=canvasRef.current;
    const setSize=()=>{if(!c)return;const dpr=Math.min(window.devicePixelRatio||1,2);c.width=(c.clientWidth||800)*dpr;c.height=(c.clientHeight||360)*dpr;};
    setSize();
    const frame=()=>{const cv=canvasRef.current;if(cv)drawMap(cv,Date.now(),srRef.current,tlRef.current,zoomRef.current);animRef.current=requestAnimationFrame(frame);};
    animRef.current=requestAnimationFrame(frame);
    window.addEventListener('resize',setSize);
    return()=>{cancelAnimationFrame(animRef.current);window.removeEventListener('resize',setSize);};
  },[]);

  useEffect(()=>{const id=setInterval(()=>setClock(new Date().toUTCString().slice(5,25)),1000);setClock(new Date().toUTCString().slice(5,25));return()=>clearInterval(id);},[]);

  useEffect(()=>{
    if(!playing||!selRoute)return;
    const id=setInterval(()=>{
      setTimelineDay(d=>{const route=ROUTES.find(r=>r.id===selRoute);const tr=route?.d||10;const total=tr+Math.round(tr*0.4);if(d>=total){setPlaying(false);return total;}return +(d+Math.max(tr/40,0.2)).toFixed(2);});
    },120);
    return()=>clearInterval(id);
  },[playing,selRoute]);
  useEffect(()=>{setTimelineDay(0);setPlaying(false);},[selRoute]);

  const log=(m)=>setScanLog(p=>[...p.slice(-10),`[${new Date().toUTCString().slice(17,25)}] ${m}`]);

  const gather=async()=>{
    setPhase('loading');setProg(0);setScanLog([]);
    setPLabel('Scanning all regions: Asia, Middle East, Africa, Americas, Oceania...');
    log('Initiating global multi-region intelligence sweep...');
    log('Querying Americas: US ports, Mississippi River, interstate corridors...');
    log('Querying Oceania: Australia, NZ port & agri export feeds...');
    log('Scanning air cargo hubs (Memphis, Anchorage, intl freight)...');
    await Promise.all([
      callClaude(`Search 2026: Asia-Pacific shipping — Singapore, Shanghai, Busan, Malacca congestion and disruptions. Return JSON: {"risk":0-100,"factors":["string"]}`,true).then(d=>{if(d)setRisks(p=>({...p,asia:d.risk??38}));}),
      callClaude(`Search 2026: Middle East shipping — Hormuz, Red Sea, Suez, Jebel Ali, Gulf tensions. Return JSON: {"risk":0-100,"factors":["string"]}`,true).then(d=>{if(d)setRisks(p=>({...p,me:d.risk??55}));}),
      callClaude(`Search 2026: East/Southern Africa shipping — Djibouti, Mombasa, Durban, Cape, Bab-el-Mandeb piracy. Return JSON: {"risk":0-100,"factors":["string"]}`,true).then(d=>{if(d)setRisks(p=>({...p,africa:d.risk??50}));}),
      callClaude(`Search 2026: Americas logistics — US West/East/Gulf ports (LA/Long Beach, NY/NJ, Houston, Savannah), Mississippi River water levels and barge traffic, US interstate trucking (I-35, I-40, I-80) capacity, Panama Canal draft restrictions, Brazil/Santos and South America export corridors. Return JSON: {"risk":0-100,"factors":["string"],"mississippiStatus":"string","panamaStatus":"string"}`,true).then(d=>{if(d)setRisks(p=>({...p,americas:d.risk??35}));}),
      callClaude(`Search 2026: Oceania logistics — Australia ports (Sydney, Melbourne, Brisbane), New Zealand (Auckland), agricultural/mineral/LNG exports, trans-Pacific and Asia trade lanes, weather/cyclone disruptions. Return JSON: {"risk":0-100,"factors":["string"]}`,true).then(d=>{if(d)setRisks(p=>({...p,oceania:d.risk??25}));})
    ]);
    setProg(25);

    setPLabel('Pulling corridor status, air/rail/river data & global headlines...');
    log('Querying chokepoints: Suez, Hormuz, Panama, Malacca, Mississippi...');
    log('Scanning Reuters, Bloomberg, FT, Al Jazeera, NYT, Lloyd\'s List, gCaptain...');
    log('Pulling airline cargo utilization & freight rate indices...');
    await Promise.all([
      callClaude(`Search 2026 status of these chokepoints/corridors: Suez Canal, Strait of Hormuz, Bab-el-Mandeb, Strait of Malacca, Panama Canal (draft/transit restrictions), Mississippi River (low water/barge limits). For each: status, risk level, added delay days, notes. Return JSON: {"chokepoints":[{"name":"string","status":"string","riskLevel":"low|medium|high|critical","addedDelayDays":0,"notes":"string"}]}`,true).then(d=>{if(d?.chokepoints)setChokepoints(d.chokepoints);}),
      callClaude(`Search the most current 2026 global supply chain, shipping, air freight, rail, and inland waterway disruption news. Cover ALL regions including Europe in depth (UK, Netherlands/Rotterdam, Germany/Hamburg, Denmark/Maersk, Belgium/Antwerp). Also Asia, Middle East, Africa, North America (incl Mississippi River barge, US interstate trucking, airline cargo, Panama Canal), South America, Oceania. Use major outlets with FULL DIRECT article URLs (not homepages): Reuters, Bloomberg, The New York Times, Al Jazeera, Financial Times, Nikkei Asia, The Guardian, BBC, CNBC, AP, gCaptain, Lloyd's List, FreightWaves, The Loadstar, Politico Europe. Each item MUST have a complete direct article URL. Return JSON: {"headlines":[{"title":"string","source":"string","url":"string","region":"Europe|Asia|Middle East|Africa|North America|South America|Oceania|Global","commodity":"string","mode":"sea|air|rail|river|road","impact":"low|medium|high|critical","summary":"string"}]}`,true).then(d=>{if(d?.headlines?.length)setNews(d.headlines);})
    ]);
    setProg(50);

    setPLabel('Analyzing commodities, carriers & premium freight cost trends...');
    log('Querying multimodal carriers: ocean, air (FedEx/UPS), rail (BNSF), barge...');
    log('Pulling express & premium freight rate cards and trends...');
    log('Scanning commodity sector risk across 6 categories...');
    await Promise.all([
      callClaude(`Search 2026 commodity supply risk: automotive, raw materials/minerals, natural gas/LNG, crude oil/fossil fuels, consumer goods, agriculture/grain (incl US Mississippi grain exports, South America soy, Oceania agri). For each give risk 0-100, trend up/stable/down, and a short note. Return JSON: {"autos":{"risk":0,"trend":"","notes":""},"rawMaterials":{"risk":0,"trend":"","notes":""},"naturalGas":{"risk":0,"trend":"","notes":""},"fossilFuels":{"risk":0,"trend":"","notes":""},"consumerGoods":{"risk":0,"trend":"","notes":""},"agriculture":{"risk":0,"trend":"","notes":""}}`,true).then(d=>{if(d){
        setCommod({autos:d.autos?.risk??35,raw:d.rawMaterials?.risk??48,gas:d.naturalGas?.risk??60,fuel:d.fossilFuels?.risk??55,goods:d.consumerGoods?.risk??40,agri:d.agriculture?.risk??42});
        setCommodMeta({autos:d.autos,raw:d.rawMaterials,gas:d.naturalGas,fuel:d.fossilFuels,goods:d.consumerGoods,agri:d.agriculture});
      }}),
      callClaude(`Search 2026 carrier/freight operational data for ocean (Maersk, MSC, CMA CGM, Hapag-Lloyd, COSCO), air cargo (FedEx, UPS), US rail (BNSF), Mississippi barge (Ingram). Give delay days, capacity utilization %, trend. Return JSON: {"companies":[{"name":"string","delayDays":0,"capacityPct":0,"trend":"improving|stable|worsening"}]}`,true).then(d=>{if(d?.companies)setComps(COMPS_D.map(c=>{const f=d.companies.find(x=>x.name?.toLowerCase().includes(c.name.toLowerCase().slice(0,4)));return f?{...c,delay:f.delayDays??c.delay,cap:f.capacityPct??c.cap,st:f.trend??c.st}:c;}));}),
      callClaude(`Search 2026 current freight rates and trends for: international air express per kg, standard air freight per kg, ocean priority 40ft container, ocean standard 40ft container, US expedited trucking per mile, US rail intermodal per container, Mississippi barge per ton. Give current cost (number), unit, trend up/stable/down, percent change. Return JSON: {"rates":[{"mode":"string","unit":"string","cost":0,"trend":"up|stable|down","chg":"string"}]}`,true).then(d=>{if(d?.rates?.length)setFreight(d.rates.map((r,i)=>({...FREIGHT_D[i],...r})));})
    ]);
    setProg(75);

    setPLabel('Integrating weather, strategic transfers & JIT delay model...');
    log('Pulling weather: cyclones, Mississippi drought, monsoon, Pacific storms...');
    log('Querying medical/humanitarian aid & military transfer flows...');
    log('Computing multimodal JIT delay probabilities...');
    await Promise.all([
      callClaude(`Search 2026 weather affecting global logistics: Pacific/Atlantic cyclones, Mississippi River drought/water levels, Indian Ocean monsoon, Australia weather, US winter storms on interstates. Return JSON: {"weatherEvents":[{"location":"string","type":"string","severity":"low|medium|high","portImpact":"string","estimatedDelayDays":0}]}`,true).then(d=>{if(d?.weatherEvents?.length){setWeather(d.weatherEvents);log(`Weather events: ${d.weatherEvents.length} active`);}}),
      callClaude(`Search 2026 strategic logistics flows: (1) MEDICAL/HUMANITARIAN aid shipments — WHO, WFP, ICRC, UN, USAID, MSF deliveries, vaccine/medicine logistics, disaster relief corridors; (2) MILITARY weapons/equipment transfers and defense logistics — major arms transfers, SIPRI-tracked deliveries, defense aid packages, sealift/airlift operations. Cover all regions. For each give type (medical/humanitarian/military), origin, destination, description, status, and category. Return JSON: {"flows":[{"type":"medical|humanitarian|military","origin":"string","destination":"string","description":"string","status":"active|planned|delayed|completed","category":"string"}]}`,true).then(d=>{if(d?.flows?.length)setStrategic(d.flows);}),
      callClaude(`Search 2026 JIT logistics risks across sea, air, rail, river (Mississippi), road (US interstate). Return JSON: {"jitAlerts":[{"severity":"low|medium|high|critical","region":"string","commodity":"string","mode":"string","estimatedDelayDays":0,"impact":"string","recommendedAction":"string"}],"delayIndex":{"sea":0,"air":0,"rail":0,"river":0}}`,true).then(d=>{if(d?.jitAlerts)setJitAlerts(d.jitAlerts);if(d?.delayIndex)setDelayIdx({sea:d.delayIndex.sea??45,air:d.delayIndex.air??30,rail:d.delayIndex.rail??25,river:d.delayIndex.river??50});})
    ]);
    setProg(92);
    setPLabel('Finalizing synthesis & validating data streams...');
    log('All streams synchronized. Distribution network model ready.');
    await new Promise(r=>setTimeout(r,400));
    setProg(100);setLastScan(new Date().toUTCString().slice(5,25));setPhase('ready');
  };

  useEffect(()=>{gather();},[]);

  useEffect(()=>{
    const items=[];
    (news.length?news:[]).slice(0,7).forEach(n=>items.push({t:(n.impact||'').toUpperCase(),c:rc(n.impact),txt:`${n.region}: ${n.title}`}));
    (strategic.length?strategic:[]).slice(0,4).forEach(f=>{const tc={medical:'#4ade80',humanitarian:'#5ab0ff',military:'#ff5a3c'}[f.type]||'#ff9020';items.push({t:(f.type||'').toUpperCase(),c:tc,txt:`${f.origin} → ${f.destination}`});});
    (chokepoints.length?chokepoints:[]).forEach(c=>items.push({t:'CORRIDOR',c:rc(c.riskLevel),txt:`${c.name} — ${(c.riskLevel||'').toUpperCase()}${c.addedDelayDays?` (+${c.addedDelayDays}d)`:''}`}));
    if(items.length)setTickerItems(items);
  },[news,chokepoints,strategic]);

  const handleLangChange=async(l)=>{
    setLang(l);
    if(l==='en'){setUiStr(UI_EN);return;}
    if(t9nRef.current[l]){setUiStr(t9nRef.current[l]);return;}
    setTranslating(true);
    const d=await callClaude(`Translate ALL string values in this JSON to ${LANGS.find(x=>x.c===l)?.n}. Keep keys identical. Return JSON only: ${JSON.stringify(UI_EN)}`);
    if(d){t9nRef.current[l]=d;setUiStr(d);}
    setTranslating(false);
  };

  const fetchPortDetail=async(port)=>{
    setLoadingPort(true);setPortDetail(null);
    const d=await callClaude(`Search the web for current 2026 operational status and recent news for ${port.n} (a ${port.t} logistics node). Find 2-4 real recent news articles, each with the FULL DIRECT article URL (not a homepage). Return JSON: {"congestion":"low|moderate|high|severe","avgDwellDays":0,"vesselsWaiting":0,"throughputTrend":"up|stable|down","capacityPct":0,"keyRisk":"string","summary":"string","articles":[{"headline":"string","source":"string","url":"string","date":"string"}]}`,true);
    setPortDetail(d||{congestion:'moderate',avgDwellDays:'—',vesselsWaiting:'—',throughputTrend:'stable',capacityPct:'—',keyRisk:'Live data unavailable',summary:'—',articles:[]});
    setLoadingPort(false);
  };
  const fetchThreatDetail=async(cz)=>{
    setLoadingThreat(true);setThreatDetail(null);
    const d=await callClaude(`Search the web for current 2026 threat situation at the ${cz.l} corridor/chokepoint. Explain WHY the threat level is what it is. Find 2-3 real recent articles each with FULL DIRECT article URLs (not homepages). Return JSON: {"threatLevel":"low|medium|high|critical","headline":"string","reasons":["string"],"impact":"string","affectedCommodities":["string"],"addedDelayDays":0,"alternativeRoute":"string","articles":[{"headline":"string","source":"string","url":"string","date":"string"}]}`,true);
    setThreatDetail(d||{threatLevel:cz.risk,headline:'Live data unavailable',reasons:['Could not retrieve live threat data'],impact:'—',affectedCommodities:[],addedDelayDays:0,alternativeRoute:'—',articles:[]});
    setLoadingThreat(false);
  };

  const handleCanvasClick=(e)=>{
    const c=canvasRef.current;if(!c)return;
    const rect=c.getBoundingClientRect();const sx=c.width/rect.width,sy=c.height/rect.height;
    const cx=(e.clientX-rect.left)*sx,cy=(e.clientY-rect.top)*sy;
    const box=zoomRef.current;
    const proj=makeProj(c.width,c.height,box);
    let cHit=null,cMinD=(box?28:22)*sx;
    CHOKE_POINTS.forEach(cz=>{const p=proj(cz.lon,cz.lat);const d=Math.hypot(p.x-cx,p.y-cy);if(d<cMinD){cMinD=d;cHit=cz;}});
    if(cHit){setThreatInfo(cHit);setPortInfo(null);setPortDetail(null);fetchThreatDetail(cHit);return;}
    let closest=null,minD=(box?30:24)*sx;
    Object.entries(PORTS).forEach(([id,port])=>{const p=proj(port.lon,port.lat);const d=Math.hypot(p.x-cx,p.y-cy);if(d<minD){minD=d;closest={id,...port};}});
    if(closest){setPortInfo(closest);setThreatInfo(null);setThreatDetail(null);fetchPortDetail(closest);}
  };

  const U=uiStr;
  const O='#ff9020', OD='#ff7a1a', OL='#ffce4a';
  const S={
    root:{background:'#100a04',color:'#e8d4b8',fontFamily:'"SF Mono","Roboto Mono","Courier New",monospace',height:'100vh',display:'flex',flexDirection:'column',overflow:'hidden',fontSize:'10px'},
    hdr:{background:'#1a1006',borderBottom:`1px solid #3a2410`,padding:'7px 12px',display:'flex',alignItems:'center',gap:'8px',flexShrink:0,flexWrap:'wrap'},
    body:{display:'grid',gridTemplateColumns:'215px 1fr 256px',flex:'1',minHeight:0,gap:'1px',background:'#241608'},
    col:{background:'#100a04',display:'flex',flexDirection:'column',overflow:'hidden'},
    pt:{color:O,fontSize:'8px',letterSpacing:'2px',padding:'7px 10px',borderBottom:'1px solid #2a1a0a',flexShrink:0,fontWeight:'bold'},
    pb:{flex:'1',overflowY:'auto',padding:'8px'},
    btm:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'1px',background:'#241608',borderTop:`1px solid #3a2410`,flexShrink:0,height:'218px'},
    btn:(a,col)=>({background:a?col+'22':'transparent',border:`1px solid ${a?col:'#3a2410'}`,color:a?col:'#8a6a40',padding:'2px 7px',cursor:'pointer',fontSize:'8px',letterSpacing:'0.8px',borderRadius:'4px',transition:'all 0.15s'}),
  };

  const FALLBACK_NEWS=[
    {title:'Mississippi River low water tightens grain barge capacity again',source:'Reuters',url:'https://www.reuters.com/markets/commodities/',region:'North America',commodity:'Agriculture',mode:'river',impact:'high',summary:'Draft restrictions force lighter loads, raising per-ton barge costs as harvest exports peak.'},
    {title:'Panama Canal eases draft limits as reservoir levels recover',source:'gCaptain',url:'https://gcaptain.com/',region:'North America',commodity:'Consumer Goods',mode:'sea',impact:'medium',summary:'Transit slots increase but operators keep contingency routings via Suez and US land bridge.'},
    {title:'Australia iron ore exports steady despite cyclone season risks',source:'Bloomberg',url:'https://www.bloomberg.com/markets/commodities',region:'Oceania',commodity:'Raw Materials',mode:'sea',impact:'low',summary:'Pilbara loadings on schedule; weather windows monitored across northwest shipping lanes.'},
    {title:'US air cargo demand climbs as shippers bypass ocean delays',source:'FreightWaves',url:'https://www.freightwaves.com/news',region:'North America',commodity:'Electronics',mode:'air',impact:'medium',summary:'Express belly and freighter capacity tightens on transpacific lanes; rates trend upward.'},
    {title:'Brazil soy logistics strained at Santos amid record volumes',source:'Financial Times',url:'https://www.ft.com/commodities',region:'South America',commodity:'Agriculture',mode:'sea',impact:'medium',summary:'Truck queues and berth waits lengthen as export season overwhelms northern arc ports.'},
    {title:'Red Sea diversions keep Asia-Europe transit times elevated',source:'Al Jazeera',url:'https://www.aljazeera.com/economy/',region:'Middle East',commodity:'Consumer Goods',mode:'sea',impact:'critical',summary:'Carriers maintain Cape routing, adding roughly two weeks and elevated fuel surcharges.'},
  ];
  const FALLBACK_CHOKE=[
    {name:'Suez Canal',riskLevel:'high',addedDelayDays:4,notes:'Red Sea diversion ongoing'},
    {name:'Strait of Hormuz',riskLevel:'high',addedDelayDays:2,notes:'Elevated Gulf tension'},
    {name:'Bab-el-Mandeb',riskLevel:'critical',addedDelayDays:14,notes:'Most carriers avoiding'},
    {name:'Panama Canal',riskLevel:'high',addedDelayDays:5,notes:'Draft restrictions; slot limits'},
    {name:'Strait of Malacca',riskLevel:'medium',addedDelayDays:1,notes:'Congestion, monsoon'},
    {name:'Mississippi River',riskLevel:'medium',addedDelayDays:3,notes:'Low water; reduced barge drafts'},
  ];
  const FALLBACK_JIT=[
    {severity:'critical',region:'Red Sea / Suez',commodity:'Consumer Goods',mode:'sea',estimatedDelayDays:14,impact:'Retail & auto JIT severely disrupted',recommendedAction:'Hold Cape routing; build buffer stock'},
    {severity:'high',region:'Mississippi River',commodity:'Grain / Agri',mode:'river',estimatedDelayDays:6,impact:'US export grain throughput constrained',recommendedAction:'Shift volume to rail intermodal'},
    {severity:'high',region:'Panama Canal',commodity:'Consumer Goods',mode:'sea',estimatedDelayDays:5,impact:'Transpacific-to-Gulf transit slowed',recommendedAction:'Use US West Coast land bridge'},
    {severity:'medium',region:'Transpacific Air',commodity:'Electronics',mode:'air',estimatedDelayDays:2,impact:'Express capacity tightening, rates up',recommendedAction:'Pre-book peak-season air blocks'},
  ];

  if(phase==='loading') return(
    <div style={{background:'#0c0703',color:O,fontFamily:'"SF Mono","Courier New",monospace',height:'100vh',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',position:'relative',overflow:'hidden'}}>
      <style>{`::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#0c0703}::-webkit-scrollbar-thumb{background:#5a3a18;border-radius:2px}@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}@keyframes spin{100%{transform:rotate(360deg)}}`}</style>
      <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle at 50% 45%, rgba(255,140,40,0.08), transparent 65%)'}}/>
      <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px',zIndex:1}}>
        <div style={{width:'11px',height:'11px',border:'2px solid #4a2e12',borderTopColor:O,borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
        <div style={{fontSize:'9px',color:'#8a5a28',letterSpacing:'5px'}}>ANTHROPIC INTELLIGENCE SYSTEMS · CLAUDE SONNET 4.6</div>
      </div>
      <div style={{fontSize:'19px',letterSpacing:'4px',color:'#ffe0b0',fontWeight:'bold',marginBottom:'5px',zIndex:1}}>◈ GLOBAL DISTRIBUTION INTELLIGENCE</div>
      <div style={{fontSize:'9px',color:'#a06a30',letterSpacing:'3px',marginBottom:'34px',zIndex:1}}>SEA · AIR · RAIL · RIVER · INTERSTATE · ALL REGIONS · v5.0</div>
      <div style={{width:'560px',maxWidth:'90vw',background:'#1a1006',border:`1px solid #4a2e12`,borderRadius:'4px',overflow:'hidden',marginBottom:'8px',zIndex:1}}>
        <div style={{height:'6px',background:`linear-gradient(90deg,${OD},${OL} ${prog}%,#1a1006 ${prog}%)`,transition:'background 0.8s ease'}}/>
      </div>
      <div style={{fontSize:'10px',color:OL,letterSpacing:'1px',marginBottom:'3px',height:'18px',textAlign:'center',width:'560px',maxWidth:'90vw',zIndex:1}}>{pLabel}</div>
      <div style={{display:'flex',gap:'18px',marginBottom:'24px',zIndex:1,flexWrap:'wrap',justifyContent:'center'}}>
        <span style={{fontSize:'9px',color:'#a06a30'}}>{prog}% COMPLETE</span>
        <span style={{fontSize:'9px',color:'#5a3a18'}}>│</span>
        <span style={{fontSize:'9px',color:'#a06a30'}}>{scanLog.length} OPS LOGGED</span>
        <span style={{fontSize:'9px',color:'#5a3a18'}}>│</span>
        <span style={{fontSize:'9px',color:OL}}><span style={{animation:'pulse 1.5s infinite'}}>● 14 LIVE STREAMS ACTIVE</span></span>
      </div>
      <div style={{width:'560px',maxWidth:'90vw',background:'#0c0703',border:'1px solid #2a1a0a',borderRadius:'3px',padding:'10px',height:'180px',overflowY:'auto',zIndex:1}}>
        {scanLog.map((l,i)=>(<div key={i} style={{fontSize:'9px',color:i===scanLog.length-1?OL:'#7a5028',marginBottom:'2.5px'}}>{i===scanLog.length-1?'▶':' '} {l}</div>))}
      </div>
    </div>
  );

  return(
    <div style={S.root}>
      <style>{`::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-track{background:#100a04}::-webkit-scrollbar-thumb{background:#5a3a18;border-radius:2px}table td{white-space:nowrap}@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}input[type=range]{-webkit-appearance:none;appearance:none}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:14px;height:14px;border-radius:50%;background:#fff5e0;border:2px solid ${O};cursor:pointer;box-shadow:0 0 8px ${O}cc}input[type=range]::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#fff5e0;border:2px solid ${O};cursor:pointer}a{text-decoration:none}`}</style>

      <div style={S.hdr}>
        <div style={{color:O,fontWeight:'bold',fontSize:'11px',letterSpacing:'2px',flex:'1',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:'7px'}}>
          <span style={{width:'7px',height:'7px',background:'#4ade80',borderRadius:'50%',animation:'blink 2s infinite',boxShadow:'0 0 6px #4ade80'}}/>◈ {U.title}
        </div>
        <span style={{color:'#8a5a28',fontSize:'8px',whiteSpace:'nowrap'}}>{clock}</span>
        {lastScan&&<span style={{color:'#6a451e',fontSize:'8px',whiteSpace:'nowrap'}}>{U.lastScan}: {lastScan}</span>}
        <div style={{display:'flex',gap:'2px',flexWrap:'wrap'}}>{LANGS.map(l=>(<button key={l.c} onClick={()=>handleLangChange(l.c)} style={S.btn(lang===l.c,O)}>{l.l}</button>))}</div>
        {translating&&<span style={{color:OL,fontSize:'8px'}}>⟳ {U.translating}</span>}
        <button onClick={gather} style={{background:'#2a1a0a',border:`1px solid ${O}`,color:O,padding:'3px 10px',cursor:'pointer',fontSize:'8px',letterSpacing:'1.5px',borderRadius:'4px',whiteSpace:'nowrap'}}>⟳ {U.deepScan}</button>
      </div>

      <div style={{background:'#1a1006',borderBottom:'1px solid #2a1a0a',height:'19px',display:'flex',alignItems:'center',overflow:'hidden',flexShrink:0}}>
        <div style={{background:OD,color:'#1a0f02',fontSize:'7px',fontWeight:'bold',padding:'0 7px',height:'100%',display:'flex',alignItems:'center',letterSpacing:'1px',zIndex:2,whiteSpace:'nowrap'}}>● LIVE</div>
        <div style={{display:'flex',animation:'ticker 80s linear infinite',whiteSpace:'nowrap'}}>
          {(tickerItems.length?[...tickerItems,...tickerItems]:[{t:'SYS',c:O,txt:'Awaiting intelligence feed...'}]).map((it,i)=>(
            <span key={i} style={{fontSize:'8px',padding:'0 14px',display:'inline-flex',alignItems:'center',gap:'5px'}}>
              <span style={{color:it.c,fontWeight:'bold',fontSize:'7px',border:`1px solid ${it.c}`,padding:'0 3px',borderRadius:'2px'}}>{it.t}</span>
              <span style={{color:'#c89858'}}>{it.txt}</span><span style={{color:'#5a3a18'}}>◆</span>
            </span>
          ))}
        </div>
      </div>

      <div style={S.body}>
        {/* LEFT */}
        <div style={S.col}>
          <div style={S.pt}>▸ {U.regionalRisk}</div>
          <div style={S.pb}>
            {[{l:'Asia-Pacific',v:risks.asia},{l:'Middle East',v:risks.me},{l:'Africa',v:risks.africa},{l:'Americas',v:risks.americas},{l:'Oceania',v:risks.oceania}].map(r=>(
              <div key={r.l} style={{marginBottom:'10px'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px'}}><span style={{color:'#d0a868'}}>{r.l}</span><span style={{color:rC(r.v),fontWeight:'bold',fontSize:'11px'}}>{r.v}<span style={{color:'#6a451e',fontSize:'8px'}}>/100</span></span></div>
                <div style={{background:'#241608',height:'5px',borderRadius:'3px',overflow:'hidden'}}><div style={{width:`${r.v}%`,height:'100%',background:`linear-gradient(90deg,${rC(r.v)}80,${rC(r.v)})`,transition:'width 1.2s ease',borderRadius:'3px',boxShadow:`0 0 6px ${rC(r.v)}80`}}/></div>
              </div>
            ))}
            <div style={{borderTop:'1px solid #2a1a0a',paddingTop:'8px',marginTop:'2px'}}>
              <div style={{...S.pt,padding:'0 0 6px 0',border:'none'}}>▸ {U.chokepointStatus}</div>
              {(chokepoints.length?chokepoints:FALLBACK_CHOKE).map((cp,i)=>(
                <div key={i} style={{marginBottom:'4px',padding:'5px 7px',background:rBg(rv(cp.riskLevel)),borderLeft:`2px solid ${rc(cp.riskLevel)}`,borderRadius:'3px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'1px'}}><span style={{color:'#e0c088',fontSize:'9px',fontWeight:'bold'}}>{cp.name}</span><span style={{color:rc(cp.riskLevel),fontSize:'8px',fontWeight:'bold'}}>{(cp.riskLevel||'').toUpperCase()}</span></div>
                  <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'#a07a48',fontSize:'8px'}}>{cp.notes}</span>{cp.addedDelayDays>0&&<span style={{color:OL,fontSize:'8px',marginLeft:'4px',whiteSpace:'nowrap',fontWeight:'bold'}}>+{cp.addedDelayDays}d</span>}</div>
                </div>
              ))}
            </div>
            <div style={{borderTop:'1px solid #2a1a0a',paddingTop:'8px',marginTop:'6px'}}>
              <div style={{...S.pt,padding:'0 0 6px 0',border:'none'}}>▸ {U.delayIndex} ({U.mode})</div>
              {[{l:'Ocean',v:delayIdx.sea},{l:'Air',v:delayIdx.air},{l:'Rail',v:delayIdx.rail},{l:'River (MS)',v:delayIdx.river}].map(d=>(
                <div key={d.l} style={{display:'flex',justifyContent:'space-between',marginBottom:'5px'}}><span style={{color:'#a07a48'}}>{d.l}</span><span style={{color:rC(d.v),fontSize:'10px',fontWeight:'bold'}}>{d.v}</span></div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER MAP */}
        <div style={{...S.col,position:'relative'}}>
          <div style={{...S.pt,display:'flex',justifyContent:'space-between',alignItems:'center',gap:'6px',flexWrap:'wrap'}}>
            <span>▸ {U.worldRoutes}{zoomRegion?` — ${zoomRegion.n}`:''}</span>
            <span style={{color:'#a06a30',fontSize:'7px'}}>◉ Click nodes & ⚠ threats · zoom a region below</span>
          </div>
          <div style={{padding:'4px 7px',borderBottom:'1px solid #2a1a0a',background:'#160e06',display:'flex',gap:'3px',flexWrap:'wrap',flexShrink:0,alignItems:'center'}}>
            <span style={{color:'#8a5a28',fontSize:'8px',marginRight:'2px'}}>ZOOM:</span>
            <button onClick={()=>setZoomRegion(null)} style={S.btn(!zoomRegion,O)}>🌍 WORLD</button>
            {REGIONS.map(rg=>(<button key={rg.id} onClick={()=>setZoomRegion(zoomRegion?.id===rg.id?null:rg)} style={S.btn(zoomRegion?.id===rg.id,O)}>{rg.n}</button>))}
          </div>
          <canvas ref={canvasRef} onClick={handleCanvasClick} style={{width:'100%',height:'100%',display:'block',flex:'1',cursor:'crosshair'}}/>

          {threatInfo&&(
            <div style={{position:'absolute',top:'30px',left:'8px',width:'264px',maxHeight:'calc(100% - 90px)',background:'rgba(28,12,4,0.97)',border:`1px solid ${rc(threatInfo.risk)}`,borderRadius:'5px',zIndex:11,boxShadow:`0 4px 28px ${rc(threatInfo.risk)}40`,display:'flex',flexDirection:'column',overflow:'hidden'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 10px',borderBottom:`1px solid ${rc(threatInfo.risk)}40`,background:`${rc(threatInfo.risk)}15`}}>
                <div><div style={{color:rc(threatInfo.risk),fontSize:'10px',fontWeight:'bold',letterSpacing:'1px'}}>⚠ {threatInfo.l}</div><div style={{color:'#a06a30',fontSize:'7px',marginTop:'1px'}}>THREAT ASSESSMENT</div></div>
                <span style={{color:'#a07a48',fontSize:'12px',cursor:'pointer',padding:'2px 4px'}} onClick={()=>{setThreatInfo(null);setThreatDetail(null);}}>✕</span>
              </div>
              <div style={{overflowY:'auto',padding:'9px 10px'}}>
                {loadingThreat?(<div style={{color:OL,fontSize:'9px',padding:'16px 0',textAlign:'center'}}><span style={{animation:'pulse 1.2s infinite'}}>⟳ Analyzing threat intelligence...</span></div>):threatDetail?(
                  <div>
                    <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}><span style={{background:rc(threatDetail.threatLevel),color:'#1a0f02',fontSize:'9px',fontWeight:'bold',padding:'2px 8px',borderRadius:'3px',letterSpacing:'1px'}}>{(threatDetail.threatLevel||'').toUpperCase()}</span>{threatDetail.addedDelayDays>0&&<span style={{color:OL,fontSize:'9px',fontWeight:'bold'}}>+{threatDetail.addedDelayDays}d</span>}</div>
                    {threatDetail.headline&&<div style={{color:'#f0d0a0',fontSize:'9px',lineHeight:'1.5',fontWeight:'bold',marginBottom:'8px'}}>{threatDetail.headline}</div>}
                    <div style={{color:OD,fontSize:'7px',letterSpacing:'1px',marginBottom:'4px'}}>▸ WHY THIS THREAT LEVEL</div>
                    {(threatDetail.reasons||[]).map((rsn,i)=>(<div key={i} style={{display:'flex',gap:'6px',marginBottom:'4px'}}><span style={{color:rc(threatDetail.threatLevel),fontSize:'8px',flexShrink:0}}>▪</span><span style={{color:'#d0a868',fontSize:'8px',lineHeight:'1.45'}}>{rsn}</span></div>))}
                    {threatDetail.impact&&threatDetail.impact!=='—'&&(<div style={{marginTop:'8px',paddingTop:'7px',borderTop:'1px solid #3a2410'}}><div style={{color:'#a06a30',fontSize:'7px',letterSpacing:'1px',marginBottom:'2px'}}>SUPPLY CHAIN IMPACT</div><div style={{color:'#c89858',fontSize:'8px',lineHeight:'1.45'}}>{threatDetail.impact}</div></div>)}
                    {threatDetail.affectedCommodities?.length>0&&(<div style={{display:'flex',flexWrap:'wrap',gap:'3px',marginTop:'6px'}}>{threatDetail.affectedCommodities.map((cm,i)=>(<span key={i} style={{background:'#2a1808',color:'#d0a060',fontSize:'7px',padding:'2px 5px',borderRadius:'2px',border:'1px solid #3a2410'}}>{cm}</span>))}</div>)}
                    {threatDetail.alternativeRoute&&threatDetail.alternativeRoute!=='—'&&(<div style={{marginTop:'8px',padding:'6px 8px',background:'rgba(74,222,128,0.08)',borderRadius:'3px',borderLeft:'2px solid #4ade80'}}><div style={{color:'#4ade80',fontSize:'7px',letterSpacing:'1px',marginBottom:'2px'}}>↪ ALTERNATIVE ROUTING</div><div style={{color:'#9adfb0',fontSize:'8px',lineHeight:'1.4'}}>{threatDetail.alternativeRoute}</div></div>)}
                    {threatDetail.articles?.length>0&&(<div style={{marginTop:'8px',paddingTop:'7px',borderTop:'1px solid #3a2410'}}><div style={{color:OL,fontSize:'7px',letterSpacing:'1px',marginBottom:'5px'}}>▸ {U.sources} ({threatDetail.articles.length})</div>{threatDetail.articles.map((a,i)=>(<a key={i} href={a.url} target="_blank" rel="noopener noreferrer" style={{display:'block',background:'#1c0e04',borderRadius:'3px',padding:'6px 8px',marginBottom:'4px',border:'1px solid #3a2410'}}><div style={{color:'#e0b878',fontSize:'8px',lineHeight:'1.4',fontWeight:'bold',marginBottom:'2px'}}>{a.headline}</div><div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'#a06a30',fontSize:'7px'}}>{a.source}{a.date?` · ${a.date}`:''}</span><span style={{color:'#4ade80',fontSize:'7px'}}>↗ {U.read}</span></div></a>))}</div>)}
                  </div>
                ):null}
              </div>
            </div>
          )}

          {portInfo&&(
            <div style={{position:'absolute',top:'30px',right:'8px',width:'260px',maxHeight:'calc(100% - 90px)',background:'rgba(20,12,4,0.97)',border:`1px solid ${modeColor(portInfo.t)}`,borderRadius:'5px',zIndex:10,boxShadow:`0 4px 28px ${modeColor(portInfo.t)}30`,display:'flex',flexDirection:'column',overflow:'hidden'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 10px',borderBottom:`1px solid ${modeColor(portInfo.t)}40`,background:`${modeColor(portInfo.t)}12`}}>
                <div><div style={{color:modeColor(portInfo.t),fontSize:'10px',fontWeight:'bold'}}>◉ {portInfo.n}</div><div style={{color:'#a06a30',fontSize:'7px',marginTop:'1px'}}>{(portInfo.t||'').toUpperCase()} NODE · {U.portDetail}</div></div>
                <span style={{color:'#a07a48',fontSize:'12px',cursor:'pointer',padding:'2px 4px'}} onClick={()=>{setPortInfo(null);setPortDetail(null);}}>✕</span>
              </div>
              <div style={{overflowY:'auto',padding:'8px 10px'}}>
                {loadingPort?(<div style={{color:OL,fontSize:'9px',padding:'16px 0',textAlign:'center'}}><span style={{animation:'pulse 1.2s infinite'}}>⟳ {U.loadingPort}</span></div>):portDetail?(
                  <div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'5px',marginBottom:'8px'}}>
                      {[{l:U.congestion,v:(portDetail.congestion||'—').toUpperCase(),c:{LOW:'#ffd24a',MODERATE:'#ffb020',HIGH:'#ff7a1a',SEVERE:'#ff3b30'}[(portDetail.congestion||'').toUpperCase()]||'#c0a070'},{l:U.capacityUtil,v:typeof portDetail.capacityPct==='number'?`${portDetail.capacityPct}%`:'—',c:rC(typeof portDetail.capacityPct==='number'?portDetail.capacityPct:50)},{l:U.dwell,v:portDetail.avgDwellDays!=null?`${portDetail.avgDwellDays}d`:'—',c:'#e0c088'},{l:U.waiting,v:portDetail.vesselsWaiting??'—',c:'#e0c088'}].map(row=>(<div key={row.l} style={{background:'#1c1206',borderRadius:'3px',padding:'5px 7px'}}><div style={{color:'#a06a30',fontSize:'7px',marginBottom:'2px'}}>{row.l}</div><div style={{color:row.c,fontWeight:'bold',fontSize:'12px'}}>{row.v}</div></div>))}
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'5px',marginBottom:'8px',fontSize:'8px'}}><span style={{color:'#a06a30'}}>{U.throughput}:</span><span style={{color:trC(portDetail.throughputTrend),fontWeight:'bold'}}>{portDetail.throughputTrend==='up'?'↑ RISING':portDetail.throughputTrend==='down'?'↓ FALLING':'→ STABLE'}</span></div>
                    {portDetail.summary&&portDetail.summary!=='—'&&(<div style={{color:'#c89858',fontSize:'8px',lineHeight:'1.5',marginBottom:'8px',paddingBottom:'8px',borderBottom:'1px solid #2a1a0a'}}>{portDetail.summary}</div>)}
                    <div style={{marginBottom:'8px'}}><div style={{color:OL,fontSize:'7px',letterSpacing:'1px',marginBottom:'3px'}}>⚠ {U.keyRisk}</div><div style={{color:'#d0a868',fontSize:'8px',lineHeight:'1.45'}}>{portDetail.keyRisk}</div></div>
                    {portDetail.articles?.length>0&&(<div><div style={{color:OL,fontSize:'7px',letterSpacing:'1px',marginBottom:'5px',paddingTop:'6px',borderTop:'1px solid #2a1a0a'}}>▸ {U.sources} ({portDetail.articles.length})</div>{portDetail.articles.map((a,i)=>(<a key={i} href={a.url} target="_blank" rel="noopener noreferrer" style={{display:'block',background:'#1c1206',borderRadius:'3px',padding:'6px 8px',marginBottom:'4px',border:'1px solid #2a1a0a'}}><div style={{color:'#e0b878',fontSize:'8px',lineHeight:'1.4',fontWeight:'bold',marginBottom:'2px'}}>{a.headline}</div><div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'#a06a30',fontSize:'7px'}}>{a.source}{a.date?` · ${a.date}`:''}</span><span style={{color:'#4ade80',fontSize:'7px'}}>↗ {U.read}</span></div></a>))}</div>)}
                  </div>
                ):null}
              </div>
            </div>
          )}

          <div style={{padding:'5px 7px',borderTop:'1px solid #2a1a0a',background:'#160e06',display:'flex',gap:'3px',flexWrap:'wrap',flexShrink:0}}>
            <span style={{color:'#8a5a28',fontSize:'8px',alignSelf:'center',marginRight:'3px'}}>{U.route}:</span>
            {ROUTES.map(r=>(<button key={r.id} onClick={()=>setSelRoute(selRoute===r.id?null:r.id)} style={S.btn(selRoute===r.id,modeColor(r.mode))}><span style={{color:modeColor(r.mode),marginRight:'3px'}}>●</span>{r.n}</button>))}
          </div>

          {selRoute&&(()=>{const r=ROUTES.find(x=>x.id===selRoute);if(!r||!r.ports)return null;
            const transitDays=r.d;const totalDays=transitDays+Math.round(transitDays*0.4);
            const isPast=timelineDay<=transitDays;
            const phaseLbl=timelineDay<=0.1?'AT ORIGIN':timelineDay>=totalDays?'ARRIVED':isPast?'IN TRANSIT':'FORECAST DELAY';
            const stops=r.ports.map((p,i)=>({n:PORTS[p]?.n||p,day:(i/Math.max(r.ports.length-1,1))*transitDays}));
            return(
              <div style={{padding:'7px 10px',background:'#130c05',borderTop:'1px solid #2a1a0a',flexShrink:0}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px',flexWrap:'wrap'}}>
                  <button onClick={()=>{if(timelineDay>=totalDays)setTimelineDay(0);setPlaying(p=>!p);}} style={{background:playing?'#2a1a0a':'#1c1206',border:`1px solid ${playing?'#4ade80':O}`,color:playing?'#4ade80':O,width:'22px',height:'22px',borderRadius:'4px',cursor:'pointer',fontSize:'10px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{playing?'❚❚':'▶'}</button>
                  <span style={{color:O,fontSize:'8px',letterSpacing:'1px',fontWeight:'bold'}}>⏱ SHIPMENT TIMELINE</span>
                  <span style={{color:isPast?OL:'#ff5a3c',fontSize:'8px',fontWeight:'bold'}}>{phaseLbl}</span>
                  <span style={{color:'#a07a48',fontSize:'8px',marginLeft:'auto'}}>Day {Math.floor(timelineDay)} / {totalDays} {!isPast&&<span style={{color:'#ff5a3c'}}>(+{Math.ceil(timelineDay-transitDays)}d)</span>}</span>
                  <button onClick={()=>{setTimelineDay(0);setPlaying(false);}} style={{background:'transparent',border:`1px solid ${O}`,color:'#a07a48',padding:'2px 6px',borderRadius:'4px',cursor:'pointer',fontSize:'7px'}}>RESET</button>
                </div>
                <div style={{position:'relative',height:'22px'}}>
                  <div style={{position:'absolute',top:'9px',left:0,right:0,height:'4px',borderRadius:'2px',overflow:'hidden',display:'flex'}}><div style={{width:`${(transitDays/totalDays)*100}%`,background:`linear-gradient(90deg,#5a3a18,${O})`}}/><div style={{width:`${((totalDays-transitDays)/totalDays)*100}%`,background:'repeating-linear-gradient(90deg,#5a2a0a,#5a2a0a 4px,#2a1408 4px,#2a1408 8px)'}}/></div>
                  <div style={{position:'absolute',top:'9px',left:0,width:`${(timelineDay/totalDays)*100}%`,height:'4px',background:isPast?`linear-gradient(90deg,${OD},${OL})`:`linear-gradient(90deg,${OL},#ff5a3c)`,borderRadius:'2px',boxShadow:`0 0 6px ${O}99`}}/>
                  {stops.map((s,i)=>(<div key={i} title={s.n} style={{position:'absolute',top:'6px',left:`${(s.day/totalDays)*100}%`,transform:'translateX(-50%)'}}><div style={{width:'8px',height:'8px',borderRadius:'50%',background:timelineDay>=s.day?OL:'#2a1808',border:`1.5px solid ${timelineDay>=s.day?'#fff5e0':'#5a3a18'}`,boxShadow:timelineDay>=s.day?`0 0 5px ${OL}`:'none'}}/></div>))}
                  <div style={{position:'absolute',top:'4px',left:`${(transitDays/totalDays)*100}%`,transform:'translateX(-50%)',width:'1px',height:'12px',background:'#ff5a3c'}}/>
                  <input type="range" min={0} max={totalDays} step={0.25} value={timelineDay} onChange={e=>{setTimelineDay(parseFloat(e.target.value));setPlaying(false);}} style={{position:'absolute',top:'4px',left:'-2px',width:'calc(100% + 4px)',height:'14px',margin:0,background:'transparent',cursor:'pointer',zIndex:3}}/>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:'1px'}}><span style={{color:'#a06a30',fontSize:'7px'}}>◉ {PORTS[r.ports[0]]?.n}</span><span style={{color:'#c07a2a',fontSize:'7px'}}>ETA Day {transitDays} ▲</span><span style={{color:'#a06a30',fontSize:'7px'}}>{PORTS[r.ports[r.ports.length-1]]?.n} ◉</span></div>
              </div>
            );
          })()}
        </div>

        {/* RIGHT NEWS */}
        <div style={S.col}>
          <div style={S.pt}>▸ {U.newsFeed}</div>
          <div style={{padding:'5px 7px',borderBottom:'1px solid #2a1a0a',display:'flex',gap:'2px',flexWrap:'wrap',flexShrink:0}}>
            {['all','Europe','North America','South America','Oceania','Asia','Middle East','Africa'].map(f=>(<button key={f} onClick={()=>setNewsFilter(f)} style={S.btn(newsFilter===f,O)}>{f==='all'?U.allRegions:f}</button>))}
          </div>
          <div style={S.pb}>
            {(news.length?news:FALLBACK_NEWS).filter(it=>newsFilter==='all'||it.region===newsFilter).map((item,i)=>{
              const Wrap=item.url?'a':'div';const wp=item.url?{href:item.url,target:'_blank',rel:'noopener noreferrer'}:{};
              return(<Wrap key={i} {...wp} style={{display:'block',marginBottom:'7px',padding:'7px',background:'#1a1006',borderLeft:`2px solid ${rc(item.impact)}`,borderRadius:'3px',cursor:item.url?'pointer':'default'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px'}}><span style={{color:rc(item.impact),fontSize:'8px',letterSpacing:'1px',fontWeight:'bold'}}>{(item.impact||'').toUpperCase()}{item.mode?` · ${item.mode.toUpperCase()}`:''}</span><span style={{color:'#8a5a28',fontSize:'8px'}}>{item.region}</span></div>
                <div style={{color:'#f0d4a8',fontSize:'9px',lineHeight:'1.5',marginBottom:'3px',fontWeight:'bold'}}>{item.title}</div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'3px'}}><span style={{color:'#b08850',fontSize:'8px'}}>{item.source} · {item.commodity}</span>{item.url&&<span style={{color:'#4ade80',fontSize:'7px',marginLeft:'4px',whiteSpace:'nowrap'}}>↗ {U.read}</span>}</div>
                {item.summary&&<div style={{color:'#a07a48',fontSize:'8px',lineHeight:'1.45'}}>{item.summary}</div>}
              </Wrap>);
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div style={S.btm}>
        {/* Tabbed: Commodity / Weather / Freight */}
        <div style={{...S.col,overflow:'hidden'}}>
          <div style={{...S.pt,display:'flex',gap:'6px',alignItems:'center',flexWrap:'wrap'}}>
            {[['matrix',U.matrix],['freight',U.freightTab],['strategic',U.strategicTab],['weather',U.weatherTab]].map(([k,lbl])=>(<button key={k} onClick={()=>setActiveTab(k)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'8px',letterSpacing:'1px',color:activeTab===k?O:'#8a5a28',fontWeight:activeTab===k?'bold':'normal',padding:0}}>{lbl}</button>))}
          </div>
          {activeTab==='matrix'&&(<div style={{...S.pb,display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px',alignContent:'start'}}>
            {[{l:'Automotive',v:commod.autos,icon:'🚗',k:'autos'},{l:'Raw Materials',v:commod.raw,icon:'⛏',k:'raw'},{l:'Natural Gas',v:commod.gas,icon:'🔥',k:'gas'},{l:'Fossil Fuels',v:commod.fuel,icon:'🛢',k:'fuel'},{l:'Consumer Goods',v:commod.goods,icon:'📦',k:'goods'},{l:'Agriculture',v:commod.agri,icon:'🌾',k:'agri'}].map(c=>{const m=commodMeta[c.k]||{};const tr=m.trend;return(
              <div key={c.l} style={{padding:'6px',background:'#1a1006',borderRadius:'3px',borderLeft:`2px solid ${rC(c.v)}80`}} title={m.notes||''}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px',alignItems:'center'}}><span style={{color:'#d0a868',fontSize:'8px'}}>{c.icon} {c.l}</span><span style={{display:'flex',alignItems:'center',gap:'3px'}}>{tr&&<span style={{color:tr==='up'?'#ff5a3c':tr==='down'?'#4ade80':'#a07a48',fontSize:'7px'}}>{tr==='up'?'▲':tr==='down'?'▼':'■'}</span>}<span style={{color:rC(c.v),fontWeight:'bold',fontSize:'11px'}}>{c.v}</span></span></div>
                <div style={{background:'#241608',height:'3px',borderRadius:'2px',overflow:'hidden'}}><div style={{width:`${c.v}%`,height:'100%',background:rC(c.v),transition:'width 1.2s',borderRadius:'2px'}}/></div>
              </div>);})}
          </div>)}
          {activeTab==='strategic'&&(<div style={S.pb}>
            {(strategic.length?strategic:[
              {type:'humanitarian',origin:'WFP / Global',destination:'Horn of Africa',description:'Emergency food aid corridor via Djibouti & Mombasa',status:'active',category:'Food Security'},
              {type:'medical',origin:'WHO / Gavi',destination:'Sub-Saharan Africa',description:'Vaccine cold-chain airlift to regional hubs',status:'active',category:'Health'},
              {type:'military',origin:'USA / NATO',destination:'Eastern Europe',description:'Defense equipment & ammunition sealift/airlift',status:'active',category:'Defense Aid'},
              {type:'humanitarian',origin:'ICRC / UN',destination:'Middle East',description:'Relief supplies amid regional displacement',status:'delayed',category:'Relief'},
              {type:'military',origin:'Multiple',destination:'Indo-Pacific',description:'Tracked arms transfers & naval logistics',status:'active',category:'Arms Transfer'},
            ]).map((f,i)=>{const tc={medical:'#4ade80',humanitarian:'#5ab0ff',military:'#ff5a3c'}[f.type]||O;const ic={medical:'⚕',humanitarian:'🤝',military:'⚔'}[f.type]||'◆';return(
              <div key={i} style={{marginBottom:'5px',padding:'6px 7px',background:'#1a1006',borderLeft:`2px solid ${tc}`,borderRadius:'3px'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'2px',alignItems:'center'}}><span style={{color:tc,fontSize:'8px',fontWeight:'bold',letterSpacing:'0.5px'}}>{ic} {(f.type||'').toUpperCase()}</span><span style={{color:f.status==='delayed'?'#ff5a3c':f.status==='active'?'#4ade80':'#a07a48',fontSize:'7px',fontWeight:'bold'}}>{(f.status||'').toUpperCase()}</span></div>
                <div style={{color:'#e0c088',fontSize:'8px',marginBottom:'2px'}}>{f.origin} → {f.destination}</div>
                <div style={{color:'#a07a48',fontSize:'8px',lineHeight:'1.35'}}>{f.description}</div>
                {f.category&&<div style={{marginTop:'3px'}}><span style={{background:tc+'22',color:tc,fontSize:'7px',padding:'1px 5px',borderRadius:'2px',border:`1px solid ${tc}44`}}>{f.category}</span></div>}
              </div>);})}
          </div>)}
          {activeTab==='weather'&&(<div style={S.pb}>
            {(weather.length?weather:[{location:'Mississippi River',type:'Low water / drought',severity:'high',portImpact:'Barge draft cuts',estimatedDelayDays:3},{location:'NW Pacific',type:'Cyclone season',severity:'medium',portImpact:'Oceania lane risk',estimatedDelayDays:2},{location:'Gulf of Mexico',type:'Storm watch',severity:'medium',portImpact:'Houston/NOLA delays',estimatedDelayDays:2},{location:'Indian Ocean',type:'Monsoon surge',severity:'low',portImpact:'Malacca visibility',estimatedDelayDays:1}]).map((wx,i)=>(
              <div key={i} style={{marginBottom:'4px',padding:'5px 7px',background:rBg(rv(wx.severity)),borderLeft:`2px solid ${rc(wx.severity)}`,borderRadius:'3px'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'1px'}}><span style={{color:'#e0c088',fontSize:'8px',fontWeight:'bold'}}>🌊 {wx.location}</span>{wx.estimatedDelayDays>0&&<span style={{color:OL,fontSize:'8px',fontWeight:'bold'}}>+{wx.estimatedDelayDays}d</span>}</div>
                <div style={{color:rc(wx.severity),fontSize:'8px',marginBottom:'1px'}}>{wx.type} · {(wx.severity||'').toUpperCase()}</div><div style={{color:'#a07a48',fontSize:'8px'}}>{wx.portImpact}</div>
              </div>))}
          </div>)}
          {activeTab==='freight'&&(<div style={S.pb}>
            {freight.map((f,i)=>(<div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'5px 6px',background:'#1a1006',borderRadius:'3px',marginBottom:'3px'}}>
              <div style={{flex:1,minWidth:0}}><div style={{color:'#e0c088',fontSize:'8px',fontWeight:'bold',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.mode}</div></div>
              <div style={{textAlign:'right',marginLeft:'6px'}}><div style={{color:'#fff0d8',fontSize:'10px',fontWeight:'bold'}}>${typeof f.cost==='number'?f.cost.toLocaleString():f.cost}<span style={{color:'#8a5a28',fontSize:'7px'}}>{f.unit}</span></div></div>
              <div style={{textAlign:'right',marginLeft:'6px',width:'42px'}}><span style={{color:trC(f.trend),fontSize:'8px',fontWeight:'bold'}}>{f.trend==='up'?'▲':f.trend==='down'?'▼':'■'} {f.chg}</span></div>
            </div>))}
          </div>)}
        </div>

        {/* Carrier */}
        <div style={{...S.col,overflow:'auto'}}>
          <div style={S.pt}>▸ {U.carrierTracker}</div>
          <div style={S.pb}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:'9px'}}>
              <thead><tr style={{color:'#b08850',borderBottom:'1px solid #2a1a0a'}}><td style={{paddingBottom:'4px'}}>{U.carrier}</td><td style={{paddingBottom:'4px',textAlign:'right'}}>{U.delay}</td><td style={{paddingBottom:'4px',textAlign:'right'}}>{U.capacity}</td><td style={{paddingBottom:'4px',textAlign:'right'}}>{U.trend}</td></tr></thead>
              <tbody>{comps.map(c=>(<tr key={c.name} style={{borderBottom:'1px solid #1a1006'}}><td style={{padding:'4px 0',color:'#e0c088',fontWeight:'bold'}}>{c.name}</td><td style={{textAlign:'right',color:c.delay>4?'#ff5a3c':c.delay>2?'#ffb020':'#4ade80'}}>+{c.delay}d</td><td style={{textAlign:'right',color:c.cap>88?'#ff5a3c':c.cap>75?'#ffb020':'#4ade80'}}>{c.cap}%</td><td style={{textAlign:'right',color:trC(c.st)}}>{c.st==='improving'?'↑':c.st==='worsening'?'↓':'→'}</td></tr>))}</tbody>
            </table>
            <div style={{marginTop:'6px',paddingTop:'5px',borderTop:'1px solid #2a1a0a',display:'flex',justifyContent:'space-between',fontSize:'8px'}}><span style={{color:'#b08850'}}>AVG DELAY</span><span style={{color:OL,fontWeight:'bold'}}>+{(comps.reduce((a,c)=>a+c.delay,0)/comps.length).toFixed(1)}d</span></div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'8px',marginTop:'2px'}}><span style={{color:'#b08850'}}>AVG UTILIZATION</span><span style={{color:rC(comps.reduce((a,c)=>a+c.cap,0)/comps.length),fontWeight:'bold'}}>{(comps.reduce((a,c)=>a+c.cap,0)/comps.length).toFixed(0)}%</span></div>
          </div>
        </div>

        {/* JIT */}
        <div style={{...S.col,overflow:'auto'}}>
          <div style={S.pt}>▸ {U.jitAlerts}</div>
          <div style={S.pb}>
            {(jitAlerts.length?jitAlerts:FALLBACK_JIT).map((a,i)=>(
              <div key={i} style={{marginBottom:'5px',padding:'6px 7px',background:rBg(rv(a.severity)),borderLeft:`2px solid ${rc(a.severity)}`,borderRadius:'3px'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'2px'}}><span style={{color:rc(a.severity),fontSize:'8px',fontWeight:'bold',letterSpacing:'0.5px'}}>{(a.severity||'').toUpperCase()} · {a.region}</span><span style={{color:OL,fontSize:'8px',whiteSpace:'nowrap',fontWeight:'bold'}}>+{a.estimatedDelayDays}d</span></div>
                <div style={{color:'#c89858',fontSize:'8px',marginBottom:'2px'}}>{a.commodity}{a.mode?` · ${a.mode}`:''} · {a.impact}</div>
                <div style={{color:'#4ade80',fontSize:'8px'}}>▸ {a.recommendedAction}</div>
              </div>))}
          </div>
        </div>
      </div>
    </div>
  );
}
