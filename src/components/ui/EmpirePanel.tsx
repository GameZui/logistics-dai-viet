import { useState } from 'react';
import { X, BookOpen, Users, Factory, Warehouse, FileCheck, Package, MapPin, Save, Truck } from 'lucide-react';
import { useEmpireStore, CAMPAIGN, GOODS, ROLES, chapterReady, money, totalStock, storyChapter } from '../../store/useEmpireStore';
import { HUBS, useGameStore } from '../../store/useGameStore';
import { FleetPanel } from './FleetPanel';
import { Goods, Role } from '../../types/empire';
import { saveGame } from '../../utils/saveGame';

const tabs = [
  { id: 'story', label: 'Hành trình', icon: BookOpen }, { id: 'staff', label: 'Nhân sự', icon: Users },
  { id: 'build', label: 'Xây dựng', icon: Warehouse }, { id: 'factory', label: 'Nhà máy', icon: Factory },
  { id: 'fleet', label: 'Đội xe', icon: Truck },
  { id: 'stock', label: 'Hàng hóa', icon: Package }, { id: 'contracts', label: 'Hợp đồng', icon: FileCheck },
  { id: 'network', label: 'Chi nhánh', icon: MapPin },
] as const;
export const EmpirePanel = ({ onClose }: { onClose: () => void }) => {
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('story');
  const state = useEmpireStore();
  const cash = useGameStore(s => s.cash);
  const capacity = useGameStore(s => s.storageMax);
  const chapter = storyChapter(state.chapter);
  const wage = state.employees.reduce((sum, e) => sum + ROLES[e.role].salary * e.level, 0);
  return <aside className="empire-panel">
    <div className="empire-heading"><div><small>ĐẠI VIỆT LOGISTICS</small><h2>Doanh nghiệp của bạn</h2></div><button title="Lưu tiến trình" onClick={() => { const saved = saveGame(); useEmpireStore.setState({ notice: saved ? 'Đã lưu tiến trình trên trình duyệt này.' : 'Không thể lưu: bộ nhớ trình duyệt đang bị chặn.' }); }}><Save size={17} /></button><button aria-label="Đóng quản lý" onClick={onClose}><X size={20} /></button></div>
    <nav className="empire-tabs">{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}><Icon size={15} />{label}</button>)}</nav>
    <div className="empire-body">
      {tab === 'story' && <>
        <img className="story-art" src="/assets/dai-viet-story.jpg" alt="Kho vận Việt Nam với xe tải, nhân viên và dây chuyền phân loại" decoding="async" />
        <div className="chapter-kicker">{state.chapter < CAMPAIGN.length ? `CHƯƠNG ${state.chapter + 1} / ${CAMPAIGN.length}` : `CHƯƠNG ${state.chapter + 1} · HÀNH TRÌNH VÔ HẠN`} · CA {Math.floor(state.elapsed / 180) + 1}</div>
        <h3>{chapter?.title ?? 'Đại Việt — kết nối ba miền'}</h3>
        <p>{chapter?.description ?? 'Bạn đã hoàn thành hành trình. Tiếp tục phát triển nhà máy, đội ngũ và mạng lưới của mình.'}</p>
        {chapter && <div className="mission-card"><strong>Mục tiêu</strong><p>{chapter.objective}</p><small>Đã nhận {state.received} pallet · Phân loại {state.sorted} · Sản xuất {state.produced} · Giao {state.contractsCompleted} hợp đồng</small><button className="primary-button" disabled={!chapterReady(state)} onClick={() => state.claimChapter()}>Hoàn thành chương · {money(chapter.reward)}</button></div>}
        {state.chapter >= CAMPAIGN.length && <div className="summary-box"><strong>Đế chế vô hạn · Cung truyện {Math.floor((state.chapter - CAMPAIGN.length) / 3) + 1}</strong><p>Đơn hàng mới liên tục thay thế hợp đồng đã xử lý. Sự kiện mùa vụ xuất hiện mỗi 6 phút; tuyến hàng và mục tiêu tăng theo quy mô tập đoàn.</p></div>}
        <div className="guide-card"><strong>Nhịp vận hành</strong><p>Gọi xe nhập hàng → nhân viên xe nâng đưa pallet vào kho → phân loại thủ công hoặc băng chuyền → xưởng dùng 2 pallet nguyên liệu đã phân loại để tạo 1 pallet thành phẩm → xuất xe theo hợp đồng.</p><p>Bắt đầu: tuyển nhân viên phân loại hoặc xây băng chuyền. Muốn chạy nhà máy, tuyển thêm kỹ thuật viên.</p></div>
        <h4>Nhật ký doanh nghiệp</h4><div className="event-log">{state.log.map((message, index) => <p key={`${message}-${index}`}>{message}</p>)}</div>
      </>}
      {tab === 'staff' && <>
        <h3>Con người làm nên doanh nghiệp</h3><p>Thủ kho duy trì phân loại; một lái xe vận hành một xe nâng. Nhân viên phân loại hỗ trợ làm thủ công, kỹ thuật viên vận hành nhà máy.</p>
        <div className="summary-box">{state.employees.length}/12 người · Lương mỗi ca: <strong>{money(wage)}</strong><small>Mỗi ca 180 giây mô phỏng. Thiếu lương làm giảm tinh thần và hiệu suất.</small></div>
        <div className="hire-grid">{(Object.keys(ROLES) as Role[]).map(role => { const portraits: Record<Role, string> = { warehouse: '/assets/worker-vietnam.webp', driver: '/assets/staff-driver.webp', sorter: '/assets/staff-sorter.webp', technician: '/assets/staff-technician.webp' }; return <button disabled={cash < ROLES[role].hire || state.employees.length >= 12} key={role} onClick={() => state.hire(role)}><img className="hire-asset" src={portraits[role]} alt="" loading="lazy" />+ {ROLES[role].label}<small>{money(ROLES[role].hire)}</small></button>; })}</div>
        {state.employees.map(employee => { const portraits: Record<Role, string> = { warehouse: '/assets/worker-vietnam.webp', driver: '/assets/staff-driver.webp', sorter: '/assets/staff-sorter.webp', technician: '/assets/staff-technician.webp' }; return <div className="employee-row" key={employee.id}><img className={`employee-portrait role-${employee.role}`} src={portraits[employee.role]} alt="" loading="lazy" /><div><strong>{employee.name}</strong><small>{ROLES[employee.role].label} · Cấp {employee.level} · Tinh thần {employee.energy}%</small></div><button disabled={employee.level >= 3 || cash < employee.level * 1500} onClick={() => state.train(employee.id)}>{employee.level >= 3 ? 'Tối đa' : 'Đào tạo'}<small>{employee.level < 3 ? money(employee.level * 1500) : ''}</small></button></div>; })}
      </>}
      {tab === 'build' && <>
        <h3>Xây dựng khu công nghiệp</h3><p>Công trình xuất hiện trực tiếp trong cảnh khi xây. Nâng cấp tăng công suất; vốn và lương vẫn cần cân đối.</p>
        {([
          { kind: 'warehouse', title: 'Kho bãi & kệ hàng', level: state.warehouseLevel, cost: 10000 * state.warehouseLevel, desc: `Sức chứa ${capacity} pallet. Mỗi cấp thêm 900 pallet.` },
          { kind: 'sorter', title: 'Dây chuyền phân loại', level: state.sorterLevel, cost: 12000 * (state.sorterLevel + 1), desc: 'Quét mã, phân loại gạo / cà phê / linh kiện tự động. Cần thủ kho.' },
          { kind: 'factory', title: 'Nhà máy đóng gói', level: state.factoryLevel, cost: 18000 * (state.factoryLevel + 1), desc: 'Chế biến nguyên liệu thành sản phẩm. Cần kỹ thuật viên.' },
        ] as const).map(building => { const art = building.kind === 'warehouse' ? '/assets/warehouse-vietnam.webp' : building.kind === 'factory' ? '/assets/warehouse-factory.webp' : '/assets/forklift-vietnam.webp'; return <div className="building-card" key={building.kind}><div className={`building-icon ${building.kind}`}><img className="building-asset" src={art} alt="" loading="lazy" /></div><div><h4>{building.title}</h4><p>{building.desc}</p><small>{building.level === 0 ? 'Chưa xây' : `Cấp ${building.level}/3`}</small><button className="primary-button" disabled={cash < building.cost || building.level >= 3} onClick={() => state.build(building.kind)}>{building.level >= 3 ? 'Đã đạt cấp tối đa' : `${building.level === 0 ? 'Xây' : 'Nâng cấp'} · ${money(building.cost)}`}</button></div></div>; })}
        <div className="guide-card"><strong>Cửa kho & xe nâng</strong><p>Mở bảng điều hành bên dưới để mua xe nâng. Chọn cửa kho trong cảnh để mở thêm cửa hoặc lắp bàn nâng.</p></div>
      </>}
      {tab === 'factory' && <>
        <h3>Điều phối dây chuyền</h3><div className="process-flow"><span>Nhập kho</span><b>→</b><span>Phân loại</span><b>→</b><span>Đóng gói</span><b>→</b><span>Xuất hàng</span></div>
        <div className="machine-card"><h4>Phân loại · {state.sorterLevel ? `Băng chuyền cấp ${state.sorterLevel}` : 'Thủ công'}</h4><p>{state.employees.some(e => e.role === 'warehouse') && (state.sorterLevel || state.employees.some(e => e.role === 'sorter')) ? 'Đã có nhân sự / thiết bị vận hành.' : 'Cần một thủ kho và nhân viên phân loại hoặc băng chuyền.'}</p><div className="cargo-progress"><span style={{ width: `${state.sortProgress * 100}%` }} /></div><button className="secondary-button" onClick={() => useEmpireStore.setState({ sortEnabled: !state.sortEnabled })}>{state.sortEnabled ? 'Tạm dừng phân loại' : 'Chạy phân loại'}</button></div>
        <div className="machine-card"><h4>Nhà máy · Cấp {state.factoryLevel}/3</h4><p>2 pallet đã phân loại → 1 pallet thành phẩm. Công suất tăng theo cấp nhà máy và kỹ năng kỹ thuật viên.</p><label className="production-select">Sản phẩm<select value={state.productionGoods} onChange={e => useEmpireStore.setState({ productionGoods: e.target.value as Goods, productionProgress: 0 })}>{(Object.keys(GOODS) as Goods[]).map(goods => <option value={goods} key={goods}>{GOODS[goods].product}</option>)}</select></label><div className="cargo-progress"><span style={{ width: `${state.productionProgress * 100}%` }} /></div><button className="secondary-button" onClick={() => useEmpireStore.setState({ productionEnabled: !state.productionEnabled })}>{state.productionEnabled ? 'Tạm dừng nhà máy' : 'Chạy nhà máy'}</button><small>{!state.factoryLevel ? 'Chưa xây nhà máy.' : !state.employees.some(e => e.role === 'technician') ? 'Chưa có kỹ thuật viên.' : state.inventory[state.productionGoods].sorted < 2 ? 'Chờ nguyên liệu đã phân loại.' : 'Đủ điều kiện sản xuất.'}</small></div>
        <div className="summary-box">Đã phân loại {state.sorted} pallet · Đã sản xuất {state.produced} pallet</div>
      </>}
      {tab === 'stock' && <>
        <h3>Hàng trong kho & nhà máy</h3><p>Số lượng theo pallet. Nguyên liệu nhập vào chưa phân loại; hợp đồng chỉ nhận đúng nhóm chất lượng yêu cầu.</p>
        <div className="stock-meter">
          <strong>{totalStock(state.inventory)} / {capacity} pallet</strong>
          <div className="cargo-progress"><span style={{ width: `${Math.min(100, totalStock(state.inventory) / capacity * 100)}%` }} /></div>
          <div className="goods-grid">
            {(Object.keys(GOODS) as Goods[]).map(goods => (
              <div className="stock-illustration" key={goods}>
                <img src={`/assets/goods-${goods}.webp`} alt={GOODS[goods].label} loading="lazy" />
                <span>{GOODS[goods].label} · {(state.inventory[goods]?.raw ?? 0) + (state.inventory[goods]?.sorted ?? 0) + (state.inventory[goods]?.finished ?? 0)} pallet</span>
              </div>
            ))}
          </div>
        </div>
        <table className="stock-table"><thead><tr><th>Hàng hóa</th><th>Chờ phân loại</th><th>Đã phân loại</th><th>Thành phẩm</th></tr></thead><tbody>{(Object.keys(GOODS) as Goods[]).map(goods => <tr key={goods}><td><i style={{ background: GOODS[goods].color }} />{GOODS[goods].label}</td><td>{state.inventory[goods]?.raw ?? 0}</td><td>{state.inventory[goods]?.sorted ?? 0}</td><td>{state.inventory[goods]?.finished ?? 0}</td></tr>)}</tbody></table>
        <div className="guide-card"><strong>Đã giao {state.delivered} pallet</strong><p>Kho đầy sẽ dừng bốc hàng. Xuất hợp đồng hoặc mở rộng kho để giải phóng sức chứa.</p></div>
      </>}
      {tab === 'contracts' && <>
        <h3>Hợp đồng & chữ tín</h3><p>Tối đa 3 hợp đồng cùng lúc. Quá hạn phạt {money(2000)} và giảm 3 điểm uy tín. Hàng được trừ khi xuất xe, tiền về khi xe rời bãi. Hợp đồng đã giao có thể ký lại.</p>
        {state.contracts.map(contract => {
          const stock = state.inventory[contract.goods]?.[contract.grade] ?? 0;
          const ready = contract.status === 'active' && stock >= contract.quantity;
          return <div className="contract-card" key={contract.id}><div className="flex justify-between gap-3"><h4>{contract.client}</h4><span className={`contract-status status-${contract.status}`}>{({ available: 'Có thể ký', active: 'Đang thực hiện', shipping: 'Đang xuất xe', completed: 'Đã giao', failed: 'Quá hạn' })[contract.status]}</span></div><p>{contract.destination} · {contract.quantity} pallet {GOODS[contract.goods]?.label ?? contract.goods} · {contract.grade === 'finished' ? 'Thành phẩm' : 'Đã phân loại'}</p><div className="contract-summary"><strong>{money(contract.reward)}</strong><span>{contract.status === 'active' ? `Còn ${Math.ceil(contract.remaining)} giây` : `Thời hạn ${contract.duration} giây`}</span></div><small>Tồn đúng loại: {stock}/{contract.quantity} pallet</small>
          {contract.status === 'active' ? <button className="primary-button" disabled={!ready} onClick={() => state.shipContract(contract.id)}>Xuất hàng theo hợp đồng</button> : contract.status === 'shipping' ? <p className="shipping-note">Xe đang xuất bãi · Còn {Math.ceil(contract.remaining)} giây để hoàn tất.</p> : <button className="secondary-button" onClick={() => state.acceptContract(contract.id)}>{contract.status === 'available' ? 'Ký hợp đồng' : 'Ký lại hợp đồng'}</button>}</div>;
        })}
      </>}
      {tab === 'fleet' && <FleetPanel />}
      {tab === 'network' && <>
        <h3>Mạng lưới Đại Việt</h3><p>Các chi nhánh dùng chung hàng hóa, nhân sự và vốn của tập đoàn. Chọn trung tâm trên thanh điều hành để xem nhận diện vùng và chuyển thị trường nhập hàng.</p>
        {HUBS.map(hub => {
          const hubArts: Record<string, string> = { 'WH-01': '/assets/hub-countryside.webp', 'WH-04': '/assets/hub-coast.webp', 'WH-03': '/assets/hub-highlands.webp' };
          return (
            <div className="network-card" key={hub.id}>
              <img className="hub-asset-art" src={hubArts[hub.id] || '/assets/warehouse-hub.webp'} alt={hub.name} loading="lazy" />
              <div>
                <h4>{hub.name}</h4>
                <p>{hub.description}</p>
                <small>{hub.location} · {hub.meta}</small>
                {state.unlockedHubs.includes(hub.id) ? (
                  <button className="secondary-button" onClick={() => useGameStore.getState().setHub(hub.id)}>
                    Đang kết nối · Xem trung tâm
                  </button>
                ) : (
                  <button className="primary-button" disabled={cash < 25000 || state.contractsCompleted < 2} onClick={() => state.unlockHub(hub.id)}>
                    Mở chi nhánh · {money(25000)}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </>}
    </div>
  </aside>;
};
