# Rà soát bản mở rộng Quá khứ / Hiện tại

## Phạm vi

Bản này vào thẳng cảnh 360°, thay cụm điều khiển tối màu bằng bề mặt giấy ngà và chữ Newsreader. Biểu tượng sách được bỏ khỏi thanh điều khiển. Nút chữ **Tư liệu** mở nguồn, ngày chụp và giới hạn phục dựng. Giao diện không dùng nhãn “AI generated”, “made by AI” hoặc cách ghi tương tự theo yêu cầu của chủ dự án.

Quá khứ gồm tám cảnh 360° và ba ảnh tư liệu; Hiện tại gồm hai cảnh 360° và sáu ảnh tư liệu. Bốn cảnh mới mở rộng từ ảnh có nguồn: hai không ảnh năm 1967 và hai ảnh di tích năm 2018. Chín JPEG tham chiếu giữ nguyên byte tải về. Niên đại ảnh hiển thị bên tên cảnh; “Hiện tại” không ngụ ý ảnh chụp năm 2026.

Các nút lên, xuống, trái, phải điều khiển hướng nhìn. Album hỗ trợ phóng, kéo, chụm hai ngón tay và đặt lại ảnh. Liên kết `#scene=id` chọn đúng thời kỳ và bộ sưu tập; mỗi bộ sưu tập nhớ mục vừa xem. Điều hướng bàn phím, trình chiếu, toàn màn hình, bảng nguồn và xử lý lỗi dùng chung giữa các chế độ.

## Dữ liệu và hình ảnh

- Hồ sơ [ảnh và các bản mở rộng](photograph-provenance.json) ghi tác giả, URL nguồn, giấy phép, niên đại, prompt, kích thước và SHA-256.
- [Ghi công ảnh nguồn](../public/photographs/ATTRIBUTION.md) và [ghi công bốn bản mở rộng](../public/scenes/ATTRIBUTION.md) đi kèm tài nguyên công khai. Bản mở rộng giữ giấy phép CC BY-SA của ảnh làm căn cứ.
- Ảnh nguồn năm 1967 không được gán thành ảnh trận chiến năm 1972. Phiếu sân bay và ảnh cầu Hiền Lương được ghi rõ là các địa điểm riêng, ngoài Thành cổ.
- Các texture được nâng từ 1774 × 887 lên 7096 × 3548 bằng Real-ESRGAN x4plus, tile 128, đệm vòng ngang 64px, WebP chất lượng 88. Đây không phải độ phân giải chụp gốc; tăng kích thước không bổ sung chứng cứ lịch sử.
- Không thay đổi màu ảnh nguồn hoặc đặt lớp sepia, hạt giả, lớp phủ màu lên cảnh. Phần ngoài khung ảnh gốc không có kiểm chứng địa hình; cả chi tiết nằm trong khung gốc cũng có thể thay đổi khi phục dựng.

Hai đường nối phía sau của các panorama năm 1967 đã được sửa: dịch vòng ngang texture rộng 1774 px một đoạn 887 px, ghép dải ảnh dựng rộng 400 px ở giữa và hòa biên 64 px mỗi phía. Các cột 200 đến 1573 của bản dựng gốc ở độ phân giải ban đầu được giữ nguyên chính xác; điều này không xác nhận độ trung thực với ảnh tư liệu chụp gốc. Vết cắt lớn phía sau cảnh nhìn Đông Bắc đã được loại bỏ; cảnh nhìn phía Nam vẫn còn một đường nối mờ theo bờ ruộng, nên không mô tả ảnh là hoàn toàn liền mạch. Hai bản cuối đã được nâng lên 7096 × 3548 và kiểm tra lại bốn hướng trong trình xem mặt cầu.

## Kiểm tra giao diện

