export function createTourUI(experience: HTMLElement, reducedMotion: MediaQueryList) {
  const navigation = experience.querySelector<HTMLElement>('.scene-navigation')!;
  const list = experience.querySelector<HTMLElement>('#scene-list')!;
  const toggle = experience.querySelector<HTMLButtonElement>('#scene-list-toggle')!;
  const animations = new Set<Animation>();
  let lastScene = '';
  let lastCollection = '';

  function animate(element: Element, frames: Keyframe[], delay = 0) {
    if (reducedMotion.matches) return;
    const animation = element.animate(frames, { duration: 360, delay, easing: 'cubic-bezier(.2,.7,.2,1)' });
    animations.add(animation);
    animation.onfinish = () => animations.delete(animation);
  }

  function cancelAnimations() {
    animations.forEach(animation => animation.cancel());
    animations.clear();
  }

  const measure = () => experience.style.setProperty('--tray-height', `${navigation.offsetHeight}px`);
  new ResizeObserver(measure).observe(navigation);
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.querySelector('span')!.textContent = expanded ? 'Ẩn' : 'Hiện';
    toggle.setAttribute('aria-label', `${expanded ? 'Ẩn' : 'Hiện'} dải ảnh`);
    list.hidden = !expanded;
    experience.classList.toggle('tray-collapsed', !expanded);
    if (expanded) {
      list.querySelector<HTMLElement>('[aria-current]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      animate(list, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }]);
    }
    measure();
  });
  reducedMotion.addEventListener('change', cancelAnimations);

  return {
    sceneChanged(id: string, collection: string) {
      if (id === lastScene) return;
      cancelAnimations();
      for (const selector of ['#scene-title', '#scene-date', '#scene-position']) {
        animate(experience.querySelector(selector)!, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }]);
      }
      if (collection !== lastCollection && !list.hidden) {
        list.querySelectorAll('.scene-card').forEach((card, index) => {
          animate(card, [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], Math.min(index, 5) * 30);
        });
      }
      lastScene = id;
      lastCollection = collection;
    },
  };
}
