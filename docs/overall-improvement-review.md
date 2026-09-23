# Đợt cải tiến tổng thể ngày 23/09/2026

Mục tiêu: dùng Gemini rà soát và cải thiện trải nghiệm thực tế của website, giữ hướng thiết kế và các giới hạn lịch sử đã chốt. Bản đầu vào là `d9fd08c`, đã xuất bản và có 42 kiểm thử đạt.

## Phạm vi nghiệm thu

- Xem trước được cảnh trong lúc ảnh toàn cảnh còn tải, giữ ảnh 7096 × 3548 khi hoàn tất và khả năng thử lại khi lỗi.
- Thu phóng album bám theo vị trí con trỏ hoặc tâm hai ngón tay; chuyển giữa kéo và chụm không làm ảnh nhảy ngoài ý muốn.
- Dùng phím mũi tên khi đang tập trung vào dấu chuyển cảnh; các nút và thông báo mô tả đúng chế độ ảnh hoặc 360°.
- Ngừng xử lý âm thanh sau khi tắt tiếng, bật lại được và xử lý đúng khi đổi thẻ trình duyệt.
- Bảng tư liệu phân biệt ảnh trong album với cảnh phục dựng, đưa ảnh đối chiếu lên trước các liên kết và giữ toàn bộ thông tin xuất xứ, giới hạn.
- Điều hướng không bị cắt ở màn hình ngang thấp; chú thích dấu chuyển cảnh không nằm dưới dải ảnh.
- Giữ hai thời kỳ, tám panorama và chín ảnh tư liệu; không khôi phục hai panorama không ảnh đã bỏ. Quá khứ giữ thang xám, mờ nhẹ và hạt; Hiện tại giữ màu. Ảnh đối chiếu trong bảng nguồn và byte ảnh gốc không đổi.
- Build, kiểm thử hồi quy, kiểm tra bố cục và bản GitHub Pages phải có bằng chứng trước khi hoàn tất.

## Phân công và quyết định

Ba worker Gemini 3.8 Flash qua Antigravity rà soát riêng tương tác, hiệu năng và nội dung. Các worker triển khai có quyền sửa tệp riêng; tác nhân chính chọn phương án, tích hợp và kiểm chứng.

Đã xác nhận bằng trình duyệt: tại 844 × 280, khung trải nghiệm cao tối thiểu 300px khiến các nút chọn thời kỳ/cách xem có tọa độ y = −3px. Tại 844 × 390, chú thích chuyển cảnh nằm dưới dải ảnh. Với yêu cầu ảnh lớn bị giữ lại để mô phỏng tải chậm, sau 684ms ảnh xem trước chưa có pixel; toàn cảnh sẵn sàng sau 7369ms. Đây là phép thử có độ trễ chủ động, không phải đo tốc độ mạng thực tế.

Không nhận nguyên trạng mọi đề xuất từ worker. Mã Pannellum hiện tại đã mặc định dùng chế độ tĩnh; không thêm cờ thừa hoặc chuyển sang chế độ động. Chưa có số đo chứng minh tác động riêng của blur lên FPS nên giữ hiệu ứng người dùng yêu cầu. Không xóa kiểm tra decode bảo vệ lỗi tải ảnh, không đổi bẫy focus của dialog hay chuẩn hóa hash khi chưa có lỗi tái hiện. Map con trỏ đã lưu riêng tọa độ từng ngón tay; không lấy tọa độ ngón vừa nhấc để ghi đè ngón còn lại. Không thêm niên đại hoặc nhận định lịch sử mới.

## Kết quả

