# Giao diện vào thẳng cảnh 360°

Chủ dự án yêu cầu bỏ màn giới thiệu, logo, nhãn địa điểm, chữ trang trí và thanh thông báo thường trực; xác nhận giữ điều hướng cùng một nút thông tin gọn.

## Quyết định

- Cảnh mở ngay để người xem có thể kéo hoặc vuốt mà không qua bước bắt đầu.
- Màu điều khiển và phông đang dùng được giữ để việc tinh gọn không trở thành một lần thay nhận diện.
- Thanh chọn cảnh giới hạn chiều rộng trên máy tính; trên điện thoại, ảnh đang chọn tự cuộn vào vùng nhìn thấy.
- Ảnh thu nhỏ đại diện cho các điểm đến thật trong tour. Chúng có cùng vai trò, không phải các thẻ quảng bá.
- Các biểu tượng chỉ dành cho thao tác: thu/phóng, đặt lại, toàn màn hình và đọc thông tin.
- Nguồn lịch sử, giới hạn ảnh AI, hướng dẫn, âm thanh và trình chiếu mở từ bảng thông tin.
- Không sửa nội dung dữ kiện hoặc tạo lại panorama trong lần tinh gọn này.

## Skill đã dùng

`find-skills` để rà bộ skill hiện có; `impeccable init` để ghi PRODUCT.md và mặc định viết mã trực tiếp; `impeccable distill` cùng các kiểm tra phù hợp từ `antislop-ui`, `antislop-human`, `antislop-layoutmobile`. Gemini qua `agy` hỗ trợ rà phụ thuộc, dọn CSS, cập nhật kiểm thử và kiểm tra bản thay đổi.

## Kiểm tra phạm vi thay đổi

| Nhóm | Kết quả | Bằng chứng |
| --- | --- | --- |
| Nội dung và cấu trúc | PASS | Màn giới thiệu, header, nhãn địa điểm và footer thường trực đã bị xóa khỏi DOM. Dữ kiện và tài sản ảnh không đổi. |
| Mục đích của phần tử | PASS | Năm nút trên cảnh đều có thao tác; ảnh thu nhỏ chuyển đến một trong bốn điểm; phần đọc mở khi người xem yêu cầu. |
| Bố cục và mức độ chuyển động | PASS | Cảnh là tiêu điểm; không thêm hiệu ứng tự chạy, nhãn quảng bá hoặc minh họa trang trí. Bốn kích thước màn hình không có tràn ngang hoặc chồng hai thanh điều khiển. |
| Chạm và bàn phím | PASS | Năm nút điều khiển đo được 44 × 44 px ở 1440 × 960, 412 × 839, 320 × 568 và 844 × 390. Escape đóng bảng và trả focus về nút thông tin. |
| Độ tương phản phần đọc | PASS | Kiểm tra công thức WCAG bằng contrast-check.py: chữ nội dung trên nền bảng đạt 10.14:1; chữ thông báo đạt 11.52:1. |
| Tương tác | PASS | Đã chạy thu/phóng/đặt lại, vào/thoát toàn màn hình, trước/sau, nguồn/câu chuyện, hướng dẫn, âm thanh bật/tắt và trình chiếu. |
| Lỗi và điều hướng | PASS | 22 kiểm thử trên Chromium máy tính và điện thoại mô phỏng: canvas, bốn cảnh, hash, lịch sử, tải lại ảnh lỗi, thiếu WebGL và kéo/chạm/bàn phím. |
| Kiểm tra tài sản | PASS | Không có ảnh hỏng trong bốn kích thước. Detector báo ảnh xem trước thiếu src tĩnh; đã bổ sung URL của cảnh hiện tại ngay trong markup. |

Kiểm tra hình ảnh thực hiện trong một lượt gộp và một lượt xác nhận sau sửa. Giới hạn độ nét, vùng nối của panorama và việc chưa hỗ trợ kính WebXR vẫn như README đã nêu.
