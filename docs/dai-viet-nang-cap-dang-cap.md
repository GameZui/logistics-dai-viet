# Phương án nâng cấp "Đại Việt Logistics" lên đẳng cấp

> Tài liệu chiến lược + kỹ thuật. Mục tiêu: đưa tựa game mô phỏng kho vận
> (`WareTrack 3D` / `Đại Việt Logistics`) từ mức "demo low-poly còn thô" lên
> **sản phẩm premium, có chiều sâu, chạy 60 FPS, nhận diện thuần Việt**.

Trạng thái repo khi lập kế hoạch: nhánh `feature/waretrack-3d`, commit `aeebdb3b`.

---

## 0. Đánh giá hiện trạng (Audit)

### 0.1. Đã có gì
- **Stack**: React 19, Vite 6, TypeScript 5.7, Three.js 0.174 + `@react-three/fiber` 9 + `@react-three/drei` 10, Zustand 5, Tailwind 3.4, Vitest 3.
- **Cảnh 3D**: `GameCanvas` (camera isometric orthographic + OrbitControls), `GroundAndRoads`, `WarehouseFacility` (4 cửa dock), `FleetLayer` (xe tải + xe nâng procedural), `VietnamIndustry` (công nhân, băng chuyền, nhà máy, cột cờ, chòi bảo vệ, xe máy, cây xanh).
- **Logic**: `useGameStore` (đội xe, dock, tick mô phỏng) + `useEmpireStore` (kinh tế, nhân sự, hợp đồng, công trình, cốt truyện, mùa vụ, sự kiện).
- **UI**: `TopNavBar`, `TopKpiCards`, `InspectorDrawer`, `FleetDockTable`, `ShipmentTimeline`, `CameraControlsWidget`, `EmpirePanel` (7 tab).
- **Tiện ích**: `audio.ts` (Web Audio procedural: còi, lách cách, ting, fanfare), `saveGame.ts` (localStorage + validate), `motion.ts` (đường đi xe/xe nâng), `labels.ts`.
- **Tài nguyên**: 22 ảnh WebP + bản PNG nguồn trong `public/assets/`, video tham chiếu `sssx.io_*.mp4`.

### 0.2. BLOCKER — bản build hiện đang HỎNG (ưu tiên tuyệt đối)
Bằng chứng thu được khi audit:

| Kiểm tra | Kết quả |
|---|---|
| `npx tsc --noEmit` | ❌ 2 lỗi |
| `vitest run` | ❌ 4/31 test fail, 2/6 test file fail |

Chi tiết:
1. `src/components/canvas/ForkliftMesh.tsx:249` — `Cannot find name 'GOODS'` (thiếu `import { GOODS } from '../../store/useEmpireStore'`).
2. `src/test/empire.test.ts:22` — inventory record thiếu `fruit`, `seafood`, `garments`.
3. `empire.test.ts > sorts stock...` — `rice.sorted` nhận `3` thay vì `5` (bộ phân loại rải pallet sai số loại hàng).
4. `empire.test.ts > dispatches real outbound cargo...` — `shipContract('hd-gao')` trả `false` (không xuất được hàng).
5. `gameStore.test.ts` — `storageCount` nhận `801/800` thay vì `611/610` (lệch +190: `totalStock` cộng thêm hàng của các loại mới nhưng UI/top KPI vẫn đọc hằng số cũ).

**Nguyên nhân gốc**: refactor theo spec `2026-10-05-vietnamese-endless-logistics-tycoon-design.md` bị dở dang. `types/empire.ts` đã mở rộng `Goods` lên 6 loại và thêm `Season`, **nhưng**:
- `GOODS` trong `useEmpireStore.ts` vẫn chỉ 3 loại.
- `saveGame.ts` chỉ validate 3 loại (`['rice','coffee','electronics']`).
- `useGameStore.spawnTruck` / `tickSimulation` chỉ xoay vòng 3 loại.
- `EmpirePanel` hard-code mảng 3 ảnh `goods-rice/coffee/electronics.webp` theo `index`.
- Toàn bộ test vẫn kỳ vọng mô hình 3 loại.

