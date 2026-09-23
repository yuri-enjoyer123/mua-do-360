# Diện mạo theo thời kỳ

## Phạm vi và hướng đã chọn

Chủ dự án yêu cầu ảnh Quá khứ mờ, bạc và nhiễu hơn, giao diện Quá khứ giống website cũ, giao diện Hiện tại hiện đại. Yêu cầu viết mã trực tiếp và chỉ dùng Antigravity cho việc nhỏ tiếp tục áp dụng.

- THESIS: nhìn vào giao diện và chất ảnh có thể phân biệt hai thời kỳ ngay.
- OWN-WORLD: Quá khứ là trình xem web cổ điển, giấy ngà, chữ có chân, viền nổi và thanh tiêu đề đỏ nâu. Hiện tại là trình xem ảnh trắng, chữ sans, nút xanh trầm và góc bo nhẹ.
- STORY: giữ toàn bộ nội dung, nguồn, niên đại, giấy phép và các chế độ xem hiện có.
- FIRST VIEWPORT: vào thẳng panorama; các nút thời kỳ, kính VR, máy ảnh, góc nhìn và dải cảnh làm việc ngay. Trên điện thoại, Hiện tại gộp các bộ chọn vào một hàng.
- FORM: Impeccable seed `d3563e01`; yêu cầu cụ thể về hai phong cách của chủ dự án quyết định diện mạo. Không có ảnh thiết kế được dùng làm hợp đồng bố cục. ENERGY 1 / RHYTHM 2 / MOTION 1.

## Phân công ở bước đổi diện mạo

Tác nhân chính thiết kế, viết CSS, tích hợp, cập nhật tài liệu và kiểm tra trình duyệt. Gemini 3.8 Flash qua Antigravity chỉ làm hai phần nhỏ: chỉ ra các kiểm thử hiện có cần chạy và nhận xét tám ảnh chụp panorama của hai thời kỳ ở bốn kích thước. Không giao phần triển khai hoặc quyết định thiết kế cho Gemini.

Nhận xét hình ảnh trả verdict `ship`, không có sửa chữa thị giác cần thiết trong tám ảnh đã xem. Đây là đánh giá ảnh chụp, không phải chứng nhận hành vi hoặc nguồn lịch sử; các phần đó do tác nhân chính kiểm tra bằng trình duyệt và diff. Kiểm tra bổ sung bằng số cho thấy cạnh tối của nút cổ cần tăng tương phản; đã đổi thành `#7c715f`, đạt 3,25:1 so với nền giấy.

## Xác minh

- TypeScript và Vite build đạt.
- 12 kiểm thử hiện có đạt: khôi phục cảnh theo thời kỳ, phóng/kéo/reset album, giữ nguồn và niên đại, ảnh nguồn không có bộ lọc, bố cục và vùng bấm màn hình ngang thấp, nguồn và giới hạn phục dựng, tài nguyên và dung lượng tải ban đầu.
- Kiểm tra riêng hai thời kỳ ở 1440 × 960, 390 × 844, 320 × 568 và 844 × 280: không tràn ngang; các nút chính ít nhất 44 × 44px, nằm trong màn hình và không bị phần tử khác che tâm vùng bấm; không có lỗi JavaScript.
- Kiểm tra cả panorama, album và bảng nguồn ở máy tính/điện thoại. Hiệu ứng Quá khứ chỉ nằm trên ảnh trong trình xem và ảnh thu nhỏ; chữ và ảnh đối chiếu không có bộ lọc. Hiện tại không nhận lớp hạt hoặc bộ lọc ảnh cũ.
- Tương phản chữ phụ: Quá khứ 4,78:1, Hiện tại 6,19:1. Chữ/biểu tượng trên nền đang chọn: Quá khứ 8,06:1, Hiện tại 7,59:1. Viền thẻ ảnh Hiện tại: 3,11:1.
- Không sửa tệp ảnh, dữ liệu cảnh, nguồn, niên đại hoặc giấy phép. Phong cách ảnh cũ không được dùng để gán cảnh sang thập niên 1990.

Ảnh chụp và số đo nằm ở `.impeccable/review/eras/`, được giữ cục bộ và loại khỏi Git. Bộ kiểm thử đầy đủ của GitHub Actions tiếp tục là bước bắt buộc trước khi phát hành.

## Anti Slop Delivery Gate

- Hard Gate PASS: điều hướng, trạng thái và dữ liệu lịch sử giữ nguyên; chữ và biểu tượng đạt tương phản cần thiết, vùng bấm 44px, không tràn ở bốn kích thước đã kiểm tra. Build và 12 kiểm thử liên quan đạt; kiểm tra ảnh chụp đã thực hiện.
- Purpose-Gate PASS: hạt ảnh và độ mờ phục vụ yêu cầu chất ảnh cổ; viền nổi phục vụ phong cách website cũ; phông sans, bề mặt trắng và các cụm bo nhẹ phân biệt Hiện tại. Không thêm huy hiệu, phần giới thiệu, tính năng hoặc dữ kiện trang trí.
- Liveliness PASS: mỗi thời kỳ có màu, chữ và hình dáng điều khiển nhất quán; cảnh vẫn là nội dung chính. Dials ENERGY 1 / RHYTHM 2 / MOTION 1 được giữ trong DESIGN.md.
- Craftsmanship & Quality Locks PASS: hai theme phủ cả panorama, album, bảng tư liệu và trạng thái; nguồn không bị làm cũ; bộ lọc có seed cố định, không nhấp nháy; các nút kính VR/máy ảnh giữ tên trợ năng. DESIGN.md và sidecar ghi lại hệ thống mới đã được yêu cầu. Hook không báo lỗi thiết kế xác định trong stylesheet mới.

