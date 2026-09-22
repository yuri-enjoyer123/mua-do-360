export function createPhotoViewer(container: HTMLElement, image: HTMLImageElement) {
  let scale = 1;
  let x = 0;
  let y = 0;
  let pinch: { distance: number; scale: number } | undefined;
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
  function zoom(factor: number) {
    scale = Math.max(1, Math.min(5, scale * factor));
    render();
  }
  function move(dx: number, dy: number) {
    if (scale === 1) scale = 1.6;
    x += dx;
    y += dy;
    render();
  }
  function reset() {
    scale = 1; x = 0; y = 0; pinch = undefined;
    pointers.clear();
    render();
  }
  const distance = () => {
    const [a, b] = [...pointers.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  };
  container.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    container.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2) pinch = { distance: distance(), scale };
  });
  container.addEventListener('pointermove', event => {
    const previous = pointers.get(event.pointerId);
    if (!previous) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size >= 2 && pinch?.distance) {
      scale = Math.max(1, Math.min(5, pinch.scale * distance() / pinch.distance));
    } else if (scale > 1) {
      x += event.clientX - previous.x;
      y += event.clientY - previous.y;
    }
    render();
  });
  const release = (event: PointerEvent) => { pointers.delete(event.pointerId); pinch = undefined; };
  container.addEventListener('pointerup', release);
  container.addEventListener('pointercancel', release);
  container.addEventListener('lostpointercapture', release);
  container.addEventListener('wheel', event => {
    event.preventDefault();
    zoom(event.deltaY < 0 ? 1.15 : 1 / 1.15);
  }, { passive: false });
  container.addEventListener('dblclick', () => scale > 1 ? reset() : zoom(2));
  image.addEventListener('dragstart', event => event.preventDefault());
  new ResizeObserver(render).observe(container);
  return { zoom, move, reset };
}
