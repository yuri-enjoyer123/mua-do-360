import { photographs, type TourScene } from './photographs';

const specifications = [
  { source: 'citadel-gate-2018', title: 'Cổng Thành cổ', pitch: 5 },
  { source: 'citadel-wall-2018', title: 'Dọc hào Thành cổ', pitch: -12 },
];

export const derivedScenes: TourScene[] = specifications.map(specification => {
  const photo = photographs.find(photo => photo.id === specification.source)!;
  const id = `${photo.id}-360`;
  const derivation = `Cảnh được mở rộng từ ảnh tham chiếu. Phần ngoài khung ảnh là suy đoán; một số chi tiết trong khung cũng có thể thay đổi. Bản mở rộng dùng cùng giấy phép ${photo.license}.`;
  return {
    id,
    era: photo.era,
    format: 'panorama',
    photograph: photo,
    title: specification.title,
    eyebrow: photo.date,
    summary: photo.caption,
    description: [],
    verified: [],
    interpretation: [],
    sourceIds: [],
    panorama: `scenes/${id}.webp`,
    thumbnail: `scenes/${id}-thumb.webp`,
    assetVersion: '20260925',
    initialYaw: 0,
    initialPitch: specification.pitch,
    hotspots: [],
    derivation,
  };
});
