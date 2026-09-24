---
name: Mưa đỏ
description: Hai diện mạo cho Quá khứ và Hiện tại, cùng một trình xem ảnh và tư liệu.
colors:
  past-paper: "#ddd4bf"
  past-inset: "#f1ead9"
  past-ink: "#30291f"
  past-muted: "#625749"
  past-accent: "#653e35"
  past-on-accent: "#f7f0df"
  past-highlight: "#fff8e8"
  past-edge: "#7c715f"
  present-paper: "#fafcfb"
  present-inset: "#eaf1ed"
  present-ink: "#172c22"
  present-muted: "#52635a"
  present-accent: "#205c48"
  present-line: "#75877c"
typography:
  past-body:
    fontFamily: "Newsreader, Georgia, Times New Roman, serif"
    fontSize: "19px"
    lineHeight: 1.65
  past-scene-title:
    fontFamily: "Newsreader, Georgia, Times New Roman, serif"
    fontSize: "20px"
    lineHeight: 1.3
  present-body:
    fontFamily: "Be Vietnam Pro, Arial, sans-serif"
    fontSize: "17px"
    lineHeight: 1.75
  present-scene-title:
    fontFamily: "Be Vietnam Pro, Arial, sans-serif"
    fontSize: "18px"
    lineHeight: 1.4
rounded:
  past: "0px"
  present-button: "8px"
  present-switch: "10px"
  present-panel: "12px"
  present-dialog: "16px"
spacing:
  touch-target: "44px"
  desktop-edge: "16px"
  mobile-edge: "10px"
  scene-gap: "8px"
components:
  past-control:
    backgroundColor: "{colors.past-paper}"
    textColor: "{colors.past-ink}"
    rounded: "{rounded.past}"
    size: "{spacing.touch-target}"
  past-control-active:
    backgroundColor: "{colors.past-accent}"
    textColor: "{colors.past-on-accent}"
  present-control:
    backgroundColor: "{colors.present-paper}"
    textColor: "{colors.present-ink}"
    rounded: "{rounded.present-button}"
    size: "{spacing.touch-target}"
  present-control-active:
    backgroundColor: "{colors.present-accent}"
    textColor: "{colors.present-paper}"
---

# Mưa đỏ

## Overview

Chủ dự án yêu cầu hai phong cách riêng: Quá khứ giống website cũ, Hiện tại có giao diện hiện đại. Mở trang vẫn vào thẳng cảnh đang chọn. Cảnh hoặc ảnh chiếm phần chính của màn hình; nút thời kỳ, kính VR, máy ảnh, hướng nhìn và dải ảnh luôn phục vụ thao tác thật.

Quá khứ dùng chữ có chân, giấy ngà, góc vuông, đường viền mảnh và điểm nhấn đỏ nâu. Bảng tên có đường đỏ bên trái; bỏ thanh màu và các lớp viền nổi dày quanh nút. Hiện tại dùng chữ sans, nền trắng gần trung tính, điểm chọn xanh trầm và các cụm điều khiển bo nhẹ. ENERGY 2 / RHYTHM 2 / MOTION 3. Theo yêu cầu mới, giao diện tăng chuyển động: trượt nền chọn thời kỳ, hiện lần lượt dải ảnh, phản hồi hover, hòa cảnh và mở bảng tư liệu. Tôn trọng reduced motion; không tự xoay hoặc bật âm thanh. Đây là hướng thiết kế do người dùng chọn; phong cách ảnh cũ không thay niên đại của tư liệu.

## Colors

Quá khứ: giấy `#ddd4bf`, vùng sáng `#f1ead9`, chữ `#30291f`, chữ phụ `#625749`, đỏ nâu `#653e35`; chữ trên nền đỏ nâu là `#f7f0df`. Hai cạnh sáng `#fff8e8` và tối `#7c715f` tạo viền nút cổ điển.

Hiện tại: bề mặt `#fafcfb`, vùng lồng `#eaf1ed`, chữ `#172c22`, chữ phụ `#52635a`, màu chọn `#205c48`, đường phân cách `#75877c`. Liên kết nguồn vẫn có gạch chân. Trạng thái chọn có cả nền, viền hoặc gạch chân và thuộc tính trợ năng.

