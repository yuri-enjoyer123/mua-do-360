export function createSplitResize(dialog: HTMLDialogElement) {
  const divider = dialog.querySelector<HTMLElement>('#slides-divider')!;
  const body = dialog.querySelector<HTMLElement>('.slides-body')!;
  const stacked = matchMedia('(max-width:899px) and (min-height:501px), (max-width:599px)');
  const ratios = { horizontal: 65, vertical: 42 };
  let pointer: number | undefined;

  function setRatio(value: number) {
    const ratio = Math.max(35, Math.min(75, Math.round(value)));
    ratios[stacked.matches ? 'vertical' : 'horizontal'] = ratio;
    body.style.setProperty('--slide-share', `${ratio}fr`);
    body.style.setProperty('--scene-share', `${100 - ratio}fr`);
    divider.setAttribute('aria-valuenow', String(ratio));
    divider.setAttribute('aria-valuetext', `Bài chiếu ${ratio}%, cảnh ${100 - ratio}%`);
  }
  function sync() {
    divider.setAttribute('aria-orientation', stacked.matches ? 'horizontal' : 'vertical');
    setRatio(ratios[stacked.matches ? 'vertical' : 'horizontal']);
  }
  function end() {
    if (pointer !== undefined && divider.hasPointerCapture(pointer)) divider.releasePointerCapture(pointer);
    pointer = undefined;
    dialog.classList.remove('is-resizing');
  }
  divider.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    pointer = event.pointerId;
    divider.setPointerCapture(pointer);
    divider.focus({ preventScroll: true });
    dialog.classList.add('is-resizing');
    event.preventDefault();
  });
  divider.addEventListener('pointermove', event => {
    if (event.pointerId !== pointer) return;
    const rect = body.getBoundingClientRect();
    const position = stacked.matches ? event.clientY - rect.top : event.clientX - rect.left;
    const size = stacked.matches ? rect.height : rect.width;
    if (size > 0) setRatio(position / size * 100);
  });
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) divider.addEventListener(event, end);
  divider.addEventListener('dblclick', () => setRatio(stacked.matches ? 42 : 65));
  divider.addEventListener('keydown', event => {
    const previous = stacked.matches ? 'ArrowUp' : 'ArrowLeft';
    const next = stacked.matches ? 'ArrowDown' : 'ArrowRight';
    if (![previous, next, 'Home', 'End', 'Enter'].includes(event.key)) return;
    event.preventDefault();
    const ratio = ratios[stacked.matches ? 'vertical' : 'horizontal'];
    if (event.key === 'Home') setRatio(35);
    else if (event.key === 'End') setRatio(75);
    else if (event.key === 'Enter') setRatio(stacked.matches ? 42 : 65);
    else setRatio(ratio + (event.key === previous ? -5 : 5));
  });
  stacked.addEventListener('change', () => { end(); sync(); });
  dialog.addEventListener('close', end);
  sync();
  return { end };
}
