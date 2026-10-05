# Thiết Kế Kỹ Thuật: WareTrack 3D - Logistics Warehouse Tycoon Game

## 1. Tổng quan Dự án (Project Overview)
**WareTrack 3D** là một tựa game mô phỏng quản lý kho bãi & vận tải (Logistics & Warehouse Tycoon Simulator) kết hợp giữa đồ họa 3D Isometric hiện đại (low-poly bóng bẩy, camera tự do, vật thể động) và giao diện điều hành SaaS / Glassmorphism chuyên nghiệp lấy cảm hứng từ video tham chiếu `WareTrack`.

* **Nền tảng**: Web 3D (chạy trực tiếp trên trình duyệt Web Desktop và Mobile mà không cần cài đặt).
* **Công nghệ cốt lõi**:
  * **Frontend**: React 19 + Vite + TypeScript.
  * **3D Graphics Engine**: Three.js + React Three Fiber (R3F) + `@react-three/drei`.
  * **State Management**: Zustand (quản lý trạng thái mô phỏng, kinh tế, camera, sự kiện tách rời độc lập).
  * **UI Styling**: Tailwind CSS / Vanilla CSS với hiệu ứng Glassmorphism, backdrop-blur, typography hiện đại (Inter / Outfit font).
  * **Animation / Tweening**: `@react-spring/three` hoặc tweening trong `useFrame` của R3F cho xe tải, xe nâng, pallet.

---

## 2. Kiến trúc Hệ thống (System Architecture)

```
┌────────────────────────────────────────────────────────────────────────┐
│                          WareTrack Web Application                     │
├───────────────────────────────────┬────────────────────────────────────┤
│         3D Viewport (R3F)         │          UI HUD Layer (DOM)        │
│  - Isometric Camera (OrbitControls)│  - Top Navigation & Stats Bar      │
│  - Warehouse Facility & Docks     │  - Inspector Drawer (Right Side)   │
│  - Trucks & Forklifts (Procedural)│  - Shipment Timeline (Bottom Left) │
│  - Animated Pallets & Racks       │  - Fleet & Dock List (Bottom Right)│
│  - 3D Floating Pin Markers (HTML) │  - Upgrade & Contract Modal Popups │
└─────────────────┬─────────────────┴──────────────────┬─────────────────┘
                  │                                    │
                  └───────────────┬────────────────────┘
                                  ▼
                    ┌───────────────────────────┐
                    │     Zustand Game Store    │
                    │  - Economy & Cash Flow    │
                    │  - Fleet & Dock Managers  │
                    │  - Contracts & Quests     │
                    │  - Game Loop & Events     │
                    └───────────────────────────┘
```

---

## 3. Chi tiết Cơ chế Trò chơi (Game Mechanics & Systems)

### 3.1. Chu trình Vận hành (Core Simulation Loop)
1. **Xe tải đến (Truck Arrival & Docking)**:
   * Hệ thống sinh xe tải định kỳ theo khoảng thời gian hoặc theo hợp đồng đã nhận.
   * Xe tải di chuyển trên đường nội bộ kho bãi (`En route`).
   * Xe tự động tìm Cổng Dock (`Dock Bay`) còn trống và thực hiện animation lùi xe vào bến (`Docking`).
   * Nếu các Dock đều bận, xe sẽ dừng tại bãi chờ (`Staged / Waiting`).
2. **Bốc dỡ hàng (Forklift Unloading System)**:
   * Khi xe đã vào dock an toàn (`Docked`), cửa sau xe mở ra.
   * Xe nâng khả dụng (`Idle Forklift`) sẽ nhận nhiệm vụ:
     1. Di chuyển tới đuôi xe tải.
     2. Nhấc kiện pallet hàng (`Pick Pallet`).
     3. Quay đầu di chuyển vào kho chứa và hạ pallet lên kệ hoặc khu bãi tập kết (`Deposit Pallet`).
     4. Lặp lại cho đến khi hết số pallet trên xe (`0/6` -> `6/6`).
