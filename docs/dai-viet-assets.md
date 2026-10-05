# Đại Việt Logistics — asset & hướng dẫn

Ảnh chương truyện: `public/assets/dai-viet-story.webp` (bản giao diện tối ưu), bản JPG/PNG gốc được giữ làm nguồn.

Prompt đã dùng: Use case: stylized-concept. Asset type: wide game chapter illustration for a Vietnamese logistics empire management game. Scene: a small modern warehouse in Binh Duong Vietnam growing into an industrial logistics campus, local blue cargo trucks, yellow forklifts, workers wearing teal uniforms and orange safety vests and helmets, pallets of rice sacks and coffee cartons, coconut trees and tropical greenery, red Vietnamese flag with a single yellow star at the gate, a visible automated conveyor sorter and modest factory workshop. Style: polished soft 3D isometric diorama game art, warm sunlight, jade green / cream / ochre palette, inviting and detailed but clean. Landscape composition, no UI, no readable text, no logos or watermark. This illustration will be used in a story management panel for the Vietnamese warehouse simulation.

Các asset vận hành được dựng bằng mesh 3D trong `VietnamIndustry.tsx`: nhân viên có tay/chân chuyển động, dây chuyền với hàng chạy qua máy quét và các làn phân loại, xưởng đóng gói, bảo vệ, xe máy, cột cờ. Không dùng ảnh tĩnh thay cho mô phỏng.

Thư viện minh họa game UI mới (PNG gốc và WebP tối ưu, nền trong suốt):

- Nhân sự: `worker-vietnam.png`, `staff-driver.png`, `staff-sorter.png`, `staff-technician.png`.
- Phương tiện: `truck-vietnam.png`, `truck-reefer.png`, `truck-container.png`, `forklift-vietnam.png`.
- Công trình/địa phương: `warehouse-vietnam.png`, `warehouse-hub.png`, `warehouse-factory.png`, `warehouse-port.png`, `hub-countryside.png`, `hub-highlands.png`, `hub-coast.png`.
- Hàng hóa: `goods-rice.png`, `goods-coffee.png`, `goods-electronics.png`, `goods-fruit.png`, `goods-seafood.png`, `goods-garments.png`, cùng `cargo-vietnam.png` làm bảng tổng hợp.

Ảnh tải trễ trong các panel, không được mount đồng loạt lên canvas lúc vào game để giữ màn hình đầu nhẹ.

Biển hiệu và nhãn tiếng Việt được vẽ tại chỗ bằng `WorldLabel.tsx`, dùng font hệ thống. Không tải font từ dịch vụ ngoài hoặc chặn cảnh 3D khi mạng chậm.

Chu kỳ: nhập pallet theo nhóm gạo / cà phê / linh kiện → phân loại → 2 pallet đã phân loại thành 1 pallet thành phẩm → hợp đồng xuất hàng → xe rời bãi → thanh toán.

Các chi nhánh hiện dùng chung vốn, hàng và đội ngũ. 180 giây mô phỏng là một ca lương. Tiến trình lưu trên trình duyệt, không chạy tiếp khi trang đóng.