### 0.3. Điểm yếu về "đẳng cấp"
- **Cảm giác generic**: mô hình procedural đúng chủ đề Việt nhưng thiếu art direction thống nhất (palette, tỉ lệ, lighting, vật liệu); chưa có post-processing/color grading.
- **Thiếu chiều sâu mô phỏng**: 3 kho dùng chung vốn/hàng/nhân sự; chưa có tuyến đường, nhiên liệu, bảo trì, ca làm, nút thắt năng suất.
- **Thiếu "juice"**: không có camera focus tới đối tượng khi click, không có screen shake/particle khi giao hàng, không nhạc nền.
- **Hiệu năng**: `dpr [1,1.1]`, canvas `antialias:false`, mọi vật thể là mesh rời (không instancing), `<Html>` pin nặng khi nhiều xe.
- **Thiếu onboarding/tutorial, achievements, prestige, mobile/PWA, accessibility.**

---

## 1. Định nghĩa "đẳng cấp" (Definition of Done)

Game được coi là "đẳng cấp" khi đạt đồng thời 6 tiêu chí:

1. **Art direction nhất quán, thuần Việt**: bảng màu ngọc bích/kem/đất nung thống nhất; ngày/đêm + mùa thể hiện trong cảnh; nhận diện rõ xe Thaco/Hino, biển vàng, báo hiệu Việt.
2. **Chiều sâu gameplay**: nhiều kho độc lập, tuyến đường, nhân sự có ca/kỹ năng, kinh tế có chi phí & rủi ro, luồng hàng là state machine rõ ràng.
3. **Game feel**: mọi tương tác có phản hồi (âm thanh + animation + camera), không có trạng thái "đơ".
4. **Hiệu năng**: ≥ 60 FPS trên máy phổ thông, tải trang < 2s, không rò rỉ bộ nhớ khi chơi dài.
5. **Trải nghiệm & khả dụng**: onboarding, hotkeys, tooltip, responsive mobile, chế độ giảm chuyển động, lưu/migrate save an toàn.
6. **Chất lượng kỹ thuật**: `tsc` sạch, test 100% pass, có CI + e2e + perf budget.

---

## 2. Giai đoạn P0 — Ổn định & vệ sinh kỹ thuật (tuần 1)

**Mục tiêu**: đưa repo về trạng thái "xanh" (build + test pass) trước khi thêm tính năng. Không xây thêm gì trên nền đang vỡ.

| # | Việc | File | Nghiệm thu |
|---|---|---|---|
| P0-1 | Quyết định & hoàn tất refactor hàng hóa: mở rộng `GOODS` đủ 6 loại **hoặc** rollback `Goods` về 3 loại | `types/empire.ts`, `store/useEmpireStore.ts` | Hai đường đi rõ ràng, chọn 1 và lan tỏa toàn bộ |
| P0-2 | Thêm `import { GOODS }` cho `ForkliftMesh` | `components/canvas/ForkliftMesh.tsx` | `tsc` hết lỗi 249 |
| P0-3 | Cập nhật validate save theo số loại hàng mới + **schema version + migration** | `utils/saveGame.ts` | save cũ v1 migrate sang v2, không mất tiến trình |
| P0-4 | Sửa bộ phân loại để tiêu thụ đúng số loại hàng | `store/useEmpireStore.ts` (`tickEmpire`) | `empire.test` case "sorts stock" pass |
| P0-5 | Sửa `shipContract` để xuất hàng chạy được | `store/useEmpireStore.ts` | `empire.test` case "dispatches outbound" pass |
| P0-6 | Đồng bộ `storageCount`/`totalStock` giữa 2 store + sửa hằng số 610 | `store/useGameStore.ts`, `store/useEmpireStore.ts` | `gameStore.test` pass |
| P0-7 | Cập nhật test kỳ vọng theo mô hình hàng hóa đã chọn | `src/test/*` | `vitest run` 100% pass |
| P0-8 | Thêm npm script `typecheck` + `test:ci`; dựng CI (GitHub Actions) chạy `tsc` + `vitest` + `vite build` | `package.json`, `.github/workflows/ci.yml` | CI xanh trên nhánh |
| P0-9 | Thêm `ErrorBoundary` bọc `Canvas` để 1 lỗi WebGL không trắng màn hình | `App.tsx`, `components/canvas/GameCanvas.tsx` | Bật/tắt WebGL bằng tay không crash UI |

