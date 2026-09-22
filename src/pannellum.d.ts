declare module 'pannellum';
declare module 'pannellum/build/pannellum.css';

interface PanoramaViewer {
  on(event: string, callback: (...args: unknown[]) => void): PanoramaViewer;
  destroy(): void;
  isLoaded(): boolean;
  setUpdate(update: boolean): PanoramaViewer;
  getYaw(): number;
  getPitch(): number;
  getHfov(): number;
  setYaw(yaw: number, duration?: number): PanoramaViewer;
  setPitch(pitch: number, duration?: number): PanoramaViewer;
  setHfov(hfov: number, duration?: number): PanoramaViewer;
  lookAt(pitch: number, yaw: number, hfov?: number, duration?: number): PanoramaViewer;
  resize(): PanoramaViewer;
}

interface Window {
  pannellum: { viewer(container: string | HTMLElement, config: Record<string, unknown>): PanoramaViewer };
  webkitAudioContext?: typeof AudioContext;
}
