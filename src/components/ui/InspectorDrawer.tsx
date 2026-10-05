import { X, Zap, Wrench, Plus } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { truckLabels, dockLabels, forkliftLabels, carrierNames, carrierLabel, isOwnTruck, ownerLabel } from '../../utils/labels';
import { money } from '../../store/useEmpireStore';

export const InspectorDrawer = () => {
  const state = useGameStore();
  const truck = state.selectedEntityType === 'truck' ? state.trucks.find(t => t.id === state.selectedEntityId) : undefined;
  const dock = state.selectedEntityType === 'dock' ? state.docks.find(d => d.id === state.selectedEntityId) : undefined;
  const forklift = state.selectedEntityType === 'forklift' ? state.forklifts.find(f => f.id === state.selectedEntityId) : undefined;
  if (!truck && !dock && !forklift) return null;
  const cost = dock?.status === 'locked' ? 15000 : 8000 * (dock?.level ?? 1);
  return <aside className="inspector-panel">
    <div className="panel-heading"><div><small>CHI TIẾT VẬN HÀNH</small><h2>{truck?.plate ?? (dock ? `Cửa kho ${dock.number}` : forklift?.name)}</h2></div><button aria-label="Đóng chi tiết" onClick={() => state.selectEntity(null, null)}><X size={18} /></button></div>
    {truck && <>
      <img className="inspector-truck-art" src={truck.direction === 'outbound' ? '/assets/truck-container.webp' : truck.goods === 'electronics' ? '/assets/truck-reefer.webp' : '/assets/truck-vietnam.webp'} alt="Minh họa xe vận tải hàng Việt Nam" loading="lazy" />
      <div className="status-banner">{truckLabels[truck.status]}</div>
      <div className={isOwnTruck(truck.carrier) ? 'owner-badge self' : 'owner-badge partner'}>{ownerLabel(truck.carrier)}</div>
      <dl><dt>Đơn vị vận tải</dt><dd>{carrierNames[truck.carrier]}</dd><dt>Điểm đến</dt><dd>{truck.destination}</dd><dt>Loại hàng</dt><dd>{truck.cargoType}</dd><dt>Cửa kho</dt><dd>{truck.dockId ? `Số ${state.docks.find(d => d.id === truck.dockId)?.number}` : 'Đang chờ'}</dd><dt>{truck.direction === 'outbound' ? 'Đã chất' : 'Đã dỡ'}</dt><dd>{truck.palletsUnloaded}/{truck.palletsTotal} pallet</dd><dt>Thưởng chuyến</dt><dd>{money(truck.valueReward)}</dd></dl>
      <div className="cargo-progress"><span style={{ width: `${truck.palletsUnloaded / truck.palletsTotal * 100}%` }} /></div>
      <button className="primary-button w-full" disabled={truck.isVip || truck.status === 'completed' || state.cash < 500} onClick={() => state.prioritizeTruck(truck.id)}><Zap size={16} />{truck.isVip ? 'Đã ưu tiên' : `Ưu tiên · ${money(500)}`}</button>
    </>}
    {dock && <>
      <div className="status-banner">{dockLabels[dock.status]}</div>
      <dl><dt>Cấp cửa kho</dt><dd>{dock.level}</dd><dt>Bàn nâng</dt><dd>{dock.hasLeveller ? 'Đã lắp · nhanh hơn 25%' : 'Chưa lắp'}</dd><dt>Chi phí nâng cấp</dt><dd>{money(cost)}</dd></dl>
      <button className="primary-button w-full" disabled={state.cash < cost || dock.level >= 3} onClick={() => state.upgradeDock(dock.id)}><Wrench size={16} />{dock.level >= 3 ? 'Đã đạt cấp tối đa' : dock.status === 'locked' ? 'Mở cửa kho' : 'Nâng cấp năng suất'}</button>
    </>}
    {forklift && <>
      <div className="status-banner">{forkliftLabels[forklift.status]}</div>
      <dl><dt>Tốc độ</dt><dd>{forklift.speed} m/s</dd><dt>Sức nâng</dt><dd>{forklift.capacity} pallet</dd><dt>Nhiệm vụ</dt><dd>{forklift.targetDockId ? `Cửa kho ${state.docks.find(d => d.id === forklift.targetDockId)?.number}` : 'Chờ phân công'}</dd><dt>Đội xe nâng</dt><dd>{state.forklifts.length}/6 xe</dd></dl>
      <button className="primary-button w-full" disabled={state.cash < 22000 || state.forklifts.length >= 6} onClick={() => state.buyForklift()}><Plus size={16} />Mua xe nâng · {money(22000)}</button>
    </>}
    <p className="panel-note">Chọn một xe hoặc cửa kho trong cảnh để chuyển đối tượng.</p>
  </aside>;
};
