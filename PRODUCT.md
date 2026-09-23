# Mưa đỏ 360°

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Người xem quan tâm đến tiểu thuyết *Mưa đỏ* của Chu Lai và lịch sử vùng đất Thành cổ Quảng Trị cùng phụ cận qua các thời kỳ, sử dụng trình duyệt trên máy tính hoặc điện thoại.

## Product Purpose

Cung cấp trải nghiệm trực quan kết hợp không gian toàn cảnh 360° minh họa và album ảnh tư liệu lịch sử có đối chiếu nguồn. Giúp người xem tiếp cận không gian Thành cổ Quảng Trị, sông Thạch Hãn và phụ cận qua hai thời kỳ Quá khứ và Hiện tại trên nền tảng tư liệu xác thực.

## Operating Context

Xây dựng bằng Vite, TypeScript và Pannellum; triển khai tĩnh hoàn toàn trên GitHub Pages qua GitHub Actions với đường dẫn cơ sở tương đối miễn phí. Người dùng truy cập trực tiếp, không cần tài khoản, máy chủ backend hay dịch vụ API khi xem.

## Capabilities and Constraints

- **Cấu trúc nội dung**:
  - *8 không gian 360°*: 6 cảnh minh họa cuộc chiến đấu bảo vệ Thành cổ năm 1972 và sau giao tranh (`pho-cu` sau giữa tháng 9, không gán cho tháng 6–8) hiển thị đơn sắc, hạt tĩnh và độ mềm nhẹ; 2 cảnh phái sinh dựng từ ảnh di tích năm 2018 hiển thị màu sắc đương đại. Hai cảnh dựng từ không ảnh năm 1967 (`quang-tri-south-1967-360`, `quang-tri-northeast-1967-360`) đã được rút lui do lo ngại về độ chân thực lịch sử và tái tạo lẫn thời kỳ; hiện chỉ còn 2 cảnh phái sinh từ ảnh chụp đang hoạt động. Chỉ 6 cảnh 1972 ban đầu có liên hệ văn học tiểu thuyết *Mưa đỏ*; các cảnh còn lại không có mục văn học.
  - *9 ảnh tư liệu trong album*: 3 ảnh thời kỳ Quá khứ (1967) và 6 ảnh thời kỳ Hiện tại (2016, 2018, 2025). Mỗi thời kỳ có panorama và album ảnh riêng; hiển thị rõ niên đại cụ thể của từng ảnh.
- **Giao diện và tương tác**:
  - Hai diện mạo theo thời kỳ: Quá khứ dùng nền giấy, chữ Newsreader, thanh tên đỏ nâu và nút viền nổi kiểu website cũ; Hiện tại dùng nền trắng, chữ Be Vietnam Pro, điểm chọn xanh trầm và điều khiển bo nhẹ. Bộ chọn cách xem nằm cùng hàng với thời kỳ trên điện thoại ở chế độ Hiện tại.
  - Nút chữ **Tư liệu** thuần túy không dùng biểu tượng cuốn sách. Bảng tư liệu giải thích nguồn gốc và giới hạn tái hiện một cách trung thực, không dùng nhãn hay huy hiệu AI trên giao diện người dùng.
  - Phân định thị giác rõ rệt giữa hai thời kỳ: trong thời kỳ Quá khứ, toàn cảnh 360°, ảnh xem trong album và ảnh thu nhỏ được xử lý thang xám đơn sắc, giảm tương phản, nâng vùng tối, độ mờ 1px (ảnh thu nhỏ 0.65px) và hạt nhiễu tĩnh rõ hơn; thời kỳ Hiện tại giữ màu sắc nguyên bản. Byte tệp JPEG gốc và ảnh tham chiếu trong bảng tư liệu (source drawer) giữ nguyên vẹn, không áp bộ lọc; các thành phần giao diện người dùng không bị áp dụng bộ lọc.
  - Cụm điều khiển gồm 4 nút chỉnh hướng nhìn, phóng to (+), thu nhỏ (−), đặt lại góc nhìn và toàn màn hình (F). Chế độ xem ảnh cho phép phóng to rồi kéo chuột/chạm hoặc dùng phím mũi tên để duyệt chi tiết ảnh gốc. Phím tắt 1–9 chọn trực tiếp điểm nhìn trong bộ sưu tập đang hiển thị.