**Khuyến nghị**: chọn **mở rộng đủ 6 loại** (khớp spec mùa vụ), vì tài nguyên ảnh đã có sẵn (`goods-fruit/seafood/garments.webp`) và cốt truyện mùa vụ cần đủ nhóm hàng. Khi chọn hướng này, thay mọi chỗ "hard-code 3 loại" bằng vòng lặp `Object.keys(GOODS)`.

---

## 3. Giai đoạn P1 — Đồ họa 3D đẳng cấp (tuần 2–4)

### 3.1. Art direction & rendering
- **Art bible**: chốt palette (`#176858` ngọc bích, kem `#f6f1e4`, đất nung `#b45309`, xám công nghiệp), tỉ lệ (1 ô = 1 m), quy tắc vật liệu. Ghi vào `docs/dai-viet-art-bible.md`.
- **Tone mapping + color grading**: bật `ACESFilmicToneMapping`, `outputColorSpace = SRGB` trong `GameCanvas` `gl` config; thêm lớp grade nhẹ để cảnh "ấm" chứ không phẳng.
- **Lighting**: giữ directional chính + hemisphere, nhưng thêm **soft shadow (PCFSoft)** và **contact shadow** dưới xe/pallet; đổi shadow map theo chất lượng (2048 khi `!economical`).
- **Post-processing (tùy chọn)**: thêm `@react-three/postprocessing` cho bloom nhẹ (đèn dock/đèn xoay), vignette, SSAO. Gắn cờ tắt theo chế độ `economical`.

### 3.2. Tối ưu hóa hạ tầng 3D
- **InstancedMesh** cho các đối tượng lặp nhiều: cây (`GroundAndRoads`), cột rào, pallet trên kệ, đèn, người (nếu > 12). Hiện mỗi cây/pallet là 1 mesh rời.
- **LOD** cho xe/nhà kho ở xa; `frustumCulled` đúng cho group động.
- **`<Html>` pin**: chuyển sang billboard sprite/texture cho pin đơn giản, chỉ dùng `<Html>` cho pin đang hover/selected; tránh mount hàng chục DOM node mỗi frame (`FloatingPinMarker.tsx`).
- **Reuse geometry/material**: tạo module `src/three/assets.ts` cache geometry & material dùng chung thay vì khai báo lại trong từng mesh.

### 3.3. Nâng chi tiết mô hình (đúng hướng "thủ công thuần Việt")
- **Xe tải** (`TruckMesh.tsx`): hoàn thiện 2 loại thùng (mui bạt xanh có dây chằng / thùng inox dập sóng), gioăng kính, cản chrome, đèn sương mù; decal "VẠN DẶM BÌNH AN" vẽ bằng `WorldLabel` (đã có).
- **Xe nâng** (`ForkliftMesh.tsx`): đèn xoay cảnh báo nhấp nháy theo chu kỳ, ghế lái, vô lăng; khớp nâng/hạ mượt theo `forkliftPose`.
- **Pallet/hàng** (`PalletStackMesh.tsx`): bao tải lúa/cà phê, sọt trái cây tem VietGAP, thùng carton tem "hàng dễ vỡ", **phuy thủy sản** (đã có nhánh `type === 'drum'` nhưng chưa gọi) — nối `type` theo `goods`.
- **Khuôn viên** (`VietnamIndustry.tsx`, `WarehouseFacility.tsx`): cột cờ bay (đã có), chòi bảo vệ + bình "trà đá miễn phí", biển hiệu chữ nổi, vạch kẻ đường, biển báo tải trọng.

### 3.4. Biến thiên theo mùa & thời gian (kết nối gameplay ↔ hình ảnh)
- Đổi ánh sáng/màu trời theo `Season` (Xuân/Hè/Thu/Đông): nhiệt độ màu, sương, mặt đất.
- **Hiệu ứng thời tiết**: mưa (miền Trung mùa bão), nắng gắt (Hè). Dùng particle đơn giản + đổi fog.
- Ngày/đêm: dịch chuyển hướng nắng theo `elapsed`, cảnh đêm bật đèn dock/cột cờ.