- Gemini hoàn thành cả ba báo cáo rà soát, ba phần triển khai (`src/main.ts`, `src/photo-viewer.ts`, CSS responsive) và bộ kiểm thử mới. Không có hai worker cùng sửa một tệp.
- Tác nhân chính tích hợp, sửa câu chỉ vị trí ảnh tham chiếu, loại nhánh nội dung không còn dùng, ràng buộc sự kiện ảnh xem trước với đúng cảnh và gia cố âm thanh khi một lệnh resume trả về sau khi người xem đã tắt tiếng.
- Bộ kiểm thử mới được siết lại: nhãn phải khớp đúng chế độ, vùng chạm phải đạt 44px ở cả hai chiều, không chấp nhận trạng thái cũ để cho qua. Kiểm tra âm thanh dùng AudioContext thật; thay đổi trạng thái ẩn của trang được mô phỏng để kiểm tra nhánh xử lý và một promise resume được giữ lại chủ động để kiểm tra thứ tự hoàn tất.
- 12/12 kiểm thử mới đạt trên máy tính và điện thoại. Kiểm tra ảnh chụp tiếp tục phát hiện dấu chuyển cảnh ở 844 × 280 bị thanh ảnh che một phần; đã đưa dấu lên vị trí dùng cho khung xem nhỏ và thêm phép kiểm tra `elementFromPoint` tại tâm nút.
- Kiểm tra năm kích thước 1440 × 960, 393 × 852, 320 × 568, 844 × 390, 844 × 280: không tràn ngang; tất cả nút điều hướng chính nằm trong khung và đạt ít nhất 44 × 44px. Bảng nguồn, giới hạn phục dựng, hướng dẫn, album và lỗi ảnh đã được chụp để kiểm tra; không có lỗi JavaScript ở năm lượt xem.
- Toàn bộ tài nguyên trong `public/`, chín JPEG gốc, nội dung lịch sử trong `src/content.ts` và hồ sơ ảnh trong `src/photo-records.json` không có thay đổi so với bản đầu vào.

Build và bộ đầy đủ **54/54 trường hợp đạt**, mất 5,9 phút trên máy này. Xác nhận bổ sung ở chế độ giảm chuyển động: hai dấu chuyển cảnh không bị che ở 844 × 280; nút toàn màn hình vào/thoát được; liên kết câu chuyện, hướng dẫn, nút đóng và trả focus hoạt động; ảnh đối chiếu mở đúng JPEG. Nút chọn bộ sưu tập giữ độ tương phản khi chuyển sang album. Kiểm chứng GitHub Actions và bản công khai được báo riêng sau bước phát hành.

## Delivery Gate của Anti Slop

Phạm vi: phần thay đổi trong đợt này và các luồng giao diện hiện có được kiểm tra hồi quy. Tác nhân chính thực hiện gate, không dùng tự đánh giá của worker thay cho kết quả chạy.

### Hard Gate: PASS

- R-02 PASS: lời mới dùng câu tiếng Việt thông thường, không thêm dấu gạch ngang dài.
- R-03 PASS: năm kích thước đã đo không tràn ngang; điều hướng nằm trong viewport.
- R-17 PASS: không thêm số liệu quảng cáo; số lượng cảnh lấy từ danh mục thật.
- R-18 PASS: không có lời chứng thực hay nhân vật quảng cáo.
- R-23 PASS: không tạo tài nguyên hình ảnh mới; các thay đổi nằm trong yêu cầu cải tiến đã giao.
- R-24 PASS: điều hướng trỏ tới cảnh có trong danh mục, nguồn dùng URL hiện có.
- R-25 PASS: tương phản trên giấy ngà: chữ chính 10,04:1, chữ phụ 4,96:1, liên kết 5,97:1; nút album xác nhận bằng computed style ở trạng thái ổn định.
- R-26 PASS: kiểm thử các nút hướng, thu phóng, reset, thời kỳ, bộ sưu tập, trước/sau, dấu chuyển cảnh, tư liệu, trình chiếu và âm thanh; kiểm tra bổ sung toàn màn hình và nút đóng.
- R-27 PASS: thumbnail khi chờ, thông báo đúng loại ảnh, lỗi có thử lại và chuyển cảnh; hash không hợp lệ trở về cảnh hợp lệ.
- R-28 PASS: không thêm FAQ.
- R-32 PASS: phím mũi tên khi focus dấu chuyển cảnh, Enter chuyển cảnh, tab nguồn, Escape và trả focus đã được kiểm tra.
- R-33 PASS: thay đổi được viết trong mã nguồn TypeScript/CSS của dự án, không chèn script để sửa trang đang chạy.
- R-34 PASS: không có công tắc theme; hai thời kỳ giữ bộ điều khiển giấy ngà nhất quán.
- R-35 PASS: TypeScript, Vite và 54 kiểm thử đạt; có ảnh chụp desktop/mobile, kiểm tra nút bằng trình duyệt, không có lỗi JavaScript ở năm lượt bố cục.
- R-36 PASS: không tuyên bố FPS hay tốc độ mạng; thử tải chậm được ghi rõ là phép thử có kiểm soát.
- R-37 PASS: DESIGN.md và chỉ dẫn đã chốt quy định giấy ngà, chữ có chân, vào thẳng 360°; ENERGY 1 / RHYTHM 2 / MOTION 1.
- R-38 PASS: không thêm tình tiết lịch sử; ảnh, hồ sơ nguồn, chú thích và giấy phép giữ nguyên; giới hạn phục dựng vẫn mở đọc được.

