# Rà soát bản sáu cảnh

Đây là báo cáo của bản sáu cảnh trước lần nâng nét. Kích thước ảnh và kết quả kiểm tra mới được ghi trong [báo cáo chất lượng ảnh](image-quality.md).

Yêu cầu: cảnh lịch sử chân thực hơn, thêm điểm nhìn, giảm cảm giác hình AI và tạo sắc thái hoài niệm. Giữ vào thẳng 360°, giao diện gọn, nội dung lịch sử có nguồn và triển khai miễn phí.

## Nội dung và hình ảnh

| Yêu cầu | Kết quả và bằng chứng |
| --- | --- |
| Thêm cảnh | PASS: `luy-bac` và `pho-cu` đã có panorama, ảnh thu nhỏ, dữ kiện, giới hạn, nguồn, liên kết và phím tắt. Tổng cộng sáu cảnh. |
| Sửa cảnh yếu | PASS: bốn panorama cũ đã thay. Cổng Hậu có một lối vòm nhìn từ ngoài; nội thành có gạch, vữa và gỗ; hào và lũy thể hiện lõi đất. Không đưa công trình tưởng niệm hiện đại vào cảnh. |
| Đối chiếu lịch sử | PASS: đọc hồ sơ Cục Di sản và các ảnh ở trang 127–128 của ấn phẩm USMC; kiểm tra chéo vật liệu với Cục Du lịch. Cảnh phố được ghi là hậu quả giao tranh, không gán cho tháng 6–8 hoặc một con phố đã đo dựng. Chi tiết và nguồn nằm trong `historical-notes.md`. |
| Kiểm tra toàn cảnh | PASS trong phạm vi minh họa: đã quan sát sáu ảnh equirectangular đầy đủ và 24 ảnh chụp từ trình xem, bốn hướng mỗi cảnh. Một lượt kiểm tra độc lập không thấy lỗi nối lớn, kết cấu lơ lửng hay chi tiết sai niên đại rõ ràng. |
| Tư liệu thật | PASS: bản đồ AMS/NARA đã mở được trong bảng nguồn, liên kết đến hồ sơ và bản gốc; niên đại in trên bản đồ và khoảng hồ sơ được ghi riêng. Quyền sử dụng có trong `public/archive/ATTRIBUTION.md`. Không sao chép ảnh chiến tranh chưa xác minh quyền. |
| Giảm cảm giác AI | PASS về các thay đổi có thể đối chiếu: bỏ ám xanh, kính mờ và hào quang; thay chất liệu đá chung chung bằng gạch, vữa và đất; ảnh thu nhỏ xuất từ phối cảnh của trình xem. Không áp dụng lớp sepia hay vết xước giả lên ảnh. |

Độ nét khi phóng gần vẫn bị giới hạn bởi nguồn 1774 × 887. Các góc đứng, thời tiết, hình dạng hư hại và phần khuất chưa được xác minh bằng tư liệu cùng thời. Nhận xét về sự hợp lý của hình không biến ảnh AI thành bằng chứng hoặc mô hình khảo cổ. Đây là giới hạn được công bố, không phải một tuyên bố đã phục dựng chính xác năm 1972.

## Giao diện và khả năng sử dụng

Một lượt kiểm tra gộp và một lượt xác nhận trên bản production ở 1440 × 960, 412 × 839, 320 × 568 và 844 × 390. Các tệp kiểm tra trong phiên làm việc nằm tại `/tmp/mua-do-nostalgia` và `/tmp/mua-do-nostalgia-final`.