## Typography

Newsreader là phông Quá khứ: nội dung đọc 19px/1.65 trên máy tính, 18px/1.65 trên điện thoại. Tiêu đề cảnh 20px, còn 18px ở màn hình hẹp hoặc ngang thấp.

Be Vietnam Pro là phông Hiện tại, được lưu cùng trang: nội dung đọc 17px/1.75, tiêu đề bảng 26px (23px trên điện thoại), tên cảnh 18px (16px trên điện thoại). Dùng biến `--ui-font` cho phông theo thời kỳ; không tải thêm phông hoặc dùng chữ kiểu pixel làm khó đọc tiếng Việt.

## Layout

Quy tắc chung ở `src/style.css`; phần theo thời kỳ ở `src/eras.css`, được chọn bằng `body[data-scene-era]`. Cảnh, chế độ xem và liên kết sâu quyết định thời kỳ, vì vậy đổi cảnh cũng đổi cả diện mạo đúng lúc.

Máy tính đặt bộ chọn thời kỳ góc trên trái, kính VR/máy ảnh góc trên phải, tên cảnh bên dưới bên trái. Tên cảnh lớn hơn, niên đại ở dưới và Tư liệu ở cạnh bên; cùng một cấu trúc cho hai thời kỳ. Hiện tại dùng bảng tên gọn, không có thanh màu riêng.

Trên điện thoại, cả hai thời kỳ đặt bộ chọn thời kỳ và bộ chọn cách xem trên cùng một hàng để dành thêm chỗ cho ảnh. Quá khứ giữ chữ có chân và viền nổi, giảm đệm ngang của nút để vừa màn hình 320px; thanh tên cảnh nằm ngay dưới hai bộ chọn. Điện thoại rộng từ 390px xếp tám nút góc nhìn thành một hàng; nhỏ hơn dùng bốn cột. Máy tính giữ cụm hai cột bên phải. Album ẩn nút hướng nhìn. Màn hình ngang thấp giữ hai bộ chọn ở hai góc trên.

Mọi nút chính có vùng bấm ít nhất 44 × 44px. Dải ảnh cuộn ngang theo số cảnh. Khung album chừa phần tên cảnh qua `--context-end`, giữ toàn bộ ảnh bằng `object-fit: contain` trước khi người xem phóng to; không cắt ảnh nguồn để vừa khung.

## Ngắm cảnh và chuyển động

Nút con mắt cạnh kính VR và máy ảnh mở Ngắm cảnh. Chế độ này ẩn bảng tên, điều hướng và dấu chuyển điểm; thanh nhỏ dưới màn hình giữ tự xoay, cảm biến điện thoại khi có hỗ trợ, âm thanh và Trở lại. Dùng đúng chất liệu của thời kỳ hiện tại, không thêm logo, huy hiệu hoặc màn giới thiệu. Hạt ảnh Quá khứ vẫn có trong chế độ này.

Khung nhìn cũ được giữ khi tải panorama cùng thời kỳ rồi hòa chuyển 420ms; không hòa Quá khứ và Hiện tại hoặc panorama với tư liệu ảnh. Khung lưu tạm không lớn hơn 1280 × 960 để giới hạn bộ nhớ và thời gian mã hóa. Album và lần mở cảnh đầu dùng hiện ảnh 320ms. Các hiệu ứng này bị hủy khi cần và tắt theo reduced motion. Tự xoay 2,4 độ/giây do người xem bật, luôn có nút dừng; chuyển động dừng khi đổi cảnh, kéo ảnh, mở bảng, ẩn thẻ hoặc thoát Ngắm cảnh.

## Elevation & Depth

Quá khứ dùng viền nút nổi/lõm kiểu web cũ; các bảng có bóng nhẹ `0 2px 4px rgb(38 31 22 / .2)`. Hiện tại dùng bóng `0 4px 18px rgb(14 39 27 / .15)` để tách các cụm điều khiển khỏi ảnh. Thẻ ảnh không có bóng; không dùng kính mờ hoặc hào quang.

