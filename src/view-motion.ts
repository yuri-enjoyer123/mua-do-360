type OrientationWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<string>;
};

export function createViewMotion(
  rotateButton: HTMLButtonElement,
  deviceButton: HTMLButtonElement,
  feedback: HTMLElement,
  reducedMotion: MediaQueryList,
  onPlaybackToggle: (playing: boolean) => void,
) {
  let viewer: PanoramaViewer | undefined;
  let panoramaMode = true;
  let mode: 'still' | 'rotate' | 'device' = 'still';
  let pending = false;
  let revision = 0;
  let stopDevice: (() => void) | undefined;
  let sensorTimer: ReturnType<typeof setTimeout> | undefined;
  const deviceAvailable = isSecureContext && 'DeviceOrientationEvent' in window
    && (navigator.maxTouchPoints > 0 || matchMedia('(pointer: coarse)').matches);

  function render() {
    rotateButton.hidden = !panoramaMode;
    deviceButton.hidden = !panoramaMode || !deviceAvailable;
    rotateButton.disabled = !viewer || reducedMotion.matches;
    deviceButton.disabled = !viewer;
    rotateButton.setAttribute('aria-pressed', String(mode === 'rotate'));
    rotateButton.setAttribute('aria-label', mode === 'rotate' ? 'Tạm dừng' : 'Phát cảnh');
    rotateButton.title = reducedMotion.matches ? 'Tự xoay tắt theo cài đặt giảm chuyển động' : rotateButton.getAttribute('aria-label')!;
    deviceButton.setAttribute('aria-pressed', String(mode === 'device'));
    deviceButton.setAttribute('aria-busy', String(pending));
    deviceButton.setAttribute('aria-label', mode === 'device' ? 'Tắt điều khiển bằng điện thoại' : 'Nghiêng điện thoại để nhìn quanh');
    deviceButton.title = deviceButton.getAttribute('aria-label')!;
  }

  function message(text: string) {
    feedback.textContent = text;
    feedback.hidden = !text;
  }

  function stop() {
    revision++;
    viewer?.stopAutoRotate();
    stopDevice?.();
    stopDevice = undefined;
    clearTimeout(sensorTimer);
    mode = 'still';
    pending = false;
    message('');
    render();
  }

  rotateButton.addEventListener('click', () => {
    if (!viewer || reducedMotion.matches) return;
    const start = mode !== 'rotate';
    stop();
    if (start) {
      mode = 'rotate';
      viewer.startAutoRotate(-2.4, viewer.getPitch());
      render();
    }
    onPlaybackToggle(start);
  });

  deviceButton.addEventListener('click', async () => {
    if (!viewer || !deviceAvailable) return;
    if (mode === 'device') { stop(); return; }
    stop();
    const token = revision;
    const target = viewer;
    mode = 'device';
    pending = true;
    render();
    try {
      const orientation = DeviceOrientationEvent as OrientationWithPermission;
      const permission = orientation.requestPermission ? await orientation.requestPermission() : 'granted';
      if (token !== revision) return;
      if (permission !== 'granted') {
        stop();
        message('Chưa được phép dùng cảm biến. Bạn vẫn có thể kéo để nhìn quanh.');
        return;
      }
      const { startDeviceLook } = await import('./device-look');
      if (token !== revision) return;
      stopDevice = startDeviceLook(target, () => {
        clearTimeout(sensorTimer);
        message('');
      });
      pending = false;
      message('Nghiêng điện thoại để nhìn quanh.');
      render();
      sensorTimer = setTimeout(() => {
        if (token !== revision) return;
        stop();
        message('Chưa nhận được cảm biến. Bạn vẫn có thể kéo để nhìn quanh.');
      }, 3000);
    } catch {
      if (token !== revision) return;
      stop();
      message('Chưa bật được cảm biến. Bạn vẫn có thể kéo để nhìn quanh.');
    }
  });

  reducedMotion.addEventListener('change', stop);
  render();
  return {
    stop,
    setViewer(next: PanoramaViewer | undefined, isPanorama: boolean) {
      stop();
      viewer = next;
      panoramaMode = isPanorama;
      render();
    },
  };
}
