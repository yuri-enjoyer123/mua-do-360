export function createPhotoViewer(container: HTMLElement, image: HTMLImageElement) {
  let scale = 1;
  let x = 0;
  let y = 0;
  const pointers = new Map<number, { x: number; y: number }>();
  const clamp = (value: number, bound: number) => Math.max(-bound, Math.min(bound, value));

  function render() {
    const fit = Math.min(container.clientWidth / (image.naturalWidth || 1), container.clientHeight / (image.naturalHeight || 1));
    x = clamp(x, Math.max(0, (image.naturalWidth * fit * scale - container.clientWidth) / 2));
    y = clamp(y, Math.max(0, (image.naturalHeight * fit * scale - container.clientHeight) / 2));
    image.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    container.dataset.scale = String(scale);
    container.dataset.x = String(x);
    container.dataset.y = String(y);
    container.classList.toggle('is-zoomed', scale > 1);
  }
  function zoomAt(factor: number, anchor?: { x: number; y: number }) {
    const oldScale = scale;
    const newScale = Math.max(1, Math.min(5, oldScale * factor));
    if (newScale === oldScale) return;
    if (anchor) {
      const rect = container.getBoundingClientRect();
      const cx = anchor.x - rect.left - rect.width / 2;
      const cy = anchor.y - rect.top - rect.height / 2;
      const ratio = newScale / oldScale;
      x = cx - ratio * (cx - x);
      y = cy - ratio * (cy - y);
    }
    scale = newScale;
    render();
  }
  function zoom(factor: number) {
    zoomAt(factor);
  }
  function move(dx: number, dy: number) {
    if (scale === 1) scale = 1.6;
    x += dx;
    y += dy;
    render();
  }
  function reset() {
    scale = 1; x = 0; y = 0; pinchState = undefined;
    pointers.clear();
    render();
  }
  const getPinchBaseline = () => {
    const pts = [...pointers.values()];
    if (pts.length < 2) return undefined;
    const [a, b] = pts;
    return {
      distance: Math.hypot(a.x - b.x, a.y - b.y) || 1,
      scale,
      midpoint: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      pan: { x, y }
    };
  };
  let pinchState: {
    distance: number;
    scale: number;
    midpoint: { x: number; y: number };
    pan: { x: number; y: number };
  } | undefined;

  container.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    container.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size >= 2) {
      pinchState = getPinchBaseline();
    }
  });
  container.addEventListener('pointermove', event => {
    const previous = pointers.get(event.pointerId);
    if (!previous) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size >= 2 && pinchState) {
      const pts = [...pointers.values()];
      const a = pts[0];
      const b = pts[1];
      const currentDist = Math.hypot(a.x - b.x, a.y - b.y);
      const targetScale = Math.max(1, Math.min(5, pinchState.scale * (currentDist / pinchState.distance)));
      const currentMid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const rect = container.getBoundingClientRect();
      const c0x = pinchState.midpoint.x - rect.left - rect.width / 2;
      const c0y = pinchState.midpoint.y - rect.top - rect.height / 2;
      const ratio = targetScale / pinchState.scale;
      const scaledX = c0x - ratio * (c0x - pinchState.pan.x);
      const scaledY = c0y - ratio * (c0y - pinchState.pan.y);
      scale = targetScale;
      x = scaledX + (currentMid.x - pinchState.midpoint.x);
      y = scaledY + (currentMid.y - pinchState.midpoint.y);
    } else if (pointers.size === 1 && scale > 1) {
      x += event.clientX - previous.x;
      y += event.clientY - previous.y;
    }
    render();
  });
  const release = (event: PointerEvent) => {
    pointers.delete(event.pointerId);
    if (pointers.size >= 2) {
      pinchState = getPinchBaseline();
    } else {
      pinchState = undefined;
    }
  };
  container.addEventListener('pointerup', release);
  container.addEventListener('pointercancel', release);
  container.addEventListener('lostpointercapture', release);
  container.addEventListener('wheel', event => {
    event.preventDefault();
    zoomAt(event.deltaY < 0 ? 1.15 : 1 / 1.15, { x: event.clientX, y: event.clientY });
  }, { passive: false });
  container.addEventListener('dblclick', () => scale > 1 ? reset() : zoom(2));
  image.addEventListener('dragstart', event => event.preventDefault());
  new ResizeObserver(render).observe(container);
  return { zoom, move, reset };
}
