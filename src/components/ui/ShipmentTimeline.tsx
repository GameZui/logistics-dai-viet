import { useGameStore } from '../../store/useGameStore';
import { truckLabels } from '../../utils/labels';

export const ShipmentTimeline = () => {
  const trucks = useGameStore(s => s.trucks);
  const selected = useGameStore(s => s.selectedEntityId);
  const truck = trucks.find(t => t.id === selected) ?? trucks.find(t => t.status === 'unloading') ?? trucks[0];
  if (!truck) return null;
  const stage = truck.status === 'en_route' ? 0 : truck.status === 'docking' ? 1 : truck.status === 'unloading' ? 2 : 3;
  return <section className="shipment-panel"><div className="flex justify-between gap-3"><strong>{truck.plate}</strong><span>{truckLabels[truck.status]}</span></div>
    <div className="shipment-stages">{['Chờ vào', 'Vào cửa kho', 'Dỡ hàng', 'Rời bãi'].map((label, index) => <div key={label} className={index <= stage ? 'done' : ''}><i>{index + 1}</i><span>{label}</span></div>)}</div>
    <p>Đã đặt {truck.palletsUnloaded}/{truck.palletsTotal} pallet · {truck.destination}</p>
  </section>;
};
