import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { dockLabels, forkliftLabels, truckLabels } from '../../utils/labels';
import { money } from '../../store/useEmpireStore';

export const FleetDockTable = () => {
  const [tab, setTab] = useState<'dock' | 'truck' | 'forklift'>('dock');
  const state = useGameStore();
  const rows = tab === 'dock' ? state.docks.map(d => ({ id: d.id, label: `Cửa kho ${d.number}`, status: dockLabels[d.status] }))
    : tab === 'truck' ? state.trucks.map(t => ({ id: t.id, label: t.plate, status: truckLabels[t.status] }))
    : state.forklifts.map(f => ({ id: f.id, label: f.name, status: forkliftLabels[f.status] }));
  return <section className="fleet-panel">
    <div className="fleet-tabs">{(['dock', 'truck', 'forklift'] as const).map(key => <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{key === 'dock' ? 'Cửa kho' : key === 'truck' ? 'Xe tải' : 'Xe nâng'}</button>)}</div>
    <div className="fleet-rows">{rows.map(row => <button key={row.id} className={state.selectedEntityId === row.id ? 'selected' : ''} onClick={() => state.selectEntity(row.id, tab)}><strong>{row.label}</strong><span>{row.status}</span></button>)}{rows.length === 0 && <p>Chưa có xe trong bãi. Bấm “Gọi xe” để bắt đầu.</p>}</div>
    <button className="fleet-buy" disabled={state.cash < 22000 || state.forklifts.length >= 6} onClick={() => state.buyForklift()}>+ Mua xe nâng · {money(22000)}</button>
  </section>;
};