**Nghiệm thu P1**: Ảnh chụp before/after; FPS đo bằng `stats` ≥ 60 trên máy mục tiêu; không có ảnh 404; cảnh đổi sắc theo mùa.

---

## 4. Giai đoạn P1 — UI/UX đẳng cấp (tuần 3–5)

### 4.1. Design system
- Tách **design tokens** (màu, khoảng cách, bo góc, bóng, chữ) thành `src/styles/tokens.css` + class tiện ích; `index.css` hiện đã phình 14 KB class thủ công → chuẩn hóa lại.
- Bộ component tái sử dụng: `Card`, `Button` (primary/secondary/ghost), `Stat`, `Badge`, `Modal`, `Tabs`, `ProgressBar` → thay các khối `<div className="...">` lặp trong `EmpirePanel`, `InspectorDrawer`, `FleetDockTable`.
- **Typography**: hiện dùng Inter + `Segoe UI` fallback cho `WorldLabel` (tránh fetch font ngoài). Cân nhắc self-host 1 font display (vd. Be Vietnam Pro) cho nhận diện, load bằng `font-display: swap`, không chặn cảnh (giữ đúng nguyên tắc hiện tại).

### 4.2. Luồng & hướng dẫn người chơi
- **Onboarding**: 3–5 bước chỉ dẫn (gọi xe → xe nâng bốc → phân loại → xuất hợp đồng), highlight phần tử tương ứng, tự tắt sau khi hoàn thành.
- **Tooltip/contextual hint** cho mọi nút quan trọng và cho pin 3D.
- **Command palette / hotkeys**: Space = pause, 1/2 = tốc độ, C = camera home, Tab = bảng điều hành, `?` = trợ giúp. Ghi vào `docs/dai-viet-controls.md`.

### 4.3. Camera & tương tác
- **Focus camera**: khi click 1 dòng trong `FleetDockTable` hoặc chọn entity, camera pan/zoom mượt (tween trong `IsometricCamera`) tới đối tượng. Hiện click chỉ mở inspector, camera đứng yên.
- Zoom/rotate giữ nguyên nhưng thêm giới hạn pan theo khuôn viên để không lạc khỏi cảnh.
- Nút "Đưa về đối tượng đang chọn" trên widget camera.

### 4.4. Responsive & accessibility
- **Mobile**: layout dock panel dạng bottom-sheet; pin 3D to hơn; nút chạm ≥ 44px; kiểm tra ở 375px.
- **A11y**: contrast ≥ 4.5:1, focus ring rõ, hỗ trợ `prefers-reduced-motion` (đã có CSS `backdrop-blur: none` cho panel — mở rộng cho animation), thêm `aria-live` cho toast `notice`.

---

## 5. Giai đoạn P2 — Chiều sâu gameplay (tuần 5–9)

Đây là phần quyết định "đẳng cấp" về nội dung, biến game từ toy thành tycoon thật.

### 5.1. Luồng hàng chuẩn (state machine)
- Định nghĩa máy trạng thái rõ ràng cho lô hàng: `Nhận → Chờ vị trí → Bốc → Phân loại → Lưu kho → Đóng gói → Chờ xe → Giao`.
- Hàng **không nhảy vị trí tức thời**: mọi chuyển trạng thái gắn với animation + thời gian di chuyển (mở rộng `motion.ts`).
- Tách **domain layer thuần** (`src/domain/`) chứa logic mô phỏng không phụ thuộc Three.js/DOM → dễ test, dễ cân bằng số liệu.

### 5.2. Nhiều kho độc lập theo vùng
- Mỗi hub có **vốn, sức chứa, cửa bốc dỡ, nhân sự, hàng riêng**. Hiện tại (xem `dai-viet-assets.md`) 3 chi nhánh dùng chung tài nguyên → bỏ mô hình cũ.
- **Điều xe liên kho**: chuyển hàng từ kho A sang kho B, tốn thời gian + nhiên liệu.
- Mở khóa vùng theo cốt truyện; mỗi vùng có thế mạnh hàng hóa (Tây Nguyên = cà phê, miền Tây = lúa, cảng = xuất khẩu).