### Purpose-Gate: PASS

- R-01 PASS: không thêm gradient hoặc hào quang.
- R-04 PASS: biểu tượng hướng, âm lượng, reset và toàn màn hình đều ứng với thao tác thật.
- R-06 PASS: giữ Newsreader theo hướng tư liệu in đã chốt, không thêm chữ monospace trang trí.
- R-07 PASS: không thêm nền lưới; hạt tĩnh chỉ dùng trên ảnh Quá khứ theo yêu cầu.
- R-08 PASS: mũi tên phục vụ hướng nhìn và chuyển điểm, không làm huy hiệu trang trí.
- R-09 PASS: không thêm capsule hay nhãn tiếp thị.
- R-10 PASS: các khung dùng giấy đặc, không kính mờ.
- R-12 PASS: bóng nhẹ hiện có tách khung điều khiển khỏi cảnh; không thêm bóng lớn.
- R-13 PASS: không thêm glow.
- R-14 PASS: dải ảnh cùng cỡ phục vụ chọn các điểm nhìn ngang hàng; không có feature cards.
- R-19 PASS: giữ chuyển động điều hướng và vòng chờ; kiểm tra chế độ giảm chuyển động.
- R-22 PASS: không thêm tranh minh họa trang trí.

### Liveliness: PASS

- Dials PASS: ENERGY 1 / RHYTHM 2 / MOTION 1 ghi trong DESIGN.md.
- Nhất quán PASS: không thêm chuyển động trang trí hoặc thành phần thu hút quá mức.
- Điểm nhìn chính PASS: cảnh chiếm khung xem; khi mở bảng, tư liệu trở thành nội dung chính.
- Khoảng trống PASS: album chừa chỗ cho điều hướng; bảng đọc có lề và vùng cuộn riêng.
- Màu nhấn PASS: đỏ nâu đánh dấu thời kỳ, cảnh được chọn và liên kết.
- Đặc trưng PASS: khung giấy góc vuông, đường kẻ và Newsreader xuyên suốt.
- Design Read PASS: giữ hướng tập tư liệu cổ đã được chốt trước khi triển khai đợt này.

### Craftsmanship & Quality Locks: PASS