- **Kỹ thuật và bản quyền hình ảnh**:
  - Cả 8 ảnh 360° được tạo ở kích thước 1774 × 887 rồi nâng độ phân giải lên 7096 × 3548 qua Real-ESRGAN x4plus; không phải ảnh chụp gốc 7K và không bổ sung bằng chứng lịch sử. 9 ảnh JPEG trong album giữ nguyên độ phân giải và byte tải về gốc.
  - 2 cảnh phái sinh đang hoạt động dựng từ ảnh đơn mở rộng không gian ngoài khung hình và có thể thay đổi chi tiết bên trong vùng chụp; không phải ảnh 360° cùng thời hay đo đạc hình học.
  - Tư liệu năm 1967 trước năm 1972 không mang nghĩa hòa bình. Phiếu ảnh sân bay năm 1967 đặt cách thị xã 3 dặm về phía Bắc dọc QL1, giữ nguyên phiếu dọc kèm chú thích. Cầu Hiền Lương bên sông Bến Hải tách biệt với Thành cổ.
  - Bản đồ AMS ghi thông tin đến năm 1968 và ảnh sân bay USMC là tác phẩm công vụ thuộc phạm vi công cộng tại Hoa Kỳ. Ảnh Commons tuân thủ CC BY-SA 3.0/4.0; ảnh phái sinh áp dụng cùng giấy phép ShareAlike và ghi công tác giả. Các ảnh chiến trường trong sách USMC ghi tác giả Việt Nam không được tái xuất bản.
  - Loại trừ các công trình sau chiến tranh (đài tưởng niệm 1997, nhà trưng bày 2002) khỏi lớp cảnh 1972. Không đưa kịch bản cá nhân, dữ liệu học tập hay toàn văn tiểu thuyết vào trang web.

Âm thanh tổng hợp mặc định tắt; ứng dụng chưa có WebXR. Nhóm Hiện tại dùng ảnh chụp năm 2016, 2018 và 2025, không phải hình ảnh trực tiếp.

## Evidence on Hand

- `src/content.ts`: 6 cảnh 1972, tư liệu từ Cục Di sản, TTXVN, MTTQ Quảng Trị, Cục Du lịch, USMC và nhà văn Chu Lai.
- `src/derived-scenes.ts`: 2 cảnh 360° phái sinh đang hoạt động dựng từ ảnh đơn kèm liên kết ảnh gốc và giới hạn tái hiện.
- `src/photo-records.json` & [photograph-provenance.json](docs/photograph-provenance.json): Hồ sơ 9 ảnh tư liệu gốc.
- `docs/historical-notes.md`: Căn cứ lịch sử, giới hạn diễn họa, chi tiết loại trừ và tác quyền tư liệu.
- `docs/asset-prompts-v2.json`: Hồ sơ tạo hình cho 6 cảnh 1972 ban đầu.
- [ATTRIBUTION ảnh](public/photographs/ATTRIBUTION.md) & [ATTRIBUTION toàn cảnh](public/scenes/ATTRIBUTION.md): Bản quyền và giấy phép.

## Product Principles

1. Điểm nhìn là trung tâm: mở trang vào thẳng không gian, không qua màn hình chờ hay bước đệm trung gian.
2. Minh bạch về nguồn gốc và giới hạn tái hiện: phân định rõ tư liệu gốc với phần diễn họa; hình ảnh không tạo bằng chứng lịch sử mới.
3. Trải nghiệm trực quan, thao tác nhất quán bằng chuột, chạm và bàn phím trên máy tính lẫn điện thoại.
4. Triển khai tài nguyên tĩnh miễn phí, không phụ thuộc vào backend, tài khoản đăng nhập hay API bên ngoài khi xem.
