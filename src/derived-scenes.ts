import { photographs, type TourScene } from './photographs';

const specifications = [
  { source: 'citadel-gate-2018', title: 'Cổng Thành cổ', pitch: 0 },
  { source: 'citadel-wall-2018', title: 'Dọc hào Thành cổ', pitch: 0 },
];

export const derivedScenes: TourScene[] = specifications.map(specification => {
  const photo = photographs.find(photo => photo.id === specification.source)!;
  const id = `${photo.id}-360`;
  const derivation = `Không gian dựng mở rộng từ ảnh của ${photo.creator}, ${photo.date}. Phần ngoài khung ảnh là suy đoán; quá trình phục dựng cũng có thể thay đổi chi tiết nằm trong khung gốc. Đây không phải ảnh chụp 360° cùng thời hoặc bản đo dựng địa hình. Ảnh bên dưới được giữ nguyên để đối chiếu. Bản mở rộng áp dụng cùng giấy phép ${photo.license}; việc tăng độ phân giải hiển thị không bổ sung chứng cứ lịch sử.`;
  return {
    id,
    era: photo.era,
    format: 'panorama',
    photograph: photo,
    title: specification.title,
    eyebrow: photo.date,
    summary: photo.caption,
    description: [photo.era === 'past' ? 'Ảnh làm căn cứ ghi lại Quảng Trị năm 1967, trước những sự kiện năm 1972 gắn với bối cảnh Mưa đỏ.' : 'Ảnh làm căn cứ cho góc nhìn này ghi lại di tích sau chiến tranh. Niên đại hiển thị là mốc của ảnh tham chiếu.'],
    verified: [],
    interpretation: [],
    sourceIds: [],
    literaryNote: '',
    panorama: `scenes/${id}.webp`,
    thumbnail: `scenes/${id}-thumb.webp`,
    initialYaw: 0,
    initialPitch: specification.pitch,
    hotspots: [],
    derivation,
  };
});