Ảnh trong Quá khứ dùng `grayscale(1) contrast(.78) brightness(1.17) blur(1.35px)`; ảnh thu nhỏ dùng blur `.75px`. Hạt phim tĩnh có seed cố định, ô lặp 240px, tương phản hạt cao hơn và viền tối nhẹ, phủ riêng vùng ảnh với chế độ hòa multiply và opacity `.84`. Bộ lọc tạo nét mềm, vùng tối bạc và chất ảnh đen trắng cũ cho panorama, album và ảnh thu nhỏ. Các tệp ảnh gốc không bị nén lại hay ghi đè. Ảnh Hiện tại, chữ, nút bấm và ảnh đối chiếu trong Tư liệu giữ cách hiển thị sẵn có.

## Shapes

Quá khứ dùng góc vuông, khung chữ nhật, nút viền hai sắc và tab tư liệu cổ điển. Hiện tại dùng góc bo 7–8px cho nút, 8px cho thẻ ảnh, 10–12px cho cụm điều khiển và 16px cho bảng hướng dẫn. Không đổi các nút thành capsule hoặc thêm khung trang trí quanh cảnh.

## Components

- Kính VR chọn chế độ nhìn quanh; máy ảnh chọn album. SVG 24px, nút 44px, có tên trợ năng và chú thích khi rê chuột.
- Nút màn chiếu cạnh kính VR mở bài Canva do chủ dự án cung cấp. Thanh trên giữ tên sách, Split-view, toàn màn hình, tùy chọn và đóng. Tùy chọn gồm sao chép liên kết, tải lại và mở Canva. Âm thanh cảnh dừng trong khi bài chiếu mở. Màn hình 320px giữ bộ chọn thời kỳ và hàng biểu tượng trên một hàng bằng cách giảm đệm và cỡ chữ của tab; vùng bấm vẫn ít nhất 44px.
- Split-view đặt bài chiếu và trình xem cạnh nhau; điện thoại dọc xếp bài chiếu trên, cảnh dưới. Dùng lại trình xem hiện tại, giữ góc nhìn, thu phóng và nguồn của cảnh. Bộ chọn cảnh chia Quá khứ / Hiện tại; Tư liệu mở đúng nguồn đang chọn. Trở lại cảnh đóng Canva và giữ cảnh vừa xem. Bật/tắt khung cảnh không tải lại iframe, nên trang chiếu và thao tác trong Canva được giữ nguyên. Kết thúc trình chiếu gỡ iframe để dừng media.
- Liên kết `#scene=…&view=slides&layout=split` mở đúng cảnh và bố cục bài chiếu. Nút Back quay về trước khi mở bài chiếu; liên kết trực tiếp không tự yêu cầu toàn màn hình. Điều khiển trang chiếu và media dùng giao diện Canva, không tạo bộ đếm hoặc nút chuyển trang dựa trên API chưa được xác nhận.
- Nút chữ Tư liệu mở nguồn, giấy phép và giới hạn của đúng cảnh. Bảng đọc kế thừa diện mạo của thời kỳ đang xem, có vùng cuộn độc lập và đường đóng rõ ràng.
- Trạng thái chọn thời kỳ dùng `aria-pressed`; cảnh hiện tại dùng viền và `aria-current`. Vòng focus vẫn nhìn thấy được trên cả hai nền.
- Các điều khiển tải, lỗi, thử lại, toàn màn hình, trình chiếu và âm thanh dùng cùng hệ màu với thời kỳ. Âm thanh mặc định tắt; giảm chuyển động theo thiết lập trình duyệt.

## Do's and Don'ts

- Giữ cảnh dẫn đầu và vào thẳng trình xem; không thêm hero, logo, màn giới thiệu hay nhãn quảng cáo.
- Giữ hai thời kỳ và hai cách xem; nguồn lịch sử, ngày chụp, ghi công và giấy phép luôn thuộc đúng ảnh.
- Chỉ làm cũ phần hiển thị hình ảnh Quá khứ; không làm mờ chữ, nút bấm hoặc ảnh đối chiếu trong tư liệu.
- Không gán ảnh hoặc sự kiện sang thập niên 1990 chỉ vì yêu cầu phong cách ảnh cũ.
- Không đưa nhãn “AI generated” hoặc “made by AI” lên giao diện. Giới hạn diễn họa vẫn trình bày trong tư liệu bằng từ “phục dựng” và “mở rộng”.