3. **Hoàn thành & Xuất bến (Departure & Reward)**:
   * Khi bốc dỡ xong, xe đóng cửa và rời khỏi kho (`Departed`).
   * Người chơi nhận được Tiền cước ($) cộng với điểm thưởng On-Time Delivery nếu hoàn thành trước hạn (ETA).
   * Cổng Dock chuyển về trạng thái `Available` sẵn sàng đón xe tiếp theo.

### 3.2. Hệ thống Kinh tế & Nâng cấp (Economy & Progression)
* **Tiền tệ & Tài nguyên**:
  * **Tiền vốn ($ Cash)**: Đơn vị tiền tệ chính để nâng cấp.
  * **Tỷ lệ đúng giờ (On-time Delivery %)**: Chỉ số danh tiếng (Reputation). Uy tín cao mở khóa các hợp đồng cao cấp và các Hub mới.
  * **Sức chứa kho (Storage Capacity)**: Giới hạn số pallet có thể chứa trong kho (`Current / Max`). Khi kho đầy, người chơi phải xuất hàng hoặc nâng cấp kho.
* **Cây nâng cấp (Upgrades)**:
  * **Cổng Dock (Dock Bays)**:
    * Mở khóa Bay 2, Bay 3, Bay 4,...
    * Lắp đặt Bàn nâng tự động (Dock Leveller): Giảm 25% thời gian bốc hàng.
  * **Đội Xe nâng (Forklift Fleet)**:
    * Mua thêm xe nâng mới (`FL-01`, `FL-02`,...).
    * Tăng tốc độ di chuyển (+20% Speed).
    * Càng nâng đôi (Double Pallet Fork): Bốc 2 kiện pallet 1 lúc.
  * **Kệ chứa hàng (Storage Racks)**:
    * Tăng sức chứa tối đa từ 200 -> 500 -> 1000 -> 2000 pallets.
  * **Quản lý tự động (Managers)**:
    * Thuê Giám sát ca để kích hoạt buff x2 tốc độ trong giờ cao điểm.

### 3.3. Hợp đồng & Nhiệm vụ (Contracts & Missions)
* **Đơn hàng tiêu chuẩn (Standard Delivery)**: 4-6 pallet, thời hạn thoải mái, nguồn thu nhập ổn định.
* **Hợp đồng Hàng giá trị cao (High-Value Cargo)**: Kiện hàng màu đặc biệt, tiền thưởng x3 nhưng nếu chậm trễ sẽ bị phạt uy tín nặng.
* **Đơn hàng Khẩn cấp (Rush Delivery)**: Đồng hồ đếm ngược gấp đôi, thử thách tốc độ phối hợp xe nâng và dock.
* **Hệ thống Chi nhánh (Multi-Hub Selection)**:
  * **Hub 1: Riverside Hub**: Kho cơ bản, luân chuyển hàng khô thông dụng.
  * **Hub 2: Southfield Cross-Dock**: Kho trung chuyển tốc độ cao, mật độ xe dồn dập.
  * **Hub 3: Eastport Cold Chain**: Kho lạnh công nghiệp, có thêm yêu cầu bảo quản hàng đông lạnh.

---

## 4. Đặc tả Đồ họa 3D & Procedural Assets

Tất cả các mô hình 3D được dựng trực tiếp bằng Three.js Mesh Procedural kết hợp vật liệu chuẩn (MeshStandardMaterial) với độ nhám (roughness), độ phản chiếu kim loại (metalness) và bảng màu pastel hiện đại:

1. **Nhà kho & Khuôn viên**:
   * Nhà kho chính hình khối hiện đại, mái hắt xám, viền xanh dương nhận diện thương hiệu `WareTrack`.
   * Cổng Dock: Cửa cuốn kim loại có số đánh dấu `01`, `02`, `03` và đèn báo trạng thái xanh/đỏ.
   * Mặt sân: Bê tông xám nhạt với vạch sơn vàng chỉ dẫn vị trí đỗ xe và đường đi nội bộ.
   * Cảnh quan: Hàng rào, cây xanh tán tròn low-poly, vạch qua đường.
