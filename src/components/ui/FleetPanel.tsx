import { Truck, Wrench, CircleDollarSign, ArrowUpCircle, AlertTriangle } from 'lucide-react';
import { useFleetStore } from '../../store/useFleetStore';
import { useEmpireStore, money } from '../../store/useEmpireStore';
import { useGameStore } from '../../store/useGameStore';
import { MAX_TRUCK_LEVEL, MIN_CONDITION, TRUCK_MODELS, upgradeCost } from '../../types/fleet';

const statusLabel = { available: 'Sẵn sàng', delivering: 'Đang giao', maintenance: 'Cần bảo dưỡng' } as const;

export const FleetPanel = () => {
  const fleet = useFleetStore();
  const state = useEmpireStore();
  const cash = useGameStore((s) => s.cash);
  const operatingCost = useGameStore((s) => s.fleetOperatingCost);
  const drivers = state.employees.filter((employee) => employee.role === 'driver');

  return (
    <>
      <h3>Đội xe Đại Việt</h3>
      <p>
        Xe của công ty do mày tự mua, gán tài xế rồi điều đi giao. Xe hao mòn theo km, hết bảo dưỡng phải đưa vào xưởng.
        <b> Xe mình đi giao</b> ăn cước hợp đồng; <b>xe đối tác vào kho</b> thì mình thu phí dịch vụ bốc dỡ.
      </p>

      {fleet.lastIncident && <div className="fleet-incident"><AlertTriangle size={14} />{fleet.lastIncident}</div>}

      <div className="money-split">
        <div><small>PHÍ DỊCH VỤ KHO</small><strong>{money(state.serviceRevenue)}</strong></div>
        <div><small>CƯỚC GIAO HÀNG</small><strong>{money(state.deliveryRevenue)}</strong></div>
        <div><small>CHI PHÍ VẬN HÀNH</small><strong className="cost">-{money(operatingCost)}</strong></div>
      </div>

      <div className="fleet-buy-grid">
        {TRUCK_MODELS.map((model) => (
          <div className="fleet-buy-card" key={model.id}>
            <img src={`/assets/${model.art}.webp`} alt="" loading="lazy" />
            <strong>{model.label}</strong>
            <small>{model.pallets} pallet · {money(model.price)}</small>
            <button className="primary-button" disabled={cash < model.price} onClick={() => fleet.buyTruck(model.id)}>
              Mua xe
            </button>
          </div>
        ))}
      </div>

      <div className="fleet-list">
        {fleet.trucks.length === 0 && (
          <p className="panel-note">Chưa có xe nào. Mua xe để tự chủ khâu vận tải thay vì thuê đối tác.</p>
        )}
        {fleet.trucks.map((truck) => {
          const model = TRUCK_MODELS.find((item) => item.id === truck.model) ?? TRUCK_MODELS[0];
          const busy = truck.status === 'delivering';
          return (
            <div className="fleet-card" key={truck.id}>
              <div className="fleet-card-top">
                <strong>{truck.plate}</strong>
                <span className={`fleet-status ${truck.status}`}>{statusLabel[truck.status]}</span>
              </div>
              <small>{model.label} · {Math.round(truck.odometerKm).toLocaleString('vi-VN')} km</small>
              <div className="cargo-progress"><span style={{ width: `${truck.condition}%` }} /></div>
              <small>
                Cấp {truck.level}/{MAX_TRUCK_LEVEL} · Tình trạng {Math.round(truck.condition)}%
                {truck.status === 'maintenance' ? ' · cần sửa trước khi chạy' : ''}
                {busy ? ` · chuyến ${Math.round(truck.tripKm)} km` : ''}
              </small>
              <label className="fleet-driver">
                Tài xế
                <select
                  value={truck.driverId ?? ''}
                  onChange={(event) => fleet.assignDriver(truck.id, event.target.value || undefined)}
                  disabled={busy}
                >
                  <option value="">— Chưa gán —</option>
                  {drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.name}</option>)}
                </select>
              </label>
              <div className="fleet-actions">
                <button className="secondary-button" disabled={busy || truck.level >= MAX_TRUCK_LEVEL || cash < upgradeCost(model, truck.level)} onClick={() => fleet.upgradeTruck(truck.id)}>
                  <ArrowUpCircle size={13} />{truck.level >= MAX_TRUCK_LEVEL ? 'Cấp tối đa' : `Nâng cấp · ${money(upgradeCost(model, truck.level))}`}
                </button>
                <button className="secondary-button" disabled={busy || cash < model.repair} onClick={() => fleet.repairTruck(truck.id)}>
                  <Wrench size={13} />Sửa · {money(model.repair)}
                </button>
                <button className="secondary-button" disabled={busy || !truck.driverId || truck.condition <= MIN_CONDITION} onClick={() => fleet.dispatchTruck(truck.id, 40)}>
                  <Truck size={13} />Điều đi giao
                </button>
                <button className="secondary-button" disabled={busy} onClick={() => fleet.sellTruck(truck.id)}>
                  <CircleDollarSign size={13} />Bán · {money(model.resale)}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
