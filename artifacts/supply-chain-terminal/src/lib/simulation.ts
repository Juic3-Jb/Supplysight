import { 
  FALLBACK_NEWS, 
  FALLBACK_CHOKE, 
  FALLBACK_JIT, 
  STRATEGIC_FLOWS, 
  WEATHER_EVENTS 
} from './mockData';
import { COMPS_D, FREIGHT_D } from '../data/geo';

export const generateSimulatedData = () => {
  return {
    risks: {
      asia: 38 + Math.floor(Math.random() * 10 - 5),
      me: 55 + Math.floor(Math.random() * 10 - 5),
      africa: 50 + Math.floor(Math.random() * 10 - 5),
      americas: 35 + Math.floor(Math.random() * 10 - 5),
      oceania: 25 + Math.floor(Math.random() * 10 - 5),
    },
    chokepoints: FALLBACK_CHOKE.map(c => ({
      ...c,
      addedDelayDays: Math.max(0, c.addedDelayDays + Math.floor(Math.random() * 4 - 2))
    })),
    news: FALLBACK_NEWS.sort(() => Math.random() - 0.5),
    commod: {
      autos: 35 + Math.floor(Math.random() * 10 - 5),
      raw: 48 + Math.floor(Math.random() * 10 - 5),
      gas: 60 + Math.floor(Math.random() * 10 - 5),
      fuel: 55 + Math.floor(Math.random() * 10 - 5),
      goods: 40 + Math.floor(Math.random() * 10 - 5),
      agri: 42 + Math.floor(Math.random() * 10 - 5),
    },
    commodMeta: {
      autos: { trend: 'stable' },
      raw: { trend: 'up' },
      gas: { trend: 'up' },
      fuel: { trend: 'stable' },
      goods: { trend: 'down' },
      agri: { trend: 'up' },
    },
    comps: COMPS_D.map(c => ({
      ...c,
      delay: Math.max(0, c.delay + Math.floor(Math.random() * 3 - 1)),
      cap: Math.min(100, Math.max(0, c.cap + Math.floor(Math.random() * 10 - 5))),
    })),
    freight: FREIGHT_D.map(f => {
      const chgNum = (Math.random() * 5).toFixed(1);
      const isUp = Math.random() > 0.5;
      return {
        ...f,
        cost: typeof f.cost === 'number' ? Math.floor(f.cost * (1 + (isUp ? 1 : -1) * (parseFloat(chgNum)/100))) : f.cost,
        trend: isUp ? 'up' : 'down',
        chg: (isUp ? '+' : '-') + chgNum + '%'
      };
    }),
    weather: WEATHER_EVENTS,
    strategic: STRATEGIC_FLOWS,
    jitAlerts: FALLBACK_JIT,
    delayIdx: {
      sea: 45 + Math.floor(Math.random() * 10 - 5),
      air: 30 + Math.floor(Math.random() * 10 - 5),
      rail: 25 + Math.floor(Math.random() * 10 - 5),
      river: 50 + Math.floor(Math.random() * 10 - 5),
    }
  };
};

export const getRiskColor = (risk: string | number) => {
  if (typeof risk === 'string') {
    return { critical: '#ff3b30', high: '#ff7a1a', medium: '#ffb020', low: '#ffd24a' }[risk] || '#c98a3a';
  }
  return risk > 70 ? '#ff4530' : risk > 45 ? '#ff9020' : '#ffce4a';
};

export const getTrendColor = (trend: string) => {
  return trend === 'improving' || trend === 'down' ? '#4ade80' : trend === 'worsening' || trend === 'up' ? '#ff5a3c' : '#c0a070';
};
