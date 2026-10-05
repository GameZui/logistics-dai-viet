import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../store/useGameStore';
import { money } from '../../store/useEmpireStore';

export const TopKpiCards = () => {
  const stats = useGameStore(useShallow(s => ({ cash: s.cash, stock: s.storageCount, capacity: s.storageMax,
    trucks: s.trucks.length, completed: s.totalTrucksCompleted, reputation: s.reputation })));
  return <div className="kpi-strip">
    <div><small>VỐN HIỆN CÓ</small><strong className="text-emerald-600">{money(stats.cash)}</strong></div>
    <div><small>HÀNG TRONG KHO</small><strong>{stats.stock.toLocaleString('vi-VN')} <span>/ {stats.capacity.toLocaleString('vi-VN')}</span></strong></div>
    <div><small>XE TRONG BÃI</small><strong>{stats.trucks} <span>xe</span></strong></div>
    <div><small>ĐÃ PHỤC VỤ</small><strong>{stats.completed} <span>chuyến</span></strong></div>
    <div><small>UY TÍN</small><strong>{stats.reputation.toFixed(1)}%</strong></div>
  </div>;
};
