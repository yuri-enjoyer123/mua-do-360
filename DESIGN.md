---
name: Mưa đỏ 360°
description: Không gian lịch sử, trình bày như tập bản thảo in cổ và album ảnh tư liệu.
colors:
  ivory: "#e9ddc5"
  ink: "#362d22"
  muted: "#6b5947"
  oxblood: "#754337"
  page-base: "#e9ddc5"
  paper-inset: "#f4ebd9"
  paper-shadow: "0 3px 9px rgba(54,45,34,.16)"
typography:
  body:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "19px"
    mobileFontSize: "18px"
    lineHeight: 1.65
    mobileLineHeight: 1.65
  heading:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "32px"
    fontWeight: 400
    lineHeight: 1.2
  story-heading:
    fontSize: "28px"
  section-heading:
    fontSize: "22px"
  source-heading:
    fontSize: "24px"
  archive-heading:
    fontSize: "21px"
  caption:
    fontSize: "14px"
  source-label:
    fontSize: "12px"
rounded:
  control: "0px"
  card: "0px"
spacing:
  touch-target: "44px"
  hairline: "1px"
  double-rule: "3px double #362d22"
components:
  era-switch:
    backgroundColor: "{colors.ivory}"
    textColor: "{colors.muted}"
    activeBackground: "{colors.oxblood}"
    activeColor: "{colors.ivory}"
  collection-switch:
    backgroundColor: "{colors.ivory}"
    textColor: "{colors.muted}"
    activeBackground: "{colors.oxblood}"
    activeColor: "{colors.ivory}"
  scene-context:
    backgroundColor: "{colors.ivory}"
    textColor: "{colors.ink}"
    borderBottom: "{spacing.double-rule}"
  view-control:
    backgroundColor: "{colors.ivory}"
    textColor: "{colors.ink}"
    activeBackground: "{colors.oxblood}"
    activeColor: "{colors.ivory}"
    gridDesktop: "2 columns x 4 rows"
    gridMobile: "4 columns x 2 rows"
  source-drawer:
    backgroundColor: "{colors.ivory}"
    textColor: "{colors.ink}"
    width: "580px"
---

# Mưa đỏ 360°

## Hướng thiết kế

Mở trang vào thẳng cảnh 360°. Các nút và phần đọc dùng giấy ngà, mực nâu, chữ có chân và đường kẻ mảnh, gợi một tập tư liệu in. Thanh ảnh có khung giấy như những ảnh nhỏ trong album. Về hiển thị hình ảnh, toàn bộ byte ảnh JPEG gốc được giữ nguyên vẹn không đổi và ảnh tham chiếu trong bảng tư liệu (source drawer) không áp bộ lọc. Ở bề mặt hiển thị Quá khứ, toàn cảnh 360°, ảnh trong album và ảnh thu nhỏ được xử lý thang xám đơn sắc, độ mờ nhẹ (blur 0.4px) và hạt tĩnh (static grain); bề mặt hiển thị Hiện tại giữ nguyên màu sắc chân thực. Không áp dụng bộ lọc lên các thành phần giao diện người dùng (thanh điều khiển, nút bấm, chữ viết).

Chủ dự án yêu cầu giao diện cổ hơn, bỏ biểu tượng sách, thêm chuyển Quá khứ / Hiện tại và bốn nút nhìn lên, xuống, trái, phải. Viết mã trực tiếp. ENERGY 1 / RHYTHM 2 / MOTION 1: chuyển động chỉ phục vụ điều hướng, không trang trí.

## Màu và chữ

- Giấy `#e9ddc5`, mực `#362d22`, chữ phụ `#6b5947`, điểm chọn và liên kết `#754337`.
- `#f4ebd9` là sắc giấy sáng hơn cho vùng lồng và trạng thái rê chuột.
- Newsreader là phông chính, được lưu cùng trang; giữ Be Vietnam Pro trong khai báo phông dự phòng. Nội dung đọc 19px / 1.65 trên máy tính, 18px / 1.65 trên điện thoại. Chú thích, niên đại và điều khiển dùng cỡ nhỏ hơn theo vai trò.
- Liên kết nguồn có gạch chân. Màu và đường viền cùng thể hiện lựa chọn; không dựa riêng vào độ đậm của chữ.

## Bố cục và thao tác

Trên máy tính, bộ chuyển thời kỳ ở góc trái trên; bộ chọn cảnh 360° hoặc ảnh tư liệu ở góc phải trên. Tên cảnh và niên đại nằm phía dưới bên trái. Nút chữ `#scene-sources` mở nguồn của cảnh, không có biểu tượng sách.

