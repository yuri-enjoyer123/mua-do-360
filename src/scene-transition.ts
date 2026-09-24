export function createSceneTransition(frame: HTMLElement, reducedMotion: MediaQueryList) {
  let animation: Animation | undefined;
  let entrance: Animation | undefined;

  function clear() {
    animation?.cancel();
    animation = undefined;
    entrance?.cancel();
    entrance = undefined;
    frame.hidden = true;
    frame.style.removeProperty('background-image');
  }

  function capture(viewer: PanoramaViewer | undefined, compatible: boolean) {
    if (!compatible || reducedMotion.matches) { clear(); return; }
    if (!viewer?.isLoaded()) return;
    clear();
    const canvas = document.querySelector<HTMLCanvasElement>('#panorama canvas');
    if (!canvas?.width || !canvas.height) return;
    try {
      const radians = Math.PI / 180;
      const snapshot = document.createElement('canvas');
      const scale = Math.min(1, 1280 / canvas.width, 960 / canvas.height);
      snapshot.width = Math.round(canvas.width * scale);
      snapshot.height = Math.round(canvas.height * scale);
      const context = snapshot.getContext('2d');
      if (!context) return;
      viewer.getRenderer().render(viewer.getPitch() * radians, viewer.getYaw() * radians, viewer.getHfov() * radians, {});
      context.drawImage(canvas, 0, 0, snapshot.width, snapshot.height);
      const source = snapshot.toDataURL('image/jpeg', 0.85);
      frame.style.backgroundImage = 'url("' + source + '")';
      frame.hidden = false;
    } catch { clear(); }
  }

  function reveal(target: HTMLElement) {
    entrance?.cancel();
    if (reducedMotion.matches) { clear(); return; }
    if (frame.hidden) {
      // Photo gestures own transform; the entrance must not override their zoom.
      entrance = target.animate([{ opacity: 0.3 }, { opacity: 1 }], {
        duration: 560, easing: 'cubic-bezier(.2,.7,.2,1)',
      });
      return;
    }
    const fade = frame.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, easing: 'ease-out' });
    animation = fade;
    fade.onfinish = () => { if (animation === fade) clear(); };
  }

  reducedMotion.addEventListener('change', clear);
  window.addEventListener('resize', clear);
  return { capture, reveal, clear };
}
