# Mưa đỏ — Một hành trình ký ức 360°

Tour trình duyệt gồm bốn điểm nhìn minh họa: bờ Thạch Hãn, hào thành, Cổng Hậu và bên trong Thành cổ Quảng Trị. Giao diện tiếng Việt, chạy trên máy tính và điện thoại.

[Mở hành trình trên GitHub Pages](https://yuri-enjoyer123.github.io/mua-do-360/).

**Đây là ảnh phục dựng bằng AI, không phải ảnh chụp năm 1972 hoặc mô hình khảo cổ đo đạc.** Tư liệu định hướng bối cảnh và kiểm chứng phần chú giải; không xác thực mọi chi tiết hình ảnh. Mỗi điểm có phần riêng cho dữ kiện lịch sử, lựa chọn diễn họa và liên hệ với tiểu thuyết *Mưa đỏ* của Chu Lai. Các dấu chuyển cảnh không xác nhận một tuyến đường có thật.

## Sử dụng

- Trang mở thẳng cảnh 360°. Nút thông tin trong thanh điều khiển mở nguồn lịch sử, giới hạn ảnh AI và câu chuyện của điểm nhìn.
- Kéo chuột/chạm để nhìn quanh; chọn dấu chuyển điểm hoặc các ảnh thu nhỏ để đổi cảnh.
- Phím 1–4 chọn điểm nhìn; khi không gian đang được chọn, dùng phím mũi tên để quay nhìn và +/− để thay đổi góc nhìn.
- F mở toàn màn hình, P bật/tắt trình chiếu. Escape đóng bảng tư liệu hoặc thoát trình chiếu.
- Âm thanh thiên nhiên là âm thanh tổng hợp, mặc định tắt, không phải âm thanh tư liệu.
- Nút bật âm thanh, trình chiếu và hướng dẫn nằm trong bảng thông tin để màn hình ngắm cảnh được gọn.
- Chia sẻ một điểm bằng địa chỉ có đuôi `#scene=cong-hau` (hoặc `thach-han`, `hao-thanh`, `noi-thanh`).

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
- [Prompt tạo ảnh và nguồn gốc tài sản](docs/asset-prompts.json).
- Dữ liệu các cảnh và nguồn tham khảo nằm trong `src/content.ts`.
- Panorama giữ độ phân giải nguồn; không phóng lớn rồi giới thiệu là ảnh 4K. Bản WebP và thumbnail được nén để tải nhẹ.
- Ảnh nguồn 1774 × 887 có giới hạn độ nét khi phóng lớn; một số vùng nối và vùng cực của panorama còn biến dạng. Đây là tour 360° trong trình duyệt, chưa có chế độ kính WebXR.
- Phông Newsreader và Be Vietnam Pro lưu tại `public/fonts`, kèm giấy phép SIL Open Font License. Pannellum theo giấy phép MIT; bản sao giấy phép được phân phối tại `public/licenses/Pannellum-MIT.txt`.
- Không sao chép ảnh tư liệu của các cơ quan, toàn văn tiểu thuyết hay thông tin cá nhân của người thuyết trình vào website.

## Triển khai miễn phí

GitHub Actions kiểm thử bản production trước khi đăng `dist` lên GitHub Pages. Trong Settings → Pages, nguồn triển khai là **GitHub Actions**. Cấu hình Vite dùng đường dẫn tương đối để hoạt động trong thư mục repository và các máy chủ tĩnh khác. Website không cần tài khoản người xem, khóa API hay máy chủ AI.
