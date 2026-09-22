# Mưa đỏ: Một hành trình ký ức 360°

Tour trình duyệt gồm sáu điểm nhìn minh họa: bờ Thạch Hãn (`thach-han`), hào thành (`hao-thanh`), Cổng Hậu (`cong-hau`), lũy đất phía Bắc (`luy-bac`), bên trong Thành cổ (`noi-thanh`) và phố sau chiến sự (`pho-cu`). Giao diện tiếng Việt, chạy trên máy tính và điện thoại.

[Mở hành trình trên GitHub Pages](https://yuri-enjoyer123.github.io/mua-do-360/).

**Đây là ảnh phục dựng bằng AI, không phải ảnh chụp năm 1972 hoặc mô hình khảo cổ đo đạc.** Tư liệu định hướng bối cảnh và kiểm chứng phần chú giải; không xác thực mọi chi tiết hình ảnh. Mỗi điểm có phần riêng cho dữ kiện lịch sử, lựa chọn diễn họa và liên hệ với tiểu thuyết *Mưa đỏ* của Chu Lai. Các dấu chuyển cảnh không xác nhận một tuyến đường có thật hay khảo sát chính xác.

## Sử dụng

- Trang mở thẳng cảnh 360°. Nút thông tin mở nguồn lịch sử, bản đồ lưu trữ và câu chuyện của cảnh. Phần đọc dùng nền giấy ấm; điều khiển màu than trầm và các ảnh thu nhỏ giúp giữ cảnh là nội dung chính.
- Kéo chuột/chạm để nhìn quanh; chọn dấu chuyển điểm hoặc các ảnh thu nhỏ để đổi cảnh.
- Phím 1–6 chọn điểm nhìn; khi không gian đang được chọn, dùng phím mũi tên để quay nhìn và +/− để thay đổi góc nhìn.
- F mở toàn màn hình, P bật/tắt trình chiếu. Escape đóng bảng tư liệu hoặc thoát trình chiếu.
- Âm thanh thiên nhiên là âm thanh tổng hợp, mặc định tắt, không phải âm thanh tư liệu.
- Nút bật âm thanh, trình chiếu và hướng dẫn nằm trong bảng thông tin để màn hình ngắm cảnh được gọn.
- Chia sẻ một điểm bằng địa chỉ có đuôi liên kết trực tiếp (deep link):
  - `#scene=thach-han` (Bờ sông Thạch Hãn)
  - `#scene=hao-thanh` (Hào và tường thành)
  - `#scene=cong-hau` (Quanh Cổng Hậu)
  - `#scene=luy-bac` (Lũy đất phía Bắc)
  - `#scene=noi-thanh` (Bên trong Thành cổ)
  - `#scene=pho-cu` (Phố sau chiến sự)

## Chạy và kiểm tra

Yêu cầu Node.js 24 trở lên.

```sh
npm ci
npx playwright install chromium
npm run dev
npm test
npm run preview
```

`npm test` kiểm tra TypeScript, tạo bản production và chạy kiểm thử trình duyệt trên kích thước máy tính và điện thoại. `npm run preview` phục vụ thư mục `dist` để kiểm tra bản production. Đặt `TOUR_URL` khi cần kiểm tra một bản đã đăng.

## Nội dung và hình ảnh

- [Tư liệu, giới hạn và các chi tiết loại trừ](docs/historical-notes.md).
- [Prompt tạo ảnh và nguồn gốc tài sản](docs/asset-prompts-v2.json).
- Dữ liệu các cảnh và nguồn tham khảo nằm trong `src/content.ts`.
- Bản đồ AMS ([NARA, NAID 74797754](https://catalog.archives.gov/id/74797754)) được nhúng trong bảng nguồn. Chú giải ghi thông tin đến năm 1968; hồ sơ lưu trữ ghi khoảng 1942–1972. Bản đồ không xác nhận nguyên trạng năm 1972 hoặc vị trí các panorama. [Bản gốc và quyền sử dụng](https://commons.wikimedia.org/wiki/File:AMS_-_Quang_Tri,_Vietnam_-_NARA_-_74797754.jpg).
- Ứng dụng **không tái xuất bản ảnh tư liệu chiến tranh**: các ảnh tư liệu lịch sử chỉ dùng làm tài liệu tham khảo nghiên cứu nội bộ, không đưa trực tiếp vào trang web.
- Kịch bản riêng của người dùng không được công bố công khai.
- Sáu panorama được nâng từ ảnh nguồn 1774 × 887 lên 7096 × 3548 bằng Real-ESRGAN x4plus chạy trên máy. Đây là ảnh nâng độ phân giải, không phải ảnh gốc 7K. [Quy trình và kết quả kiểm tra](docs/image-quality.md).
- Chi tiết nhỏ do mô hình suy đoán không phải chứng cứ lịch sử. Nâng nét không sửa được mọi sai lệch hình học, vùng nối hoặc vùng cực. Đây là tour 360° trong trình duyệt, chưa có chế độ kính WebXR và không có số liệu khảo sát đo đạc thực địa chính xác.
- Phông Newsreader và Be Vietnam Pro lưu tại `public/fonts`, kèm giấy phép SIL Open Font License. Pannellum theo giấy phép MIT; bản sao giấy phép được phân phối tại `public/licenses/Pannellum-MIT.txt`.
- Không sao chép ảnh tư liệu của các cơ quan, toàn văn tiểu thuyết hay thông tin cá nhân của người thuyết trình vào website.

## Triển khai miễn phí

GitHub Actions kiểm thử bản production trước khi đăng `dist` lên GitHub Pages. Trong Settings → Pages, nguồn triển khai là **GitHub Actions**. Cấu hình Vite dùng đường dẫn tương đối để hoạt động trong thư mục repository và các máy chủ tĩnh khác. Website không cần tài khoản người xem, khóa API hay máy chủ AI.
