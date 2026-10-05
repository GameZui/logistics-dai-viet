import { create } from 'zustand';
import { useGameStore } from './useGameStore';
import { CargoStock, Contract, Employee, Goods, Role } from '../types/empire';
import { playCoin, playFanfare } from '../utils/audio';

export const GOODS: Record<Goods, { label: string; product: string; color: string }> = {
  rice: { label: 'Gạo ST25', product: 'Gạo đóng túi ST25', color: '#d9b879' },
  coffee: { label: 'Cà phê', product: 'Cà phê đóng gói Buôn Ma Thuột', color: '#8f563f' },
  electronics: { label: 'Linh kiện', product: 'Bo mạch điện tử Bắc Ninh', color: '#4b91bd' },
  fruit: { label: 'Trái cây Cái Mơn', product: 'Sầu riêng & Bưởi da xanh', color: '#ea580c' },
  seafood: { label: 'Thủy sản Cà Mau', product: 'Tôm cá đông lạnh xuất khẩu', color: '#0d9488' },
  garments: { label: 'Dệt may Nam Định', product: 'Kiện hàng dệt may xuất khẩu', color: '#7c3aed' },
};
export const ROLES: Record<Role, { label: string; salary: number; hire: number }> = {
  warehouse: { label: 'Thủ kho', salary: 180, hire: 1800 },
  driver: { label: 'Lái xe nâng', salary: 220, hire: 2200 },
  sorter: { label: 'Nhân viên phân loại', salary: 190, hire: 1900 },
  technician: { label: 'Kỹ thuật viên', salary: 260, hire: 2600 },
};
export const CAMPAIGN = [
  { title: 'Một kho nhỏ, một giấc mơ lớn', description: 'Chú Hùng giao lại cho bạn kho hàng gia đình ở Bình Dương. Giữ lời hứa với khách, chăm lo nhân viên và bắt đầu từ những chuyến hàng đầu tiên.', objective: 'Nhận 12 pallet mới và có ít nhất 4 nhân viên.', reward: 5000 },
  { title: 'Không để hàng nằm chờ', description: 'Chị Lan đề nghị đầu tư băng chuyền. Hàng về ngày một nhiều: một quy trình tốt sẽ giúp cả đội bớt vất vả.', objective: 'Lắp dây chuyền và phân loại 30 pallet.', reward: 7000 },
  { title: 'Từ kho hàng đến nhà máy', description: 'Hợp tác xã muốn bán sản phẩm mang thương hiệu Việt. Xây xưởng, tuyển kỹ thuật viên và biến nguyên liệu thành thành phẩm.', objective: 'Xây nhà máy và sản xuất 20 pallet thành phẩm.', reward: 10000 },
  { title: 'Những chuyến hàng giữ chữ tín', description: 'Khách hàng lớn tìm đến Đại Việt. Cân đối tồn kho, ký hợp đồng vừa sức và đưa hàng đến nơi đúng hạn.', objective: 'Hoàn thành 3 hợp đồng và mở rộng kho lên cấp 2.', reward: 15000 },
  { title: 'Kết nối ba miền', description: 'Từ một kho gia đình, bạn xây mạng lưới tại Bình Dương, Hải Phòng và Cần Thơ. Đế chế lớn lên từ từng người và từng lời hứa.', objective: 'Mở cả 3 trung tâm, có 10 nhân viên và hoàn thành 8 hợp đồng.', reward: 25000 },
];
const endlessArcs = [
  { title: 'Mùa vàng trên đất phù sa', region: 'Đồng bằng sông Cửu Long', character: 'Chú Hùng', plot: 'Nước lũ rút muộn làm lịch thu hoạch đảo lộn. Hợp tác xã cần kho gom hàng và lịch xe linh hoạt để giữ lúa khỏi ẩm.' },
  { title: 'Hương cà phê vượt đại ngàn', region: 'Tây Nguyên', character: 'Chị Lan', plot: 'Vụ cà phê được mùa, nhưng các hộ nhỏ thiếu kho sơ chế. Đại Việt đứng trước lựa chọn đầu tư điểm gom hay chạy thẳng về cảng.' },
  { title: 'Chuyến lạnh ra khơi', region: 'Duyên hải miền Trung', character: 'Anh Phúc', plot: 'Một đội tàu cá trở về cùng mẻ hàng lớn. Chuỗi lạnh chưa đủ công suất; từng chuyến xe quyết định chất lượng khi hàng tới chợ.' },
  { title: 'Đèn sáng khu công nghiệp', region: 'Đông Nam Bộ', character: 'Cô Mai', plot: 'Nhà máy đối tác tăng ca, linh kiện phải đến đúng khung giờ. Mở thêm ca hay nâng băng chuyền sẽ thay đổi cả nhịp kho.' },
  { title: 'Vải vóc qua miền quan họ', region: 'Đồng bằng Bắc Bộ', character: 'Bác Sơn', plot: 'Các xưởng may nhỏ tìm đường gom đơn để đi xa. Đại Việt cần kết nối nhà cung cấp với trung tâm phân phối phía Bắc.' },
  { title: 'Đường biên mùa trái ngọt', region: 'Tây Bắc', character: 'Em An', plot: 'Mận và nhãn vào mùa, đường đèo dễ tắc. Một mạng lưới điểm tập kết sẽ giúp nông sản tới tay khách trước khi xuống chất lượng.' },
];
const names = ['Nguyễn Minh', 'Trần Lan', 'Lê Hùng', 'Phạm Mai', 'Võ Tuấn', 'Đặng Hạnh', 'Bùi Nam', 'Đỗ Linh', 'Hồ Phúc', 'Ngô Trang', 'Dương Sơn', 'Vũ An'];
const starterOffers = (): Contract[] => [
  { id: 'hd-gao', client: 'HTX Lúa Vàng', destination: 'Cần Thơ', goods: 'rice', grade: 'sorted', quantity: 8, reward: 6500, duration: 240, remaining: 240, status: 'available' },
  { id: 'hd-caphe', client: 'Cà phê Tây Nguyên', destination: 'Buôn Ma Thuột', goods: 'coffee', grade: 'sorted', quantity: 10, reward: 8500, duration: 240, remaining: 240, status: 'available' },
  { id: 'hd-donggoi', client: 'Siêu thị An Việt', destination: 'TP. Hồ Chí Minh', goods: 'rice', grade: 'finished', quantity: 12, reward: 15000, duration: 300, remaining: 300, status: 'available' },
  { id: 'hd-rangxay', client: 'Phố Cà Phê', destination: 'Đà Nẵng', goods: 'coffee', grade: 'finished', quantity: 10, reward: 18000, duration: 300, remaining: 300, status: 'available' },
  { id: 'hd-dientu', client: 'Điện tử Việt Thành', destination: 'Hải Phòng', goods: 'electronics', grade: 'finished', quantity: 8, reward: 20000, duration: 360, remaining: 360, status: 'available' },
];
const clients = ['HTX Lúa Vàng', 'Cà phê Tây Nguyên', 'Siêu thị An Việt', 'Phố Cà Phê', 'Điện tử Việt Thành', 'Bếp Nhà Mình', 'Nông sản Sông Tiền', 'Đại lý Phương Nam', 'Chợ Việt Toàn Cầu', 'Xưởng Cơ khí Sài Gòn', 'Hải sản Cửu Long', 'Hợp tác xã Bình Minh'];
const destinations = ['Cần Thơ', 'Buôn Ma Thuột', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Đà Lạt', 'Nha Trang', 'Biên Hòa', 'Huế', 'Vũng Tàu', 'Long An', 'Quy Nhơn', 'Gia Lai', 'Bình Dương'];
const newOffers = (serial: number): Contract[] => {
  const goods = (Object.keys(GOODS) as Goods[])[serial % 3];
  const finished = serial % 2 === 0;
  const tier = Math.floor(serial / 15);
  const quantity = Math.min(30, 8 + tier);
  const baseReward = [6200, 8200, 14500][(serial + 1) % 3];
  const reward = Math.round(baseReward * (1 + tier * .12));
  const duration = 240 + Math.min(240, tier * 12) + quantity * 5;
  return [{
    id: `hd-tuyen-${String(serial + 1).padStart(4, '0')}`,
    client: clients[serial % clients.length], destination: destinations[(serial * 5 + 2) % destinations.length],
    goods, grade: finished ? 'finished' : 'sorted', quantity, reward, duration, remaining: duration, status: 'available',
  }];
};
export const storyChapter = (chapter: number) => {
  if (chapter < CAMPAIGN.length) return CAMPAIGN[chapter];
  const cycle = chapter - CAMPAIGN.length;
  const arc = Math.floor(cycle / 3) + 1;
  const story = endlessArcs[Math.floor(cycle / 3) % endlessArcs.length];
  const region = story.region;
  const goals = [
    { title: `Chương ${chapter + 1}: ${story.title}`, description: `${story.character}: “${story.plot}” Đại Việt phải mở tuyến tại ${region}, giữ chữ tín và giúp những người làm ra hàng hóa Việt có đầu ra ổn định.`, objective: `Hoàn thành ${chapterReadyBase(arc)} hợp đồng tổng cộng để mở tuyến ${region}.`, reward: 25000 + arc * 2500 },
    { title: `Chương ${chapter + 1}: Cao điểm ${region}`, description: `Đơn hàng mùa vụ đổ về dồn dập. ${story.character} cần bạn điều phối tồn kho, nhân sự và đội xe để không một lô hàng nào lỡ chuyến.`, objective: `Giao ${120 + arc * 30} pallet thành công.`, reward: 30000 + arc * 2500 },
    { title: `Chương ${chapter + 1}: Lời hứa với ${region}`, description: `Sau mùa hàng lớn, Đại Việt cần chứng minh mình phát triển bền vững: chất lượng đồng đều, nhà máy chạy ổn định và đối tác được thanh toán đúng hẹn.`, objective: `Phân loại ${200 + arc * 50} pallet và sản xuất ${40 + arc * 12} pallet.`, reward: 35000 + arc * 3000 },
  ];
  return goals[cycle % 3];
};
const chapterReadyBase = (arc: number) => 10 + (arc - 1) * 3;
const endlessEvents = [
  { kind: 'bonus', amount: 1800, notice: 'Vụ mùa thuận lợi! Nông sản về đều, uy tín tăng nhẹ.', log: 'Vụ mùa thuận lợi, đối tác thưởng thêm 1.800.000 ₫.' },
  { kind: 'penalty', amount: 1200, notice: 'Mưa lớn làm chậm một tuyến hàng. Kiểm tra hợp đồng và dự phòng vốn.', log: 'Mưa lớn làm tăng chi phí điều phối 1.200.000 ₫.' },
  { kind: 'reward', amount: 2500, notice: 'Khách hàng cũ giới thiệu đối tác mới cho Đại Việt.', log: 'Đối tác giới thiệu khách mới, nhận thưởng 2.500.000 ₫.' },
  { kind: 'bonus', amount: 900, notice: 'Ngày hội nông sản Việt giúp thương hiệu được chú ý.', log: 'Ngày hội hàng Việt giúp uy tín và doanh thu tăng.' },
  { kind: 'penalty', amount: 800, notice: 'Cao điểm tiêu thụ khiến chi phí ca tăng nhẹ.', log: 'Cao điểm tiêu thụ phát sinh 800.000 ₫ chi phí tăng ca.' },
] as const;
const initial = () => ({
  inventory: {
    rice: { raw: 300, sorted: 0, finished: 0 },
    coffee: { raw: 200, sorted: 0, finished: 0 },
    electronics: { raw: 110, sorted: 0, finished: 0 },
    fruit: { raw: 0, sorted: 0, finished: 0 },
    seafood: { raw: 0, sorted: 0, finished: 0 },
    garments: { raw: 0, sorted: 0, finished: 0 },
  } as Record<Goods, CargoStock>,
  employees: [
    { id: 'nv-1', name: 'Nguyễn Minh', role: 'driver', level: 1, energy: 100 },
    { id: 'nv-2', name: 'Trần Lan', role: 'driver', level: 1, energy: 100 },
    { id: 'nv-3', name: 'Lê Hùng', role: 'warehouse', level: 1, energy: 100 },
  ] as Employee[],
  contracts: starterOffers(), offerSerial: 5, endlessEventIndex: 0, eventClock: 0, sorterLevel: 0, factoryLevel: 0, warehouseLevel: 1,
  sortEnabled: true, productionEnabled: true, productionGoods: 'rice' as Goods,
  sortProgress: 0, productionProgress: 0, elapsed: 0, wageClock: 0,
  received: 0, sorted: 0, produced: 0, delivered: 0, contractsCompleted: 0,
  chapter: 0, unlockedHubs: ['WH-01'], log: ['Chú Hùng: Kho đã sẵn sàng. Bắt đầu bằng một chuyến hàng nhé!'],
  notice: '',
});
interface EmpireState {
  inventory: Record<Goods, CargoStock>; employees: Employee[]; contracts: Contract[];
  sorterLevel: number; factoryLevel: number; warehouseLevel: number;
  sortEnabled: boolean; productionEnabled: boolean; productionGoods: Goods;
  sortProgress: number; productionProgress: number; elapsed: number; wageClock: number;
  received: number; sorted: number; produced: number; delivered: number; contractsCompleted: number;
  chapter: number; offerSerial: number; endlessEventIndex: number; eventClock: number; unlockedHubs: string[]; log: string[]; notice: string;
  resetEmpire: () => void; receiveCargo: (goods: Goods, quantity: number) => void;
  hire: (role: Role) => boolean; train: (id: string) => boolean;
  build: (kind: 'sorter' | 'factory' | 'warehouse') => boolean;
  unlockHub: (id: string) => boolean; acceptContract: (id: string) => boolean; shipContract: (id: string) => boolean;
  claimChapter: () => boolean; tickEmpire: (delta: number) => void;
}
export const money = (amount: number) => `${(amount * 1000).toLocaleString('vi-VN')} ₫`;
export const totalStock = (inventory: Record<Goods, CargoStock>) => Object.values(inventory).reduce((sum, stock) => sum + stock.raw + stock.sorted + stock.finished, 0);
export const chapterReady = (state: Pick<EmpireState, 'chapter' | 'received' | 'employees' | 'sorterLevel' | 'sorted' | 'factoryLevel' | 'produced' | 'delivered' | 'contractsCompleted' | 'warehouseLevel' | 'unlockedHubs'>) => {
  if (state.chapter >= CAMPAIGN.length) {
    const cycle = state.chapter - CAMPAIGN.length;
    const arc = Math.floor(cycle / 3) + 1;
    if (cycle % 3 === 0) return state.contractsCompleted >= chapterReadyBase(arc);
    if (cycle % 3 === 1) return state.delivered >= 120 + arc * 30;
    return state.sorted >= 200 + arc * 50 && state.produced >= 40 + arc * 12;
  }
  switch (state.chapter) {
    case 0: return state.received >= 12 && state.employees.length >= 4;
    case 1: return state.sorterLevel > 0 && state.sorted >= 30;
    case 2: return state.factoryLevel > 0 && state.produced >= 20;
    case 3: return state.contractsCompleted >= 3 && state.warehouseLevel >= 2;
    case 4: return state.unlockedHubs.length >= 3 && state.employees.length >= 10 && state.contractsCompleted >= 8;
    default: return false;
  }
};

export const useEmpireStore = create<EmpireState>((set, get) => ({
  ...initial(),
  resetEmpire: () => set(initial()),
  receiveCargo: (goods, quantity) => set(s => ({
    inventory: { ...s.inventory, [goods]: { ...s.inventory[goods], raw: (s.inventory[goods]?.raw ?? 0) + quantity } },
    received: s.received + quantity,
  })),
  hire: role => {
    const state = get(); const game = useGameStore.getState();
    if (state.employees.length >= 12 || game.cash < ROLES[role].hire) { set({ notice: 'Không đủ vốn hoặc đội ngũ đã đủ 12 người.' }); return false; }
    useGameStore.setState({ cash: game.cash - ROLES[role].hire });
    playCoin();
    const employee: Employee = { id: `nv-${Date.now()}-${state.employees.length}`, name: names[state.employees.length], role, level: 1, energy: 100 };
    set({ employees: [...state.employees, employee], notice: `Đã tuyển ${employee.name} · ${ROLES[role].label}` }); return true;
  },
  train: id => {
    const employee = get().employees.find(e => e.id === id); const game = useGameStore.getState();
    if (!employee || employee.level >= 3 || game.cash < employee.level * 1500) return false;
    useGameStore.setState({ cash: game.cash - employee.level * 1500 });
    playCoin();
    set(s => ({ employees: s.employees.map(e => e.id === id ? { ...e, level: e.level + 1 } : e), notice: 'Đào tạo hoàn tất: hiệu suất tăng 15%.' })); return true;
  },
  build: kind => {
    const state = get(); const game = useGameStore.getState();
    const level = kind === 'sorter' ? state.sorterLevel : kind === 'factory' ? state.factoryLevel : state.warehouseLevel;
    const cost = (kind === 'sorter' ? 12000 : kind === 'factory' ? 18000 : 10000) * (kind === 'warehouse' ? level : level + 1);
    if (level >= 3 || game.cash < cost) { set({ notice: 'Không đủ vốn hoặc công trình đã đạt cấp tối đa.' }); return false; }
    useGameStore.setState({ cash: game.cash - cost, ...(kind === 'warehouse' ? { storageMax: 1800 + level * 900 } : {}) });
    playCoin();
    set({ ...(kind === 'sorter' ? { sorterLevel: level + 1 } : kind === 'factory' ? { factoryLevel: level + 1 } : { warehouseLevel: level + 1 }), notice: 'Công trình đã sẵn sàng vận hành.' }); return true;
  },
  unlockHub: id => {
    const game = useGameStore.getState(); const state = get();
    if (!['WH-04', 'WH-03'].includes(id) || state.unlockedHubs.includes(id) || game.cash < 25000 || state.contractsCompleted < 2) { set({ notice: 'Cần hoàn thành 2 hợp đồng và có 25.000.000 ₫ để mở chi nhánh.' }); return false; }
    useGameStore.setState({ cash: game.cash - 25000 });
    playCoin();
    set({ unlockedHubs: [...state.unlockedHubs, id], notice: 'Đã kết nối chi nhánh vào mạng lưới Đại Việt.' }); return true;
  },
  acceptContract: id => {
    const state = get(); const contract = state.contracts.find(c => c.id === id);
    if (!contract || contract.status !== 'available' || state.contracts.filter(c => c.status === 'active' || c.status === 'shipping').length >= 3) return false;
    playCoin();
    set({ contracts: state.contracts.map(c => c.id === id ? { ...c, status: 'active', remaining: c.duration, truckId: undefined } : c), notice: 'Đã ký hợp đồng. Chuẩn bị hàng trước thời hạn.' }); return true;
  },
  shipContract: id => {
    const state = get(); const game = useGameStore.getState(); const contract = state.contracts.find(c => c.id === id);
    const dock = game.docks.find(d => d.status === 'available');
    if (!contract || contract.status !== 'active' || (state.inventory[contract.goods]?.[contract.grade] ?? 0) < contract.quantity || !dock || game.trucks.length >= 8) { set({ notice: 'Cần đủ hàng đúng loại, một cửa kho trống và chỗ cho xe xuất hàng.' }); return false; }
    const truckId = `xuat-${contract.id}-${Math.round(state.elapsed * 1000)}`;
    game.spawnTruck({ id: truckId, dockId: dock.id, status: 'completed', direction: 'outbound', goods: contract.goods, palletsTotal: contract.quantity, palletsUnloaded: contract.quantity, valueReward: 0, destination: contract.destination, cargoType: GOODS[contract.goods].product });
    const inventory = { ...state.inventory, [contract.goods]: { ...state.inventory[contract.goods], [contract.grade]: state.inventory[contract.goods][contract.grade] - contract.quantity } };
    set({ inventory, contracts: state.contracts.map(c => c.id === id ? { ...c, status: 'shipping', truckId } : c), notice: 'Đã chất hàng lên xe. Thanh toán khi xe hoàn tất xuất bãi.' });
    useGameStore.setState({ storageCount: totalStock(inventory) }); return true;
  },
  claimChapter: () => {
    const state = get(); if (!chapterReady(state)) return false;
    const chapter = storyChapter(state.chapter);
    useGameStore.setState(s => ({ cash: s.cash + chapter.reward }));
    playFanfare();
    const chapterIndex = state.chapter + 1;
    set({ chapter: chapterIndex, log: [`Hoàn thành: ${chapter.title}. Thưởng ${money(chapter.reward)}.`, ...state.log].slice(0, 8), notice: chapterIndex >= CAMPAIGN.length ? 'Đã mở tuyến truyện vô hạn. Hành trình Đại Việt tiếp tục!' : 'Một cột mốc mới cho Đại Việt Logistics!' }); return true;
  },
  tickEmpire: delta => {
    const state = get(); const game = useGameStore.getState();
    const inventory = Object.fromEntries(Object.entries(state.inventory).map(([key, value]) => [key, { ...value }])) as Record<Goods, CargoStock>;
    let sorted = state.sorted, produced = state.produced, cash = game.cash, reputation = game.reputation;
    let sortProgress = state.sortProgress, productionProgress = state.productionProgress;
    const efficiency = (role: Role) => state.employees.filter(e => e.role === role).reduce((sum, e) => sum + (1 + (e.level - 1) * .15) * (.5 + e.energy / 200), 0);
    if (state.sortEnabled && efficiency('warehouse') > 0 && (state.sorterLevel > 0 || efficiency('sorter') > 0)) {
      sortProgress += delta * (state.sorterLevel * 1.5 + efficiency('sorter') * .35);
      while (sortProgress >= 1) {
        const availableKeys = (Object.keys(GOODS) as Goods[]).filter(key => inventory[key].raw > 0);
        if (availableKeys.length === 0) { sortProgress = 0; break; }
        const goods = availableKeys[sorted % availableKeys.length];
        inventory[goods].raw--; inventory[goods].sorted++; sorted++; sortProgress--;
      }
    }
    if (state.productionEnabled && state.factoryLevel > 0 && efficiency('technician') > 0) {
      productionProgress += delta * state.factoryLevel * .5 * efficiency('technician');
      while (productionProgress >= 1) {
        const stock = inventory[state.productionGoods];
        if (stock.sorted < 2) { productionProgress = 0; break; }
        stock.sorted -= 2; stock.finished++; produced++; productionProgress--;
      }
    }
    let completed = state.contractsCompleted, delivered = state.delivered;
    const events: string[] = [];
    let eventClock = state.eventClock + delta;
    let endlessEventIndex = state.endlessEventIndex;
    let eventNotice = '';
    if (eventClock >= 360) {
      eventClock -= 360;
      const event = endlessEvents[endlessEventIndex % endlessEvents.length];
      endlessEventIndex++;
      eventNotice = event.notice;
      if (event.kind === 'bonus') { cash += event.amount; reputation = Math.min(100, reputation + 1); }
      if (event.kind === 'penalty') { cash = Math.max(0, cash - event.amount); reputation = Math.max(0, reputation - 1); }
      if (event.kind === 'reward') cash += event.amount;
      events.push(`Sự kiện mùa vụ: ${event.log}`);
    }
    let contracts = state.contracts.map(contract => {
      if (contract.status === 'shipping' && !game.trucks.some(t => t.id === contract.truckId)) {
        cash += contract.reward; completed++; delivered += contract.quantity; reputation = Math.min(100, reputation + 1);
        events.push(`Đã giao ${contract.quantity} pallet cho ${contract.client}: +${money(contract.reward)}.`);
        return { ...contract, status: 'completed' as const };
      }
      if (contract.status !== 'active' && contract.status !== 'shipping') return contract;
      const remaining = Math.max(0, contract.remaining - delta);
      if (remaining === 0) {
        cash -= Math.min(cash, 2000); reputation = Math.max(0, reputation - 3);
        events.push(`Hợp đồng ${contract.client} quá hạn. Phạt ${money(2000)}.`);
        return { ...contract, remaining, status: 'failed' as const };
      }
      return { ...contract, remaining };
    });
    const terminal = contracts.some(contract => contract.status === 'completed' || contract.status === 'failed');
    let offerSerial = state.offerSerial;
    if (terminal) {
      const terminalContracts = contracts.filter(contract => contract.status === 'completed' || contract.status === 'failed');
      contracts = contracts.filter(contract => contract.status !== 'completed' && contract.status !== 'failed');
      while (contracts.length < 5) {
        contracts.push(...newOffers(offerSerial));
        offerSerial++;
      }
      for (const completedContract of terminalContracts) {
        const replace = contracts.findIndex(contract => contract.status === 'available');
        if (replace >= 0) contracts[replace] = completedContract;
      }
      if (contracts.length > 5) contracts = contracts.slice(0, 5);
    }

    let wageClock = state.wageClock + delta;
    let employees = state.employees;
    if (wageClock >= 180) {
      wageClock -= 180;
      const salary = state.employees.reduce((sum, e) => sum + ROLES[e.role].salary * e.level, 0);
      const paid = cash >= salary;
      cash = Math.max(0, cash - salary);
      employees = state.employees.map(e => ({ ...e, energy: Math.max(30, Math.min(100, e.energy + (paid ? 10 : -20))) }));
      events.push(paid ? `Đã trả lương ca: ${money(salary)}.` : 'Thiếu tiền lương ca. Tinh thần nhân viên giảm.');
    }
    useGameStore.setState({ cash, reputation, storageCount: totalStock(inventory) });
    set({ inventory, contracts, employees, sorted, produced, sortProgress, productionProgress,
      contractsCompleted: completed, delivered, elapsed: state.elapsed + delta, wageClock, offerSerial, eventClock, endlessEventIndex,
      ...(eventNotice ? { notice: eventNotice } : {}),
      ...(events.length ? { log: [...events, ...state.log].slice(0, 8) } : {}) });
  },
}));
