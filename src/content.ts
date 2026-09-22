export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
  kind: 'historical' | 'literary';
  note: string;
}

export interface Scene {
  id: string;
  title: string;
  eyebrow: string;
  summary: string;
  description: string[];
  verified: string[];
  interpretation: string[];
  sourceIds: string[];
  literaryNote: string;
  panorama: string;
  initialYaw: number;
  initialPitch: number;
  hotspots: { pitch: number; yaw: number; targetId: string; label: string }[];
}

export const reconstructionNotice =
  'Phục dựng theo tư liệu — không phải ảnh chụp năm 1972';

export const sources: Source[] = [
  {
    id: 'di-san',
    title: 'Thành cổ Quảng Trị và những địa điểm lưu niệm sự kiện 81 ngày đêm năm 1972',
    publisher: 'Cục Di sản văn hóa',
    url: 'https://dsvh.gov.vn/di-tich-lich-su-thanh-co-quang-tri-va-nhung-dia-diem-luu-niem-su-kien-81-ngay-dem-nam-1972-2975',
    kind: 'historical',
    note: 'Theo hồ sơ xếp hạng di tích; phân biệt dấu tích còn lại sau chiến tranh với các công trình tu bổ, tưởng niệm xây dựng về sau.',
  },
  {
    id: 'ttxvn',
    title: 'Cuộc chiến đấu 81 ngày đêm bảo vệ Thành cổ Quảng Trị',
    publisher: 'Thông tấn xã Việt Nam · Nhân vật và Sự kiện',
    url: 'https://nvsk.vnanet.vn/cuoc-chien-dau-81-ngay-dem-bao-ve-thanh-co-quang-tri-ngay-28-6-den-16-9-1972-4-147823.vna',
    kind: 'historical',
    note: 'Đối chiếu mốc 28/6–16/9/1972. Mốc chung này không xác định ngày, giờ của từng cảnh phục dựng.',
  },
  {
    id: 'thach-han',
    title: 'Thạch Hãn dòng sông hoa lửa',
    publisher: 'Ủy ban MTTQ Việt Nam tỉnh Quảng Trị',
    url: 'https://ubmttqvn.quangtri.gov.vn/index.php/van-hoa-van-nghe/thach-han-dong-song-hoa-lua-4075.html',
    kind: 'historical',
    note: 'Đối chiếu vai trò tiếp tế của dòng sông. Bài có cả ảnh hiện đại và ảnh thuộc thời điểm khác; không coi mọi ảnh minh họa là Thành cổ trong 81 ngày đêm.',
  },
  {
    id: 'du-lich',
    title: 'Thành cổ Quảng Trị',
    publisher: 'Cục Du lịch Quốc gia Việt Nam',
    url: 'https://vietnamtourism.vn/index.php/tourism/items/1271',
    kind: 'historical',
    note: 'Đối chiếu tường thành, hào, bốn cửa và việc tu sửa giai đoạn 1993–1995; không dùng ảnh hiện nay để suy ra nguyên trạng năm 1972.',
  },
  {
    id: 'chu-lai',
    title: 'Nhà văn Chu Lai: “Mưa đỏ” vạm vỡ, cường tráng hơn qua điện ảnh',
    publisher: 'Báo Quân đội nhân dân',
    url: 'https://www.qdnd.vn/van-hoa/doi-song/nha-van-chu-lai-mua-do-vam-vo-cuong-trang-hon-qua-dien-anh-845152',
    kind: 'literary',
    note: 'Phỏng vấn tác giả xác nhận việc xây dựng nhân vật hư cấu từ chất liệu đời thực; chỉ dùng để làm rõ ranh giới giữa tiểu thuyết và sử liệu.',
  },
];