### 5.3. Nhân sự có chiều sâu
- Ca làm việc, mệt mỏi tích lũy, nghỉ phép; **tiền lương & tăng ca**.
- Kỹ năng/chuyên môn, đào tạo, phân công cụ thể (không chỉ "mỗi lái xe 1 xe nâng").
- Xe nâng/băng chuyền tạo **nút thắt năng suất** để người chơi phải cân bằng.

### 5.4. Kinh tế & rủi ro
- Hợp đồng theo **SLA**: loại hàng, tiêu chuẩn chất lượng, tuyến đường, thưởng/phạt, khách hàng có **độ trung thành**.
- Chi phí vận hành: nhiên liệu, bảo trì xe, khấu hao, lạm phát; **giá thị trường biến động**.
- Sự kiện rủi ro: thời tiết xấu, tắc đường, tai nạn, đình công, biến động giá — có thể bật/tắt.
- **Bảo hiểm/giảm thiểu rủi ro** như một quyết định quản trị.

### 5.5. Tiến trình dài hạn
- **Cấp bậc doanh nhân** (đã có trong spec), uy tín theo ngành.
- **Achievements / thành tựu** với phần thưởng.
- **Vòng lặp prestige/legacy**: kết thúc một "đời" doanh nghiệp, chơi lại với đặc quyền vĩnh viễn (điểm Uy tín Tinh hoa).
- Thống kê tổng kết sau mỗi chương/mùa.

---

## 6. Giai đoạn P2 — Cốt truyện, âm thanh & "juice" (tuần 7–10)

### 6.1. Cốt truyện & meta
- Hoàn tất **Niên Giám 4 Mùa vô tận** (Xuân Tết / Hè nông sản / Thu cảng biển / Đông cứu trợ) gắn với 6 nhóm hàng.
- Nhân vật tái xuất, **lựa chọn đầu tư có hệ quả**, chuỗi nhiệm vụ phụ (side quests).
- Đối thoại/event trên `EmpirePanel` tab "Hành trình" — mở rộng từ `endlessArcs` sẵn có.

### 6.2. Âm thanh
- Mở rộng `audio.ts` (Web Audio procedural, đã có còi/lách cách/ting/fanfare): thêm **ambience** (tiếng kho, xe chạy, mưa), **nhạc nền** nhẹ.
- **Mixer**: bus nhạc/SFX, âm lượng riêng, **mute được lưu vào save**; nút bật/tắt tiếng trên `TopNavBar` (đã nằm trong spec, cần hoàn tất).
- **Spatial audio** tùy chọn: âm thanh nhỏ dần theo khoảng cách camera.

### 6.3. Game juice
- Screenshake nhẹ khi xe cập dock; particle khói bụi/tiền bay khi hoàn thành hợp đồng.
- Animation số KPI đếm tăng, toast trượt vào, badge mùa vụ "lấp lánh".
- Rung (haptics) trên mobile khi hoàn tất đơn.

---

## 7. Giai đoạn P3 — Hiệu năng, QA & phát hành (tuần 9–12)

### 7.1. Hiệu năng & độ ổn định
- **Ngân sách hiệu năng**: khai báo mục tiêu (draw calls < 150, triangle < 300k, FPS ≥ 60, tải < 2s). Đo bằng `r3f-perf`/`stats-gl`.
- **Tách simulation khỏi render**: fixed-timestep (vd. 10 Hz) cho mô phỏng, nội suy cho hình ảnh → không phụ thuộc `delta` frame (hiện `FleetLayer` tick theo `useFrame`).
- **Code splitting**: lazy-load `EmpirePanel` và các tab nặng; preload asset ảnh theo nhu cầu; nén WebP (đã có) + `loading="lazy"` (đã có).
- **Rò rỉ bộ nhớ**: dispose texture/sprite của `<Html>` pin & `WorldLabel` khi unmount (đã có dispose cho WorldLabel, cần kiểm tra pin).
- Chế độ **"Ưu tiên hiệu năng"** (đã có `economical`) mở rộng: tắt post-processing, giảm shadow, giảm dpr, tắt weather.

