// Faithful national map of Vietnam for the inter-city fleet tracker.
// Real lon/lat coordinates are projected into an SVG viewBox so the S-shape and
// both archipelagos (Hoàng Sa & Trường Sa) line up with the city nodes.

export const LON_MIN = 101.8;
export const LAT_MAX = 23.6;
export const MAP_SCALE = 42;

const LON_MAX = 116.5;
const LAT_MIN = 7.2;

export const MAP_VIEWBOX = `0 0 ${Math.round((LON_MAX - LON_MIN) * MAP_SCALE)} ${Math.round((LAT_MAX - LAT_MIN) * MAP_SCALE)}`;

export function project(lon: number, lat: number): [number, number] {
  return [(lon - LON_MIN) * MAP_SCALE, (LAT_MAX - lat) * MAP_SCALE];
}

// Simplified national outline (43 points): the Vietnamese S-shape.
const MAINLAND: [number, number][] = [
  [108.0502, 21.5524], [106.7151, 20.6969], [105.8817, 19.7521], [105.6620, 19.0582],
  [106.4268, 18.0041], [107.3620, 16.6975], [108.2695, 16.0797], [108.8771, 15.2767],
  [109.3353, 13.4260], [109.2001, 11.6669], [108.3661, 11.0083], [107.2209, 10.3645],
  [106.4051, 9.5308], [105.1583, 8.5998], [104.7952, 9.2410], [105.0762, 9.9185],
  [104.3343, 10.4865], [105.1999, 10.8893], [106.2497, 10.9618], [105.8105, 11.5676],
  [107.4914, 12.3372], [107.6145, 13.5355], [107.3827, 14.2024], [107.5645, 15.2022],
  [107.3127, 15.9085], [106.5560, 16.6043], [105.9258, 17.4853], [105.0946, 18.6670],
  [103.8965, 19.2652], [104.1834, 19.6247], [104.8226, 19.8866], [104.4350, 20.7587],
  [103.2039, 20.7666], [102.7549, 21.6751], [102.1704, 22.4648], [102.7070, 22.7088],
  [103.5045, 22.7038], [104.4769, 22.8192], [105.3292, 23.3521], [105.8112, 22.9769],
  [106.7254, 22.7943], [106.5673, 22.2182], [107.0434, 21.8119],
];

