import { X, Truck, MapPin, Package } from 'lucide-react';
import { useLogisticsStore } from '../../store/useLogisticsStore';
import { useEmpireStore } from '../../store/useEmpireStore';
import { useGameStore } from '../../store/useGameStore';
import {
  LOCATIONS, ROUTES, ARCHIPELAGOS, VIETNAM_OUTLINE, MAP_VIEWBOX, locationById, pointOnRoute, routePath,
} from '../../utils/vietnamMap';

export const VietnamMapPanel = ({ onClose }: { onClose: () => void }) => {
  const trucks = useLogisticsStore((s) => s.trucks);
  const unlocked = useEmpireStore((s) => s.unlockedHubs);
  const contracts = useEmpireStore((s) => s.contracts);
  const currentHub = useGameStore((s) => s.currentHub);

  const hubLocations = LOCATIONS.filter((location) => location.kind === 'hub');
  const activeShipments = contracts.filter((contract) => contract.status === 'active' || contract.status === 'shipping');

  return (
    <div className="map-overlay" role="dialog" aria-label="Bản đồ mạng lưới vận tải Việt Nam">
      <div className="map-panel">
        <div className="map-head">
          <div>
            <small>ĐẠI VIỆT LOGISTICS · DOANH NGHIỆP VẬN TẢI & KHO BÃI</small>
            <h2>Mạng lưới đường dài · Theo dõi đội xe</h2>
          </div>
          <button aria-label="Đóng bản đồ" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="map-body">
          <div className="map-canvas">
            <svg viewBox={MAP_VIEWBOX} preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="map-sea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#dcf0f7" />
                  <stop offset="100%" stopColor="#cfe4f2" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="340" height="820" rx="18" fill="url(#map-sea)" />
              <path d={VIETNAM_OUTLINE} className="map-land" />

              {ROUTES.map((route) => {
                const from = locationById(route.from);
                const to = locationById(route.to);
                if (!from || !to) return null;
                return <path key={route.id} d={routePath(from, to)} className="map-road" />;
              })}

              {LOCATIONS.map((location) => {
                const isHub = location.kind === 'hub';
                const active = !location.hubId || unlocked.includes(location.hubId);
                return (
                  <g key={location.id} className={`map-node ${isHub ? 'hub' : location.kind} ${active ? '' : 'locked'}`}>
                    <circle cx={location.x} cy={location.y} r={isHub ? 7 : 4.5} />
                    <text x={location.x + (isHub ? 11 : 7)} y={location.y + 3.5}>{location.short}</text>
                  </g>
                );
              })}

              {ARCHIPELAGOS.map((arch) => (
                <g key={arch.id} className="map-arch">
                  {arch.islands.map((island, index) => (
                    <circle key={`${arch.id}-${index}`} cx={island.x} cy={island.y} r={1.9} />
                  ))}
                  <text x={arch.labelX} y={arch.labelY} textAnchor="middle" className="map-arch-label">{arch.short}</text>
                </g>
              ))}

              {trucks.map((truck) => {
                const from = locationById(truck.from);
                const to = locationById(truck.to);
                if (!from || !to) return null;
                const point = pointOnRoute(from, to, truck.progress);
                return (
                  <g
                    key={truck.id}
                    className="map-truck"
                    transform={`translate(${point.x} ${point.y}) rotate(${(point.angle * 180) / Math.PI})`}
                  >
                    <rect x="-7" y="-4" width="12" height="8" rx="2" />
                    <rect x="5" y="-3.5" width="4.5" height="7" rx="1.5" className="map-truck-cab" />
                  </g>
                );
              })}
            </svg>
            <p className="map-legend">★ Hoàng Sa · Trường Sa là lãnh thổ Việt Nam · ● kho · ● cảng · ● thành phố</p>
          </div>
          <div className="map-side">
            <h3><Truck size={14} /> Đội xe Đại Việt · {trucks.filter((t) => t.status === 'in_transit').length}/{trucks.length} xe đang chạy</h3>
            <div className="map-list">
              {trucks.map((truck) => {
                const from = locationById(truck.from);
                const to = locationById(truck.to);
                const remain = Math.max(0, Math.round(truck.distanceKm * (1 - truck.progress)));
                return (
                  <div className="map-truck-row" key={truck.id}>
                    <div className="map-row-top">
                      <strong>{truck.plate}</strong>
                      <span>{truck.cargo}</span>
                    </div>
                    <div className="map-row-route">
                      <span>{from?.name ?? truck.from}</span>
                      <b>→</b>
                      <span>{to?.name ?? truck.to}</span>
                    </div>
                    <div className="cargo-progress"><span style={{ width: `${Math.round(truck.progress * 100)}%` }} /></div>
                    <small>{truck.status === 'in_transit' ? 'Đang chạy' : 'Đang bốc dỡ tại kho'} · {Math.round(truck.progress * 100)}% · còn {remain.toLocaleString('vi-VN')} km · {truck.speedKmh} km/h</small>
                  </div>
                );
              })}
            </div>

            <h3><MapPin size={14} /> Kho địa phương</h3>
            <div className="map-list compact">
              {hubLocations.map((hub) => {
                const active = hub.hubId ? unlocked.includes(hub.hubId) : false;
                const here = hub.hubId === currentHub;
                return (
                  <div className={`map-hub ${active ? 'on' : 'off'}`} key={hub.id}>
                    <strong>{hub.name}</strong>
                    <span>{here ? 'Đang đứng' : active ? 'Đã kết nối' : 'Chưa mở'}</span>
                  </div>
                );
              })}
            </div>

            {activeShipments.length > 0 && (
              <>
                <h3><Package size={14} /> Chuyến hàng theo hợp đồng</h3>
                <div className="map-list compact">
                  {activeShipments.map((contract) => (
                    <div className="map-hub on" key={contract.id}>
                      <strong>{contract.destination}</strong>
                      <span>{contract.quantity} pallet · {contract.status === 'shipping' ? 'đang xuất' : 'chờ xuất'}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