Ngoại lệ phông `Be Vietnam Pro` hiện có được cập nhật lý do: phông này nay là chữ chính của Hiện tại trong hệ thiết kế hai thời kỳ được yêu cầu. Không tắt quy tắc hoặc thêm ngoại lệ rộng.

## Nâng trải nghiệm nhập vai

Sau bước đổi diện mạo, chủ dự án chọn nâng cả giao diện và trải nghiệm, ưu tiên nhập vai. Hai phong cách giữ nguyên; MOTION tăng lên 2 để thể hiện chuyển cảnh có kiểm soát.

- Nút con mắt mở Ngắm cảnh, thu gọn giao diện và ẩn các dấu điều hướng trong ảnh. Thanh nhỏ giữ tự xoay, điều khiển điện thoại khi được hỗ trợ, âm thanh và nút Trở lại. Escape/P và bàn phím tiếp tục hoạt động.
- Tự xoay chỉ chạy khi bật, dừng khi người xem thao tác, chuyển cảnh, mở tư liệu, ẩn tab hoặc thoát. Cài đặt giảm chuyển động tắt tự xoay và chuyển cảnh.
- Cảm biến xin quyền theo thao tác của người xem, hiệu chỉnh theo góc đang xem và có thông báo khi bị từ chối hoặc không nhận dữ liệu. Three.js chỉ tải khi bật chức năng này; việc tắt cũng hủy yêu cầu đang chờ, listener và khung hình đã lên lịch.
- Hai panorama cùng thời kỳ chuyển bằng ảnh chụp khung nhìn giới hạn 1280 × 960 px và dissolve 420 ms. Chuyển giữa Quá khứ/Hiện tại hoặc giữa panorama/album không chồng ảnh lên nhau. Ảnh đầu tiên hiện trong 320 ms.
- Âm thanh nền stereo có bộ đệm 12 giây và chuyển sắc độ theo cảnh sông/hào hoặc mặt đất. Âm thanh vẫn tắt mặc định và được mô tả đúng là mô phỏng trong hướng dẫn.
- Sửa lỗi đóng bảng tư liệu có thể lấy lại focus sau khi người xem đã chuyển tới nút khác.

Tác nhân chính triển khai toàn bộ. Ba việc nhỏ giao Gemini qua Antigravity: kiểm tra tính di động của bản dựng tĩnh, đối chiếu API Pannellum trong mã thư viện đã cài, và rà soát vòng đời điều khiển cảm biến. Đã thu đủ kết quả. Pannellum không dọn listener cảm biến khi destroy nên phần điều khiển điện thoại dùng vòng đời riêng; tác nhân chính quyết định và kiểm chứng cách tích hợp.

Xác minh cục bộ của bước này:

- Build TypeScript/Vite đạt. 13 kiểm thử nhập vai đạt; 3 kiểm thử cảm biến bỏ qua có chủ đích ở cấu hình desktop. Sau tối ưu bộ nhớ chuyển cảnh, cả 4 ca chuyển cảnh/âm thanh liên quan đạt lại.
- 6 ca focus, bảng tư liệu và trình chiếu đạt. Ảnh chuyển cảnh được kiểm tra có dữ liệu pixel thực, tránh chụp một canvas WebGL trống.
- 8 tổ hợp thời kỳ/kích thước (1440 × 960, 390 × 844, 320 × 568, 844 × 280) đạt kiểm tra tràn, vùng bấm, che khuất, mở/thoát Ngắm cảnh và lỗi JavaScript. Đã xem 16 ảnh chụp; không phát hiện lỗi thị giác cần sửa. Bằng chứng cục bộ: `.impeccable/review/immersion/`.
- Quyền và dữ liệu cảm biến đã kiểm tra bằng trình duyệt mô phỏng. Chưa kiểm tra trên điện thoại vật lý.
- Dữ liệu lịch sử và ảnh nguồn không thay đổi. Build được giữ tương thích cả ChatGPT Sites và GitHub Pages; toàn bộ suite của GitHub Actions vẫn phải đạt trước khi phát hành.

Delivery Gate của bước nhập vai: Hard Gate PASS với kiểm tra cục bộ trên; Purpose-Gate PASS vì chuyển cảnh giữ hướng nhìn và Ngắm cảnh nhường không gian cho ảnh; Liveliness PASS với hai diện mạo và dials ENERGY 1 / RHYTHM 2 / MOTION 2; Craftsmanship & Quality Locks PASS với điều khiển hoạt động, giảm chuyển động, giới hạn bộ nhớ, dọn cảm biến và bảo toàn nguồn lịch sử. Kết quả CI và kiểm tra bản trực tuyến được ghi trong lịch sử phát hành, không suy diễn từ kiểm tra cục bộ.