### 7.2. Kiểm thử
- **Unit**: mở rộng `empire.test.ts`, `gameStore.test.ts`, `motion.test.ts` cho domain layer mới; mọi nhánh kinh tế quan trọng phải có test (không âm tiền, không nhân bản hàng).
- **Component**: mở rộng `empireUI.test.tsx` cho toàn bộ 7 tab + onboarding + a11y.
- **E2E (Playwright)**: kịch bản vòng chơi đầy đủ (gọi xe → xuất hợp đồng → nhận thưởng), chụp ảnh khi fail.
- **Visual regression**: ảnh chụp canvas theo mùa để chống lệch art.
- **Perf test trong CI**: chạy Lighthouse/Playwright + ngưỡng FPS.

### 7.3. Phát hành & vận hành
- **PWA**: manifest + service worker → chơi offline, cài như app; nhớ migrate save cũ.
- **Đóng gói mobile**: Capacitor (nếu cần lên store) tái dùng codebase web.
- **Analytics nhẹ, ẩn danh** (tùy chọn, có công tắc) + **crash reporting** (Sentry) để bám lỗi thực tế.
- Kênh phát hành: itch.io/Steam (web build) với **menu chính, settings, credits**.

---

## 8. Lộ trình tổng thể (Roadmap)

| Giai đoạn | Thời lượng | Trọng tâm | Cột mốc nghiệm thu |
|---|---|---|---|
| **P0** Ổn định | Tuần 1 | Fix build/test, CI, save migration | `tsc` sạch · `vitest` 100% · CI xanh |
| **P1a** Đồ họa | Tuần 2–4 | Art bible, lighting, instancing, mùa/thời tiết | 60 FPS · before/after ảnh · không 404 |
| **P1b** UI/UX | Tuần 3–5 | Design system, onboarding, camera focus, mobile/a11y | Mobile 375px đẹp · hotkeys · tutorial chạy |
| **P2a** Gameplay | Tuần 5–9 | State machine, kho độc lập, nhân sự, kinh tế/rủi ro | Có ≥ 3 kho độc lập · SLA · achievements |
| **P2b** Nội dung | Tuần 7–10 | 4 mùa, cốt truyện, âm thanh, juice | Vòng mùa chạy · mixer · particles |
| **P3** Hoàn thiện | Tuần 9–12 | Perf, e2e, PWA, phát hành | Lighthouse ≥ 90 · e2e xanh · PWA cài được |

> Thứ tự P1a↔P1b và P2a↔P2b có thể chạy song song nếu có ≥ 2 người, vì gần như không chồng lấn file.

### Ưu tiên nếu chỉ có 1 người / thời gian ngắn (MVP "đẳng cấp")
1. P0 (bắt buộc).
2. P1a mục 3.1 + 3.2 (ánh sáng/instancing) — cải thiện ấn tượng thị giác nhanh nhất.
3. P1b mục 4.3 (camera focus) + 4.2 (onboarding).
4. P2b mục 6.2 + 6.3 (âm thanh/juice) — rẻ, tăng cảm giác premium rõ rệt.
5. Còn lại theo lộ trình.

---

## 9. Rủi ro & biện pháp giảm thiểu

| Rủi ro | Ảnh hưởng | Giảm thiểu |
|---|---|---|
| Refactor 6 loại hàng chạm nhiều file, dễ vỡ tiếp | Cao | Làm ở P0, phủ test trước, commit nhỏ; hoặc rollback về 3 loại rồi mở rộng có kiểm soát |
| Thêm post-processing/nhiều mesh làm tụt FPS | Cao | Ngân sách perf, LOD/instancing, cờ `economical`, đo trong CI |
| Save cũ không tương thích schema mới | Cao | Schema version + migration + test "reject corrupt save" (đã có nền) |
| Nội dung (cốt truyện/kinh tế) phình to khó cân bằng | Trung bình | Tách domain layer + bảng số liệu tập trung (`src/domain/balance.ts`) |
| Phụ thuộc thêm nhiều (postprocessing, motion, playwright) | Trung bình | Chỉ thêm khi thật cần, lazy/optional, ghi rõ trong `package.json` |
| Thời gian/1 người | Cao | Bám thứ tự ưu tiên MVP ở mục 8 |

