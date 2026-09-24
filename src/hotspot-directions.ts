export function createHotspotDirections(getYaw: () => number) {
  const spots = new Map<HTMLElement, { yaw: number; icon: SVGElement }>();
  const update = (element: HTMLElement) => {
    const spot = spots.get(element);
    if (!spot) return;
    const delta = ((spot.yaw - getYaw() + 180) % 360 + 360) % 360 - 180;
    const transform = delta < 0 ? 'scaleX(-1)' : 'scaleX(1)';
    if (spot.icon.style.transform !== transform) spot.icon.style.transform = transform;
  };
  // Pannellum updates the wrapper style for every camera movement, including inertia.
  // Watching only wrappers avoids a permanent animation loop and ignores our SVG writes.
  const observer = new MutationObserver(records => {
    new Set(records.map(record => record.target as HTMLElement)).forEach(update);
  });
  return {
    add(element: HTMLElement, yaw: number) {
      const icon = element.querySelector<SVGElement>('.hotspot-circle .icon')!;
      spots.set(element, { yaw, icon });
      observer.observe(element, { attributes: true, attributeFilter: ['style'] });
      update(element);
    },
    clear() {
      observer.disconnect();
      spots.clear();
    },
  };
}
