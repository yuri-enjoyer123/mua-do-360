# Mưa đỏ 360°

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Người xem hành trình 360° phục vụ việc giới thiệu và tìm hiểu tiểu thuyết Mưa đỏ của Chu Lai. Trải nghiệm chạy trên trình duyệt máy tính và điện thoại.

## Product Purpose

Cho người xem khám phá không gian Quảng Trị được minh họa bằng panorama, đồng thời tiếp cận tư liệu lịch sử liên quan đến bối cảnh tác phẩm. Thành công là mở được cảnh, nhìn quanh, chuyển điểm và tìm được căn cứ cho phần thuyết minh.

## Operating Context

Dự án đã chạy bằng Vite, TypeScript và Pannellum. Mã nguồn và tài nguyên nằm trong repository này; GitHub Actions kiểm thử và xuất bản lên GitHub Pages miễn phí. Không cần tài khoản người xem hoặc API AI khi sử dụng trang.

## Capabilities and Constraints

- Sáu điểm nhìn: bờ Thạch Hãn (`thach-han`), hào và tường thành (`hao-thanh`), quanh Cổng Hậu (`cong-hau`), lũy đất phía Bắc (`luy-bac`), bên trong Thành cổ (`noi-thanh`), và phố sau chiến sự (`pho-cu`).
- Điều khiển bằng chuột, chạm và bàn phím (phím tắt 1–6 chọn điểm nhìn); hỗ trợ liên kết trực tiếp (deep links) đến từng cảnh, toàn màn hình và trình chiếu.
- Trạng thái lỗi ảnh hoặc WebGL phải có lối thử lại, chuyển cảnh và đọc nội dung.
- Không bịa sự kiện lịch sử, tọa độ công sự hoặc vị trí nhân vật tiểu thuyết.
- Phân biệt dữ kiện có nguồn, chi tiết AI minh họa và liên hệ văn học.
- Không đưa công trình tưởng niệm hiện đại vào lớp cảnh năm 1972.
- Âm thanh tổng hợp mặc định tắt. Tour trình duyệt hiện chưa có WebXR cho kính VR và không dựa trên khảo sát thực địa đo đạc chính xác.
- Yêu cầu cập nhật của chủ dự án: bỏ màn giới thiệu, logo, nhãn địa điểm và các thanh chữ trang trí được đánh dấu trong ảnh phản hồi; không bắt người xem đi qua một trang quảng bá trước khi vào cảnh.
- Khi mở trang, vào thẳng cảnh 360°, không có màn giới thiệu. Chỉ giữ điều hướng và nút thông tin gọn. Bảng tư liệu nền giấy ấm và điều khiển màu than trầm tạo cảm giác hoài niệm theo yêu cầu của chủ dự án.
- Bản đồ AMS (NAID 74797754) được nhúng trong bảng nguồn. Chú giải ghi thông tin đến năm 1968, hồ sơ lưu trữ ghi khoảng 1942–1972; không khẳng định nguyên trạng năm 1972.
- Ứng dụng không tái xuất bản ảnh tư liệu chiến tranh; ảnh lưu trữ chỉ dùng làm tài liệu tham khảo nội bộ.

## Evidence on Hand

- `src/content.ts`: nội dung từng cảnh, nguồn Cục Di sản văn hóa, TTXVN, MTTQ Quảng Trị, Cục Du lịch, USMC và phỏng vấn tác giả.
- `docs/historical-notes.md`: căn cứ, giới hạn diễn họa và chi tiết sai niên đại cần loại trừ; liên kết Commons cho bản đồ AMS NARA (NAID 74797754).
- `public/scenes/`: panorama AI và ảnh thu nhỏ. Ảnh nguồn 1774 × 887 được nâng lên 7096 × 3548 bằng Real-ESRGAN; không phải ảnh gốc 7K, ảnh tư liệu hoặc phục dựng khảo cổ đo đạc. Chi tiết nhỏ do mô hình suy đoán không bổ sung bằng chứng lịch sử. Không có WebXR.
- `docs/asset-prompts-v2.json`: nguồn gốc và yêu cầu tạo hình cho 6 cảnh.
- Kịch bản do chủ dự án cung cấp dùng làm bối cảnh riêng. Không công bố đường dẫn tài liệu riêng, thông tin học sinh hoặc toàn văn tiểu thuyết.

## Product Principles

1. Cảnh là nội dung chính; thao tác điều hướng không nên bị chặn bởi phần giới thiệu.
2. Nhận định lịch sử cần nguồn có thể đối chiếu; hình ảnh minh họa không tạo thêm bằng chứng.
3. Giữ nội dung và cách điều khiển sử dụng được trên máy tính, điện thoại và bàn phím.
4. Duy trì triển khai miễn phí và không phụ thuộc dịch vụ AI khi người xem mở trang.
