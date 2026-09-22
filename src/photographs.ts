import type { Scene } from './content';
import records from './photo-records.json';

export interface Photograph {
  id: string;
  era: 'past' | 'present';
  title: string;
  caption: string;
  date: string;
  creator: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  file: string;
  width: number;
  height: number;
  notes: string[];
}

export interface TourScene extends Scene {
  era?: 'past' | 'present';
  format?: 'photo' | 'panorama';
  photograph?: Photograph;
  thumbnail?: string;
  derivation?: string;
}

export const photographs = records as Photograph[];
export const photoScenes: TourScene[] = photographs.map(photo => ({
  id: photo.id,
  era: photo.era,
  format: 'photo',
  photograph: photo,
  title: photo.title,
  eyebrow: photo.date,
  summary: photo.caption,
  description: photo.notes,
  verified: [],
  interpretation: [],
  sourceIds: [],
  literaryNote: '',
  panorama: photo.file,
  thumbnail: photo.file.replace('.jpg', '-thumb.webp'),
  initialYaw: 0,
  initialPitch: 0,
  hotspots: [],
}));
