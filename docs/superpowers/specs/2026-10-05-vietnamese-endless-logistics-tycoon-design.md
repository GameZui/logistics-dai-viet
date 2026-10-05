# Thiết Kế Chi Tiết: Nâng Cấp Đồ Họa Thuần Việt Thủ Công & Cốt Truyện Vô Tận (Đại Việt Logistics)

## 1. Tổng Quan & Mục Tiêu (Overview & Objectives)
Dự án nhằm giải quyết triệt để vấn đề đồ họa 3D và giao diện hiện tại bị "thô cứng, mang cảm giác hộp AI nhân tạo (generic AI box)", chuyển hóa toàn diện thành tựa game mô phỏng **Logistics Tycoon thuần Việt cao cấp**:
* **Thẩm mỹ 3D Thủ Công (Handcrafted Stylized Mini-Vietnam)**: Tái thiết kế toàn bộ xe tải Thaco/Hino/Hyundai với mui bạt xanh, tem "Vạn Dặm Bình An", biển số vàng phản quang; xe nâng có ghế lái và đèn xoay chớp vàng; bao tải dứa lúa gạo, sọt trái cây xuất khẩu; khuôn viên có chòi bảo vệ bình "Trà Đá Miễn Phí", cột cờ Tổ quốc đỏ sao vàng.
* **Cốt Truyện Vô Tận (Endless Seasonal Engine)**: Sau 5 chương mở màn, kích hoạt vòng lặp **Niên Giám 4 Mùa Quốc Dân** (Xuân Tết cao điểm -> Hè Nông sản giải cứu -> Thu Xuất khẩu cảng biển -> Đông Cứu trợ miền Trung), tích hợp trọn vẹn 7 nhóm hàng hóa đặc sản Việt Nam.
* **Lột Xác Giao Diện (Rich Game UI & Complete Asset Integration)**: Thoát khỏi layout hộp kính thô sơ của AI, sử dụng thiết kế UI ấm áp, chuyên nghiệp, gắn kết 100% thư viện 22 ảnh WebP tối ưu vào bảng Nhân sự, Kho bãi, Chi nhánh và Xe; sửa toàn bộ lỗi liên kết ảnh.
* **Hệ Thống Âm Thanh Web Audio Thuần Việt**: Tích hợp còi xe tải "pim pim", tiếng lách cách bốc dỡ của xe nâng và tiếng "ting ting" khi hoàn thành hợp đồng cước xe.

---

## 2. Đặc Tả Mỹ Thuật 3D (3D Procedural Assets Specification)

### 2.1. Đội Xe Tải Thuần Việt (`TruckMesh.tsx`)
* **Cabin Thaco / Hino**:
  * Bo cong góc cabin mềm mại (`RoundedBox` tỉ lệ 2.3 x 2.4 x 2.3, radius 0.22).
  * Kính chắn gió vát nghiêng góc 15 độ, viền gioăng cao su đen.
  * Cản trước (Bumper) mạ chrome tích hợp đèn gầm sương mù vàng ấm (`#eab308`).
  * Biển số xe viền đen nền **vàng phản quang** đặc trưng xe kinh doanh vận tải Việt Nam (`61C-205.51`, `29C-889.12`, `51D-432.88`, `65C-102.39`).
* **Thùng Xe Có 2 Tùy Chọn**:
  * **Mui Bạt Xanh (Canvas Tarpaulin)**: Khung bửng thép bên dưới cao 1.1m, bên trên phủ bạt vải xanh lá/xanh dương đậm với nếp gấp gân 3D và dây thừng chằng chéo đặc trưng xe chở nông sản Việt Nam.
  * **Thùng Kín Dập Sóng (Ribbed Inox Box)**: Thùng inox chịu lực dập sóng dọc song song, cửa đôi phía sau có then cài chữ T mạ kẽm.
* **Tem Xe & Decal**:
  * Dải decal sọc thể thao 3 màu (đỏ - trắng - xanh) chạy dọc sườn xe.
  * Tem chữ dán thành xe / nóc kính: *"VẠN DẶM BÌNH AN"*, *"CHÀNH XE ĐẠI VIỆT"*, *"BẮC NAM EXPRESS"*.

### 2.2. Xe Nâng Forklift Chi Tiết (`ForkliftMesh.tsx`)
* Đối trọng phía sau bo tròn màu vàng công nghiệp / cam đất.
* Khung lồng bảo hiểm vòm cong bằng thép ống.
* **Khoang lái chi tiết**: Bổ sung ghế ngồi bọc da đen, vô lăng lái xe và cần gạt nâng hạ mini.
* **Đèn chớp cảnh báo (Rotating Beacon)**: Nóc cabin gắn đèn xoay màu cam nhấp nháy phát sáng chu kỳ 0.4s khi xe đang trong ca làm việc chở hàng.

