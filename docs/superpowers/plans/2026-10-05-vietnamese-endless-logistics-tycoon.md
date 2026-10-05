# Kế Hoạch Triển Khai: Nâng Cấp Đồ Họa Thuần Việt Thủ Công & Cốt Truyện Vô Tận

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuyển hóa toàn diện trò chơi từ trạng thái đồ họa/giao diện "hộp AI thô cứng" thành tựa game Logistics Tycoon thuần Việt cao cấp với mô hình 3D xe tải/xe nâng/hàng hóa thủ công tinh xảo, hệ thống cốt truyện Niên Giám 4 Mùa vô tận, tích hợp 100% tài nguyên ảnh WebP và âm thanh Web Audio sống động.

**Architecture:** Mở rộng enum hàng hóa và cốt truyện mùa vụ trong Zustand store (`useEmpireStore.ts`), nâng cấp toàn bộ Three.js mesh procedural với chi tiết nhận diện xe tải Việt Nam (`TruckMesh`, `ForkliftMesh`, `PalletStackMesh`, `VietnamIndustry`), xây dựng module âm thanh tổng hợp Web Audio (`audio.ts`), tái cấu trúc giao diện điều hành (`EmpirePanel`, `TopNavBar`, `InspectorDrawer`, `index.css`) gắn kết trọn vẹn 22 asset WebP và đồng bộ toàn bộ bộ test.

