export const truckLabels = {
  en_route: 'Chờ vào bãi', docking: 'Đang vào dock', unloading: 'Đang dỡ hàng',
  completed: 'Đang rời bãi', departed: 'Đã rời bãi',
};
export const dockLabels = { available: 'Sẵn sàng', loading: 'Xe đang vào', unloading: 'Đang phục vụ', locked: 'Chưa mở' };
export const forkliftLabels = { idle: 'Sẵn sàng', moving_to_truck: 'Đến lấy hàng', picking: 'Nâng pallet', carrying: 'Chở hàng', depositing: 'Hạ pallet' };
export const carrierNames: Record<string, string> = { WareTrack: 'Đại Việt', Nordline: 'Bắc Nam', Cargoviva: 'Mekong', Bluepeak: 'Hải Âu' };

// Xe nào là của mình: hãng "Đại Việt" (WareTrack) là công ty của bạn; còn
// Nordline/Cargoviva/Bluepeak là xe đối tác chở hàng tới kho.
export const OWN_CARRIER = 'WareTrack';
export const isOwnTruck = (carrier: string) => carrier === OWN_CARRIER;
export const carrierLabel = (carrier: string) => carrierNames[carrier] ?? carrier;
export const ownerLabel = (carrier: string) =>
  isOwnTruck(carrier) ? 'Xe của Đại Việt (của bạn)' : `Xe đối tác · ${carrierLabel(carrier)}`;
