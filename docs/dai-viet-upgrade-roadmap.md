# Đại Việt Logistics — gói asset và phương án mở rộng

## Đã triển khai trong đợt này

- Bộ minh họa game Việt Nam gồm 22 asset PNG nguồn và WebP tối ưu: bốn vai trò nhân sự; bốn loại xe; bảy nhóm hàng hóa; bốn loại kho/công trình; ba bối cảnh vùng miền. Ảnh nền trong suốt dùng ở thẻ tuyển dụng, kho hàng, nâng cấp công trình và bảng chi tiết xe. Ảnh 3D vận hành hiện tại được giữ nguyên để tránh làm chậm vòng lặp mô phỏng.
- Sau 5 chương mở đầu, chiến dịch tiếp tục vô hạn theo ba nhịp: mở tuyến vùng mới, mùa hàng cao điểm, rồi nâng chuẩn công suất/chất lượng. Sáu cung truyện về mùa lúa, cà phê, thủy sản, khu công nghiệp, dệt may và trái cây luân phiên; yêu cầu và thưởng tăng theo từng cung truyện. Có thêm sự kiện vận hành mỗi 6 phút mô phỏng.
- Bảng hợp đồng luôn duy trì tối đa 5 cơ hội đang mở. Khi hợp đồng được giao hoặc quá hạn, hợp đồng đó rời bảng và một đơn mới được sinh; dữ liệu lưu game chấp nhận chương và mã hợp đồng mới.
- Vẫn giữ nguyên năm hợp đồng đầu, nhân vật, ba miền mở đầu và cơ chế kho → phân loại → sản xuất → giao hàng.

## Hướng nâng cấp đề xuất

### Chặng 1 — Nhìn rõ, chạy mượt (đang làm)

Hoàn thiện nhận diện asset Việt; giữ mức chi tiết vừa phải, tránh đưa texture nặng lên mọi vật thể 3D. Dùng hình minh họa trong UI và ưu tiên mesh đơn giản trong cảnh. Theo dõi số xe/pallet đang hiển thị, giới hạn hiệu ứng, dùng LOD/culling cho tài sản ngoài khung nhìn.

### Chặng 2 — Hậu cần có chiều sâu

- Nhiều kho độc lập theo vùng, mỗi kho có sức chứa, cửa bốc dỡ, nhân sự và hàng riêng; điều xe giữa các kho.
- Hợp đồng theo SLA, loại hàng/tiêu chuẩn, tuyến đường, chi phí nhiên liệu, thưởng/phạt và khách hàng có mức độ trung thành.
- Nhân viên có chuyên môn, ca làm, mệt mỏi, đào tạo và phân công cụ thể; xe nâng/băng chuyền tạo nút thắt năng suất để người chơi phải cân bằng.
- Luồng hàng thành state machine rõ ràng: nhận → chờ vị trí → phân loại → lưu kho → đóng gói → chờ xe → giao. Hàng không tự dịch chuyển xuyên cảnh; luôn có đích đến và thời gian di chuyển.

### Chặng 3 — Đế chế và cốt truyện dài hạn

- Các cung truyện theo mùa vụ Việt Nam và vùng nguyên liệu (lúa, cà phê, trái cây, thủy sản), đối tác/nhân vật quay lại và lựa chọn đầu tư.
- Mở trung tâm vùng, tuyến liên tỉnh, hợp đồng chuỗi cung ứng và sự kiện thị trường ngẫu nhiên có thể bật/tắt.
- Thành tựu, danh tiếng theo ngành, mục tiêu tập đoàn và chế độ di sản/prestige để chơi lại với phần thưởng lâu dài.

## Tài sản và nguồn

- `public/assets/*.webp` — 23 ảnh tối ưu (22 asset mới + tranh truyện), tổng khoảng 0.7 MB.
- Các file `.png` và `.jpg` cùng tên được giữ lại làm nguồn chất lượng cao.

Prompt tạo asset mới đều mô tả game render low-poly 3D, nhận diện kho vận Việt Nam, nền trong suốt, không chữ/logo; chúng được sinh riêng từng ảnh để dễ thay thế và nén/atlas hóa sau này.