| Kiểm tra | Kết quả |
| --- | --- |
| Bố cục | PASS: không tràn ngang, không chồng thanh điều khiển lên thanh chọn cảnh, mục đang chọn nằm trong vùng cuộn nhìn thấy ở cả bốn kích thước. |
| Vùng chạm và focus | PASS: năm nút chính đều 44 × 44px; Escape đóng bảng, trả focus về nút thông tin. Mục bản đồ mở được bằng Enter. |
| Tương phản | PASS bằng `contrast-check.py`: chữ chính trên giấy 11.39:1; chữ phụ 5.27:1; liên kết 5.65:1; chữ trên điều khiển 13.32:1; chữ phụ trên nền than 5.50:1. |
| Điều khiển cảnh | PASS: kéo chuột/chạm/phím mũi tên làm đổi góc nhìn; thu/phóng làm thay đổi vị trí dấu mốc, đặt lại hoạt động; toàn màn hình vào và thoát được. Dấu chuyển bên phải đưa về bờ sông. |
| Đọc và phụ trợ | PASS: nguồn, câu chuyện, bản đồ, hướng dẫn, nút đóng đều hoạt động. Bật/tắt âm thanh làm tăng/giảm gain thực tế của AudioContext. Trình chiếu đóng bảng, ẩn điều hướng, thoát khôi phục điều khiển. |
| Trạng thái khó | PASS: lỗi ảnh có thử lại, thiếu WebGL vẫn đọc được, chuyển nhanh giữ cảnh mới nhất, liên kết sai trở về cảnh hợp lệ, lịch sử trình duyệt hoạt động. |
| Tài nguyên | PASS: không ảnh hỏng hoặc lỗi JavaScript trong bốn kích thước; tải đầu dưới giới hạn 5MB. Bản đồ được nén còn khoảng 273KB. |
| Kiểm thử | PASS: `npm test`, 26 kiểm thử trên Chromium máy tính và điện thoại mô phỏng. |

## Cổng kiểm tra antislop

- Hard Gate PASS: không lời chứng, số liệu quảng bá, tính năng hoặc chứng nhận tưởng tượng; nguồn và nội dung diễn họa tách rõ. Không có màn quảng bá hay điều khiển chết. Kiểm tra bàn phím, lỗi tải, tràn và độ tương phản có bằng chứng ở trên. Ảnh được tạo theo yêu cầu trực tiếp của chủ dự án.
- Purpose Gate PASS: nền giấy dành cho phần đọc, nền than để thao tác rõ trên ảnh, màu đất nung đánh dấu lựa chọn. Hình tròn chỉ dành cho dấu chuyển trong cảnh. Bản đồ có nguồn gốc thật và chức năng đối chiếu. Không trang trí bằng kính mờ, hào quang, lưới hoặc chữ cách xa.
- Liveliness PASS: ENERGY 1 / RHYTHM 2 / MOTION 1; cảnh là điểm tập trung, nhịp đọc theo nội dung, một màu nhấn và giọng chữ Newsreader lặp lại ở tiêu đề/chú thích. Hướng lịch sử và hoài niệm được chủ dự án chỉ định trước khi làm.
- Craftsmanship PASS: sáu điểm đều có nội dung và chức năng; bảng nguồn phục vụ việc đọc, thanh ảnh phục vụ chọn cảnh. Các trạng thái, kích thước, phím và thao tác đã chạy thực tế. `DESIGN.md` cùng `.impeccable/design.json` ghi lại hệ thống đang dùng.

Detector không báo lỗi chặn. Các cảnh báo dạng advisory về biến thể màu, cỡ chữ và góc bo đã được đối chiếu với CSS; thang chữ, màu bề mặt và góc bo được bổ sung vào DESIGN.md. Độ trong suốt của bóng và nền che là mức độ sâu, không phải một bảng màu mới.

Gemini qua `agy` hỗ trợ rà giả định số cảnh, sửa CSS, bổ sung kiểm thử và cập nhật tài liệu. Bản sửa đã được đọc lại; cách dịch sai thuật ngữ giao diện và cách ghi niên đại bản đồ đã được sửa trước khi phát hành. Kiểm tra lịch sử và quyết định bàn giao do tác nhân chính thực hiện, có một lượt rà hình độc lập.
