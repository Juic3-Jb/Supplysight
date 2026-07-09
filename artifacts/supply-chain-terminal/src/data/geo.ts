export const PORTS = {
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
export const ROUTES = [
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

export const COMPS_D = [
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

export const FREIGHT_D = [
  {mode:'Air Express (Intl)',unit:'/kg',cost:8.40,trend:'up',chg:'+6.2%'},
  {mode:'Air Freight (Standard)',unit:'/kg',cost:4.10,trend:'up',chg:'+3.1%'},
  {mode:'Ocean Priority (FCL)',unit:'/40ft',cost:4250,trend:'up',chg:'+18%'},
  {mode:'Ocean Standard (FCL)',unit:'/40ft',cost:2980,trend:'stable',chg:'+1.4%'},
  {mode:'US Expedited Trucking',unit:'/mi',cost:3.85,trend:'down',chg:'-2.0%'},
  {mode:'Rail Intermodal (US)',unit:'/container',cost:1840,trend:'stable',chg:'+0.8%'},
  {mode:'Barge (Mississippi)',unit:'/ton',cost:28.50,trend:'up',chg:'+9.5%'},
];

// ===== Detailed coastlines (smoothed at render) =====
export const LAND = [
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
export const LAKES = [
  [[-88,42],[-87,46],[-85,45],[-82,43],[-83,41],[-87,41],[-88,42]],
  [[31,0],[33,-1],[34,-3],[33,-2],[31,-1],[31,0]],
];

export const CHOKE_POINTS=[
  {id:'suez',lon:32.5,lat:30,l:'SUEZ',risk:'high'},
  {id:'hormuz',lon:56.5,lat:26.6,l:'HORMUZ',risk:'high'},
  {id:'babelmandeb',lon:43.5,lat:12.5,l:'BAB-EL-MANDEB',risk:'critical'},
  {id:'malacca',lon:101,lat:2.5,l:'MALACCA',risk:'medium'},
  {id:'panama',lon:-79.7,lat:9.1,l:'PANAMA CANAL',risk:'high'},
  {id:'mississippi',lon:-91,lat:32,l:'MISSISSIPPI L.WATER',risk:'medium'},
];
export const CHOKE_POS={};

// Zoomable regions: [lonMin, lonMax, latMin, latMax]
export const REGIONS = [
  {id:'europe',n:'EUROPE',box:[-12,30,35,62]},
  {id:'nasia',n:'N.AMERICA',box:[-130,-60,8,55]},
  {id:'samerica',n:'S.AMERICA',box:[-82,-34,-56,14]},
  {id:'asia',n:'ASIA-PAC',box:[60,150,-12,52]},
  {id:'meast',n:'MID-EAST',box:[30,65,10,40]},
  {id:'africa',n:'AFRICA',box:[-18,52,-36,38]},
  {id:'oceania',n:'OCEANIA',box:[110,180,-48,-8]},
];

// projection that honors an optional zoom box