2. **Xe tải chở hàng (Cargo Trucks)**:
   * Đầu kéo vuông vức phong cách flat/stylized, kính cabin đen bóng.
   * Thùng hàng container dài màu trắng, dán logo thương hiệu (*WareTrack*, *Nordline*, *Cargoviva*, *Bluepeak*).
   * Cửa sau có animation mở gập 90 độ khi cập dock.
   * Bánh xe quay khi di chuyển.
3. **Xe nâng (Forklifts)**:
   * Khung bảo vệ màu vàng rực rỡ, đối trọng phía sau màu đen.
   * Khung nâng (mast) và càng nâng (forks) có thể nâng hạ theo trục Y để bốc pallet.
4. **Pallet & Kiện hàng (Pallets & Boxes)**:
   * Pallet gỗ 3D chuẩn tỉ lệ.
   * Hàng hóa trên pallet: Các thùng carton nâu dán băng dính, thùng nhựa xanh dương, hoặc kiện bọc màng co.
5. **Ghim nổi 3D (3D Pin Markers)**:
   * Sử dụng component `<Html>` của `@react-three/drei`.
   * Tự động bám theo tọa độ 3D của xe tải hoặc bến dock.
   * Hiển thị: Icon trạng thái + Biển số xe / Tên dock + Thanh tiến độ mini.

---

## 5. Đặc tả Giao diện Người dùng (UI Layout Specification)

Giao diện áp dụng phong cách **Glassmorphism SaaS Dashboard**:

* **Top Header Bar**:
  * Logo WareTrack + Icon 3D Box.
  * Dropdown chọn Hub (Riverside Hub, Southfield Cross-Dock, Eastport Cold Chain).
  * Đồng hồ thời gian thực + Nút điều tốc (Pause / 1x / 2x / 3x).
  * Widget tài chính: Tiền mặt ($) và Uy tín (%).
* **Thanh chỉ số Top KPI**:
  * 3 thẻ tóm tắt: *Stock on hand*, *Trucks on site*, *On-time delivery rate*.
* **Bảng thanh trượt bên phải (Right Inspector Drawer)**:
  * Trượt vào khi click vào bất kỳ xe tải, xe nâng hoặc cổng dock nào.
  * Tab thông tin chi tiết + Nút nâng cấp và điều phối.
* **Góc dưới bên trái (Shipment Tracking Stepper)**:
  * Hiển thị chu trình 5 bước: *Order Confirmed* -> *Picked* -> *Loaded* -> *In Transit* -> *Unloading/Delivered*.
* **Góc dưới bên phải (Fleet & Dock Table)**:
  * 3 tab: `Docks`, `Forklifts`, `Trucks`.
  * Click vào bất kỳ dòng nào sẽ điều khiển camera 3D lướt (smooth pan) tới đối tượng đó.
* **Bộ điều khiển góc nhìn (Camera Controls Widget)**:
  * Phóng to (+), thu nhỏ (-), xoay góc nhìn, đặt lại góc nhìn Isometric ban đầu.

---

## 6. Kế hoạch Kiểm thử & Tiêu chí Thành công (Testing & Success Criteria)

1. **Hiệu năng (Performance)**:
   * Tốc độ khung hình duy trì ổn định >= 60 FPS trên máy tính thông thường.
   * Tải trang dưới 2 giây.
2. **Logic Mô phỏng (Simulation Accuracy)**:
   * Xe tải cập dock chính xác không bị xuyên vật thể.
   * Xe nâng bốc dỡ pallet nhịp nhàng và cập nhật số lượng pallet theo thời gian thực.
   * Tiền cước và nâng cấp hoạt động chính xác không bị lỗi âm tiền.
3. **Trải nghiệm Người dùng (UX)**:
   * Click vào vật thể 3D trong không gian phản hồi ngay lập tức trên UI Drawer.
   * Giao diện responsive, sắc nét và hiện đại như video tham chiếu.