export const VIETNAM_OUTLINE =
  MAINLAND.map(([lon, lat], index) => {
    const [x, y] = project(lon, lat);
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ') + ' Z';

export type LocationKind = 'hub' | 'port' | 'city';

export interface MapLocation {
  id: string; name: string; short: string; kind: LocationKind; hubId?: string;
  lon: number; lat: number; x: number; y: number;
}

// Real coordinates of the local warehouses, seaports and market cities.
const RAW_LOCATIONS: Omit<MapLocation, 'x' | 'y'>[] = [
  { id: 'ha-noi', name: 'Hà Nội', short: 'HN', kind: 'city', lon: 105.83, lat: 21.03 },
  { id: 'hai-phong', name: 'Cảng Hải Phòng', short: 'HP', kind: 'port', hubId: 'WH-04', lon: 106.68, lat: 20.86 },
  { id: 'vinh', name: 'Vinh', short: 'Vinh', kind: 'city', lon: 105.68, lat: 18.68 },
  { id: 'da-nang', name: 'Đà Nẵng', short: 'ĐN', kind: 'port', lon: 108.22, lat: 16.05 },
  { id: 'quang-ngai', name: 'Quảng Ngãi', short: 'QNg', kind: 'city', lon: 108.79, lat: 15.12 },
  { id: 'nha-trang', name: 'Nha Trang', short: 'NT', kind: 'city', lon: 109.19, lat: 12.25 },
  { id: 'da-lat', name: 'Đà Lạt', short: 'ĐL', kind: 'city', lon: 108.44, lat: 11.94 },
  { id: 'tay-nguyen', name: 'Tây Nguyên', short: 'TN', kind: 'city', lon: 108.05, lat: 12.67 },
  { id: 'binh-duong', name: 'Kho Bình Dương', short: 'BD', kind: 'hub', hubId: 'WH-01', lon: 106.65, lat: 10.98 },
  { id: 'hcm', name: 'TP. Hồ Chí Minh', short: 'HCM', kind: 'city', lon: 106.70, lat: 10.78 },
  { id: 'can-tho', name: 'Trung tâm Cần Thơ', short: 'CT', kind: 'hub', hubId: 'WH-03', lon: 105.78, lat: 10.03 },
  { id: 'ca-mau', name: 'Cà Mau', short: 'CM', kind: 'city', lon: 105.15, lat: 9.18 },
];

export const LOCATIONS: MapLocation[] = RAW_LOCATIONS.map((location) => {
  const [x, y] = project(location.lon, location.lat);
  return { ...location, x, y };
});

// Both archipelagos are Vietnamese territory — draw them as island clusters.
export interface MapArchipelago {
  id: string; name: string; short: string;
  labelX: number; labelY: number;
  islands: { x: number; y: number }[];
}

const RAW_ARCHIPELAGOS: {
  id: string; name: string; short: string; labelLon: number; labelLat: number; points: [number, number][];
}[] = [
  {
    id: 'hoang-sa', name: 'Quần đảo Hoàng Sa', short: 'Hoàng Sa', labelLon: 110.5, labelLat: 17.4,
    points: [
      [111.66, 16.53], [111.76, 16.72], [111.57, 16.33], [111.72, 16.05], [111.95, 16.23],
      [112.05, 16.43], [112.19, 15.93], [112.32, 16.05], [112.34, 16.83], [112.20, 16.67], [112.42, 16.52],
    ],
  },
  {
    id: 'truong-sa', name: 'Quần đảo Trường Sa', short: 'Trường Sa', labelLon: 114.7, labelLat: 12.3,
    points: [
      [114.33, 11.43], [114.25, 11.05], [115.82, 10.72], [114.40, 10.38], [113.55, 10.20],
      [114.30, 9.85], [112.87, 9.55], [113.65, 9.20], [114.65, 8.85], [111.92, 8.63],
      [113.65, 8.15], [113.80, 7.55], [114.10, 8.05],
    ],
  },
];

export const ARCHIPELAGOS: MapArchipelago[] = RAW_ARCHIPELAGOS.map((arch) => {
  const [labelX, labelY] = project(arch.labelLon, arch.labelLat);
  return {
    id: arch.id, name: arch.name, short: arch.short, labelX, labelY,
    islands: arch.points.map(([lon, lat]) => { const [x, y] = project(lon, lat); return { x, y }; }),
  };
});
export interface MapRoute {
  id: string;
  from: string;
  to: string;
  distanceKm: number;
  label: string;
}

// Quốc lộ 1A backbone plus the highland and Mekong links.
export const ROUTES: MapRoute[] = [
  { id: 'ql1a-1', from: 'ha-noi', to: 'hai-phong', distanceKm: 120, label: 'QL5' },
  { id: 'ql1a-2', from: 'ha-noi', to: 'vinh', distanceKm: 300, label: 'QL1A' },
  { id: 'ql1a-3', from: 'vinh', to: 'da-nang', distanceKm: 470, label: 'QL1A' },
  { id: 'ql1a-4', from: 'da-nang', to: 'quang-ngai', distanceKm: 130, label: 'QL1A' },
  { id: 'ql1a-5', from: 'quang-ngai', to: 'nha-trang', distanceKm: 400, label: 'QL1A' },
  { id: 'ql1a-6', from: 'nha-trang', to: 'hcm', distanceKm: 440, label: 'QL1A' },
  { id: 'ql14', from: 'da-nang', to: 'tay-nguyen', distanceKm: 350, label: 'QL14' },
  { id: 'ql14b', from: 'tay-nguyen', to: 'hcm', distanceKm: 350, label: 'QL14' },
  { id: 'ql20', from: 'da-lat', to: 'hcm', distanceKm: 300, label: 'QL20' },
  { id: 'mekong-1', from: 'hcm', to: 'can-tho', distanceKm: 170, label: 'CT-HCM' },
  { id: 'mekong-2', from: 'can-tho', to: 'ca-mau', distanceKm: 180, label: 'QL1A' },
  { id: 'bd-hcm', from: 'binh-duong', to: 'hcm', distanceKm: 40, label: 'Vành đai' },
  { id: 'bd-mekong', from: 'binh-duong', to: 'can-tho', distanceKm: 180, label: 'CT-BD' },
];

const LOCATION_INDEX = new Map(LOCATIONS.map((location) => [location.id, location]));

export function locationById(id: string): MapLocation | undefined {
  return LOCATION_INDEX.get(id);
}

// A gentle sideways bend so highways read as curves on the map.
export function controlPoint(from: MapLocation, to: MapLocation, bend = 0.22) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const sign = from.id <= to.id ? 1 : -1;
  return { x: midX - dy * bend * sign, y: midY + dx * bend * sign };
}

export function routePath(from: MapLocation, to: MapLocation) {
  const c = controlPoint(from, to);
  return `M ${from.x} ${from.y} Q ${c.x} ${c.y} ${to.x} ${to.y}`;
}

export interface RoutePoint {
  x: number;
  y: number;
  angle: number;
}

export function pointOnRoute(from: MapLocation, to: MapLocation, t: number): RoutePoint {
  const clamped = Math.max(0, Math.min(1, t));
  const c = controlPoint(from, to);
  const mt = 1 - clamped;
  const x = mt * mt * from.x + 2 * mt * clamped * c.x + clamped * clamped * to.x;
  const y = mt * mt * from.y + 2 * mt * clamped * c.y + clamped * clamped * to.y;
  const dx = 2 * mt * (c.x - from.x) + 2 * clamped * (to.x - c.x);
  const dy = 2 * mt * (c.y - from.y) + 2 * clamped * (to.y - c.y);
  return { x, y, angle: Math.atan2(dy, dx) };
}