Hai lượt kiểm tra bố cục tại 1440 × 960, 393 × 852, 320 × 568 và 844 × 390, với cảnh cũ, cảnh không ảnh, cảnh hiện tại, album và bảng tư liệu/hướng dẫn. Lượt đầu phát hiện tên dài sát khung ảnh khi xoay ngang và dải hai ảnh bị kéo giãn. Đã cho khung ảnh bám theo chiều cao tiêu đề và giới hạn dải ảnh theo số mục. Lượt xác nhận không có tràn ngang, nút nằm ngoài màn hình hoặc chồng lấn giữa tiêu đề và ảnh. Các nút chính đạt tối thiểu 44 × 44px.

Độ tương phản trên nền giấy `#e9ddc5`: mực chính `#362d22` **10,04:1**; chữ phụ `#6b5947` **4,96:1**; đỏ nâu `#754337` **5,97:1**. Liên kết nguồn có gạch chân và lựa chọn có viền, không chỉ dùng màu để phân biệt.

Impeccable detect đã chạy một lần sau sửa giao diện. Công cụ nêu cảnh báo khai báo phông và các khuyến nghị thang chữ/màu so với hồ sơ thiết kế. Newsreader, Be Vietnam Pro dự phòng và sắc giấy lồng là các lựa chọn đã ghi trong DESIGN.md; hồ sơ sidecar Impeccable cũ chưa được tái tạo trong công việc này. Đây không phải kết quả “detector không có cảnh báo”.

## Kiểm thử chức năng

Lượt đầu có 36 kiểm thử Playwright đạt trên máy tính và điện thoại. Rà soát mã bổ sung phát hiện hai lỗi: tải ảnh hoàn thành sau thời hạn có thể báo thành công khi vẫn đang hiện lỗi; tiêu đề bảng câu chuyện có thể cũ khi dùng nút Back. Đã vô hiệu hóa lượt tải thất bại và cập nhật tiêu đề theo cảnh, bổ sung kiểm thử hồi quy cho cả hai.

Lượt npm test cuối do tác nhân chính giám sát kết thúc với mã 0: 42 kiểm thử đạt trong 2,6 phút. Gemini 3.8 Flash hoàn thành riêng một lượt build và 8 kiểm thử mục tiêu trong 10,9 giây. Hai lần chạy toàn bộ bộ kiểm thử do Gemini khởi động bị dừng khi phiên in của agy đóng; không tính hai lần đó là kết quả kiểm thử.

Chín ảnh nguồn và bốn panorama mới đã được đối chiếu SHA-256 với hồ sơ xử lý. Quy trình [Verify and publish tour](https://github.com/yuri-enjoyer123/mua-do-360/actions/workflows/pages.yml) chạy lại bộ kiểm thử trước khi xuất bản GitHub Pages.

## Antislop

| Cổng | Kết quả trong phạm vi đã kiểm tra | Căn cứ |
| --- | --- | --- |
| Hard-Fail | Đạt về nội dung và bề mặt | Vào thẳng cảnh; không có hero, số liệu quảng bá hoặc lời nhân chứng tự đặt. Ngày ảnh và giới hạn phục dựng giữ trong tư liệu. |
| Purpose | Đạt | Khung giấy, serif và đường kẻ phục vụ yêu cầu cổ kính; mũi tên đổi hướng thực; không có kính mờ, gradient hay hiệu ứng hạt. |
| Liveliness | Đạt | ENERGY 1 / RHYTHM 2 / MOTION 1; ảnh là trọng tâm, đỏ nâu dành cho điều hướng, phần đọc có nhịp chữ và khoảng cách riêng. |
| Craftsmanship | Đạt trong phạm vi đã kiểm tra | Bố cục, tương phản và 42 kiểm thử chức năng đã đạt. Hai ảnh sửa đường nối đã được nâng nét, đối chiếu mã băm và xem lại trong mặt cầu; giới hạn còn lại được ghi ở trên. |

Không kiểm thử kính VR vật lý; ứng dụng chưa triển khai WebXR. Kiểm thử trình duyệt dùng Chromium và SwiftShader, không đại diện cho mọi GPU hoặc trình duyệt trên điện thoại.