Tám nút góc nhìn xếp hai cột bên phải. Trên màn hình dọc hẹp, bộ chuyển chế độ thành hai hàng trên, còn tám nút xếp bốn cột, hai hàng phía trên dải ảnh. Màn hình ngang thấp giữ bộ chuyển ở hai góc trên và cụm nút phía phải, trên dải ảnh. Mọi nút giữ vùng chạm ít nhất 44 × 44px, kể cả màn hình ngang.

Dải ảnh cuộn ngang, tên ảnh luôn ở dưới hình. Khung giấy góc vuông và viền đỏ nâu 2px đánh dấu mục hiện tại. Hình thu nhỏ của cảnh 360° lấy từ góc nhìn phối cảnh trong trình xem.

`.photo-viewer` dành khoảng trống cho điều hướng bằng `inset`, cập nhật theo chiều cao thực của tên cảnh. Ảnh `#document-photo` có chiều rộng và cao 100%, dùng `object-fit: contain`, không có padding; bộ điều khiển phóng và kéo toàn bộ ảnh trong khung có `overflow: hidden` và `touch-action: none`. Ảnh nguồn không bị cắt khi ở mức thu phóng ban đầu. Đã kiểm tra bố cục tại 320 × 568, 393 × 852, 844 × 390 và 1440 × 960: không tràn ngang, nút điều khiển nằm trong khung và đạt 44px. Dải ảnh thu gọn theo số mục để bộ sưu tập hai ảnh không bị kéo giãn hết màn hình.

## Bề mặt và trạng thái

Bảng nguồn có khung lề mảnh bên trong, phần nội dung cuộn độc lập và chữ lớn như trang đọc. Bảng hướng dẫn, thông báo tải, lỗi, nút thoát trình chiếu, dấu chuyển cảnh và chú thích đều dùng cùng bề mặt giấy. Dấu chuyển cảnh là nút vuông 44px; chú thích hiện trên máy tính và ẩn trên màn hình hẹp.

Đường viền đơn 1px và đôi 3px chia các phần. Bóng nhẹ lệch xuống tách bề mặt giấy khỏi cảnh. Giao diện (khung giấy, nút bấm, chữ) hoàn toàn không dùng kính mờ, hào quang, gradient hay bộ lọc làm cũ. Toàn bộ 9 ảnh JPEG gốc lưu trữ giữ nguyên byte không đổi, và ảnh tham chiếu hiển thị trong bảng tư liệu (source drawer) không áp bộ lọc. Ở bề mặt hiển thị Quá khứ, toàn cảnh 360°, ảnh xem trong album và ảnh thu nhỏ được áp dụng thang độ xám đơn sắc (grayscale), độ mờ nhẹ (blur 0.4px) và hạt tĩnh (static grain) nhằm phân định rõ với không gian Hiện tại (vẫn giữ màu sắc nguyên bản). Không có màn giới thiệu hay logo.

Vòng focus có độ tương phản rõ trên giấy. Trình chiếu ẩn điều hướng và giữ nút thoát. Lỗi tải cho phép thử lại, chuyển cảnh hoặc đọc tư liệu. Âm thanh mặc định tắt, ghi rõ là mô phỏng. Tôn trọng tùy chọn giảm chuyển động.

## Giới hạn lịch sử và hình ảnh

- Nguồn và giới hạn diễn họa nằm trong bảng tư liệu. Theo yêu cầu của chủ dự án, giao diện không dùng nhãn hoặc lời ghi “AI generated”, “made by AI” hay tương tự; phần đọc giải thích bằng từ “phục dựng” và “mở rộng”.
- Sáu ảnh 360° minh họa ban đầu do AI tạo ở 1774 × 887, được Real-ESRGAN nâng lên 7096 × 3548. Đây không phải ảnh tư liệu, ảnh gốc 7K hay bằng chứng về từng chi tiết lịch sử.
- Hai cảnh phái sinh đang hoạt động mở rộng từ hai ảnh di tích năm 2018 (hai cảnh dựng từ không ảnh năm 1967 đã được rút lui do lo ngại về độ chân thực lịch sử và tái tạo lẫn thời kỳ). Album lưu riêng chín ảnh tham chiếu với niên đại và giấy phép; chế độ Hiện tại có ảnh chụp năm 2016, 2018 và 2025, không phải hình ảnh truyền trực tiếp.
- Ảnh tư liệu và ảnh hiện tại phải giữ xuất xứ, niên đại, quyền sử dụng và giới hạn của nguồn; không nhập nhằng chúng với ảnh minh họa.
- Các cảnh 360° độc lập, không phải tuyến đi bộ hay bản đồ đo đạc. Không dùng ảnh hoặc bản đồ để gán một tọa độ, sự kiện hay tình tiết không được nguồn xác nhận.
- Không thêm công trình phục hồi hiện đại vào cảnh năm 1972, lời nhân chứng tưởng tượng hay diễn biến chiến đấu chưa đối chiếu.
