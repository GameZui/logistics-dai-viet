// Named isometric camera framings so the player can follow every crew on the
// lot: the dock crews, the sorting team and the packing line.
export interface CameraView {
  id: string;
  label: string;
  hint: string;
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
}

export const CAMERA_VIEWS: CameraView[] = [
  { id: 'overview', label: 'Toàn cảnh', hint: 'Bao quát cả khuôn viên kho', position: [40, 34, 48], target: [0, 1.5, -3], zoom: 12 },
  { id: 'sorting', label: 'Khu phân loại', hint: 'Xem đội phân loại và băng chuyền làm việc', position: [-12, 20, 4], target: [-1, 1.2, -11], zoom: 22 },
  { id: 'docks', label: 'Bến dỡ hàng', hint: 'Xe tải cập bến và xe nâng bốc hàng', position: [18, 22, 30], target: [0, 1, -1], zoom: 19 },
  { id: 'factory', label: 'Xưởng đóng gói', hint: 'Kỹ thuật viên vận hành máy xưởng', position: [46, 22, -2], target: [29, 2.2, -14], zoom: 19 },
  { id: 'gate', label: 'Cổng & cột cờ', hint: 'Khu ra vào, chòi bảo vệ và trà đá', position: [-16, 18, 26], target: [-26, 3.5, 2], zoom: 21 },
];

const dispatch = (type: string, detail?: unknown) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(type, detail === undefined ? undefined : { detail }));
};

export function requestCameraView(id: string) {
  dispatch('camera-view', { id });
}

export function requestCameraFocus(target: [number, number, number]) {
  dispatch('camera-focus', { target });
}

export function requestCameraZoom(direction: 'in' | 'out') {
  dispatch(direction === 'in' ? 'camera-zoom-in' : 'camera-zoom-out');
}

export function requestCameraReset() {
  dispatch('camera-reset');
}