### 2.3. Kiện Hàng & Pallet Thuần Việt (`PalletStackMesh.tsx`)
* **Bao tải dứa gai (Rice/Coffee Sacks)**: Hình khối bao căng phồng bo tròn, dập nổi 2 tai thắt dây ở đầu bao, màu vàng nhạt hoặc nâu vải bố, sọc kẻ màu chỉ dệt.
* **Sọt quả xuất khẩu (Fruit Crates)**: Sọt nhựa đục lỗ màu xanh/đỏ đựng trái cây căng mọng, có dán tem kiểm định trắng nhỏ "VietGAP".
* **Thùng carton tiêu chuẩn (Electronics & Goods)**: Thùng carton vàng nâu có in biểu tượng chiếc ly "Hàng dễ vỡ" và mũi tên chỉ hướng thẳng đứng.

### 2.4. Khuôn Viên Bến Bãi Thuần Việt (`VietnamIndustry.tsx` & `WarehouseFacility.tsx`)
* **Cột cờ Tổ quốc**: Cột thép cao 8m tại cổng chính, lá Cờ đỏ Sao vàng bay lượn trong gió.
* **Chòi bảo vệ**: Mái ngói đỏ/tôn xám, trước hiên đặt **bình nước "TRÀ ĐÁ MIỄN PHÍ"** màu xanh dương và bộ ấm tích pha chè chén.
* **Bảng hiệu 3D chữ nổi**: Đặt trên đỉnh nhà kho chính *"TỔNG KHO VẬN TẢI & LOGISTICS ĐẠI VIỆT"*.
* **Cảnh quan**: Hàng cây chuối cảnh/bàng lá nhỏ nhiệt đới, vỉa hè lát gạch con sâu, biển báo giao thông cấm đỗ/tải trọng 10T.

---

## 3. Kiến Trúc Cốt Truyện Vô Tận & Niên Giám 4 Mùa (`useEmpireStore.ts`)

### 3.1. Hệ Thống 7 Nhóm Hàng Hóa Thuần Việt
Mở rộng enum `Goods` thành 7 nhóm hàng:
1. `rice` (Gạo ST25 Sóc Trăng) - Màu vàng lúa `#d9b879`
2. `coffee` (Cà phê Robusta Tây Nguyên) - Màu nâu hạt `#8f563f`
3. `electronics` (Linh kiện điện tử Bắc Ninh) - Màu xanh vi mạch `#4b91bd`
4. `fruit` (Trái cây nhiệt đới Cái Mơn) - Màu cam đỏ `#ea580c`
5. `seafood` (Thủy hải sản Cà Mau) - Màu xanh ngọc `#0d9488`
6. `garments` (Dệt may Nam Định) - Màu tím than `#7c3aed`

### 3.2. Niên Giám 4 Mùa Vô Tận (Endless Seasonal Cycles)
Sau 5 chương cốt truyện ban đầu, kích hoạt vòng lặp 4 mùa vụ liên hoàn:
* **Mùa Xuân (Tết Cao Điểm)**: Nhu cầu quà Tết & bia bánh tăng vọt, giá trị cước x2.5, thưởng Tết cho tài xế để hồi 100% năng lượng.
* **Mùa Hè (Chiến Dịch Nông Sản)**: Trái cây & thủy sản vào mùa thu hoạch, yêu cầu giải cứu bốc dỡ siêu tốc dưới 60s, thưởng tip thêm từ Chủ vựa.
* **Mùa Thu (Xuất Khẩu Cảng Biển)**: Hàng hóa dệt may & linh kiện đóng container chuyển ra Cảng Hải Phòng / Cái Mép.
* **Mùa Đông (Chuyến Xe Nghĩa Tình)**: Hợp đồng thiện nguyện chi viện đồng bào miền Trung mùa mưa bão, tích lũy điểm Uy tín Tinh hoa mở khóa đặc quyền vĩnh viễn.

---

## 4. Thiết Kế Giao Diện UI & Tích Hợp Toàn Bộ Asset (`EmpirePanel.tsx`, `TopNavBar.tsx`, `index.css`)
* Thay thế toàn bộ layout thô sơ kiểu AI bằng phong cách game Tycoon hiện đại:
  * Huy hiệu mùa vụ động trên thanh TopBar.
  * Tab Chi Nhánh: Hiển thị minh họa 3D đẹp mắt của 3 Hub (`hub-countryside.webp`, `hub-coast.webp`, `hub-highlands.webp`).
  * Tab Nhân Sự: Hiển thị chân dung 4 vị trí nhân viên với khung viền chuyên nghiệp, thanh năng lượng và nút thăng cấp rõ ràng.
  * Tab Kho Hàng: Hiển thị trực quan 7 nhóm hàng hóa bằng hình ảnh WebP sắc nét, xóa bỏ hoàn toàn lỗi broken link.
* **Bổ Sung Bộ Phát Âm Thanh Web Audio Thuần Việt (`soundEffects.ts`)**:
  * Còi xe tải "Pim... pim...".
  * Tiếng bốc xếp pallet "Cạch... cạch...".
  * Tiếng ting ting thu tiền cước và hoàn thành chương truyện.

---

## 5. Kế Hoạch Kiểm Thử (Testing & Quality Assurance)
* Đảm bảo bộ test `src/test/empire.test.ts`, `src/test/empireUI.test.tsx`, `src/test/gameStore.test.ts` đều PASS 100%.
* Kiểm tra tải trang không còn bất kỳ lỗi 404 image nào trên console trình duyệt.
* Tốc độ render Three.js giữ vững >= 60 FPS.