## Nội dung giao diện

Rà chữ theo [Wikipedia:Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing), theo yêu cầu của chủ dự án. Xét nội dung và ngữ cảnh của câu, không thay từ máy móc theo danh sách.

Viết trực tiếp về địa danh, sự kiện hoặc chi tiết có nguồn. Bỏ lời bình chung chung về ý nghĩa, cảm xúc và các mối liên hệ không có dẫn chứng. Không đưa lời dặn biên tập, lời tự nhận xét chất lượng bài viết, placeholder hay câu giải thích điều hiển nhiên vào trang. Mục không có nội dung cụ thể thì bỏ; không thêm lại khối “Liên hệ với tiểu thuyết” cho từng cảnh. Ghi nguồn và giới hạn phục dựng ngắn gọn trong Tư liệu, tránh nhắc lại cùng một ý ở nhiều chỗ.

Bảng nguồn mở vào tư liệu của cảnh. Không thêm lại khung giải thích chung “Về ảnh phục dựng” hay “Giới hạn phục dựng”; chú thích cần gắn với ảnh hoặc chi tiết cụ thể.

## Giới hạn lịch sử và hình ảnh

- Nguồn và giới hạn diễn họa nằm trong bảng tư liệu. Theo yêu cầu của chủ dự án, giao diện không dùng nhãn hoặc lời ghi “AI generated”, “made by AI” hay tương tự; phần đọc giải thích bằng từ “phục dựng” và “mở rộng”.
- Sáu ảnh 360° minh họa ban đầu do AI tạo ở 1774 × 887, được Real-ESRGAN nâng lên 7096 × 3548. Đây không phải ảnh tư liệu, ảnh gốc 7K hay bằng chứng về từng chi tiết lịch sử.
- Hai cảnh phái sinh đang hoạt động mở rộng từ hai ảnh di tích năm 2018 (hai cảnh dựng từ không ảnh năm 1967 đã được rút lui do lo ngại về độ chân thực lịch sử và tái tạo lẫn thời kỳ). Album lưu riêng chín ảnh tham chiếu với niên đại và giấy phép; chế độ Hiện tại có ảnh chụp năm 2016, 2018 và 2025, không phải hình ảnh truyền trực tiếp.
- Ảnh tư liệu và ảnh hiện tại phải giữ xuất xứ, niên đại, quyền sử dụng và giới hạn của nguồn; không nhập nhằng chúng với ảnh minh họa.
- Các cảnh 360° độc lập, không phải tuyến đi bộ hay bản đồ đo đạc. Không dùng ảnh hoặc bản đồ để gán một tọa độ, sự kiện hay tình tiết không được nguồn xác nhận.
- Không thêm công trình phục hồi hiện đại vào cảnh năm 1972, lời nhân chứng tưởng tượng hay diễn biến chiến đấu chưa đối chiếu.

## Cập nhật giao diện toàn trang

Dải ảnh nằm trên một mặt giấy thống nhất, có số vị trí và nút Dải ảnh để thu gọn. Khi đóng, các ảnh và nút điều hướng được ẩn cả khỏi bàn phím; phím số vẫn đổi cảnh. Vùng xem album và các nút thu phóng tự nhận diện tích được trả lại. Tên ảnh nhỏ được xuống hai dòng.

Album dùng nền tối (`#272520` ở Quá khứ, `#16241f` ở Hiện tại); ảnh giữ object-fit contain và không bị crop mặc định. Hiệu ứng hạt ảnh chỉ phủ vùng hình. Bảng tư liệu tách khỏi mép trang một khoảng nhỏ, có chuyển động trượt lúc mở và vùng đọc rộng.

Split-view dùng một nhãn cố định với aria-pressed. Đường phân chia kéo được bằng chuột/chạm, phím mũi tên chỉnh từng 5%, Home/End đặt giới hạn 35/75%, Enter hoặc nhấp đúp khôi phục tỷ lệ. Điện thoại xếp dọc. Thay đổi tỷ lệ không thay iframe và không mất vị trí slide hay thu phóng ảnh. Tư liệu và Trở lại cảnh nằm cùng hàng phía dưới.