---

## 10. Bảng điểm nghiệm thu "đẳng cấp" (Scorecard)

Chấm 0–2 mỗi mục, mục tiêu tổng ≥ 20/24:

| # | Tiêu chí | Hiện tại | Mục tiêu |
|---|---|---|---|
| 1 | `tsc` sạch + test 100% pass | 0 (đang hỏng) | 2 |
| 2 | FPS ổn định ≥ 60, tải < 2s | 1 | 2 |
| 3 | Art direction nhất quán (palette/lighting/grade) | 1 | 2 |
| 4 | Mùa/thời tiết/ngày-đêm phản ánh trong cảnh | 0 | 2 |
| 5 | Chiều sâu gameplay (kho độc lập, SLA, nhân sự) | 1 | 2 |
| 6 | Luồng hàng là state machine, không teleport | 1 | 2 |
| 7 | Onboarding + tooltip + hotkeys | 0 | 2 |
| 8 | Camera focus tới đối tượng khi chọn | 0 | 2 |
| 9 | Âm thanh (nhạc nền/mixer/juice) | 1 | 2 |
| 10 | Mobile responsive + accessibility | 1 | 2 |
| 11 | Achievements + prestige/legacy loop | 0 | 2 |
| 12 | PWA/offline + e2e + CI + crash reporting | 0 | 2 |

---

## 11. Việc cần làm ngay (Next actions)

1. **[Chặn]** Chạy P0: khôi phục build (`tsc`) và test (`vitest`) về xanh — đây là điều kiện tiên quyết.
2. Chốt hướng hàng hóa: **6 loại** (khuyến nghị) hay 3 loại; lan tỏa toàn bộ store/save/UI/test.
3. Tạo `docs/dai-viet-art-bible.md` + `docs/dai-viet-controls.md` làm chuẩn cho P1.
4. Dựng CI (`.github/workflows/ci.yml`) để không tái phát tình trạng build hỏng.

---

## Phụ lục — Bản đồ file theo hạng mục

| Hạng mục | File chính |
|---|---|
| Ổn định build/test | `src/store/*.ts`, `src/utils/saveGame.ts`, `src/test/*`, `package.json` |
| Đồ họa 3D | `src/components/canvas/*.tsx`, `src/three/assets.ts` (mới) |
| UI/UX | `src/components/ui/*.tsx`, `src/index.css`, `src/styles/tokens.css` (mới) |
| Gameplay/domain | `src/domain/*` (mới), `src/store/*.ts`, `src/utils/motion.ts` |
| Nội dung/mùa vụ | `src/store/useEmpireStore.ts`, `src/types/empire.ts` |
| Âm thanh | `src/utils/audio.ts` |
| Phát hành | `public/manifest.webmanifest`, `public/sw.js`, `vite.config.ts` |

---

## Phụ lục — Nhật ký triển khai "trải nghiệm xe tải & camera" (đã làm)

### Lỗi xe tải "nhảy nhảy / mất luôn" — nguyên nhân & cách sửa
1. **Xe chờ bay khỏi mặt sàn**: `truckPose('en_route')` đặt xe tại `x = -42 - queueSlot*12` (slot 2+ → x ≤ -66, ngoài sàn ±60) nên xe biến mất.
   → Thêm `waitSlotX(slot)` cho xe đậu trên đường ngoài trong tầm nhìn; docking có pha "tấp vào làn" trước khi lùi vào bến (`src/utils/motion.ts`).
2. **Đóng băng rồi giật**: `TruckMesh` là `React.memo` bỏ qua `motionTime`, khiến `useFrame` đọc giá trị cũ → xe đứng im ~20s rồi nhảy khi đổi trạng thái.
   → `useFrame` đọc **state sống** từ `useGameStore.getState().trucks` mỗi frame (`src/components/canvas/TruckMesh.tsx`).