- C-1 PASS: mỗi thay đổi gắn với lỗi tái hiện hoặc thao tác cụ thể trong phạm vi nghiệm thu.
- C-2 PASS: các điều khiển có tác dụng, đối chiếu bộ kiểm thử và lượt kiểm tra bổ sung.
- C-3 PASS: không thêm section hoặc màn giới thiệu.
- C-4 PASS: kiểm tra tải lỗi, WebGL không khả dụng, nguồn đến muộn, thao tác nhanh, khung nhỏ, touch và bàn phím.
- C-5 PASS: không tạo lời chứng, số liệu hay dữ kiện lịch sử mới.
- R-05 PASS: trang mở trực tiếp vào trình xem, không hero/cards theo mẫu.
- R-11 PASS: giữ góc vuông và vùng chạm 44px; không đổi sang pill.
- R-15 PASS: nhãn nêu thao tác cụ thể như Tư liệu, Thử tải lại, Đặt lại ảnh.
- R-16 PASS: không thêm ngôn ngữ quảng cáo hay nhãn AI lên giao diện.
- R-20 PASS: giao diện gắn với ảnh, nguồn và phong cách tư liệu của Quảng Trị.
- R-21 PASS: không áp dark mode hoặc đổi theme ngoài yêu cầu.
- R-29 PASS: giữ giấy ngà, mực nâu và một màu nhấn đỏ nâu.
- R-30 PASS: tiếp tục hướng album tư liệu hiện có, không sao chép giao diện sản phẩm khác.
- R-31 PASS: DESIGN.md nêu lý do của màu, chữ, khung giấy và bố cục; đợt này chỉ điều chỉnh khả năng xem và điều khiển.

## Triage công cụ thiết kế

- `design-system-font`: thêm ngoại lệ duy nhất cho `Be Vietnam Pro`, vì DESIGN.md đã ghi rõ đây là phông dự phòng được giữ lại; không thay đổi phông giao diện và không tắt cả quy tắc.
- `broken-image`: khung xem trước được gán ảnh thu nhỏ thật ngay khi tạo HTML, không còn phần tử thiếu `src` ban đầu.
- Sidecar `.impeccable/design.json` cũ vẫn được ghi nhận. Theo quy tắc của Impeccable, không tự sửa drift như tác dụng phụ của đợt cải tiến; DESIGN.md hiện tại tiếp tục là căn cứ thiết kế.

## Giới hạn đo đạc

Phép thử tải chậm giữ yêu cầu ảnh lớn và xác nhận thumbnail đã giải mã khi panorama còn bận; khi hoàn tất, ảnh xem trước có đủ 7096 × 3548 pixel. Đây là cải thiện phản hồi lúc chờ, không phải tuyên bố tăng tốc mạng hoặc FPS. Không có thử nghiệm kính VR hay Safari trong đợt này.

## Chỉnh lời giao diện

Theo phản hồi tiếp theo của chủ dự án, đổi nút “Không gian 360°” thành “Nhìn quanh”, giữ “Album ảnh”. Lời hướng dẫn, thông báo tải/lỗi và tiêu đề trình duyệt dùng từ thông thường như “cảnh”, “ảnh”, “chọn cảnh”. Gemini sửa các chuỗi giao diện trong một tệp; tác nhân chính kiểm tra bản diff, chỉnh metadata, chạy build và kiểm tra ảnh chụp máy tính/điện thoại.

- Hard Gate PASS: 4 kiểm thử hiện có về bố cục, tải ảnh và tư liệu đạt; không sửa dữ liệu lịch sử, ảnh, giấy phép, CSS hay xử lý tương tác. Nội dung mới không thêm dữ kiện lịch sử.
- Purpose-Gate PASS: “Nhìn quanh” gọi đúng thao tác; “Đang mở cảnh…” mô tả trạng thái đang diễn ra. Không thêm lời quảng cáo, huy hiệu hoặc thành phần trang trí.
- Liveliness PASS: giữ ENERGY 1 / RHYTHM 2 / MOTION 1 và phong cách giấy ngà; ảnh chụp hai kích thước xác nhận nhãn mới vừa nút.
- Craftsmanship & Quality Locks PASS: TypeScript/Vite build đạt, nguồn và album mở được ở cả hai cấu hình kiểm thử. Diff chỉ đổi lời trong giao diện và tài liệu liên quan; đọc lại để loại thuật ngữ thừa, giữ phần giải thích lịch sử đúng nghĩa.
