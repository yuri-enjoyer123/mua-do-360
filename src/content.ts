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
  panorama: string;
  initialYaw: number;
  initialPitch: number;
  hotspots: { pitch: number; yaw: number; targetId: string; label: string }[];
}

export const reconstructionNotice =
  'Minh họa theo tư liệu, không phải ảnh chụp năm 1972';

export const sources: Source[] = [
  {
    id: 'usmc-archive',
    title: 'Ảnh Quảng Trị sau giao tranh, trang 127–128',
    publisher: 'History and Museums Division, U.S. Marine Corps',
    url: 'https://archive.org/details/usmarinesinvietn00char_0/page/128/mode/2up',
    kind: 'historical',
    note: 'The War That Would Not End, 1971–1973: ảnh phố ở trang 128 được chụp sau khi quân Việt Nam Cộng hòa tái chiếm thị xã; không ghi ngày chụp cụ thể.',
  },
  {
    id: 'ams-map',
    title: 'AMS: Quảng Trị, bản đồ lưu trữ',
    publisher: 'U.S. Army Topographic Command / National Archives',
    url: 'https://catalog.archives.gov/id/74797754',
    kind: 'historical',
    note: 'NAID 74797754. Chú giải bản đồ ghi thông tin đến năm 1968; hồ sơ lưu trữ ghi khoảng 1942–1972. Bản đồ không xác nhận nguyên trạng năm 1972 hoặc định vị các góc đứng trong tour.',
  },
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
    note: 'Chu Lai nói về chất liệu đời thực và các nhân vật hư cấu trong Mưa đỏ.',
  },
];

export const scenes: Scene[] = [
  {
    id: 'thach-han',
    title: 'Bờ sông Thạch Hãn',
    eyebrow: 'Quảng Trị · Hè–thu 1972',
    summary: 'Từ bờ Thạch Hãn, nhìn về dòng sông từng nối hậu phương với mặt trận Quảng Trị.',
    description: [
      'Trong cuộc chiến đấu 81 ngày đêm, Thạch Hãn là một tuyến tiếp tế nhân lực và vật lực quan trọng. Cảnh này gợi không gian bờ sông, không xác định một bến vượt hay một chuyến đò cụ thể.',
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
    summary: 'Bên kia hào là lớp gạch vỡ và đất lũy lộ ra, những thành phần của hệ thống phòng thủ Thành cổ.',
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
    summary: 'Vòm Cổng Hậu là một trong những dấu tích còn lại để đọc cấu trúc của tòa thành.',
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
    panorama: 'scenes/cong-hau.webp',
    initialYaw: 0,
    initialPitch: 0,
    hotspots: [
      { pitch: -10, yaw: -25, targetId: 'hao-thanh', label: 'Điểm trước: Hào thành' },
      { pitch: -10, yaw: 25, targetId: 'luy-bac', label: 'Điểm tiếp: Lũy phía Bắc' },
    ],
  },
  {
    id: 'luy-bac',
    title: 'Lũy đất phía Bắc',
    eyebrow: 'Dấu tích phòng thủ',
    summary: 'Lớp gạch không còn che kín thân lũy. Phần đất đắp lộ ra cho thấy thành được tạo nên từ cả đất lẫn gạch.',
    description: ['Điểm nhìn ở sát chân lũy đất phía Bắc.'],
    verified: ['Hồ sơ Cục Di sản ghi nhận dấu tích tường đất ở đoạn giữa mặt Bắc và sự hư hại nặng tại góc Tây Bắc.'],
    interpretation: [
      'Vị trí đứng, hình dáng chỗ vỡ, các hõm đất và gạch rơi trong ảnh là diễn họa, không phải một đoạn thành đã được đo dựng.',
      'Cảnh không xác định công sự, đơn vị chiến đấu hoặc vị trí của hố bom được bảo tồn hiện nay.',
    ],
    sourceIds: ['di-san', 'du-lich', 'chu-lai'],
    panorama: 'scenes/luy-bac.webp',
    initialYaw: -20,
    initialPitch: -3,
    hotspots: [
      { pitch: -10, yaw: -55, targetId: 'cong-hau', label: 'Điểm trước: Cổng Hậu' },
      { pitch: -10, yaw: 25, targetId: 'noi-thanh', label: 'Điểm tiếp: Trong thành' },
    ],
  },
  {
    id: 'noi-thanh',
    title: 'Bên trong Thành cổ',
    eyebrow: 'Góc nhìn minh họa · Năm 1972',
    summary: 'Những mảng tường gạch, lớp vữa còn bám và gỗ sập gợi lại không gian từng có doanh trại, nhà lao và các công trình trong thành.',
    description: [
      'Góc nhìn minh họa bên trong Thành cổ. Tư liệu chưa xác định đây là một căn hầm, sở chỉ huy hay trận địa cụ thể.',
    ],
    verified: [
      'Hồ sơ di tích ghi nhận Thành cổ bị phá hủy gần hết trong cuộc chiến năm 1972.',
      'Đài tưởng niệm xây năm 1997 và nhà trưng bày xây năm 2002.',
    ],
    interpretation: [
      'Góc khuất, cách sắp xếp đổ nát và địa hình trước mắt là bố cục minh họa.',
      'Chất liệu bề mặt và ánh sáng được diễn họa; không tái hiện chính xác mức tàn phá, thời tiết hoặc tầm nhìn của một ngày trong năm 1972.',
    ],
    sourceIds: ['di-san', 'usmc-archive', 'ttxvn', 'chu-lai'],
    panorama: 'scenes/noi-thanh.webp',
    initialYaw: 0,
    initialPitch: 0,
    hotspots: [
      { pitch: -10, yaw: -25, targetId: 'luy-bac', label: 'Điểm trước: Lũy phía Bắc' },
      { pitch: -10, yaw: 25, targetId: 'pho-cu', label: 'Điểm tiếp: Phố sau chiến sự' },
    ],
  },
  {
    id: 'pho-cu',
    title: 'Phố sau chiến sự',
    eyebrow: 'Quảng Trị · Sau giao tranh năm 1972',
    summary: 'Từ không gian tòa thành, nhìn ra những gì còn lại của một thị xã sau chiến tranh.',
    description: [
      'Ảnh đường Quang Trung trong tư liệu được đối chiếu cho thấy một con đường rộng giữa những đống đổ nát thấp, xen vài cột và khung còn đứng. Chú thích đặt ảnh sau khi quân Việt Nam Cộng hòa tái chiếm thị xã, không ghi ngày chụp cụ thể.',
      'Cảnh tham khảo mức độ đổ nát và vật liệu trong ảnh. Chưa có đủ tư liệu để phục dựng chính xác đường Quang Trung từ góc nhìn này.',
    ],
    verified: ['Ảnh ở trang 128 của The War That Would Not End, 1971–1973 ghi lại đường Quang Trung sau giao tranh; dòng ghi nguồn ảnh là Government of Vietnam Photo.'],
    interpretation: [
      'Các chân tường, gỗ sập, cột, chiều rộng đường và vị trí nhà trong panorama đều là sắp đặt minh họa.',
      'Thời điểm của cảnh không được xác định cụ thể.',
    ],
    sourceIds: ['usmc-archive', 'ttxvn', 'chu-lai'],
    panorama: 'scenes/pho-cu.webp',
    initialYaw: 0,
    initialPitch: -2,
    hotspots: [
      { pitch: -10, yaw: -25, targetId: 'noi-thanh', label: 'Điểm trước: Trong thành' },
      { pitch: -10, yaw: 25, targetId: 'thach-han', label: 'Trở lại bờ sông' },
    ],
  },
];