export const scenes: Scene[] = [
  {
    id: 'thach-han',
    title: 'Bờ sông Thạch Hãn',
    eyebrow: 'Quảng Trị · Hè–thu 1972',
    summary: 'Bắt đầu bên dòng sông gắn với tuyến tiếp tế cho mặt trận Quảng Trị, rồi theo hành trình đọc để tìm hiểu không gian Thành cổ.',
    description: [
      'Trong cuộc chiến đấu 81 ngày đêm, Thạch Hãn là một tuyến tiếp tế nhân lực và vật lực quan trọng. Cảnh này gợi không gian bờ sông, không xác định một bến vượt hay một chuyến đò cụ thể.',
      'Các điểm chuyển cảnh đưa bạn đến phần tiếp theo của hành trình; vị trí mũi tên không biểu thị một lối đi lịch sử đã được khảo sát.',
    ],
    verified: [
      'Mốc 81 ngày đêm được tính từ 28/6 đến 16/9/1972.',
      'Sông Thạch Hãn là tuyến tiếp tế nhân lực, vật lực cho mặt trận Quảng Trị.',
    ],
    interpretation: [
      'Góc đứng, hình dạng bãi bờ và vị trí các vật thể trong ảnh là lựa chọn minh họa, chưa được định vị bằng tư liệu cùng thời.',
      'Ánh sáng, thời tiết, màu nước và chất liệu bề mặt được tạo để thể hiện không gian; không mô tả một ngày cụ thể trong năm 1972.',
    ],
    sourceIds: ['ttxvn', 'thach-han', 'chu-lai'],
    literaryNote: 'Liên hệ với Mưa đỏ ở trải nghiệm và số phận người lính, không gán một sự việc trong truyện cho địa điểm chính xác trên bờ sông.',
    panorama: 'scenes/thach-han.webp',
    initialYaw: 0,
    initialPitch: 0,
    hotspots: [
      { pitch: -10, yaw: 25, targetId: 'hao-thanh', label: 'Điểm tiếp: Hào thành' },
    ],
  },
  {
    id: 'hao-thanh',
    title: 'Hào và tường thành',
    eyebrow: 'Không gian phòng thủ · Năm 1972',
    summary: 'Dừng ngoài tường thành để hình dung mối quan hệ giữa hào, lũy và cửa thành; những chi tiết không còn tư liệu được ghi rõ là phần minh họa.',
    description: [
      'Hào và tường bao là những thành phần của hệ thống phòng thủ Thành cổ. Cảnh phục dựng gợi vị trí quan sát bên ngoài thành trong bối cảnh chiến tranh, không khẳng định hình dạng nguyên vẹn của một đoạn hào vào thời điểm xác định.',
    ],
    verified: [
      'Thành có bốn cửa và hệ thống hào bao quanh tường thành.',
      'Hệ thống hào, cầu, cống và một số đoạn thành được tu sửa trong giai đoạn 1993–1995.',
    ],
    interpretation: [
      'Độ rộng nhìn thấy, địa hình mép hào, mực nước và mức hư hại của đoạn tường trong ảnh chưa có đo đạc lịch sử tương ứng.',
      'Màu gạch, bùn đất, cây cỏ và ánh sáng là phần diễn họa; ảnh không phải bản vẽ kiến trúc theo tỷ lệ.',
    ],
    sourceIds: ['du-lich', 'ttxvn', 'chu-lai'],
    literaryNote: 'Không gian này giúp đặt việc đọc Mưa đỏ vào bối cảnh chiến tranh, không xác nhận đường di chuyển của các nhân vật.',
    panorama: 'scenes/hao-thanh.webp',
    initialYaw: 0,
    initialPitch: 0,
    hotspots: [
      { pitch: -10, yaw: -25, targetId: 'thach-han', label: 'Điểm trước: Bờ sông' },
      { pitch: -10, yaw: 25, targetId: 'cong-hau', label: 'Điểm tiếp: Cổng Hậu' },
    ],
  },
  {
    id: 'cong-hau',
    title: 'Quanh Cổng Hậu',
    eyebrow: 'Bắc môn · Thành cổ Quảng Trị',
    summary: 'Tiếp cận không gian Cổng Hậu từ dấu tích còn lại sau chiến tranh, đồng thời phân biệt những gì hồ sơ ghi nhận với phần hình ảnh được phục dựng.',
    description: [
      'Cổng Hậu, còn gọi là Bắc môn, là một điểm tựa để tìm hiểu cấu trúc Thành cổ. Những dấu tích được ghi nhận sau chiến tranh không cho biết đầy đủ diện mạo của cổng trong từng giai đoạn giao tranh.',
    ],
    verified: [
      'Cổng Hậu là Bắc môn trong hệ thống bốn cửa thành.',
      'Hồ sơ di tích ghi nhận vòm cuốn Cổng Hậu còn hình dạng sau chiến tranh, cùng nhiều dấu bom, đạn.',
    ],
    interpretation: [
      'Độ cao còn lại, mảng tường vỡ, vật liệu rơi và hình dáng phần trên cổng trong cảnh không phải kết quả đo dựng nguyên trạng năm 1972.',
      'Góc quan sát, ánh sáng và dấu bào mòn bề mặt được diễn họa; không có căn cứ xác định một trận đánh tại đúng góc đứng này.',
    ],
    sourceIds: ['di-san', 'ttxvn', 'chu-lai'],
    literaryNote: 'Các nhân vật trong Mưa đỏ thuộc thế giới tiểu thuyết; không xem Cổng Hậu trong cảnh này là tọa độ của một tình tiết cụ thể.',
    panorama: 'scenes/cong-hau.webp',
    initialYaw: 0,
    initialPitch: 0,
    hotspots: [
      { pitch: -10, yaw: -25, targetId: 'hao-thanh', label: 'Điểm trước: Hào thành' },
      { pitch: -10, yaw: 25, targetId: 'noi-thanh', label: 'Điểm tiếp: Bên trong thành' },
    ],
  },
  {
    id: 'noi-thanh',
    title: 'Bên trong Thành cổ',
    eyebrow: 'Góc nhìn minh họa · Năm 1972',
    summary: 'Khép lại giữa không gian đổ nát bên trong thành, dành khoảng lặng để đọc về người lính và suy nghĩ về cái giá của chiến tranh.',
    description: [
      'Đây là góc nhìn minh họa bên trong Thành cổ, không phải một căn hầm, sở chỉ huy hay trận địa được xác định trong hồ sơ. Cảnh chỉ gợi cảm giác về một không gian bị chiến tranh tàn phá.',
      'Các công trình tưởng niệm hiện nay không thuộc lớp cảnh năm 1972. Phần liên hệ văn học dành cho cách tiểu thuyết nhìn vào con người giữa chiến tranh.',
    ],
    verified: [
      'Hồ sơ di tích ghi nhận Thành cổ bị phá hủy gần hết trong cuộc chiến năm 1972.',
      'Đài tưởng niệm xây năm 1997 và nhà trưng bày xây năm 2002; các công trình này chưa có vào năm 1972.',
    ],
    interpretation: [
      'Góc khuất, cách sắp xếp đổ nát và địa hình ngay trước mắt là bố cục minh họa; không được gọi là nơi trú ẩn của một đơn vị hay nhân vật cụ thể.',
      'Chất liệu bề mặt và ánh sáng do AI diễn họa; không tái hiện chính xác mức tàn phá, thời tiết hoặc tầm nhìn của một ngày trong năm 1972.',
    ],
    sourceIds: ['di-san', 'ttxvn', 'chu-lai'],
    literaryNote: 'Mưa đỏ gợi suy ngẫm về hy sinh và khát vọng sống; nhan đề được tiếp nhận như hình tượng văn học, không phải hiện tượng mưa màu đỏ.',
    panorama: 'scenes/noi-thanh.webp',
    initialYaw: 0,
    initialPitch: 0,
    hotspots: [
      { pitch: -10, yaw: -25, targetId: 'cong-hau', label: 'Điểm trước: Cổng Hậu' },
      { pitch: -10, yaw: 25, targetId: 'thach-han', label: 'Về đầu hành trình' },
    ],
  },
];