**Tech Stack:** React 19, TypeScript, Three.js, React Three Fiber (R3F), Zustand, Web Audio API, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-05-vietnamese-endless-logistics-tycoon-design.md`

## Global Constraints
- Không dùng file audio ngoài nặng, dùng Web Audio API để tạo âm thanh còi xe, nâng hàng và nhận tiền mượt mà 100%.
- Giữ tốc độ render Three.js >= 60 FPS.
- Sử dụng toàn bộ ảnh tối ưu định dạng `.webp` trong `public/assets/`, tuyệt đối không để xảy ra lỗi 404 broken image.
- Toàn bộ test suite `vitest` phải PASS 100%.

---

### Task 1: Module Âm Thanh Thuần Việt Web Audio (`src/utils/audio.ts`)

**Files:**
- Create: `src/utils/audio.ts`
- Test: `src/test/audio.test.ts`

- [ ] **Step 1: Viết test cho audio synthesizer**
- [ ] **Step 2: Chạy test để xác nhận fail**
- [ ] **Step 3: Triển khai audio synthesizer (`playHorn`, `playForklift`, `playCoin`, `playFanfare`)**
- [ ] **Step 4: Chạy test để xác nhận pass**
- [ ] **Step 5: Commit task**

---

### Task 2: Mở Rộng Hệ Thống Hàng Hóa & Cốt Truyện Mùa Vụ (`src/types/empire.ts`, `src/types/game.ts`)

**Files:**
- Modify: `src/types/empire.ts`
- Modify: `src/types/game.ts`

- [ ] **Step 1: Khai báo 7 nhóm hàng (`rice`, `coffee`, `electronics`, `fruit`, `seafood`, `garments`)**
- [ ] **Step 2: Thêm định nghĩa Season (`spring`, `summer`, `autumn`, `winter`) và cấp bậc Doanh nhân**
- [ ] **Step 3: Kiểm tra TypeScript compile**
- [ ] **Step 4: Commit task**

---

### Task 3: Tái Thiết Kế Mô Hình 3D Xe Tải & Xe Nâng Thuần Việt (`TruckMesh.tsx`, `ForkliftMesh.tsx`)

**Files:**
- Modify: `src/components/canvas/TruckMesh.tsx`
- Modify: `src/components/canvas/ForkliftMesh.tsx`

- [ ] **Step 1: Nâng cấp cabin xe tải Thaco/Hino có kính cong, cản chrome, đèn sương mù, biển vàng phản quang 61C/29C/51D**
- [ ] **Step 2: Bổ sung 2 loại thùng: Mui bạt xanh có dây rút và Thùng dập sóng Inox, dán tem "VẠN DẶM BÌNH AN"**
- [ ] **Step 3: Nâng cấp xe nâng Forklift: bổ sung khoang lái (ghế da, vô lăng, cần gạt) và đèn xoay chớp vàng cảnh báo trên nóc**
- [ ] **Step 4: Kiểm tra hiển thị và animation trong 3D Scene**
- [ ] **Step 5: Commit task**

---

### Task 4: Tái Thiết Kế Kiện Hàng, Pallet & Cảnh Quan Bến Bãi (`PalletStackMesh.tsx`, `VietnamIndustry.tsx`, `WarehouseFacility.tsx`)

**Files:**
- Modify: `src/components/canvas/PalletStackMesh.tsx`
- Modify: `src/components/canvas/VietnamIndustry.tsx`
- Modify: `src/components/canvas/WarehouseFacility.tsx`

- [ ] **Step 1: Thiết kế bao tải dứa gai lúa gạo/cà phê, sọt nhựa đóng quả có tem VietGAP, thùng carton in tem ly hàng dễ vỡ**
- [ ] **Step 2: Bổ sung chòi bảo vệ có bình "TRÀ ĐÁ MIỄN PHÍ", ấm tích, cột cờ đỏ sao vàng bay phấp phới**
- [ ] **Step 3: Bổ sung bảng hiệu chữ nổi lớn 3D "TỔNG KHO VẬN TẢI & LOGISTICS ĐẠI VIỆT" trên nóc nhà kho**
- [ ] **Step 4: Kiểm tra hiển thị trong Canvas**
- [ ] **Step 5: Commit task**

---

### Task 5: Triển Khai Engine Cốt Truyện Vô Tận & Niên Giám 4 Mùa Trong Store (`src/store/useEmpireStore.ts`, `src/store/useGameStore.ts`)

**Files:**
- Modify: `src/store/useEmpireStore.ts`
- Modify: `src/store/useGameStore.ts`
- Test: `src/test/empire.test.ts`
- Test: `src/test/gameStore.test.ts`

- [ ] **Step 1: Cập nhật 7 loại hàng hóa vào dây chuyền sản xuất và danh mục hợp đồng**
- [ ] **Step 2: Cài đặt Niên Giám 4 Mùa (Xuân Tết, Hè Nông sản, Thu Cảng biển, Đông Chi viện) với buff/debuff và đối thoại nhân vật**
- [ ] **Step 3: Sửa lỗi hợp đồng terminal filter để người chơi thấy rõ trạng thái hoàn tất/thất bại**
- [ ] **Step 4: Tích hợp hiệu ứng âm thanh Web Audio vào các sự kiện còi xe, hoàn tất hợp đồng, nhận tiền cước**
- [ ] **Step 5: Cập nhật test suite `empire.test.ts` & `gameStore.test.ts` để pass 100%**
- [ ] **Step 6: Commit task**

---

### Task 6: Lột Xác Giao Diện UI & Tích Hợp Toàn Bộ 22 Asset WebP (`EmpirePanel.tsx`, `TopNavBar.tsx`, `InspectorDrawer.tsx`, `index.css`)

**Files:**
- Modify: `src/components/ui/EmpirePanel.tsx`
- Modify: `src/components/ui/TopNavBar.tsx`
- Modify: `src/components/ui/InspectorDrawer.tsx`
- Modify: `src/index.css`
- Test: `src/test/empireUI.test.tsx`

- [ ] **Step 1: Gắn toàn bộ 22 ảnh WebP tối ưu: chân dung 4 nhân viên, 4 loại xe theo ngữ cảnh, 7 loại hàng hóa, 4 công trình và 3 chi nhánh**
- [ ] **Step 2: Tái thiết kế style UI: các thẻ bo góc ấm áp, badge mùa vụ lấp lánh, huy hiệu cấp bậc doanh nhân, nút bấm pill button sang trọng**
- [ ] **Step 3: Thêm nút bật/tắt âm thanh trên thanh TopBar**
- [ ] **Step 4: Chạy test `empireUI.test.tsx` và xác nhận pass**
- [ ] **Step 5: Commit task**

---

### Task 7: Kiểm Thử Toàn Diện & Tinh Chỉnh Cuối Cùng (End-to-End Verification)

**Files:**
- Verify: `npm test`
- Verify: `npx vite build`

- [ ] **Step 1: Chạy toàn bộ test suite vitest đảm bảo pass 100%**
- [ ] **Step 2: Chạy build production kiểm tra không có lỗi bundle/TypeScript**
- [ ] **Step 3: Xác minh các asset hiển thị mượt mà trên browser**
- [ ] **Step 4: Commit task**