3. **Kẹt ở bến**: chỉ 1 xe vào dock/completed một lúc, và xe `completed` bị chặn chờ xe `docking`.
   → Cho nhiều bến tiếp nhận đồng thời, bỏ chặn xe rời bãi (`src/store/useGameStore.ts`).

### Camera nhiều góc nhìn (xem nhân viên làm việc)
- `src/utils/cameraViews.ts`: 5 preset — **Toàn cảnh · Khu phân loại · Bến dỡ hàng · Xưởng đóng gói · Cổng & cột cờ**, kèm helper `requestCameraView/Focus/Zoom/Reset` (CustomEvent).
- `IsometricCamera.tsx`: tween `position/target/zoom` mượt 0.9s (smoothstep) khi đổi góc; giữ zoom/reset; thêm `camera-focus` để sau này zoom tới đối tượng được chọn.
- `CameraControlsWidget.tsx`: panel "GÓC NHÌN" liệt kê các preset (đang chọn được highlight) + zoom/nhút khôi phục; CSS mới trong `index.css`.

### Kiểm thử
- Thêm 1 test khoá hành vi: xe chờ luôn nằm trong sàn và `en_route → docking` liền mạch (`src/test/motion.test.ts`).
- Trạng thái: `tsc` sạch · **32/32 test pass** · `vite build` OK.

### Còn lại (gợi ý tiếp)
- Gắn `requestCameraFocus` vào lúc chọn xe/nhân viên để tự zoom tới đối tượng.
- Cho `Person` biết trạng thái phân loại thật (`sortEnabled`, `sortProgress`) để động tác khớp dây chuyền.
- Camera "theo chân" (follow) một nhân viên cụ thể bằng tween liên tục.

### Đợt 2 — Xe & người không đi xuyên/đè lên nhau
- **Xe xếp hàng chờ**: hàng chờ dời ra `STAGING_Z = 20` (ngoài làn ra vào), nên xe chờ không còn đè lên làn xe đang vào/ra.
- **Khoá làn dốc bến**: chỉ 1 xe được vào làn tại một thời điểm; xe vào theo thứ tự `queueSlot`; xe đã dỡ xong chỉ rời bến khi làn đã trống (không còn đè nhau ở khúc lùi/ra).
- **Người không xuyên nhau**: thêm `src/utils/crowd.ts` (`separateWorker`) — mỗi nhân viên giữ khoảng cách tối thiểu `WORKER_GAP` với đồng nghiệp qua registry vị trí dùng chung trong `VietnamIndustry.tsx`; nhân viên phân loại cũng được chia làn rộng hơn để ít trùng quỹ đạo.
- Test mới: `src/test/crowd.test.ts` (3 case). Trạng thái: `tsc` sạch · **35/35 test pass** · `vite build` OK.

### Đợt 3 — Xe vào bến không cắt qua xe đang đậu & dọn vật thể gây rối
- **Đẩy làn vào bến ra xa**: làn xe chạy vào đổi `z=6` → `LANE_Z = 9`, cách dãy xe đang đậu ở bến (~z=5.4) hẳn ~2.4m → không còn cắt ngang đầu/đuôi xe đang dỡ. Đường cong lấy đà giờ nội suy `LANE_Z → APPROACH_Z` nên vẫn liền mạch khi lùi vào bến.
- **Hàng chờ thoáng hơn**: `waitSlotX` giãn cách 9m (bắt đầu -49) và `STAGING_Z = 18`; 8 slot vẫn nằm gọn trên sân.
- **Dọn "bánh xe trên đường"**: 3 xe máy nhân viên (khối hộp mỏng + bánh trơ) được dựng lại thành xe máy đúng hình (thân, yên, đầu xe, ghi-đông, đèn pha) để không còn trông như mấy cái bánh lăn trên đường.
- **Khôi phục số dư khởi điểm**: working copy bị chỉnh tay `cash: 45000000` (không phải thay đổi trong kế hoạch) làm 5 test đỏ; đã trả về `45000`.
- Trạng thái: `tsc` sạch · **35/35 test pass** · `vite build` OK.

