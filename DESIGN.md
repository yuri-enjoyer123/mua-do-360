---
name: Mưa đỏ 360°
description: Không gian lịch sử, phần đọc như một tập tư liệu.
colors:
  paper: "#eee7d8"
  ink: "#302b25"
  muted-ink: "#655d51"
  terracotta: "#795039"
  charcoal: "#28241f"
  ivory: "#f3eee3"
  hairline: "#cfc4b1"
  page-base: "#181614"
  control-hover: "#38332c"
  control-border: "#474138"
  control-muted: "#a3998b"
  control-link-hover: "#c4975f"
  paper-inset: "#e5ddcc"
  paper-hover: "#f8f4ec"
typography:
  heading:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "38px"
    fontWeight: 400
    lineHeight: 1.2
  body:
    fontFamily: "Be Vietnam Pro, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.8
  source-label:
    fontSize: "11px"
  caption:
    fontSize: "12px"
  compact-body:
    fontSize: "13px"
  disclosure-marker:
    fontSize: "15px"
  archive-heading:
    fontSize: "23px"
  section-heading:
    fontSize: "25px"
  compact-help-heading:
    fontSize: "26px"
  notice-heading:
    fontSize: "27px"
  source-heading:
    fontSize: "29px"
  mobile-heading:
    fontSize: "30px"
  story-heading:
    fontSize: "33px"
  error-heading:
    fontSize: "34px"
rounded:
  control: "4px"
  small: "2px"
  key: "3px"
spacing:
  small: "8px"
  group: "12px"
  section: "28px"
components:
  view-control:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.ivory}"
    rounded: "{rounded.control}"
    width: "44px"
    height: "44px"
  source-drawer:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    width: "580px"
---

# Mưa đỏ 360°

## Overview

Cảnh chiếm toàn bộ màn hình. Thanh ảnh nhỏ giúp chọn điểm nhìn; nút thông tin mở một phần đọc có màu giấy và chữ mực. Cảm giác lịch sử đến từ chất liệu cảnh, tư liệu thật và giọng thuyết minh, không từ chữ quảng bá hoặc hiệu ứng làm cũ giả.

Định hướng do chủ dự án yêu cầu: chân thực hơn, ít dấu hiệu AI, hoài niệm; giữ vào thẳng 360°, giao diện gọn và viết mã trực tiếp. ENERGY 1 / RHYTHM 2 / MOTION 1. Cảnh là điểm tập trung, nhịp đọc được chia bằng tiêu đề và khoảng trống, chuyển động phục vụ thao tác nhìn quanh.

## Colors

Giấy ấm và mực nâu dùng cho phần đọc, than trầm và ngà dùng cho điều khiển phủ trên ảnh. Đất nung đánh dấu điểm đang chọn và liên kết. Không đặt lớp nhuộm màu lên toàn cảnh.

## Typography

Newsreader mang sắc thái trang sách ở tiêu đề và chú thích ảnh; Be Vietnam Pro giữ chữ Việt dễ đọc trong phần tư liệu. Các phông được lưu cùng website. Tiêu đề bảng 38px trên máy tính, 30px trên điện thoại; nội dung 14px, nguồn và chú thích 12–14px.

## Layout

Điều khiển góc nhìn xếp dọc bên phải trên máy tính, xếp ngang phía trên trên điện thoại. Thanh ảnh ở đáy, rộng tối đa 1000px, cuộn ngang khi cần; mỗi ảnh dẫn đến một cảnh thật trong tour. Mọi nút có vùng chạm ít nhất 44px. Bảng thông tin rộng 580px trên máy tính và hết chiều ngang điện thoại, nội dung cuộn độc lập.

## Elevation & Depth

Bề mặt điều khiển đặc giúp đọc được trên mọi nền cảnh. Bóng mềm có độ lệch chỉ giúp tách điều khiển khỏi hình. Không dùng kính mờ, hào quang hay lớp sương màu.

## Shapes

Điều khiển và ảnh thu nhỏ có góc bo 4px. Chỉ dấu di chuyển trong cảnh dùng hình tròn để phân biệt với thanh công cụ. Ảnh thu nhỏ được chụp từ góc nhìn phối cảnh thật trong trình xem, có chú thích trên nền giấy.

## Components

- Thanh ảnh: ảnh ở trên, tên cảnh ở dưới, viền đất nung cho mục hiện tại; cuộn đưa mục vừa chọn vào vùng nhìn thấy.
- Nút thông tin: mở nguồn và giới hạn ảnh; thẻ Câu chuyện chứa dữ kiện, diễn họa và liên hệ văn học.
- Bản đồ: mục mở/đóng bằng chuột hoặc bàn phím, có ảnh lưu trữ thật, chú giải niên đại và liên kết bản gốc.
- Trình chiếu: ẩn điều hướng, giữ nút thoát; Escape khôi phục khả năng điều khiển.
- Lỗi tải cảnh: cho phép thử lại, đổi cảnh và đọc nguồn. Âm thanh mặc định tắt, được ghi là mô phỏng.

## Do's and Don'ts

- Giữ nguồn lịch sử đối chiếu được và ghi rõ phần không thể xác minh trong ảnh.
- Tạo cảm giác hoài niệm bằng tài liệu, vật liệu và nhịp đọc; không thêm lời nhân chứng, nhân vật hoặc trận đánh tưởng tượng.
- Không đưa công trình phục hồi hiện đại vào cảnh 1972, không dùng bản đồ làm tọa độ cho điểm đứng giả lập.
- Không đưa trở lại màn giới thiệu, logo, thanh chú thích thường trực hoặc nhãn trang trí đã bị chủ dự án loại bỏ.
- Phân biệt ảnh nguồn 1774 × 887 với bản nâng độ phân giải 7096 × 3548. Không gọi bản nâng nét là ảnh gốc 7K hoặc ảnh lịch sử. Giữ giới hạn chi tiết suy đoán và phép chiếu trong tài liệu sản phẩm.
